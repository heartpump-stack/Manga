from __future__ import annotations
import io, json, math, os, time, zipfile, hashlib
from pathlib import Path
import numpy as np
import pandas as pd
import requests

ARCHIVE = "https://data.binance.vision"
SYMBOL = os.getenv("SYMBOL", "BTCUSDT")
START = pd.Timestamp(os.getenv("START", "2021-01-01T00:00:00Z"))
END = pd.Timestamp(os.getenv("END", "2025-01-01T00:00:00Z"))
OUT = Path(os.getenv("OUT", "output"))
OUT.mkdir(parents=True, exist_ok=True)

GATE_30D = 20.0
GATE_ACTIVE7 = 3.0
GATE_P90_GAP_H = 48.0

COLS = [
    "open_time_ms","open","high","low","close","volume","close_time_ms",
    "quote_volume","trade_count","taker_buy_base_volume",
    "taker_buy_quote_volume","ignore"
]

def interval_ms(interval: str) -> int:
    n = int(interval[:-1]); u = interval[-1]
    return n * {"m":60000, "h":3600000, "d":86400000}[u]

def _get(session: requests.Session, url: str, tries: int = 6) -> bytes:
    last = None
    for attempt in range(tries):
        try:
            r = session.get(url, timeout=45)
            if r.status_code in (418,429,500,502,503,504):
                time.sleep(min(2**attempt, 20)); continue
            r.raise_for_status()
            return r.content
        except Exception as e:
            last = e
            time.sleep(min(2**attempt, 20))
    raise RuntimeError(f"download failed: {url}: {last}")

def _months(start: pd.Timestamp, end: pd.Timestamp):
    cur = pd.Timestamp(start.year, start.month, 1, tz="UTC")
    while cur < end:
        yield cur.year, cur.month
        cur = cur + pd.offsets.MonthBegin(1)

def download_archive_klines(symbol: str, interval: str,
                            start: pd.Timestamp, end: pd.Timestamp) -> tuple[pd.DataFrame, list[dict]]:
    session = requests.Session()
    session.headers.update({"User-Agent":"dayengine-research/1.0"})
    frames = []
    integrity = []

    for y, m in _months(start, end):
        fn = f"{symbol}-{interval}-{y:04d}-{m:02d}.zip"
        rel = f"/data/futures/um/monthly/klines/{symbol}/{interval}/{fn}"
        url = ARCHIVE + rel
        checksum_url = url + ".CHECKSUM"

        zip_bytes = _get(session, url)
        checksum_text = _get(session, checksum_url).decode("utf-8", errors="replace").strip()
        expected_sha = checksum_text.split()[0].lower()
        actual_sha = hashlib.sha256(zip_bytes).hexdigest().lower()
        if expected_sha != actual_sha:
            raise RuntimeError(f"CHECKSUM mismatch for {fn}: expected={expected_sha} actual={actual_sha}")

        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            names = [n for n in z.namelist() if n.lower().endswith(".csv")]
            if len(names) != 1:
                raise RuntimeError(f"Unexpected archive members in {fn}: {z.namelist()}")
            raw = z.read(names[0])

        d = pd.read_csv(io.BytesIO(raw), header=None, names=COLS)
        d["open_time_ms"] = pd.to_numeric(d["open_time_ms"], errors="coerce")
        d = d.dropna(subset=["open_time_ms"]).copy()
        d["open_time_ms"] = d["open_time_ms"].astype("int64")

        # 2021-2024 USD-M futures archives are millisecond timestamps.
        d["open_time"] = pd.to_datetime(d["open_time_ms"], unit="ms", utc=True)
        for c in ["open","high","low","close","volume","quote_volume","trade_count",
                  "taker_buy_base_volume","taker_buy_quote_volume"]:
            d[c] = pd.to_numeric(d[c], errors="coerce")

        frames.append(d)
        integrity.append({
            "file": fn,
            "sha256": actual_sha,
            "rows": int(len(d)),
            "first": str(d["open_time"].min()),
            "last": str(d["open_time"].max())
        })
        print(f"ARCHIVE_OK {fn} rows={len(d)} sha256={actual_sha[:12]}")

    all_d = pd.concat(frames, ignore_index=True)
    all_d = (
        all_d[(all_d.open_time >= start) & (all_d.open_time < end)]
        .sort_values("open_time")
        .drop_duplicates("open_time")
        .reset_index(drop=True)
    )
    return all_d, integrity

def qa(d: pd.DataFrame, interval: str, start: pd.Timestamp, end: pd.Timestamp) -> dict:
    step = pd.Timedelta(milliseconds=interval_ms(interval))
    expected = pd.date_range(start, end-step, freq=step)
    idx = pd.DatetimeIndex(d.open_time)
    missing = expected.difference(idx)
    extras = idx.difference(expected)
    diffs = idx.to_series().diff().dropna()
    return {
        "rows": int(len(d)),
        "expected_rows": int(len(expected)),
        "duplicates": int(d.open_time.duplicated().sum()),
        "missing_bars": int(len(missing)),
        "extra_bars": int(len(extras)),
        "max_source_gap_h": float(diffs.max().total_seconds()/3600) if len(diffs) else 0.0,
        "pass": bool(len(missing)==0 and len(extras)==0 and not d.open_time.duplicated().any()),
        "missing_examples": [str(x) for x in missing[:10]],
        "extra_examples": [str(x) for x in extras[:10]],
    }

def div(a,b):
    return a / np.where(np.abs(b) < 1e-12, np.nan, b)

def features(d: pd.DataFrame) -> pd.DataFrame:
    x = d.set_index("open_time").copy()
    pc = x.close.shift(1)
    tr = pd.concat([(x.high-x.low),(x.high-pc).abs(),(x.low-pc).abs()], axis=1).max(axis=1)
    x["atr20"] = tr.rolling(20, min_periods=20).mean()
    x["body"] = x.close-x.open
    x["body_atr"] = div(x.body.abs(), x.atr20)
    x["eff6"] = div((x.close-x.close.shift(6)).abs(), x.close.diff().abs().rolling(6).sum())
    x["range_atr"] = div(x.high-x.low, x.atr20)
    x["close_pos"] = div(x.close-x.low, x.high-x.low)
    x["range_q"] = (x.high-x.low).rolling(240, min_periods=80).rank(pct=True)
    for n in (6,12,20,36):
        x[f"ph{n}"] = x.high.shift(1).rolling(n).max()
        x[f"pl{n}"] = x.low.shift(1).rolling(n).min()
    x["tfi"] = 2*(x.taker_buy_base_volume/x.volume.replace(0,np.nan))-1
    return x

def families(x: pd.DataFrame) -> dict[str,pd.Series]:
    f = {}
    for n in (6,12,20):
        f[f"sweep_reclaim_{n}"] = (
            ((x.high>x[f"ph{n}"])&(x.close<x[f"ph{n}"])&(x.close_pos<.65)) |
            ((x.low<x[f"pl{n}"])&(x.close>x[f"pl{n}"])&(x.close_pos>.35))
        )
    for n in (12,20):
        f[f"accept_break_{n}"] = (
            ((x.close>x[f"ph{n}"])|(x.close<x[f"pl{n}"])) &
            (x.body_atr>=.55) & (x.eff6>=.45)
        )
    f["compression_ignite"] = (
        (x.range_q.shift(1).rolling(6).mean()<=.35) &
        (x.range_q>=.75) & (x.body_atr>=.55)
    )
    f["exhaustion_reprice"] = (
        (x.range_atr>=1.6) &
        (((x.body>0)&(x.close_pos<=.45)) | ((x.body<0)&(x.close_pos>=.55)))
    )
    f["efficient_impulse"] = (x.body_atr>=.8)&(x.eff6>=.55)&(x.range_q>=.65)
    f["flow_absorption"] = (x.tfi.abs()>=.20)&(x.body_atr<=.45)&(x.range_q>=.45)
    f["flow_followthrough"] = (
        (x.tfi.abs()>=.20)&(x.body_atr>=.65)&(np.sign(x.body)==np.sign(x.tfi))
    )
    return {k:v.fillna(False) for k,v in f.items()}

def metrics(times: pd.DatetimeIndex, start: pd.Timestamp, end: pd.Timestamp) -> dict:
    t = pd.DatetimeIndex(times).sort_values()
    days = pd.date_range(start.floor("D"), (end-pd.Timedelta(microseconds=1)).floor("D"), freq="D")
    counts = pd.Series(0.0, index=days)
    if len(t):
        dc = pd.Series(1.0,index=t.floor("D")).groupby(level=0).sum()
        common = counts.index.intersection(dc.index)
        counts.loc[common] = dc.loc[common]
    r30 = counts.rolling(30,min_periods=30).sum().dropna()
    r7 = (counts>0).astype(float).rolling(7,min_periods=7).sum().dropna()
    gaps = t.to_series().diff().dropna().dt.total_seconds()/3600 if len(t)>1 else pd.Series(dtype=float)
    return {
        "events": int(len(t)),
        "rolling30_p10": float(r30.quantile(.10)) if len(r30) else 0.0,
        "rolling7_active_p10": float(r7.quantile(.10)) if len(r7) else 0.0,
        "p90_gap_h": float(gaps.quantile(.90)) if len(gaps) else math.inf,
        "max_gap_h": float(gaps.max()) if len(gaps) else math.inf,
    }

def eval_period(x, f, start, end):
    s = pd.Timestamp(start); e = pd.Timestamp(end)
    p = (x.index>=s)&(x.index<e)
    out = {}
    for name,m in f.items():
        q = metrics(x.index[p&m],s,e)
        q["calendar_pass"] = bool(
            q["rolling30_p10"]>=GATE_30D and
            q["rolling7_active_p10"]>=GATE_ACTIVE7 and
            q["p90_gap_h"]<=GATE_P90_GAP_H
        )
        out[name] = q
    union = pd.concat(f,axis=1).any(axis=1)
    q = metrics(x.index[p&union],s,e)
    q["calendar_pass"] = bool(
        q["rolling30_p10"]>=GATE_30D and
        q["rolling7_active_p10"]>=GATE_ACTIVE7 and
        q["p90_gap_h"]<=GATE_P90_GAP_H
    )
    out["RAW_UNION"] = q
    return out

def run(interval: str):
    d, integrity = download_archive_klines(SYMBOL, interval, START, END)
    q = qa(d, interval, START, END)

    raw_path = OUT/f"{SYMBOL}_PERP_{interval}_{START.date()}_{(END-pd.Timedelta(days=1)).date()}.csv"
    d.to_csv(raw_path,index=False)
    (OUT/f"integrity_{interval}.json").write_text(json.dumps(integrity,indent=2),encoding="utf-8")
    (OUT/f"qa_{interval}.json").write_text(json.dumps(q,indent=2),encoding="utf-8")

    if not q["pass"]:
        raise RuntimeError(f"{interval} SOURCE_QA_FAIL {json.dumps(q)}")

    x = features(d); f = families(x)
    r = {
        "symbol": SYMBOL,
        "interval": interval,
        "source": "Binance Vision USD-M Futures monthly klines",
        "qa": q,
        "gates": {
            "rolling30_p10_min": GATE_30D,
            "rolling7_active_p10_min": GATE_ACTIVE7,
            "p90_gap_h_max": GATE_P90_GAP_H
        },
        "development_2021_2023": eval_period(x,f,"2021-01-01T00:00:00Z","2024-01-01T00:00:00Z"),
        "validation_2024": eval_period(x,f,"2024-01-01T00:00:00Z","2025-01-01T00:00:00Z"),
    }
    (OUT/f"stage1_census_{interval}.json").write_text(
        json.dumps(r,indent=2),encoding="utf-8"
    )
    return r

def main():
    results = {}
    for interval in ("4h","1h"):
        print(f"=== START {interval} ===")
        results[interval] = run(interval)
        print(f"=== DONE {interval} ===")

    rows = []
    for i,r in results.items():
        for pk,label in (
            ("development_2021_2023","DEV_2021_2023"),
            ("validation_2024","VAL_2024")
        ):
            for fam,m in r[pk].items():
                rows.append({"interval":i,"period":label,"family":fam,**m})
    pd.DataFrame(rows).to_csv(OUT/"stage1_summary.csv",index=False)

    lines = [
        "# BTC Stage 1 Binance Futures Census",
        "",
        "Source: Binance Vision USD-M Futures monthly klines with SHA256 CHECKSUM verification.",
        "PnL-blind event-supply census.",
        ""
    ]
    for i,r in results.items():
        for pk,label in (
            ("development_2021_2023","DEV"),
            ("validation_2024","VAL")
        ):
            m = r[pk]["RAW_UNION"]
            lines.append(
                f"- {i} {label}: 30D_P10={m['rolling30_p10']:.2f}, "
                f"active7_P10={m['rolling7_active_p10']:.2f}, "
                f"P90_gap={m['p90_gap_h']:.2f}h, "
                f"max_gap={m['max_gap_h']:.2f}h, "
                f"PASS={m['calendar_pass']}"
            )
    report = "\n".join(lines)+"\n"
    (OUT/"REPORT.md").write_text(report,encoding="utf-8")
    print(report)

if __name__ == "__main__":
    main()

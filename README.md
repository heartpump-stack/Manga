# Day Engine BTC Binance Bridge

Dedicated research bridge for BTCUSDT perpetual futures.

- Source: Binance USD-M Futures REST (`fapi.binance.com/fapi/v1/klines`)
- First run: 2021-2024, 4h + 1h
- Output: raw CSV, QA, PnL-blind Stage-1 census JSON/CSV/report
- Existing PineTS workflows are untouched.
- Trigger by updating `dayengine_btc_bridge/trigger.txt` or workflow_dispatch.

import { Kline } from './types';
/**
 * Given a target timeframe and a set of supported timeframes, select the
 * best sub-timeframe to aggregate from.
 *
 * Strategy:
 * - **W/M targets**: always use `'D'` (calendar-based grouping).
 * - **All others**: pick the largest supported timeframe whose duration
 *   evenly divides the target duration (using `TIMEFRAME_SECONDS`).
 *
 * @returns The best sub-timeframe, or `null` if none found.
 */
export declare function selectSubTimeframe(targetTimeframe: string, supportedTimeframes: Set<string>): string | null;
/**
 * Compute how many sub-candles fit into one aggregated candle.
 *
 * For fixed-duration aggregation: `targetSeconds / subSeconds`.
 * For calendar-based (W/M from D): returns `Infinity` to signal variable grouping.
 */
export declare function getAggregationRatio(targetTimeframe: string, subTimeframe: string): number;
/**
 * Aggregate sub-candles into higher-timeframe candles.
 *
 * Three modes:
 * 1. **Fixed-ratio** (intraday → higher intraday): groups every N consecutive
 *    sub-candles, with session-boundary detection to avoid cross-session merging.
 * 2. **Weekly from daily**: groups daily bars by ISO week number.
 * 3. **Monthly from daily**: groups daily bars by calendar year+month.
 *
 * OHLCV merge:
 * - `open` = first sub-candle's open
 * - `high` = max of all highs
 * - `low`  = min of all lows
 * - `close` = last sub-candle's close
 * - `volume` = sum
 * - `closeTime` = last sub-candle's closeTime (preserves session-aware close)
 */
export declare function aggregateCandles(subCandles: Kline[], targetTimeframe: string, subTimeframe: string): Kline[];

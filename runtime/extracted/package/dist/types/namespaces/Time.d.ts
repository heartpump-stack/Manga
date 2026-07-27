/**
 * Normalize a Pine Script timeframe string to a canonical form.
 * e.g. "1D" → "D", "60" → "60", "1W" → "W", "" → ""
 */
export declare function normalizeTimeframe(tf: string): string;
/**
 * Compute the opening timestamp of the higher-timeframe bar that contains the given timestamp.
 *
 * For intraday TFs (minutes): floor to the nearest multiple of the TF duration within the day.
 * For daily: floor to UTC day start (00:00 UTC).
 * For weekly: floor to Monday 00:00 UTC.
 * For monthly: floor to 1st of month 00:00 UTC.
 */
export declare function alignToTimeframe(timestamp: number, tf: string): number;
interface DateParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    dayOfWeek: number;
}
/**
 * Decompose a UTC-millisecond timestamp into calendar parts
 * interpreted in the given timezone.
 */
export declare function getDatePartsInTimezone(timestamp: number, timezone: string): DateParts;
/**
 * ISO 8601 week number (1-53). Monday-start, week containing Jan 4th is week 1.
 */
export declare function getISOWeekNumber(year: number, month: number, day: number): number;
/**
 * TimeHelper implements the dual-use `time` / `time_close` identifiers.
 * - Bare `time` → `time.__value` → openTime Series
 * - `time[1]` → `$.get(time.__value, 1)` → previous bar's time
 * - `time(timeframe)` → `time.any(timeframe)` → time function
 */
export declare class TimeHelper {
    private context;
    private dataField;
    constructor(context: any, dataField?: string);
    get __value(): any;
    param(source: any, index?: number): any;
    any(...args: any[]): number;
    /**
     * Basic session check: parses "HHMM-HHMM" format and tests if
     * the timestamp falls within the session window.
     */
    private _isInSession;
}
/**
 * Single parameterized class for all 8 dual-use time component identifiers:
 * dayofmonth, dayofweek, hour, minute, month, second, weekofyear, year.
 *
 * - Bare `dayofmonth` → `dayofmonth.__value` → extract from current bar openTime
 * - `dayofmonth(time)` → extract from given timestamp
 * - `dayofmonth(time, timezone)` → extract from timestamp in given timezone
 */
export declare class TimeComponentHelper {
    private context;
    private extractor;
    constructor(context: any, extractor: (parts: DateParts) => number);
    get __value(): number;
    param(source: any, index?: number): any;
    any(...args: any[]): number;
}
export declare const EXTRACTORS: {
    dayofmonth: (parts: DateParts) => number;
    dayofweek: (parts: DateParts) => number;
    hour: (parts: DateParts) => number;
    minute: (parts: DateParts) => number;
    month: (parts: DateParts) => number;
    second: (parts: DateParts) => number;
    weekofyear: (parts: DateParts) => number;
    year: (parts: DateParts) => number;
};
export {};

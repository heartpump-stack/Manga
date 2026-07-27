export declare class Timeframe {
    private context;
    private _normalized;
    constructor(context: any);
    param(source: any, index?: number, name?: string): any;
    /** Normalized canonical timeframe (cached) */
    private get normalized();
    /** Last character of the normalized timeframe (uppercase) */
    private get unit();
    get main_period(): string;
    get period(): string;
    get multiplier(): number;
    get isdwm(): boolean;
    get isdaily(): boolean;
    get isweekly(): boolean;
    get ismonthly(): boolean;
    get isseconds(): boolean;
    get isminutes(): boolean;
    get isintraday(): boolean;
    /**
     * Detects changes in the specified timeframe.
     * Returns true on the first bar of a new HTF period, false otherwise.
     *
     * Works by aligning current and previous bar timestamps to the target
     * timeframe and comparing — if they differ, a new period has started.
     */
    change(timeframe: any): boolean;
    from_seconds(seconds: number): string | number;
    in_seconds(timeframe?: string): number;
}

import { IProvider } from './marketData/IProvider';
import { Context } from './Context.class';
import { Indicator } from './Indicator';
/**
 * This class is a wrapper for the Pine Script language, it allows to run Pine Script code in a JavaScript environment
 */
export declare class PineTS {
    private source;
    private tickerId?;
    private timeframe?;
    private limit?;
    private sDate?;
    private eDate?;
    data: any;
    open: any;
    high: any;
    low: any;
    close: any;
    volume: any;
    hl2: any;
    hlc3: any;
    ohlc4: any;
    hlcc4: any;
    openTime: any;
    closeTime: any;
    private _readyPromise;
    private _ready;
    private _debugSettings;
    private _transpiledCode;
    get transpiledCode(): Function | String;
    private _currentIndicator;
    private _isSecondaryContext;
    markAsSecondary(): void;
    private _syminfo;
    private _chartTimezone;
    /**
     * Set the chart display timezone (like TradingView's timezone picker).
     * This only affects log timestamp formatting — it does NOT change the timezone
     * used by computation functions (timestamp(), dayofmonth, hour, etc.), which
     * always use the exchange timezone from syminfo.timezone.
     * @param timezone IANA timezone name (e.g. 'America/New_York'), UTC offset ('UTC+5'), or 'UTC'
     */
    setTimezone(timezone: string): void;
    private _maxLoops;
    /**
     * Set the maximum number of iterations allowed per loop.
     * Mirrors TradingView's internal loop protection. If a for/while loop
     * exceeds this limit, a runtime error is thrown.
     * @param maxLoops Maximum iterations per loop (default: 500000)
     */
    setMaxLoops(maxLoops: number): void;
    private _alertMode;
    /**
     * Set alert mode.
     * - 'realtime' (default): alerts only fire on the last (realtime) bar,
     *   matching TradingView behavior.
     * - 'all': alerts fire on every bar, useful for backtesting alert strategies.
     * @param mode Alert firing mode
     */
    setAlertMode(mode: 'realtime' | 'all'): void;
    private _viewportLeft;
    private _viewportRight;
    private _usesVisibleRange;
    private _lastRunViewport;
    private _lastResult;
    private _lastPineTSCode;
    /**
     * Set the visible range of bars from the host (e.g. chart UI viewport).
     * Affects `chart.left_visible_bar_time` and `chart.right_visible_bar_time`.
     * Defaults derive from `marketData[0]/[last].openTime` if never called.
     *
     * The setter only stores values; it does NOT trigger a re-run. Call
     * `update()` afterwards to apply the change. For scripts that don't
     * reference visible-range built-ins, `update()` is a no-op.
     *
     * @param left  openTime of the leftmost visible bar
     * @param right openTime of the rightmost visible bar
     */
    setVisibleRange(left: number, right: number): void;
    /**
     * Whether the loaded script references any visible-range built-in
     * (e.g. `chart.left_visible_bar_time`). Detected statically during
     * transpile. Consumers fanning viewport changes across many indicators
     * should skip non-tagged instances to avoid unnecessary re-runs.
     */
    usesVisibleRange(): boolean;
    /** Current viewport left (undefined if setter never called). */
    get visibleRangeLeft(): number | undefined;
    /** Current viewport right (undefined if setter never called). */
    get visibleRangeRight(): number | undefined;
    /**
     * Smart re-run: executes `run()` only if a re-run is actually needed.
     *
     * - First call: behaves like `run()` (always executes).
     * - Subsequent calls: returns the cached previous result UNLESS the script
     *   is viewport-dependent (`usesVisibleRange()`) AND the viewport has
     *   changed since the last cached run.
     *
     * The typical pattern for a chart consumer with multiple indicators:
     *
     *     // user pans the chart
     *     for (const p of indicators) {
     *         p.setVisibleRange(left, right);
     *         await p.update(code);   // no-op for non-viewport indicators
     *     }
     *
     * The pineTSCode argument is optional after the first call — the same code
     * is reused. Pass it again only when the script source itself has changed.
     */
    update(pineTSCode?: Indicator | Function | String): Promise<Context>;
    constructor(source: IProvider | any[], tickerId?: string, timeframe?: string, limit?: number, sDate?: number, eDate?: number);
    setDebugSettings({ ln, debug }: {
        ln: boolean;
        debug: boolean;
    }): void;
    private loadMarketData;
    ready(): Promise<any>;
    /**
     * Run the Pine Script code and return the resulting context.
     * @param pineTSCode
     * @param periods
     * @returns Promise<Context>
     */
    run(pineTSCode: Indicator | Function | String, periods?: number): Promise<Context>;
    /**
     * Run the Pine Script code with pagination, yielding results page by page.
     * @param pineTSCode
     * @param periods
     * @param pageSize
     * @returns AsyncGenerator<Context>
     */
    run(pineTSCode: Indicator | Function | String, periods: number | undefined, pageSize: number): AsyncGenerator<Context>;
    /**
     * Stream the results of the Pine Script code.
     * Provides an event-based interface for handling streaming data.
     * @param pineTSCode The Pine Script code to execute
     * @param options Streaming options
     * @returns Object with on(event, callback) and stop() methods
     */
    stream(pineTSCode: Indicator | Function | String, options?: {
        pageSize?: number;
        live?: boolean;
        interval?: number;
    }): {
        on: (event: 'data' | 'error' | 'warning' | 'alert', callback: Function) => void;
        stop: () => void;
    };
    /**
     * Run an already-transpiled PineTS function in this instance — no
     * additional transpile/parse pass. Used by `request.security_lower_tf`'s
     * slow path to execute the slice produced at primary-transpile time
     * (a truncated body containing only the prefix up to the call). The
     * caller is responsible for ensuring `transpiledFn` was produced by
     * this transpiler against the same source — calling this with an
     * arbitrary function is unsafe.
     */
    runPretranspiled(transpiledFn: Function, inputs?: Record<string, any>, periods?: number): Promise<Context>;
    /**
     * Run the script completely and return the final context.
     *
     * Execution is split: all bars except the last are processed first, then a
     * var-state snapshot is taken, then the last bar is processed. This gives
     * updateTail() a reliable snapshot-based restore point, matching the
     * pattern used by _runPaginated and eliminates the pop-based drift that
     * occurred when var variables were modified in-place during re-execution.
     * @private
     */
    private _runComplete;
    /**
     * Run the script with pagination, yielding results page by page
     * Each page contains only the new results for that page, not cumulative results
     * Uses a unified loop that handles both historical and live streaming data
     * @private
     */
    private _runPaginated;
    /**
     * Get the length of the result (works for arrays and objects)
     * @private
     */
    private _getResultLength;
    /**
     * Create a context containing only the new results for the current page
     * @private
     */
    private _createPageContext;
    /**
     * Update market data from the last known candle to now (or eDate if provided)
     * Intelligently replaces the last candle if it's still open, or appends new candles
     * @param eDate - Optional end date, defaults to now
     * @returns Object containing: { newCandles: number, updatedLastCandle: boolean }
     * @private
     */
    private _updateMarketData;
    /**
     * Replace a candle at a specific index with new data
     * @private
     */
    private _replaceCandle;
    /**
     * Append a new candle to the end of market data arrays
     * @private
     */
    private _appendCandle;
    /**
     * Update the secondary context's tail with fresh market data.
     *
     * Uses snapshot-restore for reliable var state rollback, matching the
     * approach used by _runPaginated. The pop-based _removeLastResult is
     * only used as a fallback for contexts that have no snapshot (e.g. those
     * produced by runPretranspiled, which skips the split-execute pattern).
     *
     * After restoring state and re-executing, a fresh snapshot is taken before
     * the last bar so that subsequent updateTail() calls also have a valid
     * restore point.
     *
     * @param context - The cached secondary context to update
     * @returns true if data was updated, false if no changes
     */
    updateTail(context: Context): Promise<boolean>;
    /**
     * Remove the last result from context (for updating an open candle)
     * @private
     */
    private _removeLastResult;
    /**
     * Snapshot the var/let/const/params Series state for streaming rollback.
     * Captures the data array length and last value for each variable so we can
     * restore to this exact state before re-executing the last bar.
     *
     * PERF NOTE: This currently snapshots ALL scopes (const, var, let, params).
     * In practice, only `var` variables need snapshot/restore because:
     *   - `let` variables are re-initialized every bar via $.init() — they reset naturally
     *   - `const` variables are set once and never modified
     *   - `params` are function parameters, not modified across bars
     * Only `var` variables persist and get modified in-place by $.set() (e.g. n += 1),
     * which causes drift on streaming re-execution.
     * If this becomes a bottleneck, narrow to `['var']` only.
     *
     * An even lighter alternative: make $.set() on var Series append-only (push
     * instead of in-place modify). Then the existing pop-based _removeLastResult
     * would correctly revert var state without any snapshot. This would require
     * changes to the core Series/set mechanics.
     *
     * @private
     */
    private _snapshotVarState;
    /**
     * Restore var/let/const/params Series state from a snapshot.
     * Truncates each Series' data array back to the snapshotted length.
     * @private
     */
    private _restoreVarState;
    /**
     * Initialize a new context for running Pine Script code
     * @private
     */
    private _initializeContext;
    /**
     * Execute iterations from startIdx to endIdx, updating the context
     * @private
     */
    private _executeIterations;
}
export default PineTS;

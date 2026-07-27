import { Order, StrategyState } from './types';
/**
 * Parse strategy() function arguments
 */
export declare function parseStrategyOptions(args: any[]): any;
/**
 * Round a stop/limit price to the symbol's mintick grid, AWAY from the
 * reference price (typically the current bar's close at order placement).
 *
 * Pine's broker emulator places stop/limit orders on the mintick grid
 * conservatively — a buy stop at 4188.4541 above current 4184 becomes
 * 4188.46 (ceiling), not 4188.45. This makes the order trigger LATER
 * (requires more price movement), mirroring real-broker order placement.
 *
 * The rule:
 *   price > referencePrice → ceil to mintick (push price UP)
 *   price < referencePrice → floor to mintick (push price DOWN)
 *   price === referencePrice → return as-is
 *
 * Covers all four cases naturally:
 *   - Buy stop above current  → ceil
 *   - Sell stop below current → floor
 *   - Buy limit below current → floor
 *   - Sell limit above current → ceil
 *   - Long TP above entry / SL below entry → ceil / floor
 *   - Short TP below entry / SL above entry → floor / ceil
 *
 * For mintick === 0 or undefined (defensive), returns the price unchanged.
 */
export declare function roundToMintick(price: number, referencePrice: number, mintick: number): number;
/**
 * Margin required to hold a position of `qty` contracts at `price`, given
 * the `marginPct` (% of notional that must be posted as collateral). The
 * pointValue factor converts price units to account-currency dollars
 * (1 for crypto, varies for futures).
 *
 * Pine docs (strategy() declaration): `margin_long` / `margin_short` is
 * the percentage of notional held as collateral. 100 = no leverage, 20 =
 * 5× leverage, etc.
 */
export declare function computeRequiredMargin(qty: number, price: number, marginPct: number, pointValue: number): number;
/**
 * Account equity computed AS IF the marketprice were `atPrice` — used to
 * check what equity would be at a hypothetical intra-bar price (e.g. the
 * bar's adverse extreme for a margin-call check).
 *
 *   equity_at_price = initial_capital + netprofit + unrealizedPnL_at_price
 *
 * The mark-to-market is computed against EVERY open trade's entry price.
 */
export declare function computeEquityAtPrice(context: any, atPrice: number): number;
/**
 * Total margin currently held by all open positions, valued at `atPrice`.
 * Per-position margin uses `margin_long` for longs and `margin_short` for
 * shorts (Pine semantic — see strategy() declaration).
 */
export declare function computeHeldMargin(context: any, atPrice: number): number;
/**
 * Calculate order quantity based on strategy configuration
 */
export declare function calculateOrderQty(context: any, specifiedQty: number | undefined, direction: number, fillPrice: number): number;
/**
 * Process pending orders and execute them
 */
export declare function processStrategyOrders(context: any): void;
/**
 * Parse direction string/number to numeric value
 */
export declare function parseDirection(direction: number | string): number;
/**
 * Returns true if adding a same-direction entry would exceed the strategy's
 * pyramiding cap. Counts existing open trades in the requested direction.
 *
 * `strategy.entry()` (when implemented) consults this; `strategy.order()` does
 * NOT — Pine treats strategy.order as a low-level primitive that ignores the
 * pyramiding limit.
 */
export declare function wouldExceedPyramiding(strategy: StrategyState, direction: number): boolean;
/**
 * Pre-fill risk-rule check. Returns true if the order should be BLOCKED.
 *
 * Consulted rules (independent; first violation wins):
 *   - risk_halted (latched by any catastrophic rule)
 *   - allow_entry_in: 'long' blocks short orders; 'short' blocks long
 *   - max_position_size: post-fill |position_size| would exceed N
 */
export declare function isOrderBlockedByRisk(strategy: StrategyState, order: Order): boolean;
/**
 * Latches `risk_halted` when any catastrophic rule trips (max_drawdown,
 * max_intraday_loss, max_cons_loss_days). Once halted, all entries are
 * blocked for the rest of the run.
 *
 * Called after each close. The intraday rules use simple cumulative
 * approximations — true day-rollover detection would require bar timestamp
 * + timezone logic that's deferred.
 */
export declare function evaluateCatastrophicRiskHalt(strategy: StrategyState): void;
/**
 * Open a new trade.
 *
 * @param direction +1 long, -1 short
 * @param qty       unsigned contract count
 * @param price     fill price
 * @param time      fill time (ms)
 */
export declare function openTrade(context: any, entryId: string, direction: number, qty: number, price: number, time: number, entryComment?: string, isReversalOpen?: boolean): void;
/**
 * Close partial or full position.
 *
 * FIFO accounting: closes oldest open trades first. Splits a trade if the
 * close qty is smaller than the trade's remaining qty.
 */
export interface CloseInfo {
    /** Which exit leg triggered ('profit'/'loss'/'trailing'), null otherwise. */
    triggerKind?: 'profit' | 'loss' | 'trailing' | null;
    /** Exit order's id, set onto the closed trade as trade.exit_id. */
    exitId?: string;
    /** Resolved exit comment (the matching comment_profit/loss/trailing). */
    exitComment?: string;
    /**
     * True when this close is part of a single REVERSAL order that will
     * also open a new trade in the opposite direction. Affects
     * `cash_per_order` commission: TV charges the flat fee ONCE per order
     * placement, attributed to the new entry — the implicit close leg of
     * the reversal does NOT incur a second flat charge. Per-leg types
     * (percent, cash_per_contract) are unaffected by this flag.
     */
    isImplicitReversal?: boolean;
}
export declare function closePartialPosition(context: any, qtyToClose: number, exitPrice: number, exitTime: number, closeInfo?: CloseInfo): void;
/**
 * FIFO close of `qtyToClose` contracts from open trades, optionally filtered
 * by `fromEntry` — when set, only trades whose `entry_id === fromEntry` are
 * eligible. Falls back to closing across all open trades when empty/undefined.
 *
 * Wraps `closePartialPosition` by temporarily reorganizing `opentrades` so
 * the matching trades sit at the head of the FIFO queue.
 */
export declare function closeMatching(context: any, fromEntry: string | undefined, qtyToClose: number, exitPrice: number, exitTime: number, closeInfo?: CloseInfo, specificTradeId?: string): void;
/**
 * Process exit-category orders each bar (after entry-order fills, before the
 * user script runs). Handles:
 *   - Market exits from strategy.close() / strategy.close_all() (fill at
 *     current bar's open if placed previously).
 *   - Conditional exits from strategy.exit() — TP / SL / trailing-stop
 *     triggers evaluated against current bar's high/low. Trailing-stop
 *     peak (trade.trail_peak) is updated each bar even when not triggered.
 */
export declare function processExitOrders(context: any, phase?: 'open' | 'intrabar'): void;
/**
 * Apply a SECOND margin call scheduled by the phantom re-check (see
 * processMarginCall). TV books that fill at the PREVIOUS bar's close,
 * AFTER the script's on-close evaluation — so the script and any order
 * it queued saw the pre-MC#2 position. PineTS mirrors this by booking
 * the fill at the very start of the NEXT bar, before entries process:
 * a reversal queued at the MC bar's close (qty frozen at queue time)
 * then naturally overshoots by exactly q2, reproducing TV's phantom
 * opposite-side position (xlsx-confirmed: 2021-10-02 reversal long
 * 5.263108 = 5 + 0.263108).
 *
 * Same-direction (non-reversal) entries queued on the MC bar are
 * CANCELED — TV's transient post-MC state rejects them (2022-04-19: the
 * add queued at the 04-18 close never filled; the next add was accepted
 * a bar later). Opposite-direction reversals are unaffected (E1), and a
 * close-MC that flattens the position leaves nothing to gate (IC=900k
 * experiment: next-open entry from flat was admitted).
 */
export declare function applyPendingCloseMarginCall(context: any): void;
/**
 * True when the bar's first intra-bar move is ADVERSE for the current
 * position (TV broker-emulator path assumption: open closer to high →
 * open→high→low→close; open closer to low → open→low→high→close).
 * Used to path-order the margin-call checkpoint against exit fills.
 */
export declare function isAdverseFirstBar(context: any): boolean;
/**
 * Margin-call check (TV broker emulator) at one of two intra-bar
 * CHECKPOINTS along the assumed price path:
 *
 *   'open'    — right after entries fill at the bar's open: equity and
 *               required margin evaluated AT THE OPEN, liquidation fills
 *               at the open price.
 *   'extreme' — at the bar's adverse extreme (low for longs, high for
 *               shorts), liquidation fills at the extreme itself — the
 *               pessimistic broker model (intra-bar tick order unknown).
 *   'close'   — at the bar's close, after all exits: if the (possibly
 *               already-trimmed) position still breaches at the closing
 *               price, another partial liquidation fills at the close.
 *               Evidence: 2021-10-01 (profit QA) shows TWO same-bar MC
 *               prices — 4×cover at the high, then a further 0.263108
 *               at 48,147.38 (the close).
 *
 * TV checks margin along the path, interleaved with exit fills — proven
 * by the MC-ordering probe (BTCUSDT 1D, 2026-02-05): a 5-lot short
 * entered at the open was split within one bar into MC 0.00228 at the
 * OPEN price, MC 0.0888 at the high, then a TP fill of 4.90892 at the
 * lows. The caller orders the 'extreme' checkpoint BEFORE exit
 * processing on adverse-first bars and AFTER it on favorable-first bars
 * (favorable exits free margin before the adverse extreme is reached).
 *
 * Runs for ALL margin percentages including 100%. At 100% margin the
 * trader still needs full notional collateral; adverse price movement
 * that drops account equity below the position's current notional
 * triggers a margin call. This matches TV's broker-emulator behavior
 * (the "Margin calls" stat in the Strategy Tester is non-zero on 100%
 * margin runs whenever a position's mark-to-market loss exceeds equity).
 */
export declare function processMarginCall(context: any, checkpoint?: 'open' | 'extreme' | 'close'): void;
/**
 * End-of-bar finalize: refresh equity at CLOSE and latch
 * `strategy.max_drawdown` / `strategy.max_runup` using the bar's H/L. Runs
 * UNCONDITIONALLY once per bar (after entry+exit fills are done), regardless
 * of whether the strategy uses exit orders.
 */
export declare function finalizeStrategyBar(context: any): void;
/**
 * End-of-run finalize: compute the risk-adjusted performance ratios
 * (Sharpe / Sortino) from the monthly equity curve captured during the
 * run. Called ONCE after the last bar (see PineTS.class.ts).
 *
 * TV broker-emulator formula (confirmed against the Help Center docs and
 * reverse-engineered to the third decimal across 7 QA datasets,
 * 2026-06-15):
 *   - Sample the MARK-TO-MARKET equity at each calendar month's close.
 *   - Monthly simple returns rᵢ = Eᵢ / Eᵢ₋₁ − 1, anchored at the initial
 *     capital (the first return runs from initial_capital to month 1).
 *   - MR = mean(rᵢ);  RFR = risk_free_rate / 100 / 12 (annual % → monthly).
 *   - Sharpe  = (MR − RFR) / SD,  SD = √(Σ(rᵢ − MR)² / N)   (population).
 *   - Sortino = (MR − RFR) / DD,  DD = √(Σ min(0, rᵢ − RFR)² / N)
 *     (downside deviation over ALL N returns, target = RFR — per TV's
 *     documented DD = sqrt(sum(min(0, Xᵢ − T))² / N)).
 *   - No annualization.
 *
 * Note: the ratios are only as accurate as the bar-by-bar equity path;
 * they ride on the strategy engine's mark-to-market fidelity. With < 2
 * monthly returns (very short backtests) they are left at 0.
 */
export declare function finalizeStrategyRun(context: any): void;
/**
 * Initialize strategy state
 */
export declare function initializeStrategy(context: any, config: any): void;

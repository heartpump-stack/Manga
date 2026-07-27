/**
 * Average per-trade loss (as a SIGNED negative percent) across losing
 * closed trades. NaN when no losers yet.
 *
 * Note: `strategy.avg_losing_trade` (the dollar version) is reported as
 * a POSITIVE magnitude by Pine convention, but `_percent` is signed —
 * negative values, since they represent losses.
 */
export declare function avg_losing_trade_percent(context: any): () => number;

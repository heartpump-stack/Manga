/**
 * Average per-trade return (as a percent) across winning closed trades.
 * NaN when no winners yet. Matches Pine's strategy.avg_winning_trade_percent.
 */
export declare function avg_winning_trade_percent(context: any): () => number;

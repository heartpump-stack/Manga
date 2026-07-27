/**
 * Average per-trade return as a percent. Computed as the mean of each
 * closed trade's individual profit_percent = profit / (entry_price * |size|) * 100.
 * NaN when no trades have closed. Matches Pine's strategy.avg_trade_percent.
 */
export declare function avg_trade_percent(context: any): () => number;

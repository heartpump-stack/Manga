/**
 * Average loss across losing closed trades, returned as a POSITIVE number
 * (Pine convention: average loss is unsigned). NaN when no losers yet.
 * Matches Pine's strategy.avg_losing_trade.
 */
export declare function avg_losing_trade(context: any): () => number;

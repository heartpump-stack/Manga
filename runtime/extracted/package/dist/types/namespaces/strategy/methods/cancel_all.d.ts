/**
 * Cancel all pending orders (entries only — exits attached to open trades
 * are not affected since they ride on positions, not orders).
 * Pine signature: strategy.cancel_all() → void
 */
export declare function cancel_all(context: any): () => void;

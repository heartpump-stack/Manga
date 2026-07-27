/** Split `"SYM;modifier"` into its parts. Plain symbols yield `modifier: null`. */
export declare function splitTickerModifier(tickerId: string): {
    symbol: string;
    modifier: string | null;
};
/** The plain symbol with any chart-type modifier removed. */
export declare function stripTickerModifier(tickerId: string): string;
/** Append a chart-type modifier (replacing any existing one; idempotent). */
export declare function withTickerModifier(tickerId: string, modifier: string): string;

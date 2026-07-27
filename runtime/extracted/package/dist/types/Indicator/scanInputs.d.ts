import type { IPineInput } from './types';
/**
 * Public entry point. Returns `[]` for invalid Pine or for non-string source.
 */
export declare function scanInputs(source: unknown): IPineInput[];

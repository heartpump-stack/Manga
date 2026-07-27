/**
 * Pine Script integer division (`int / int → int`).
 *
 * TradingView truncates the quotient toward zero when BOTH operands are of
 * type `int` (Java semantics: `11 / 2 == 5`, `-7 / 2 == -3`). Plain JS `/`
 * always yields a float, which breaks idioms like `pivots(high, depth / 2)`
 * where the result feeds a series history offset.
 *
 * The pine2js codegen emits this helper only when both operands are
 * statically provable ints (declared `int` vars/params, int literals,
 * `input.int`, int-result expressions). Anything unprovable keeps plain `/`.
 *
 * - `na` in either operand propagates (`NaN`).
 * - Division by zero returns `na` (`NaN`) instead of JS `Infinity`.
 */
export declare function __intDiv(context: any): (a: any, b: any) => number;

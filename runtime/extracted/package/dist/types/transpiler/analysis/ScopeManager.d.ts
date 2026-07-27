export declare class ScopeManager {
    private scopes;
    private scopeTypes;
    private scopeCounts;
    private contextBoundVars;
    private arrayPatternElements;
    private rootParams;
    private localSeriesVars;
    private varKinds;
    private loopVars;
    private loopVarNames;
    private paramIdCounter;
    private cacheIdCounter;
    private tempVarCounter;
    private taCallIdCounter;
    private userCallIdCounter;
    private plotCallIdCounter;
    private alertCallIdCounter;
    private loopGuardCounter;
    private hoistingStack;
    private suppressHoisting;
    private reservedNames;
    private userFunctions;
    private userMethods;
    /**
     * Regular user-declared functions (i.e. NOT methods). Tracked separately
     * from `userFunctions` so a UFCS-style direct call to a method-only
     * declaration (`foo(receiver, args)` where `foo` was declared as
     * `method foo(...)`) can be retargeted to the prefixed JS name.
     *
     * If a Pine name has both a regular function and a method form, the
     * regular function takes precedence for direct `name(args)` calls and
     * the method is reachable via dot-syntax `obj.name(args)`.
     */
    private regularUserFunctions;
    /**
     * Registry of user-defined UDT type names → their field map (fieldName → fieldType).
     * Populated from `const X = Type({fieldA: ['type', default], ...})` declarations
     * (which pine2js emits from Pine `type X` declarations).
     *
     * V2 data model: stores field-type metadata. V1 logic only consults
     * `isUdtTypeName` for now; field metadata is ready for future use-site
     * type-aware rewrites (nested UDT chains, mixed scalar/array fields, etc.).
     */
    private udtTypeNames;
    /**
     * Registry of user variables that hold UDT instances → the UDT type name.
     * Populated from `let bar = X.new(...)` / `bar = X.copy(...)` where
     * `X ∈ udtTypeNames`. Stores the type name (V2 shape) so future passes
     * can do typed-field lookups via `getUdtTypeFields(typeName)` without
     * a refactor. V1 logic only consults `isUdtInstance`.
     */
    private udtInstances;
    /**
     * Registry of user-defined function names → UDT type they return.
     * Populated by inspecting each FunctionDeclaration's return paths during
     * the UDT pre-pass. A function is registered only when ALL return paths
     * unambiguously produce the SAME UDT type.
     *
     * Used by the instance populator so that `bar = makeBar()` registers
     * `bar` as a UDT instance when `makeBar` is known to return one.
     */
    private functionReturnTypes;
    /**
     * Registry of user-defined function names → tuple of UDT type names they
     * return. Each slot holds either the UDT type name at that position, or
     * `undefined` when that position is not (unambiguously) a UDT instance.
     *
     * Populated when ALL return paths of a function are ArrayExpressions of
     * the SAME length and each position resolves to the SAME UDT (or to
     * something non-UDT, which becomes `undefined`).
     *
     * Used by the instance populator so that `[a, b] = makeBars()` registers
     * `a` and `b` as UDT instances at their respective tuple positions.
     */
    private functionReturnTupleTypes;
    /**
     * Registry of user-defined function names → map of {paramName → UDT type}.
     * Populated from `<funcName>.__pineParamTypes__ = {...}` markers emitted
     * by pine2js codegen for parameters that carried a Pine type annotation
     * (e.g. `readField(BAR b)`). Filtered to UDT-known types so non-UDT
     * annotations like `int` / `float` / `string` never enter the map.
     *
     * Consumed by `transformFunctionDeclaration`: when entering a function's
     * body, each typed param is temporarily registered as a UDT instance
     * (`markVariableAsUdtInstance`) so the use-site rewrite for `b.field[N]`
     * fires inside the body. The registration is removed when leaving the
     * function scope, keeping the global registry clean.
     */
    private functionParamUdtTypes;
    get nextParamIdArg(): any;
    get nextCacheIdArg(): any;
    getNextTACallId(): any;
    getNextUserCallId(): any;
    getNextPlotCallId(): any;
    getNextAlertCallId(): any;
    getNextLoopGuardName(): string;
    constructor();
    pushScope(type: string): void;
    popScope(): void;
    getCurrentScopeType(): string;
    /**
     * True when any active scope on the stack is a function scope.
     * Different from `getCurrentScopeType() === 'fn'`, which only matches
     * the immediate scope — code inside a nested `if`/`for`/`while` inside
     * a function body still needs the function-scope context (e.g. for
     * call-path-keyed param/ta-callsite ids).
     */
    isInsideFunctionScope(): boolean;
    getCurrentScopeCount(): number;
    addLocalSeriesVar(name: string): void;
    removeLocalSeriesVar(name: string): void;
    isLocalSeriesVar(name: string): boolean;
    addUdtTypeName(typeName: string, fields?: Record<string, string>): void;
    isUdtTypeName(name: string): boolean;
    getUdtTypeFields(typeName: string): Record<string, string> | undefined;
    markVariableAsUdtInstance(varName: string, typeName: string): void;
    getVariableUdtType(varName: string): string | undefined;
    isUdtInstance(varName: string): boolean;
    /**
     * Record a user-defined function as returning a specific UDT type.
     * Idempotent — re-registering with the same type is a no-op; conflicting
     * registrations (different type) drop back to "unknown" by removing the
     * entry, so an ambiguous function never falsely promotes a caller.
     */
    setFunctionReturnType(funcName: string, typeName: string): void;
    getFunctionReturnType(funcName: string): string | undefined;
    /**
     * Record a user-defined function as returning a tuple whose positions
     * carry specific UDT types (or `undefined` for non-UDT positions).
     * Idempotent — re-registering with the same shape is a no-op; conflicting
     * registrations (different length OR different type at any position) drop
     * the entry, so an ambiguous function never falsely promotes a caller.
     */
    setFunctionReturnTupleType(funcName: string, tupleTypes: (string | undefined)[]): void;
    getFunctionReturnTupleType(funcName: string): (string | undefined)[] | undefined;
    /**
     * Record a user-defined function's UDT-typed parameters. The argument
     * is a `paramName → UDT type` map filtered down to UDT-known types only.
     */
    setFunctionParamUdtTypes(funcName: string, paramTypes: Record<string, string>): void;
    getFunctionParamUdtTypes(funcName: string): Record<string, string> | undefined;
    /**
     * Remove a previously-registered UDT instance entry. Used to roll back
     * scope-local registrations (e.g. UDT-typed function parameters) when
     * leaving the function body, so the global registry stays clean.
     */
    unmarkVariableAsUdtInstance(varName: string): void;
    addContextBoundVar(name: string, isRootParam?: boolean): void;
    removeContextBoundVar(name: any): void;
    addArrayPatternElement(name: string): void;
    isContextBound(name: string): boolean;
    isArrayPatternElement(name: string): boolean;
    isRootParam(name: string): boolean;
    addLoopVariable(originalName: string, transformedName: string): void;
    removeLoopVariable(originalName: string): void;
    getLoopVariableName(name: string): string | undefined;
    isLoopVariable(name: string): boolean;
    addReservedName(name: string): void;
    addUserFunction(name: string): void;
    isUserFunction(name: string): boolean;
    addUserMethod(name: string): void;
    isUserMethod(name: string): boolean;
    addRegularUserFunction(name: string): void;
    isRegularUserFunction(name: string): boolean;
    addVariable(name: string, kind: string): string;
    getVariable(name: string): [string, string];
    /**
     * Check if a variable (by original name) lives inside a function scope.
     * Walks the scope stack to find which scope owns the variable, then checks
     * whether any scope from the root up to (and including) that level is a
     * function scope ('fn').  This allows nested scopes (if, else, for, while)
     * inside functions to be correctly treated as function-local.
     */
    isVariableInFunctionScope(name: string): boolean;
    generateTempVar(): string;
    enterHoistingScope(): void;
    exitHoistingScope(): any[];
    addHoistedStatement(stmt: any): void;
    /**
     * Hoist a statement to the script body scope (inside the async IIFE).
     * Used for TA built-in variable auto-calls (e.g. ta.obv) that must run
     * every bar, even when referenced inside conditional blocks.
     *
     * hoistingStack layout for PineTS:
     *   [0] = Program level (outside IIFE — variables not in scope)
     *   [1] = IIFE body level (script's top-level — correct target)
     *   [2+] = inner scopes (if-blocks, loops, etc.)
     */
    addOuterHoistedStatement(stmt: any): void;
    getCurrentHoistingScope(): any[] | null;
    setSuppressHoisting(suppress: boolean): void;
    shouldSuppressHoisting(): boolean;
    hasVariableInScope(name: string): boolean;
    generateParamId(): string;
}
export default ScopeManager;

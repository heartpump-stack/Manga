export declare class CodeGenerator {
    private indent;
    private indentStr;
    private output;
    private sourceCode;
    private sourceLines;
    private lastCommentedLine;
    private includeSourceComments;
    private paramRenameCounter;
    private functionParams;
    constructor(options?: {
        indentStr?: string;
        sourceCode?: string;
        includeSourceComments?: boolean;
    });
    generate(ast: any): string;
    private preProcessAST;
    /**
     * Scan the program body for declarations whose names would collide with
     * either Pine namespaces or JavaScript reserved keywords. Rename them
     * with a `_$N` suffix.
     *
     * Two collision classes, one rename pass:
     *
     *  1. Pine namespace collisions (NAMESPACE_COLLISION_NAMES — e.g. `fill`,
     *     `size`, `color`, `line`): user variable would shadow the namespace
     *     destructured from `$.pine`. The CALL SITE `fill(...)` is the
     *     namespace, NOT the renamed variable, so callees are NOT renamed.
     *
     *  2. JS reserved keyword collisions (JS_RESERVED_WORDS — e.g. `delete`,
     *     `super`, `static`): the generated JS would fail to parse
     *     (`function delete()` → "Unexpected keyword 'delete'"). The CALL SITE
     *     `delete(arg)` IS the user function, so callees MUST be renamed.
     *
     * The walker checks the original name's source list at each call site to
     * pick the right behavior.
     *
     * Renaming rules (common):
     * - Variable declaration target (let fill = ...)  → renamed
     * - Function declaration name (function delete()) → renamed (class 2 only)
     * - Assignment target (fill := ...)               → renamed
     * - Bare identifier read (return fill)            → renamed
     * - MemberExpression object (size.tiny)           → NOT renamed
     * - MemberExpression property (obj.delete)        → NOT renamed
     * - Object property key ({size: ...})             → NOT renamed
     */
    private renameConflictingVariables;
    /**
     * True if `name` requires renaming — either a Pine namespace collision
     * or a JS reserved keyword (which would make the generated JS invalid).
     */
    private isReservedName;
    /**
     * Walk the AST and collect declarations whose names conflict with either
     * Pine namespaces (NAMESPACE_COLLISION_NAMES) or JS reserved keywords
     * (JS_RESERVED_WORDS). Both collision classes are renamed with the same
     * `_$N` suffix scheme.
     */
    private collectConflictingVarNames;
    /**
     * Context-aware variable reference renaming.
     * Renames Identifiers that are user-variable references, but skips:
     * - CallExpression callees (namespace function calls)
     * - MemberExpression objects with non-computed property (namespace.member)
     * - MemberExpression non-computed properties (obj.namespace)
     * - Object property keys ({namespace: value})
     */
    private renameVariableRefsInAST;
    private collectFunctionParams;
    writeSourceComment(startLine: any, endLine?: any): void;
    write(str: any): void;
    writeLine(str?: string): void;
    increaseIndent(): void;
    decreaseIndent(): void;
    generateProgram(node: any): void;
    generateStatement(node: any): void;
    generateTypeDefinition(node: any): void;
    private renameIdentifiersInAST;
    private renameParamRefsInBody;
    generateFunctionDeclaration(node: any): void;
    generateVariableDeclaration(node: any): void;
    generateExpressionStatement(node: any): void;
    generateIfStatement(node: any): void;
    generateIfStatementWithAssignment(condExpr: any, varName: any): void;
    generateNestedIfWithAssignments(node: any, varName: any): void;
    generateNestedIfAlternatesWithAssignments(alternate: any, varName: any): void;
    generateForStatement(node: any): void;
    generateWhileStatement(node: any): void;
    generateReturnStatement(node: any): void;
    generateBlockStatement(node: any, addIndent?: boolean): void;
    generateExpression(node: any): void;
    generateLiteral(node: any): void;
    generateBinaryExpression(node: any): void;
    generateUnaryExpression(node: any): void;
    generateAssignmentExpression(node: any): void;
    generateUpdateExpression(node: any): void;
    generateCallExpression(node: any): void;
    generateMemberExpression(node: any): void;
    generateConditionalExpression(node: any): void;
    generateIIFEConditional(node: any): void;
    generateIIFEIfBlock(node: any): void;
    generateNestedIfWithReturns(node: any): void;
    generateNestedIfAlternates(alternate: any): void;
    generateNestedIfAsExpression(node: any): void;
    generateArrayExpression(node: any): void;
    generateObjectExpression(node: any): void;
    generateSwitchExpression(node: any): void;
    generateSwitchAsIfElseIIFE(node: any): void;
    generateSwitchAsIfElse(node: any): void;
    generateLoopAsExpression(node: any, loopType: any): void;
    generateSequenceExpression(node: any): void;
    getPrecedence(node: any): 3 | 5 | 15 | 2 | 4 | 1 | 10 | 0 | 9 | 12 | 13 | 20 | 19;
}

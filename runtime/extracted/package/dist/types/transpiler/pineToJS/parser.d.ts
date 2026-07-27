import { Token } from './tokens';
import { Program, VariableDeclaration, FunctionDeclaration, TypeDefinition, IfStatement, ForStatement, WhileStatement, BlockStatement, CallExpression, ArrayExpression, SwitchExpression } from './ast';
export declare class Parser {
    private tokens;
    private pos;
    private functionNames;
    private paramScopes;
    private noLineContinuation;
    constructor(tokens: Token[]);
    peek(offset?: number): Token;
    private isCurrentFunctionParam;
    advance(): Token;
    match(type: any, value?: any): boolean;
    expect(type: any, value?: any): Token;
    private static readonly CONTEXTUAL_KEYWORDS;
    /**
     * Consume an identifier OR a contextual keyword used as an identifier.
     * Used in positions where Pine permits soft keywords as names — most notably
     * UDT field names like `int type = 0`.
     */
    expectIdentifierOrContextual(): Token;
    matchEx(type: any, value?: any, allowLineContinuation?: boolean): boolean;
    peekOperatorEx(validOps: string[]): any;
    skipNewlines(allowIndent?: boolean): void;
    parse(): Program;
    parseStatement(handleCommas?: boolean): any;
    isFunctionDeclaration(): boolean;
    parseTypeExpression(): any;
    parseEnumDefinition(): VariableDeclaration;
    parseTypeDefinition(): TypeDefinition;
    parseVarDeclaration(): VariableDeclaration;
    isTypedVarDeclaration(): boolean;
    parseTypedVarDeclaration(): VariableDeclaration;
    parseFunctionDeclaration(): FunctionDeclaration;
    parseMethodDeclaration(): FunctionDeclaration;
    parseFunctionBody(): BlockStatement;
    /**
     * Recursively convert the last expression in a statement list to a ReturnStatement.
     * Handles if/else chains by adding return to each branch's last expression.
     */
    private _addImplicitReturn;
    private _addImplicitReturnToIf;
    parseStatementOrSequence(): any;
    parseIfStatement(): IfStatement;
    parseForStatement(): ForStatement;
    parseWhileStatement(): WhileStatement;
    parseBlock(): BlockStatement;
    isTupleDestructuring(): boolean;
    parseTupleDestructuring(): VariableDeclaration;
    parseExpression(): any;
    parseTernary(): any;
    parseLogicalOr(): any;
    parseLogicalAnd(): any;
    parseEquality(): any;
    parseComparison(): any;
    parseAdditive(): any;
    parseMultiplicative(): any;
    parseUnary(): any;
    parsePostfix(): any;
    parseCallExpression(callee: any): CallExpression;
    parsePrimary(): any;
    parseArrayLiteral(): ArrayExpression;
    parseIfExpression(): any;
    needsIIFE(consequentStmts: any, alternateStmts: any): any;
    parseSwitchExpression(): SwitchExpression;
    parseForExpression(): ForStatement;
    parseWhileExpression(): WhileStatement;
    getBlockValue(statements: any): any;
}

import ScopeManager from '../analysis/ScopeManager';
/**
 * Creates the AST nodes for a loop guard:
 * 1. A counter declaration: `let __lgN = 0;` (to be hoisted before the loop)
 * 2. A guard check: `if (++__lgN > __maxLoops) throw new Error("Loop exceeded maximum iterations (__lgN)");`
 *    (to be prepended to the loop body)
 */
export declare function createLoopGuardNodes(guardName: string): {
    counterDecl: any;
    guardCheck: any;
};
export declare function transformAssignmentExpression(node: any, scopeManager: ScopeManager): void;
export declare function transformVariableDeclaration(varNode: any, scopeManager: ScopeManager): void;
export declare function transformForStatement(node: any, scopeManager: ScopeManager, c: any): void;
export declare function transformWhileStatement(node: any, scopeManager: ScopeManager, c: any): void;
export declare function transformExpression(node: any, scopeManager: ScopeManager): void;
export declare function transformIfStatement(node: any, scopeManager: ScopeManager, c: any): void;
export declare function transformReturnStatement(node: any, scopeManager: ScopeManager): void;
export declare function transformFunctionDeclaration(node: any, scopeManager: ScopeManager, c: any): void;

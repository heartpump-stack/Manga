import { Token } from './tokens';
export declare class Lexer {
    private source;
    private pos;
    private line;
    private column;
    private tokens;
    private indentStack;
    private atLineStart;
    private parenDepth;
    private bracketDepth;
    private braceDepth;
    constructor(source: string);
    tokenize(): Token[];
    handleNewline(): void;
    handleIndentation(): void;
    /**
     * True when the most recently emitted token (skipping NEWLINE / COMMENT
     * — those are layout, not content) is a token that requires a right-
     * hand-side and therefore implies the next non-blank line is a
     * continuation, not a new block. Mirrors the set the parser's
     * `peekOperatorEx` already crosses NEWLINE for.
     */
    private isContinuationFromPrevToken;
    readComment(): void;
    readString(): void;
    readColorLiteral(): void;
    readNumber(): void;
    readIdentifier(): void;
    readOperatorOrPunctuation(): boolean;
    peek(offset?: number): string;
    advance(): string;
    skipWhitespaceInline(): void;
    isDigit(ch: any): boolean;
    isIdentifierStart(ch: any): boolean;
    isIdentifierChar(ch: any): boolean;
    getCurrentIndent(): number;
    addToken(type: any, value: any, indent?: any, raw?: any): void;
}

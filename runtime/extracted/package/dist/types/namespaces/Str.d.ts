import { Context } from '..';
import { PineArrayObject } from './array/PineArrayObject';
export declare class Str {
    private context;
    constructor(context: Context);
    param(source: any, index?: number, name?: string): any;
    tostring(value: any, formatStr?: string): string;
    tonumber(value: any): number;
    lower(value: string): string;
    upper(value: string): string;
    trim(value: string): string;
    repeat(source: string, repeat: number, separator?: string): string;
    replace_all(source: string, target: string, replacement: string): string;
    replace(source: string, target: string, replacement: string, occurrence?: number): string;
    contains(source: string, target: string): boolean;
    endswith(source: string, target: string): boolean;
    startswith(source: string, target: string): boolean;
    pos(source: string, target: string): number;
    length(source: string): number;
    match(source: string, pattern: string): RegExpMatchArray;
    split(source: string, separator: string): PineArrayObject;
    substring(source: string, begin_pos: number, end_pos: number): string;
    /**
     * Format a UNIX millisecond timestamp using Java SimpleDateFormat-style tokens
     * (yyyy, MM, dd, HH, mm, ss, EEE, EEEE, MMM, MMMM, a, h, S, Z, etc.).
     * Text inside single quotes is treated as a literal; '' produces a literal '.
     */
    format_time(time: any, format?: string, timezone?: string): string;
    format(message: string, ...args: any[]): string;
}

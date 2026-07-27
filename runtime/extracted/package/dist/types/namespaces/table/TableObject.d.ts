export declare function resetTableIdCounter(): void;
export interface TableCell {
    text: string;
    width: number;
    height: number;
    text_color: string;
    text_halign: string;
    text_valign: string;
    text_size: string | number;
    bgcolor: string;
    tooltip: string;
    text_font_family: string;
    _merged: boolean;
    _merge_parent: [number, number] | null;
}
export interface MergeRegion {
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
}
export declare class TableObject {
    id: number;
    position: string;
    columns: number;
    rows: number;
    bgcolor: string;
    frame_color: string;
    frame_width: number;
    border_color: string;
    border_width: number;
    force_overlay: boolean;
    _deleted: boolean;
    cells: (TableCell | null)[][];
    merges: MergeRegion[];
    private _helper;
    constructor(position?: string, columns?: number, rows?: number, bgcolor?: string, frame_color?: string, frame_width?: number, border_color?: string, border_width?: number, force_overlay?: boolean);
    delete(): void;
    toPlotData(): any;
    setCell(column: number, row: number, props: Partial<TableCell>): void;
    getCell(column: number, row: number): TableCell | null;
    clearCell(column: number, row: number): void;
    _setHelper(helper: any): void;
    cell(...args: any[]): any;
    clear(...args: any[]): any;
    merge_cells(...args: any[]): any;
    cell_set_text(...args: any[]): any;
    cell_set_bgcolor(...args: any[]): any;
    cell_set_text_color(...args: any[]): any;
    cell_set_text_size(...args: any[]): any;
    cell_set_height(...args: any[]): any;
    cell_set_width(...args: any[]): any;
    cell_set_tooltip(...args: any[]): any;
    cell_set_text_halign(...args: any[]): any;
    cell_set_text_valign(...args: any[]): any;
    cell_set_text_font_family(...args: any[]): any;
    set_position(...args: any[]): any;
    set_bgcolor(...args: any[]): any;
    set_border_color(...args: any[]): any;
    set_border_width(...args: any[]): any;
    set_frame_color(...args: any[]): any;
    set_frame_width(...args: any[]): any;
    private _defaultCell;
}

// 0-based: for arrays, loops, and config layouts
export type ArrayIndex = number & { __: "0-based" };
// 1-based:for sheet rows and columns
export type SheetIndex = number & { __: "1-based" };

// converts SheetIndex (1-based) to ArrayIndex(0-based)
export const toArrayIndex = (i: SheetIndex): ArrayIndex =>
  (i - 1) as ArrayIndex;

// converts ArrayIndex (0-based) to SheetIndex (1-based)
export const toSheetIndex = (i: ArrayIndex): SheetIndex =>
  (i + 1) as SheetIndex;

export const asArrayIndex = (i: number): ArrayIndex => i as ArrayIndex;

export interface SheetMetadata {
  label?: string;
  type?: string;
  description?: string;
  layout?: string;
  module_clearAttendance?: boolean;
  module_attendanceTracker?: boolean;
  module_refocus?: boolean;
}

export type ColumnDef<T> = {
  header: string;
  key: keyof T | null;
};

export interface BaseLayout {
  id: ArrayIndex;
  name: ArrayIndex;
}

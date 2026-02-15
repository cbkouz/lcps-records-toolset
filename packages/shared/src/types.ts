import { CORE_COLUMNS, MODULES } from "./schema";

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

type ExtractKeys<T> = {
  [K in keyof T]: T[K] extends { key: infer Key }
    ? Key extends string
      ? Key
      : never
    : never;
}[keyof T];

type CoreKeys = ExtractKeys<typeof CORE_COLUMNS>;
type ModuleKeys = ExtractKeys<typeof MODULES>;

export type MetadataModuleKey = typeof MODULES[keyof typeof MODULES]["key"];

export type SheetMetadata = Partial<Record<CoreKeys, string>> &
  Partial<Record<ModuleKeys, boolean>>;

export interface SheetConfig {
  tabId: number;
  meta: SheetMetadata;
}

export interface BaseColumnDef {
  header: string;
  key: string | null;
}

export type SheetWithTags = { sheet: GoogleAppsScript.Spreadsheet.Sheet, tags: Map<string, string> };
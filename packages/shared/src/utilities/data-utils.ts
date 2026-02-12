import { ClassSheetLayout } from "@shared/config/class-layouts";
import {
  ArrayIndex,
  asSheetIndex,
  SheetIndex,
  toSheetIndex,
} from "@shared/config/config-types";

export function isValidId(id: string): boolean {
  const idPattern = /^\d{6,7}$/; // Pattern: 6 or 7-digit numeric ID
  return idPattern.test(String(id).trim());
}

export function formatDate(
  date: Date = new Date(),
  format: string = "yyyy-MM-dd",
): string {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
}

/**
 * UTILITY TYPE:
 * Takes any object configuration (T) where the values are numbers,
 * and transforms all those values into strict `SheetIndex` types.
 */
export type SheetColumnMap<T> = {
  [K in keyof T]: SheetIndex;
};

/**
 * RUNTIME HELPER:
 * Actually does the math.
 * Takes a 0-based layout config and returns a 1-based SheetColumnMap.
 */
export function toSheetColumns<T extends Record<string, ArrayIndex>>(
  layout: T,
): SheetColumnMap<T> {
  const result = {} as SheetColumnMap<T>;
  for (const key in layout) {
    if (Object.prototype.hasOwnProperty.call(layout, key)) {
      result[key] = toSheetIndex(layout[key]);
    }
  }
  return result;
}

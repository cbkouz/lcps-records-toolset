import { ArrayIndex } from "./types";

export function isValidId(id: string): boolean {
  const idPattern = /^\d{6,7}$/; // Pattern: 6 or 7-digit numeric ID
  return idPattern.test(String(id).trim());
}

export function isStudentRow(row: any[], idCol: ArrayIndex): boolean {
  const id = row[idCol];
  return isValidId(id);
}

export function formatDate(
  date: Date = new Date(),
  format: string = "yyyy-MM-dd",
): string {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
}

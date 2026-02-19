import { SheetIndex } from "@shared/types";

export function isStudentRow(idCell: string): boolean {
  const idPattern = /^\d{6,7}$/; // Pattern: 6 or 7-digit numeric ID
  return idPattern.test(String(idCell).trim());
}

export function columnNumberToLetter(column: SheetIndex): string {
  let temp: number = column;
  let letter = "";
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

export function zeroHours(date: Date): number {
  return date.setHours(0, 0, 0, 0);
}

export function dateToString(date: Date): string {
  return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}
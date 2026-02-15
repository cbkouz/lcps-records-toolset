export function isStudentRow(idCell: string): boolean {
  const idPattern = /^\d{6,7}$/; // Pattern: 6 or 7-digit numeric ID
  return idPattern.test(String(idCell).trim());
}
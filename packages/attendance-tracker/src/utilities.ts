export function isValidDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}
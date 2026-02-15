import { ArrayIndex, asArrayIndex } from "./types";

export interface BaseLayout {
  id: ArrayIndex;
  name: ArrayIndex;
}

/** Builds layouts with ArrayValue types */
type RawLayout = Record<string, number>;
export function buildLayout<T extends RawLayout>(
  raw: T,
): { [K in keyof T]: ArrayIndex } {
  const result: any = {};
  for (const key in raw) {
    result[key] = asArrayIndex(raw[key]);
  }
  return result;
}

export const REFOCUS_LAYOUT = buildLayout({
  id: 0, // Column A
  name: 1, // Column B
  gradeLevel: 2, // Column C
  enrollmentDate: 5, // Column F
  supportNeeded: 6, // Column G
  datesAttended: 15, // Column P
}) satisfies BaseLayout;

export type RefocusLayout = typeof REFOCUS_LAYOUT;

export const ELEMENTARY_LAYOUT = buildLayout({
  id: 4, // Column E
  name: 1, // Column B
  gradeLevel: 0, // Column A
  enrollmentDate: 8, // Column I
  departureDate: 9, // Column J
  supportNeeded: 2, // Column C
  datesAttended: 25, // Column Z
}) satisfies BaseLayout;

export type ElementaryLayout = typeof ELEMENTARY_LAYOUT;

export const DAY_PROGRAM_LAYOUT = buildLayout({
  id: 6, // Column G
  name: 1, // Column B
  gradeLevel: 0, // Column A
  enrollmentDate: 9, // Column J
  departureDate: 10, // Column K
}) satisfies BaseLayout;

export type DayProgramLayout = typeof DAY_PROGRAM_LAYOUT;

export const LAYOUT_REGISTRY = {
  refocus: REFOCUS_LAYOUT,
  elementary: ELEMENTARY_LAYOUT,
  dayProgram: DAY_PROGRAM_LAYOUT,
} satisfies Record<string, BaseLayout>;

export type LayoutKey = keyof typeof LAYOUT_REGISTRY;

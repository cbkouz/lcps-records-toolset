import { ArrayIndex, asArrayIndex, SheetIndex } from "./config-types";
import { SHEET_LAYOUTS } from "./shared-config";

export interface ClassSheetLayout {
  // 0-based col indexes
  id: ArrayIndex;
  name: ArrayIndex;
  gradeLevel: ArrayIndex;
  enrollmentDate: ArrayIndex;
  departureDate?: ArrayIndex;
  supportNeeded?: ArrayIndex;
  datesAttended?: ArrayIndex;
}

export const Refocus: ClassSheetLayout = {
  id: asArrayIndex(0), // Column A
  name: asArrayIndex(1),
  gradeLevel: asArrayIndex(2), // Column C
  enrollmentDate: asArrayIndex(5), // Column F
  supportNeeded: asArrayIndex(6), // Column G
  datesAttended: asArrayIndex(15), // Column P
};

export const Elementary: ClassSheetLayout = {
  id: asArrayIndex(4), // Column E
  name: asArrayIndex(1), // Column B
  gradeLevel: asArrayIndex(0), // Column A
  enrollmentDate: asArrayIndex(8), // Column I
  departureDate: asArrayIndex(9), // Column J
  supportNeeded: asArrayIndex(2), // Column C
  datesAttended: asArrayIndex(25), // Column Z
};

export const DayProgram: ClassSheetLayout = {
  id: asArrayIndex(6), // Column G
  name: asArrayIndex(1), // Column B
  gradeLevel: asArrayIndex(0), // Column A
  enrollmentDate: asArrayIndex(9), // Column J
  departureDate: asArrayIndex(10), // Column K
};

export type LayoutKey = (typeof SHEET_LAYOUTS)[keyof typeof SHEET_LAYOUTS];

export const layoutRegistry = {
  [SHEET_LAYOUTS.REFOCUS]: Refocus,
  [SHEET_LAYOUTS.ELEMENTARY]: Elementary,
  [SHEET_LAYOUTS.DAY_PROGRAM]: DayProgram,
} as const;

import { SheetIndex } from "./types";

export const BASE_STUDENT_DEFAULTS = {
  id: "",
  name: "",
};

export type BaseStudent = typeof BASE_STUDENT_DEFAULTS;

export const REFOCUS_DEFAULTS = {
  ...BASE_STUDENT_DEFAULTS,
  gradeLevel: 0,
  enrollmentDate: "",
  supportNeeded: "",
  attendanceDates: [] as string[],
};

export type RefocusStudent = typeof REFOCUS_DEFAULTS;

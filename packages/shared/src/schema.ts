import { ArrayIndex } from "./types";

export const BASE_STUDENT_DEFAULTS = {
  id: "",
  name: "",
};

export type BaseStudent = typeof BASE_STUDENT_DEFAULTS;

export const ATTENDANCE_STUDENT_DEFAULTS = {
  ...BASE_STUDENT_DEFAULTS,
  statusColor: "", // hex color code
  index: 0 as ArrayIndex,
};

export type AttendanceStudent = typeof ATTENDANCE_STUDENT_DEFAULTS;

export const REFOCUS_DEFAULTS = {
  ...BASE_STUDENT_DEFAULTS,
  gradeLevel: 0,
  enrollmentDate: "",
  supportNeeded: "",
  attendanceDates: [] as string[],
};

export type RefocusStudent = typeof REFOCUS_DEFAULTS;

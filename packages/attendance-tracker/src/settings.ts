export const LINKED_SHEET_TAG = 'linkedSheetId';
export const FORMATTING = {
  DEFAULT_FONT_SIZE: 12,
  COLORS: {
    HEADER_ROW: "#d9d9d9",
    WEEK_BANDING: "#f3f3f3",
    NON_SCHOOL_DAY: "#b7b7b7",
    SNOW_DAY: "#cfe2f3",
    PERFECT_ATTENDANCE: "#d9ead3",
    SUSPENSION: "#fff2cc",
  },
} as const;

export const ATTENDANCE_CODES = {
  P: { symbol: "✓", weight: 2 }, // Present
  A: { symbol: "-", weight: 1 }, // Absent
  S: { symbol: "S", weight: 3 }, // Suspended
} as const;

export type AttendanceCode = keyof typeof ATTENDANCE_CODES;
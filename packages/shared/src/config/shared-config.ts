import { ColumnDef, SheetMetadata } from "./types";

export const CONFIG_SHEET_NAME = "_ConfigData";

type SheetConfig = Record<string, ColumnDef<SheetMetadata>>;

export const CORE_COLUMNS = {
  TAB_ID: { header: "TabId", key: null },
  TAB_NAME: { header: "TabName", key: null },
  LABEL: { header: "Label", key: "label" },
  TYPE: { header: "Type", key: "type" },
  DESCRIPTION: { header: "Description", key: "description" },
  LAYOUT: { header: "Layout", key: "layout" },
} satisfies SheetConfig;

export const MODULES = {
  CLEAR_ATTENDANCE: {
    header: "ClearAttendance",
    key: "module_clearAttendance",
  },
  ATTENDANCE_TRACKER: {
    header: "AttendanceTracker",
    key: "module_attendanceTracker",
  },
  REFOCUS: { header: "Refocus", key: "module_refocus" },
} satisfies SheetConfig;

export const ALL_COLUMNS = { ...CORE_COLUMNS, ...MODULES };

export const SHEET_LAYOUTS = {
  REFOCUS: "refocus",
  ELEMENTARY: "elementary",
  DAY_PROGRAM: "dayProgram",
} as const;

export const COLORS = {
  DEFAULT: "#ffffff",
  STATUS: {
    PRESENT: "#00ff00",
  },
};

export const CORE_COLUMNS = {
  TAB_ID: { header: "TabId", key: null },
  TAB_NAME: { header: "TabName", key: null },
  LABEL: { header: "Label", key: "label" },
  TYPE: { header: "Type", key: "type" },
  DESCRIPTION: { header: "Description", key: "description" },
  LAYOUT: { header: "Layout", key: "layout" },
} as const;

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
} as const;


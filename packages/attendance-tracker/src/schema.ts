export const LOCAL_SHEET_ID_PROPERTY = 'localSheetId';
export const ENROLLMENT_SHEET_ID_PROPERTY = 'enrollmentSheetId';
export const CORE_TABS = {
  ATTENDANCE_LOG: 'Attendance Log',
  CALENDAR: 'Calendar',
  ATTENDANCE_LOG_BACKUP: '_AttendanceBackup',
} as const;

export const NAMED_RANGES = {
  SEMESTER_DATES: 'SemesterDates', // A1:B2 range (Start/End)
  NINE_WEEKS: 'NineWeeks', // Last day of the 1st nine weeks (splits semester into quarters)
  NON_SCHOOL_DAYS: 'NonSchoolDays', // List of dates that are non-school days
  SNOW_DAYS: 'SnowDays', // List of dates that were snow days
} as const;
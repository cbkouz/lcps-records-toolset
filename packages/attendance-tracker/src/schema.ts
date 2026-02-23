import { buildLayout } from "@shared/layouts";
import { AttendanceRecord } from "./types";

export const LOCAL_SHEET_ID_PROPERTY = 'localSheetId';
export const ENROLLMENT_SHEET_ID_PROPERTY = 'enrollmentSheetId';

export const CORE_TABS = {
  ATTENDANCE_LOG: 'Attendance Log',
  CALENDAR: 'Calendar',
  ATTENDANCE_LOG_BACKUP: '_AttendanceBackup',
} as const;

export const SUMMARY_SHEET = "Weekly Summary";

export const NAMED_RANGES = {
  SEMESTER_DATES: 'SemesterDates', // A1:B2 range (Start/End)
  NINE_WEEKS: 'NineWeeks', // Last day of the 1st nine weeks (splits semester into quarters)
  NON_SCHOOL_DAYS: 'NonSchoolDays', // List of dates that are non-school days
  SNOW_DAYS: 'SnowDays', // List of dates that were snow days
} as const;


export const LOG_COLUMNS = buildLayout({
  DATE: 0, // Col A
  STUDENT_ID: 1, // Col C
  STUDENT_NAME: 2, // Col D
  TAB_ID: 3, // Col E
  TAB_NAME: 4, // Col F
  STATUS: 5, // Col B
  //SOURCE: 6, // Col G
});

export type LogColumns = typeof LOG_COLUMNS;

export const buildLogRow = (record: AttendanceRecord): any[] => {
  const row = [];
  row[LOG_COLUMNS.DATE] = record.date;
  row[LOG_COLUMNS.STUDENT_ID] = record.studentId;
  row[LOG_COLUMNS.STUDENT_NAME] = record.studentName;
  row[LOG_COLUMNS.TAB_ID] = record.tabId;
  row[LOG_COLUMNS.TAB_NAME] = record.tabName;
  row[LOG_COLUMNS.STATUS] = record.status;
  return row;
}
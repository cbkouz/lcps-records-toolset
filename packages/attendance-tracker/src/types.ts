import { buildLayout } from "@shared/layouts";

export const LOG_COLUMNS = buildLayout({
  TIMESTAMP: 0, // Col A
  DATE: 1, // Col B
  STUDENT_ID: 2, // Col C
  STUDENT_NAME: 3, // Col D
  TAB_ID: 4, // Col E
  TAB_NAME: 5, // Col F
  STATUS: 6, // Col G
  SOURCE: 7, // Col H
});

export type LogColumns = typeof LOG_COLUMNS;

export interface AttendanceRecord {
  date: Date;
  studentId: string;
  studentName: string;
  tabId: string;
  tabName: string;
  status: 'P' | 'A' | 'S'; // Present, absent, or suspended
}
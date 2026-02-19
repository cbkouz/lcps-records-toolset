import { AttendanceCode } from "./settings";

export interface AttendanceRecord {
  date: Date;
  studentId: string;
  studentName: string;
  tabId: string;
  tabName: string;
  status: AttendanceCode
}

export type StudentHistoryMap = Map<string, Map<string, AttendanceCode>>; // studentId -> (dateString -> status)
import { LAYOUT_REGISTRY, LayoutKey } from "@shared/layouts";
import { AttendanceLogRepository } from "./attendance-log-repo";
import { AttendanceRecordsRepository } from "./attendance-records-repo";
import { SingleClassHarvester } from "./single-class-harvester";
import { AttendanceRecord } from "../types";
import { ATTENDANCE_CODES, AttendanceCode } from "../settings";

export class AttendanceService {
  constructor(private logRepo: AttendanceLogRepository, private recordsRepo: AttendanceRecordsRepository) { }
  
  public processDailyAttendance(date: Date): Map<string, AttendanceRecord[]> {
    const AttendanceSheets = this.recordsRepo.getAttendanceSheets();
    if (AttendanceSheets.length === 0) {
      throw new Error("No attendance sheets found. Please ensure sheets are properly tagged.");
    }
    
    const classMap = new Map<string, AttendanceRecord[]>();
    const allRecords: AttendanceRecord[] = [];
    AttendanceSheets.forEach(({ sheet, tags }) => {
      const sheetId = sheet.getSheetId().toString();
      const harvester = new SingleClassHarvester(sheet, tags.layout as LayoutKey);
      const classRecords = harvester.getDailyRecords(date, sheetId, sheet.getName());
      classMap.set(sheetId, classRecords);
      allRecords.push(...classRecords);
    });

    if (allRecords.length === 0) {
      console.log("No attendance records found for the given date.");
      return new Map();
    }

    const todayState = this.logRepo.getCurrentStatus(date);
    const recordsToLog: AttendanceRecord[] = [];
    if (todayState.size === 0) {
      // No existing records for today, log all
      console.log("No existing attendance records for today. Logging all records.");
      recordsToLog.push(...allRecords);
    } else {
      // Compare with existing records and log only changes
      console.log(`Existing attendance records found for today: ${todayState.size}. Checking for updates...`);
      allRecords.forEach(record => {
        const existing = todayState.get(record.studentId);
        if (!existing) {
          // No existing record for this student, log new record
          recordsToLog.push(record);
        } else if (this.needsUpdate(existing.status as AttendanceCode, record.status)) {
          // Status has changed and needs update
          this.logRepo.updateRecord(existing.rowIndex, record.status, existing.status, record.studentName);
        }
      });
    }

    if (recordsToLog.length > 0) {
      this.logRepo.logAttendanceRecords(recordsToLog);
      console.log(`Logged ${recordsToLog.length} attendance records for ${date.toDateString()}.`);
    }
    return classMap;
  }

  private needsUpdate(existingStatus: AttendanceCode, newStatus: AttendanceCode): boolean {
    return ATTENDANCE_CODES[newStatus].weight > ATTENDANCE_CODES[existingStatus].weight;
  }
}
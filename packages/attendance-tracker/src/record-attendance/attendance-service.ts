import { LAYOUT_REGISTRY, LayoutKey } from "@shared/layouts";
import { AttendanceLogRepository } from "./attendance-log-repo";
import { AttendanceRecordsRepository } from "./attendance-records-repo";
import { SingleClassHarvester } from "./single-class-harvester";
import { AttendanceRecord, ClassMap } from "../types";
import { ATTENDANCE_CODES, AttendanceCode } from "../settings";
import { SheetMetadata } from "@shared/types";

export class AttendanceService {
  constructor(private logRepo: AttendanceLogRepository, private recordsRepo: AttendanceRecordsRepository) { }

  public buildClassMap(date: Date): ClassMap {
    const AttendanceSheets = this.recordsRepo.getAttendanceSheets();
    if (AttendanceSheets.length === 0) {
      throw new Error("No attendance sheets found. Please ensure sheets are properly tagged.");
    }
    
    const classMap: ClassMap = new Map();
    AttendanceSheets.forEach(({ sheet, tags }) => {
      const sheetId = sheet.getSheetId().toString();
      const sheetName = sheet.getName();
      const layoutKey = this.resolveLayoutKey(tags, sheetName);
      const harvester = new SingleClassHarvester(sheet, layoutKey);
      const classRecords = harvester.getDailyRecords(date, sheetId, sheet.getName());
      classMap.set(sheetId, { tabName: sheetName, records: classRecords });
    });
    return classMap;
  }
  
  public processDailyAttendance(date: Date): ClassMap {
    const classMap = this.buildClassMap(date);
    const allRecords: AttendanceRecord[] = [];
    classMap.forEach(classInfo => {
      allRecords.push(...classInfo.records);
    });

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

  private resolveLayoutKey(tags: SheetMetadata, sheetName: string): LayoutKey {
    const rawLayout = tags.layout;
    if (!rawLayout || !(rawLayout in LAYOUT_REGISTRY)) {
      throw new Error(`Sheet \"${sheetName}\" has invalid or missing layout metadata.`);
    }
    return rawLayout as LayoutKey;
  }
}
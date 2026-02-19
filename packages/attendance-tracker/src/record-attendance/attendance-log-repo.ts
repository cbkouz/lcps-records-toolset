import { SheetUtils } from "@shared/utilities/sheet-utils";
import { buildLogRow, CORE_TABS, LOCAL_SHEET_ID_PROPERTY, LOG_COLUMNS } from "../schema";
import { SheetIndex } from "@shared/types";
import { dateToString, zeroHours } from "@shared/utilities/data-utils";
import { AttendanceRecord, StudentHistoryMap } from "../types";
import { AttendanceCode } from "../settings";

export class AttendanceLogRepository {
  private logSheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    const logSheet = ss.getSheetByName(CORE_TABS.ATTENDANCE_LOG);
    if (!logSheet) {
      throw new Error(`Attendance log sheet (${CORE_TABS.ATTENDANCE_LOG}) not found in spreadsheet.`);
    }
    this.logSheet = logSheet;
  }

  public getCurrentStatus(date: Date): Map<string, { rowIndex: SheetIndex, status: string }> {
    const recentData = this.logSheet.getRange(2, 1, 200, this.logSheet.getLastColumn()).getValues(); // Get recent 200 entries
    const statusMap = new Map();
    const cols = LOG_COLUMNS;
    const targetDate = zeroHours(date);
    for (let i = 0; i < recentData.length; i++) {
      const row = recentData[i];
      const dateValue = row[cols.DATE];
      if (!(dateValue instanceof Date)) continue; // Skip if date is invalid
      const rowDate = zeroHours(dateValue);
      if (rowDate < targetDate) break; // Stop if we've gone past the target date
      if (rowDate === targetDate) {
        const studentId = String(row[cols.STUDENT_ID]).trim();
        const status = row[cols.STATUS];
        if (!statusMap.has(studentId)) {
          statusMap.set(studentId, { rowIndex: i + 2 as SheetIndex, status }); // Store row index for potential updates
        }
      }
    }
    return statusMap;
  }

  public updateRecord(rowIndex: SheetIndex, newStatus: AttendanceCode, oldStatus: string, studentName: string): void {
    this.logSheet.getRange(rowIndex, LOG_COLUMNS.STATUS + 1).setValue(newStatus);
    console.log(`Updated attendance for ${studentName} from ${oldStatus} to ${newStatus}`);
  }

  public logAttendanceRecords(records: AttendanceRecord[]): void {
    this.logSheet.getRange(this.logSheet.getLastRow() + 1, 1, records.length, Object.keys(LOG_COLUMNS).length).setValues(
      records.map(record => buildLogRow(record))
    );
    this.logSheet.sort(LOG_COLUMNS.DATE + 1, false); // Sort by date descending after adding new records
  }

  public buildStudentHistoryMap(): StudentHistoryMap {
    if (this.logSheet.getLastRow() < 2) {
      return new Map(); // No records, return empty map
    }
    const data = this.logSheet.getRange(2, 1, this.logSheet.getLastRow() - 1, this.logSheet.getLastColumn()).getValues();
    const historyMap: StudentHistoryMap = new Map();
    const cols = LOG_COLUMNS;
    for (const row of data) {
      const studentId = String(row[cols.STUDENT_ID]).trim();
      const dateString = dateToString(row[cols.DATE]);
      const status = row[cols.STATUS];
      if (!historyMap.has(studentId)) {
        historyMap.set(studentId, new Map());
      }
      historyMap.get(studentId)!.set(dateString, status);
    }
    return historyMap;
  }

}
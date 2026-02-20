import { dateToString } from "@shared/utilities/data-utils";
import { CORE_TABS, LOG_COLUMNS } from "./schema";

export function cleanAttendanceData(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CORE_TABS.ATTENDANCE_LOG);
  if (!sheet) {
    throw new Error(`Sheet ${CORE_TABS.ATTENDANCE_LOG} not found.`);
  }
  const backupSheet = ss.getSheetByName(CORE_TABS.ATTENDANCE_LOG_BACKUP);
  backupSheet!.clear();
  sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).copyTo(backupSheet!.getRange(1, 1));
  console.log(`Backed up attendance log to ${CORE_TABS.ATTENDANCE_LOG_BACKUP}.`);

  const [header, ...data] = sheet.getDataRange().getValues(); // Skip header
  const cleanRows = [];
  const seenEntries = new Set();

  for (const row of data) {
    const dateStr = dateToString(row[LOG_COLUMNS.DATE]);
    const id = String(row[LOG_COLUMNS.STUDENT_ID]).trim();
    const key = `${dateStr}-${id}`;
    if (!seenEntries.has(key)) {
      seenEntries.add(key);
      cleanRows.push(row);
    }
  }
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  if (cleanRows.length > 0) {
    sheet.getRange(2, 1, cleanRows.length, header.length).setValues(cleanRows);
  }
  console.log(`Cleaned attendance log. Removed ${data.length - cleanRows.length} duplicate entries.`);
}
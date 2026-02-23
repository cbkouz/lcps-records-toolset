import { DailyAttendanceController } from "./controller";
import { AttendanceLogRepository } from "./record-attendance/attendance-log-repo";
import { AttendanceRecordsRepository } from "./record-attendance/attendance-records-repo";
import { LOCAL_SHEET_ID_PROPERTY } from "./schema";
import { ProvisionSemesterController } from "./setup/provision-semester-controllers";
import { deleteReportSheets } from "./utilities";
import { SheetUtils } from "@shared/utilities/sheet-utils";

export function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const adminMenu = ui
    .createMenu("Admin Tools")
    .addItem("Inspect Active Sheet Metadata", "inspectActiveSheetMetadata")
  ui.createMenu("📊 Attendance Tracker")
    .addItem("Record Attendance", "processAttendance")
    .addItem("Regenerate Attendance Reports", "regenReports")
    .addSeparator()
    .addSubMenu(adminMenu)
    .addToUi();
}

export function createReportSheets(): void {
  ProvisionSemesterController.setUpSemester();
}

export function deleteExtraSheets(): void {
  const ss = SheetUtils.getLocalSs(LOCAL_SHEET_ID_PROPERTY);
  deleteReportSheets(ss);
}

export function processAttendance(): void {
  const controller = new DailyAttendanceController();
  controller.runDailyProcess();
}

export function regenReports(): void {
  const controller = new DailyAttendanceController();
  controller.regenerateReports();
}

export function createAttendanceBackup(): void {
  const ss = SheetUtils.getLocalSs(LOCAL_SHEET_ID_PROPERTY);
  const repo = new AttendanceLogRepository(ss);
  repo.backupAttendanceLog();
}

export { inspectActiveSheetMetadata } from "@shared/utilities/debug";
import { SheetUtils } from "@shared/utilities/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { CORE_COLUMNS, MODULES } from "@shared/schema";
import { MetadataUtils } from "@shared/utilities/metadata-utils";
import { MetadataModuleKey, SheetWithTags } from "@shared/types";
import { ClearAttendanceService } from "./clear-attendance-service";
import { ClearAttendanceRepository } from "./clear-attendance-repo";
import { LAYOUT_REGISTRY, LayoutKey } from "@shared/layouts";

export class ClearAttendanceController {
  private static moduleKey: MetadataModuleKey = MODULES.CLEAR_ATTENDANCE.key;
  private static _ss: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;

  private static get ss() {
    if (!this._ss) {
      console.log("Fetching spreadsheet...");
      this._ss = SheetUtils.getLocalSs(SHEET_ID_PROPERTY);
    }
    return this._ss;
  };

  static clearAllSheetsAttendance(): void {
    const ui = SpreadsheetApp.getUi();
    const attendanceSheets = MetadataUtils.getModuleSheetsWithTags(this.ss, this.moduleKey);
    const response = ui.alert(
      "Clear Attendance",
      `This will clear attendance forn ${attendanceSheets.length} sheet(s). Do you want to proceed?`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) {
      return; // User chose not to proceed
    }
    this.ss.toast("Clearing attendance, please wait...", "Processing", -1);
    attendanceSheets.forEach(entry => {
      this.clearSheetAttendance(entry.sheet, entry.tags);
    });
    this.ss.toast("Attendance clearing completed.", "Done", 5);
  }

  static clearCurrentSheetAttendance(): void {
    const sheet = this.ss.getActiveSheet();
    const tags = MetadataUtils.createMetadataMap(sheet);
    if (!this.isAttendanceSheet(tags)) {
      throw new Error("Current sheet is not tagged for attendance clearing.");
    };
    this.clearSheetAttendance(sheet, tags);
    this.ss.toast("Attendance cleared for current sheet.", "Done", 5);
  }

  private static isAttendanceSheet(tags: Map<string, string>): boolean {
    return tags.has(this.moduleKey) && tags.get(this.moduleKey) === "true";
  }

  private static clearSheetAttendance(sheet: GoogleAppsScript.Spreadsheet.Sheet, tags: Map<string, string>): void {
    const layoutKey = tags.get(CORE_COLUMNS.LAYOUT.key);
    const layout = LAYOUT_REGISTRY[layoutKey as LayoutKey]
    if (!layout) {
      throw new Error("No layout tag found for the current sheet.");
    }
    const repo = new ClearAttendanceRepository(sheet, layout);
    const service = new ClearAttendanceService(repo);
    service.clearSheetAttendance();
  }
}
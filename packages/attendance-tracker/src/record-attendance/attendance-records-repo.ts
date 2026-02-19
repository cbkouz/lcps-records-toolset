import { ENROLLMENT_SHEET_ID_PROPERTY } from "../schema";
import { SheetUtils } from "@shared/utilities/sheet-utils";
import { MODULES } from "@shared/schema";
import { MetadataUtils } from "@shared/utilities/metadata-utils";
import { MetadataModuleKey, SheetWithTags } from "@shared/types";

export interface ClassInfo {
  tabName: string;
  tabId: string;
}

export class AttendanceRecordsRepository {
  // For the semester setup process
  public getRemoteClassInfoForReportSheets(): ClassInfo[] {
    const sheetsWithTags = this.getAttendanceSheets();
    return sheetsWithTags.map(({ sheet }) => ({
      tabName: sheet.getName(),
      tabId: sheet.getSheetId().toString(),
    }));
  }
  
  // For the daily attendance recording process
  public getAttendanceSheets(): SheetWithTags[] {
    const enrollmentSsId = SheetUtils.getSheetIdFromProperty(ENROLLMENT_SHEET_ID_PROPERTY);
    const enrollmentSs = SpreadsheetApp.openById(enrollmentSsId);
    const moduleKey = MODULES.ATTENDANCE_TRACKER.key as MetadataModuleKey;
    return MetadataUtils.getModuleSheetsWithTags(enrollmentSs, moduleKey);
  }
}
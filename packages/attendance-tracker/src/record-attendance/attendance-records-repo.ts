import { ENROLLMENT_SHEET_ID_PROPERTY } from "../schema";
import { SheetUtils } from "@shared/utilities/sheet-utils";
import { MODULES } from "@shared/schema";
import { MetadataUtils } from "@shared/utilities/metadata-utils";
import { MetadataModuleKey, SheetWithTags } from "@shared/types";
import { BaseStatusRepository } from "@shared/modules/base-status-repo";

export interface ClassInfo {
  tabName: string;
  tabId: string;
}

export class AttendanceRecordsRepository extends BaseStatusRepository {
  public static getRemoteClassInfoForReportSheets(): ClassInfo[] {
    const sheetsWithTags = this.getAttendanceSheets();
    return sheetsWithTags.map(({ sheet }) => ({
      tabName: sheet.getName(),
      tabId: sheet.getSheetId().toString(),
    }));
  }
  
  private static getAttendanceSheets(): SheetWithTags[] {
    const enrollmentSsId = SheetUtils.getSheetIdFromProperty(ENROLLMENT_SHEET_ID_PROPERTY);
    const enrollmentSs = SpreadsheetApp.openById(enrollmentSsId);
    const moduleKey = MODULES.ATTENDANCE_TRACKER.key as MetadataModuleKey;
    return MetadataUtils.getModuleSheetsWithTags(enrollmentSs, moduleKey);
  }
}
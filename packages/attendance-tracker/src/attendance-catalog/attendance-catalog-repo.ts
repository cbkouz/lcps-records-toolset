import { ENROLLMENT_SHEET_ID_PROPERTY } from "../config";
import { SheetUtils } from "@shared/utilities/sheet-utils";
import { MODULES } from "@shared/schema";
import { MetadataUtils } from "@shared/utilities/metadata-utils";
import { MetadataModuleKey, SheetWithTags } from "@shared/types";

export class AttendanceCatalogRepository {
  public getAttendanceSheets(): SheetWithTags[] {
    const enrollmentSsId = SheetUtils.getSheetIdFromProperty(ENROLLMENT_SHEET_ID_PROPERTY);
    const enrollmentSs = SpreadsheetApp.openById(enrollmentSsId);
    const moduleKey = MODULES.CLEAR_ATTENDANCE.key as MetadataModuleKey;
    return MetadataUtils.getModuleSheetsWithTags(enrollmentSs, moduleKey);
  }
}
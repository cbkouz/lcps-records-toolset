import { MODULES } from "@shared/shared-config";
import { SheetUtils } from "@shared/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { MetadataUtils } from "@shared/metadata-utils";
import { RefocusAttendanceRepository } from "../repositories/refocus-attendance-repository";

export class RefocusAttendanceService {
  private static module: string = MODULES.REFOCUS.key;

  private static get ss() {
    return SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
  }

  static run(): void {
    const refocusSheets = MetadataUtils.getSheetsWithLayouts(
      this.ss,
      this.module,
    );
    refocusSheets.forEach((sheetData) => {
      const repo = new RefocusAttendanceRepository(
        sheetData.sheet,
        sheetData.layout,
      );
      repo.run();
    });
  }
}

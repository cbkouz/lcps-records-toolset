import { LayoutKey, LAYOUT_REGISTRY } from "@shared/layouts";
import { MODULES, CORE_COLUMNS } from "@shared/shared-config";
import { SheetUtils } from "@shared/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { ClearAttendanceRepository } from "../repositories/clear-attendance-repo";
import { MetadataUtils } from "@shared/metadata-utils";

export class ClearAttendanceService {
  private static module: string = MODULES.CLEAR_ATTENDANCE.key;

  private static get ss() {
    return SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
  }

  static clearAllAttendanceSheets(): void {
    const attendanceSheets = MetadataUtils.getSheetsWithLayouts(
      this.ss,
      this.module,
    );
    attendanceSheets.forEach((sheetData) => {
      const repo = new ClearAttendanceRepository(
        sheetData.sheet,
        sheetData.layout,
      );
      repo.run();
    });
  }

  static clearActiveSheet(): void {
    const sheet = this.ss.getActiveSheet();
    const metadataMap = MetadataUtils.createMetadataMap(sheet);
    if (!this.isAttendanceSheet(metadataMap)) {
      throw new Error("Active sheet is not an attendance sheet.");
    }
    const layoutKey = metadataMap.get(CORE_COLUMNS.LAYOUT.key) as LayoutKey;
    const layout = LAYOUT_REGISTRY[layoutKey];

    const repo = new ClearAttendanceRepository(sheet, layout);
    repo.run();
  }

  private static isAttendanceSheet(metadataMap: Map<string, any>): boolean {
    return (
      metadataMap.has(this.module) && metadataMap.get(this.module) === "true"
    );
  }
}

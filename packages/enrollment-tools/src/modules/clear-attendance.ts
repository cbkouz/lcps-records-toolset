import { COLORS, CORE_COLUMNS, MODULES } from "@shared/config/shared-config";
import { MetadataUtils } from "@shared/utilities/metadata-utils";
import {
  ClassSheetLayout,
  DayProgram,
  LayoutKey,
  layoutRegistry,
} from "@shared/config/class-layouts";
import { isValidId, SheetsByLayout } from "@shared/utilities/data-utils";

export class ClearAttendanceService {
  private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private readonly module: string = MODULES.CLEAR_ATTENDANCE.key;

  constructor(ss: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    this.ss = ss;
  }

  private clearSheetAttendance(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    layout: ClassSheetLayout,
  ): void {
    console.log(`Clearing attendance for sheet '${sheet.getName()}'`);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return; // No data rows to clear
    const idColValues = sheet
      .getRange(2, layout.id + 1, lastRow - 1)
      .getValues();

    const idRows = idColValues.reduce<number[]>((rows, [id], index) => {
      if (isValidId(id)) {
        rows.push(index);
      }
      return rows;
    }, []);

    if (idRows.length === 0) return; // No valid IDs found, nothing to clear
    const lastStudentIndex = idRows[idRows.length - 1];

    const namesRange = sheet.getRange(2, layout.name + 1, lastStudentIndex + 1);
    const namesBackgrounds = namesRange.getBackgrounds();

    let hasChanges = false;
    idRows.forEach((row) => {
      const bgColor = namesBackgrounds[row][0]; // Get background color of the name cell
      if (String(bgColor).toLowerCase() === COLORS.STATUS.PRESENT) {
        namesBackgrounds[row][0] = COLORS.DEFAULT; // Reset to default color
        hasChanges = true;
      }
    });
    if (hasChanges) {
      namesRange.setBackgrounds(namesBackgrounds);
    }
  }

  public clearAllAttendanceSheets(catalog: SheetsByLayout) {
    catalog.default.forEach((sheet) => {
      this.clearSheetAttendance(sheet, DayProgram);
    });

    catalog.other.forEach(({ sheet, layout }) => {
      this.clearSheetAttendance(sheet, layout);
    });
  }

  public clearCurrentSheetAttendance() {
    const sheet = this.ss.getActiveSheet();
    const metadataMap = MetadataUtils.createMetadataMap(sheet);
    if (!this.isAttendanceSheet(metadataMap)) {
      throw new Error("Active sheet is not an attendance sheet.");
    }
    const layout =
      layoutRegistry[metadataMap.get(CORE_COLUMNS.LAYOUT.key) as LayoutKey];

    this.clearSheetAttendance(sheet, layout);
  }

  private isAttendanceSheet(metadataMap: Map<string, any>): boolean {
    return (
      metadataMap.has(this.module) && metadataMap.get(this.module) === "true"
    );
  }
}

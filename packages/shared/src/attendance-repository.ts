import { isStudentRow } from "./data-utils";
import { COLORS } from "./shared-config";
import { BaseLayout } from "./types";

export class AttendanceRepository {
  constructor(
    private sheet: GoogleAppsScript.Spreadsheet.Sheet,
    private layout: BaseLayout,
  ) {}

  public resetAttendanceColors(): void {
    const dataRange = this.sheet.getDataRange();
    if (!dataRange) return; // sheet is empty

    const values = dataRange.getValues();
    const backgrounds = dataRange.getBackgrounds();
    let hasChanges = false;

    for (let i = 1; i < values.length; i++) {
      // assume header in first row
      const row = values[i];
      if (!isStudentRow(row, this.layout.id)) continue;

      if (backgrounds[i][this.layout.name] === COLORS.STATUS.PRESENT) {
        backgrounds[i][this.layout.name] = COLORS.DEFAULT;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      dataRange.setBackgrounds(backgrounds);
    }
  }
}

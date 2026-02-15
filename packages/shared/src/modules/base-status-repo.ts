import { BaseLayout } from "@shared/layouts";
import { GridContext, LocatedStudent } from "./status-types";
import { isStudentRow } from "@shared/utilities/data-utils";
import { ArrayIndex, toSheetIndex } from "@shared/types";

export abstract class BaseStatusRepository {
  constructor(protected sheet: GoogleAppsScript.Spreadsheet.Sheet, protected layout: BaseLayout) { }

  public getStudentData<T>(
    mapper: (row: any[], layout: BaseLayout) => T,
  ): LocatedStudent<T>[] {
    const dataRange = this.sheet.getDataRange();
    if (!dataRange) {
      throw new Error("No data range found in the sheet.");
    }
    const values = dataRange.getValues();
    const backgrounds = dataRange.getBackgrounds();
    const results: LocatedStudent<T>[] = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const id = String(row[this.layout.id]).trim();
      if (!isStudentRow(id)) {
        continue; // Skip non-student rows
      }
      const context: GridContext = {
        id,
        rowIndex: toSheetIndex(i as ArrayIndex),
        statusColor: backgrounds[i][this.layout.name].toLowerCase()
      };

      const studentData = mapper(row, this.layout); // Map row data to student data using the provided mapper
      results.push({ ...studentData, ...context } as LocatedStudent<T>);
    }
    return results;
  }
}
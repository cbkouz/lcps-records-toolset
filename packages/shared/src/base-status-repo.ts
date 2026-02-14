import { isStudentRow } from "./data-utils";
import { COLORS } from "./shared-config";
import { ArrayIndex, BaseLayout, SheetIndex, toSheetIndex } from "./types";

export interface GridContext {
  id: string;
  rowIndex: SheetIndex;
  statusColor: string;
}
export type LocatedStudent<T> = T & GridContext;

export abstract class BaseStatusRepository<T> {
  constructor(
    protected sheet: GoogleAppsScript.Spreadsheet.Sheet,
    protected layout: BaseLayout,
  ) {}

  protected getStudentData(
    mapper: (row: any[], layout: BaseLayout) => T,
  ): LocatedStudent<T>[] {
    const dataRange = this.sheet.getDataRange();
    if (!dataRange) return []; // no data to process

    const values = dataRange.getValues();
    const backgrounds = dataRange.getBackgrounds();
    const results: LocatedStudent<T>[] = [];

    for (let i = 1; i < values.length; i++) {
      // Assume header in row 1
      const row = values[i];
      if (!isStudentRow(row, this.layout.id)) continue;
      const context: GridContext = {
        id: String(row[this.layout.id]),
        rowIndex: toSheetIndex(i as ArrayIndex),
        statusColor: String(backgrounds[i][this.layout.name]).toLowerCase(),
      };
      const studentData = mapper(row, this.layout); // extra data as required by child class
      results.push({ ...context, ...studentData } as LocatedStudent<T>);
    }
    return results;
  }

  protected getPresentStudents(
    students: LocatedStudent<T>[],
  ): LocatedStudent<T>[] {
    return students.filter(
      (student) => student.statusColor === COLORS.STATUS.PRESENT,
    );
  }
}

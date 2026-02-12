import { ClassSheetLayout } from "@shared/config/class-layouts";
import { BaseStudent } from "@shared/config/types";
import { isValidId } from "@shared/utilities/data-utils";

export interface StudentRowPair {
  dataRow: any[];
  notesRow: any[];
}

export abstract class BaseStudentRepository<T extends BaseStudent> {
  constructor(
    protected sheet: GoogleAppsScript.Spreadsheet.Sheet,
    protected layout: ClassSheetLayout,
  ) {}

  public getStudents(rawData?: any[][]): T[] {
    // assume header in row 1
    const data = rawData
      ? rawData
      : this.sheet.getDataRange().getValues().slice(1);
    const studentRows = this.pairStudentRows(data);
    return [];
  }

  protected pairStudentRows(data: any[][]): StudentRowPair[] {
    const students: StudentRowPair[] = [];
    for (let i = 0; i < data.length; ) {
      const dataRow = data[i];
      const notesRow = data[i + 1];
      const isStudentRow = isValidId(dataRow[this.layout.id]);
      const nextRowIsNotes = notesRow && !isValidId(notesRow[this.layout.id]);

      if (isStudentRow && nextRowIsNotes) {
        students.push({ dataRow, notesRow });
        i += 2; // to account for paired rows
      } else {
        i++; // try the next row
      }
    }
    return students;
  }
  protected createStudentMap(studentRows: StudentRowPair[]): T[] {}
}

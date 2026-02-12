import { ClassSheetLayout } from "@shared/config/class-layouts";
import { isValidId } from "@shared/utilities/data-utils";

export abstract class BaseStudentRepository {
  protected readonly START_ROW = 2; // Headers in row 1
  protected readonly STRIDE = 2; // To account for 2-rows student data pairs

  constructor(
    protected readonly sheet: GoogleAppsScript.Spreadsheet.Sheet,
    protected readonly layout: ClassSheetLayout,
  ) {  }

  public getStudents(): T[] {
    const rawData = this.readRawData();
    if (rawData.length === 0) return []; // No data
    const students: T[] = [];
    for (let i = 0; i < rawData.length;) {
      const row = rawData[i];
      if (!isValidId(row[this.layout.id])) {
        i++
      } else {
        const student = this.mapBlockToStudent()
      }

  }

  protected readRawData(): any[][] {
    const lastRow = this.sheet.getLastRow();
    if (lastRow < this.START_ROW) return []; // No data to process
    const numRows = lastRow - this.START_ROW + 1;
    const numCols = this.sheet.getLastColumn();

    return this.sheet.getRange(this.START_ROW, 1, numRows, numCols).getValues();
  }





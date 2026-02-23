import { RefocusLayout } from "@shared/layouts";
import { BaseStatusRepository } from "@shared/modules/base-status-repo";
import { LocatedStudent } from "@shared/modules/status-types";
import { SheetIndex, toSheetIndex } from "@shared/types";

export interface RefocusAttendanceStudent {
  datesAttended: string[]; // json array of date strings
}

export class RefocusAttendanceRepository extends BaseStatusRepository {
  protected layout: RefocusLayout;
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, layout: RefocusLayout) {
    super(sheet, layout);
    this.layout = layout;
  }

  public getRefocusRoster(): LocatedStudent<RefocusAttendanceStudent>[] {
    return this.getStudentData<RefocusAttendanceStudent>((row) => {
      const rawDates = String(row[this.layout.datesAttended] || "");
      let parsedDates: string[] = [];
      if (rawDates && rawDates.trim() !== "") {
        try {
          parsedDates = JSON.parse(rawDates);
        } catch (e) {
          console.warn(
            `Failed to parse datesAttended for student ${row[this.layout.name]}: ${rawDates}`
          );
          parsedDates = [];
        }
      }
        return { datesAttended: parsedDates };
    });
  }

  public markStudentAttendance(students: { rowIndex: SheetIndex; datesAttended: string }[]): void {
    students.forEach(student => {
      this.sheet
        .getRange(student.rowIndex, toSheetIndex(this.layout.datesAttended))
        .setValue(student.datesAttended);
    });
  }
}

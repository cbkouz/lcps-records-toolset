import { BaseStatusRepository } from "@shared/base-status-repo";
import { formatDate } from "@shared/data-utils";
import { RefocusLayout } from "@shared/layouts";
import { toSheetIndex } from "@shared/types";

export interface RefocusAttendanceData {
  currentDates: string[];
}

export class RefocusAttendanceRepository extends BaseStatusRepository<RefocusAttendanceData> {
  constructor(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    layout: RefocusLayout,
  ) {
    super(sheet, layout);
  }

  public run(): void {
    const today = formatDate(new Date());
    const refocusLayout = this.layout as RefocusLayout;
    const students = this.getStudentData((row) => {
      const rawValue = row[refocusLayout.datesAttended];

      let dates: string[] = [];

      if (rawValue) {
        try {
          dates = JSON.parse(String(rawValue));
        } catch (e) {
          dates = [];
        }
      }

      return { currentDates: dates };
    });

    const presentStudents = this.getPresentStudents(students);

    if (presentStudents.length === 0) return;

    presentStudents.forEach((student) => {
      if (!student.currentDates.includes(today)) {
        student.currentDates.push(today);
      }
    });

    const datesAttendedValues = students.map((student) => {
      const newDates = JSON.stringify(student.currentDates);
      return [newDates];
    });

    this.sheet
      .getRange(
        2,
        toSheetIndex(refocusLayout.datesAttended),
        datesAttendedValues.length,
        1,
      )
      .setValues(datesAttendedValues);
  }
}

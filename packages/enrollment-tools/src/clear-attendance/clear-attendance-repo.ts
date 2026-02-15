import { BaseLayout } from "@shared/layouts";
import { BaseStatusRepository } from "@shared/modules/base-status-repo";
import { LocatedStudent } from "@shared/modules/status-types";
import { COLORS } from "@shared/settings";
import { ArrayIndex } from "@shared/types";

export class ClearAttendanceRepository extends BaseStatusRepository {
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, layout: BaseLayout) {
    super(sheet, layout);
  }

  public getAllStudentStatuses(): LocatedStudent<{}>[] {
    return this.getStudentData(() => ({})); // No additional data mapping needed for clearing attendance
  };

  public clearAttendanceForStudents(students: LocatedStudent<{}>[]): void {
    const columnLetter = this.toColumnLetter(this.layout.name);
    const a1Notations = students.map((student) => {
      return `${columnLetter}${student.rowIndex}`;
    });

    this.sheet.getRangeList(a1Notations).setBackground(COLORS.DEFAULT);
  }

  private toColumnLetter(index: ArrayIndex): string {
    let temp = index as number;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65);
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }
}
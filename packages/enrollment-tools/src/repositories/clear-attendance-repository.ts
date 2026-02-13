import { BaseStatusRepository } from "@shared/base-status-repository";
import { toColumnLetter } from "@shared/data-utils";
import { COLORS } from "@shared/shared-config";
import { BaseLayout } from "@shared/types";

export class ClearAttendanceRepository extends BaseStatusRepository<{}> {
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, layout: BaseLayout) {
    super(sheet, layout);
  }

  public run(): void {
    const students = this.getStudentData(() => ({}));
    const presentStudents = this.getPresentStudents(students);

    if (presentStudents.length === 0) return; // no attendance to clear

    const columnLetter = toColumnLetter(this.layout.name);
    const a1Notations = presentStudents.map((student) => {
      return `${columnLetter}${student.rowIndex}`;
    });

    this.sheet.getRangeList(a1Notations).setBackground(COLORS.DEFAULT);
  }
}

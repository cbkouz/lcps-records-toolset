import { DayProgramLayout, LAYOUT_REGISTRY, LayoutKey } from "@shared/layouts";
import { BaseStatusRepository } from "@shared/modules/base-status-repo";
import { AttendanceRecord } from "../types";
import { COLORS } from "@shared/settings";
import { AttendanceCode } from "../settings";
 
type Student = {
  student: string;
  enrollmentDate: Date;
}

export class SingleClassHarvester extends BaseStatusRepository {
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, key: LayoutKey) {
    const layout = LAYOUT_REGISTRY[key];
    super(sheet, layout);
  }

  public getDailyRecords(date: Date, tabId: string, tabName: string): AttendanceRecord[] {
    const students = this.getStudentData<Student>((row, l) => {
      const layout = l as DayProgramLayout;
      return {
        student: String(row[layout.name]).trim(),
        enrollmentDate: new Date(row[layout.enrollmentDate]),
      };
    });

    const currentStudents = students.filter(student => 
      student.enrollmentDate <= date &&
        student.statusColor !== COLORS.STATUS.IGNORE
    )
      .map(student => ({
        date,
        studentId: student.id,
        studentName: student.student,
        tabId,
        tabName,
        status: this.getStatusFromColor(student.statusColor),
      } as AttendanceRecord));

    return currentStudents;
  }

  private getStatusFromColor(color: string): AttendanceCode{
    switch (color.toLocaleLowerCase()) {
      case COLORS.STATUS.PRESENT:
        return 'P';
      case COLORS.STATUS.SUSPENDED:
        return 'S';
      default:
        return 'A';
    }
  }
}


import { COLORS } from "@shared/settings";
import { ClearAttendanceRepository } from "./clear-attendance-repo";

export class ClearAttendanceService {
  constructor(private repo: ClearAttendanceRepository) { }

  public clearSheetAttendance(): void {
    const students = this.repo.getAllStudentStatuses();
    const studentsToClear = students.filter(student =>
      student.statusColor === COLORS.STATUS.PRESENT.toLowerCase()
    );
    if (studentsToClear.length > 0) {
      this.repo.clearAttendanceForStudents(studentsToClear);
    }
  }
}

import { dateToString } from "@shared/utilities/data-utils";
import { RefocusAttendanceRepository } from "./refocus-attendance";
import { COLORS } from "@shared/settings";

export class RefocusAttendanceService {
  constructor(private repo: RefocusAttendanceRepository) { }

  public processRefocusAttendance(date: Date): void {
    const todayStr = dateToString(date);
    const roster = this.repo.getRefocusRoster();
    const studentsToUpdate = roster.filter(student =>
      student.statusColor === COLORS.STATUS.PRESENT.toLowerCase() &&
      !student.datesAttended.includes(todayStr)
    );
    const payload = studentsToUpdate.map(student => ({
      rowIndex: student.rowIndex,
      datesAttended: JSON.stringify([...student.datesAttended, todayStr])
    }));
    if (payload.length > 0) {
      this.repo.markStudentAttendance(payload);
      console.log(`Marked attendance for ${payload.length} students on ${todayStr}`);
    } else {
      console.log(`No students needed attendance marked for ${todayStr}`);
    }
  }
}
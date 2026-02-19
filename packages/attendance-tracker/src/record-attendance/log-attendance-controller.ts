import { AttendanceLogRepository } from "./attendance-log-repo";
import { AttendanceRecordsRepository } from "./attendance-records-repo";
import { AttendanceService } from "./attendance-service";

export class LogAttendanceController {
  static run(): void {
     const logRepo = new AttendanceLogRepository();
      const recordsRepo = new AttendanceRecordsRepository();
      const service = new AttendanceService(logRepo, recordsRepo);
    service.processDailyAttendance(new Date());
  }
} 
import { SheetUtils } from "@shared/utilities/sheet-utils";
import { AttendanceLogRepository } from "./record-attendance/attendance-log-repo";
import { AttendanceRecordsRepository } from "./record-attendance/attendance-records-repo";
import { AttendanceService } from "./record-attendance/attendance-service";
import { ReportService } from "./reports/report-service";
import { LOCAL_SHEET_ID_PROPERTY } from "./schema";
import { ReportRepository } from "./reports/report-repo";
import { SemesterRepository } from "./semester-repository";
import { CalendarService } from "./calendar-service";

export class dailyControllers {
  private static _ss: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;

  private static get ss() {
    if (!this._ss) {
      console.log("Fetching spreadsheet...");
      this._ss = SheetUtils.getLocalSs(LOCAL_SHEET_ID_PROPERTY);
    }
    return this._ss;
  };

  static dailyProcess(): void {
    // Check if today is a school day before doing any processing
    const today = new Date();
    const semesterRepo = new SemesterRepository(this.ss);
    const semesterConfig = semesterRepo.getSemesterConfig();
    const calendarService = new CalendarService(semesterConfig);
    if (!calendarService.isSchoolDay(today)) {
      console.log("Today is not a school day. Skipping attendance processing.");
      return;
    };
    
    // Log attendance
    const logRepo = new AttendanceLogRepository(this.ss);
    const recordsRepo = new AttendanceRecordsRepository();
    const service = new AttendanceService(logRepo, recordsRepo);
    const classMap = service.processDailyAttendance(today);

    // Generate class reports
    const logData = logRepo.buildStudentHistoryMap();
    const reportRepo = new ReportRepository(this.ss);
    const reportService = new ReportService(reportRepo);
    reportService.generateClassReports(classMap, logData);

    // Generate weekly summary report
    const dateConfig = calendarService.getReportDateConfig(today);
    reportService.generateWeeklyReport(classMap, dateConfig, logData);
  }
}
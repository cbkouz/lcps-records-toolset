import { CalendarService } from "./calendar-service";
import { AttendanceLogRepository } from "./record-attendance/attendance-log-repo";
import { AttendanceRecordsRepository } from "./record-attendance/attendance-records-repo";
import { AttendanceService } from "./record-attendance/attendance-service";
import { ReportRepository } from "./reports/report-repo";
import { ReportService } from "./reports/report-service";
import { SemesterRepository } from "./semester-repository";
import { PROCESS_SNOW_DAYS } from "./settings";
import { snowDaysRepository } from "./snow-days/snow-days-repo";
import { SnowDaysService } from "./snow-days/snow-days-service";
import { ClassMap } from "./types";

export class DailyAttendanceController {
  private ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private logRepo: AttendanceLogRepository;
  private calendarService: CalendarService;
  private recordsRepo: AttendanceRecordsRepository;
  
  constructor() {
    console.log("Initializing DailyAttendanceController...");
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.logRepo = new AttendanceLogRepository(this.ss);
    const semesterConfig = new SemesterRepository(this.ss).getSemesterConfig();
    this.calendarService = new CalendarService(semesterConfig);
    this.recordsRepo = new AttendanceRecordsRepository();
    console.log("Initialization complete.");
  }

  public runDailyProcess() {
    console.log("Running daily attendance process...");

    let snowDaysProcessed = false;
    if (PROCESS_SNOW_DAYS) {
      snowDaysProcessed = this.processSnowDays();
    }

    const today = new Date();
    if (!this.calendarService.isSchoolDay(today)) {
      console.log("Today is not a school day. Skipping attendance recording.");
      if (snowDaysProcessed) {
        this.regenerateReports(today);
      }
      return;
    }

    const classMap = this.recordAttendance(today);
    this.updateAllReports(classMap, today);
    console.log("Daily attendance process complete.");
  }

  public regenerateReports(date: Date = new Date()): void {
    console.log("Updating reports...");
    const classMap = new AttendanceService(this.logRepo, this.recordsRepo).buildClassMap(date);
    this.updateAllReports(classMap, date);
    console.log("Report update complete.");
  }

  private processSnowDays() {
    console.log("Processing snow days...");
    const repo = new snowDaysRepository(this.ss);
    const snowDayQueue = repo.getUnprocessedSnowDays();
    if (snowDayQueue.dates.size === 0) {
      console.log("No unprocessed snow days found.");
      return false;
    }
    console.log(`Found ${snowDayQueue.dates.size} unprocessed snow day(s). Updating attendance records...`);
    this.logRepo.backupAttendanceLog(); // Backup before making changes
    const { header, data } = this.logRepo.readAttendanceLog();
    const filteredData = new SnowDaysService().filterSnowDays(data, snowDayQueue.dates);
    this.logRepo.rewriteAttendanceLog(header, filteredData);
    repo.markSnowDaysAsProcessed(snowDayQueue.rowsA1);
    console.log("Snow day processing complete. Attendance records updated and snow days marked as processed.");
    return true;
  }

  private recordAttendance(date: Date): ClassMap {
    console.log(`Recording attendance for ${date.toDateString()}...`);
    const service = new AttendanceService(this.logRepo, this.recordsRepo);
    const classMap = service.processDailyAttendance(date);
    console.log("Attendance recording complete.");
    return classMap;
  }

  private updateAllReports(classMap: ClassMap, date: Date): void {
    console.log("Updating all reports with new attendance data...");
    const logData = this.logRepo.buildStudentHistoryMap();
    const reportRepo = new ReportRepository(this.ss);
    const reportService = new ReportService(reportRepo);

    reportService.generateClassReports(classMap, logData);

    const dateConfig = this.calendarService.getReportDateConfig(date);
    reportService.generateWeeklyReport(classMap, dateConfig, logData);
  }
}
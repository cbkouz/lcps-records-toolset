import { dateToString } from "@shared/utilities/data-utils";
import { ReportDateConfig, ReportDateSets } from "../calendar-service";
import { ATTENDANCE_CODES, AttendanceCode } from "../settings";
import { AttendanceRecord, ClassMap, StudentHistoryMap } from "../types";
import { ReportRepository } from "./report-repo";

export class ReportService {
  constructor(private repo: ReportRepository) { }

  public generateClassReports(classMap: ClassMap, logData: StudentHistoryMap): void {
    const reportSheets = this.repo.getClassReportSheets();
    const headers = this.repo.getClassTabHeaders(reportSheets[0].sheet); // All sheets have the same headers

    for (const { sheet, linkedClassId } of reportSheets) {
      const classRecords = classMap.get(linkedClassId);
      if (!classRecords) {
        console.warn(`No attendance records found for class with ID ${linkedClassId}. Skipping report generation for this sheet.`);
        continue;
      }
      const reportData = this.buildClassReportData(headers, classRecords.records, logData);
      this.repo.writeClassReportData(sheet, reportData, headers.length, classRecords.tabName);
    }
  }

  private buildClassReportData(headers: string[], classRecords: AttendanceRecord[], logData: StudentHistoryMap): string[][] {
    const reportData: string[][] = [];
    for (const record of classRecords) {
      const row: string[] = [this.formatStudentName(record.studentName)];
      for (let i = 1; i < headers.length; i++) {
        const dateString = headers[i];
        const rawStatus = logData.get(record.studentId)?.get(dateString) as AttendanceCode;
        const displaySymbol = rawStatus && ATTENDANCE_CODES[rawStatus] ? ATTENDANCE_CODES[rawStatus].symbol : "";
        row.push(displaySymbol);
      }
      reportData.push(row);
    }
    return reportData;
  }

  public generateWeeklyReport(classMap: ClassMap, dateConfig: ReportDateConfig, logData: StudentHistoryMap): void {
    const summaryCols = 4; // Last Week, This Week, Q1, Q2
    const dailyLookupKeys = dateConfig.thisWeekDates.map(d => dateToString(d));
    const thisWeekSet = new Set(dailyLookupKeys);
    const dataWidth = dailyLookupKeys.length + summaryCols + 1; // +1 for student name column
    const blankRow = Array(dataWidth).fill("");

    const matrix: any[][] = [];
    const formattingPlan = {
      sectionHeaders: [] as number[],
      targetZones: [] as { startRow: number, endRow: number }[]
    };
    
    const titleRow = [`Weekly Attendance Summary for ${dateToString(dateConfig.thisWeekDates[0])} - ${dateToString(dateConfig.thisWeekDates[dateConfig.thisWeekDates.length - 1])}`,
      ...Array(dataWidth - 1).fill("")]; 
    matrix.push(titleRow);
    
    let currentRow = 2;
    classMap.forEach(({ tabName, records }) => {
      matrix.push(blankRow); // Spacer row between classes
      currentRow++;
      
      const sectionHeader = [
        `Class: ${tabName}`,
        ...Array(dailyLookupKeys.length).fill(""),
        "Absences/Suspension",
        ...Array(summaryCols-1).fill("") // Placeholder cells for totals
      ];
      matrix.push(sectionHeader);
      formattingPlan.sectionHeaders.push(currentRow);
      currentRow++;

      const subHeader = [
        "Student Name",
        ...dateConfig.thisWeekDates,
        "Last Week",
        "This Week",
        "Q1",
        "Q2"
      ];
      const zoneStart = currentRow;
      matrix.push(subHeader);
      currentRow++;

      for (const record of records) {
        const studentRow: any[] = [this.formatStudentName(record.studentName)];
        for (const dateKey of dailyLookupKeys) {
          const rawStatus = logData.get(record.studentId)?.get(dateKey) as AttendanceCode;
          const displaySymbol = rawStatus && ATTENDANCE_CODES[rawStatus] ? ATTENDANCE_CODES[rawStatus].symbol : "";
          studentRow.push(displaySymbol);
        }
        const absenceCounts = this.tallyStudentAbsences(logData.get(record.studentId) || new Map(), dateConfig.dateSets, thisWeekSet);
        studentRow.push(...absenceCounts);
        matrix.push(studentRow);
        currentRow++;
      }
      
      const zoneEnd = currentRow - 1;
      formattingPlan.targetZones.push({ startRow: zoneStart, endRow: zoneEnd });
    });

    this.repo.writeWeeklySummary(matrix, formattingPlan, summaryCols);
  }

  private tallyStudentAbsences(studentHistory: Map<string, AttendanceCode>, dateSets: ReportDateSets, thisWeekSet: Set<string>): number[] {
    if (!studentHistory) return [0, 0, 0, 0];
    let thisWeekCount = 0, lastWeekCount = 0, q1Count = 0, q2Count = 0;
    studentHistory.forEach((status, date) => {
      const isAbsence = status === "A" || status === "S";
      if (isAbsence) {
        if (thisWeekSet.has(date)) thisWeekCount++;
        if (dateSets.lastWeekSet.has(date)) lastWeekCount++;
        if (dateSets.q1Dates.has(date)) q1Count++;
        if (dateSets.q2Dates.has(date)) q2Count++;
      }
    });
    return [lastWeekCount, thisWeekCount, q1Count, q2Count];
  }

  private formatStudentName(name: string): string {
    return name.replace(/^(.+),\s+(.+)$/, "$2 $1");
  }
}
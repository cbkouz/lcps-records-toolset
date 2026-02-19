import { dateToString, formatDate } from "@shared/utilities/data-utils";
import { SemesterConfig } from "./semester-repository";

export interface DayInfo {
  date: Date;
  relativeIndex: number; // 1-based index of the day within the semester
  isSchoolDay: boolean;
  isMonday: boolean;
  weekNumber: number; // 1-based week number within the semester
}

export interface ReportDateSets {
  lastWeekSet: Set<string>;
  q1Dates: Set<string>;
  q2Dates: Set<string>; 
}

export interface ReportDateConfig {
  thisWeekDates: Date[];
  dateSets: ReportDateSets;
}

export class CalendarService {
  constructor(private semesterConfig: SemesterConfig) { }

  public generateSemesterDates(): DayInfo[] {
    const { startDate, endDate, nonSchoolDays } = this.semesterConfig;
    const dates: DayInfo[] = [];
    let currentDate = new Date(startDate);
    let relativeIndex = 1;
    let weekNumber = 1;
    
    while (currentDate <= endDate) {
      const weekday = currentDate.getDay();
      if (weekday === 0 || weekday === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue; // Skip weekends
      }
      const isSchoolDay = !nonSchoolDays.has(dateToString(currentDate));
      const isMonday = weekday === 1;
      dates.push({ date: new Date(currentDate), relativeIndex, isSchoolDay, isMonday, weekNumber });
      if (weekday === 5) weekNumber++; // Increment week number after Friday
      relativeIndex++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  public getReportDateConfig(days: DayInfo[], endOfNineWeeks: Date, refDate: Date): ReportDateConfig {
    const refDateWeek = days.find(d => dateToString(d.date) === dateToString(refDate))?.weekNumber;
    if (!refDateWeek) throw new Error("Reference date is out of semester range");

    const thisWeekDates = days.filter(d => d.weekNumber === refDateWeek).map(d => d.date);

    const lastWeekSet = new Set(days.filter(d => d.weekNumber === refDateWeek - 1).map(d => dateToString(d.date)));

    const q1Dates = new Set(days.filter(d => d.date <= endOfNineWeeks).map(d => dateToString(d.date)));
    const q2Dates = new Set(days.filter(d => d.date > endOfNineWeeks).map(d => dateToString(d.date)));

    return { thisWeekDates, dateSets: { lastWeekSet, q1Dates, q2Dates } };
  }
}
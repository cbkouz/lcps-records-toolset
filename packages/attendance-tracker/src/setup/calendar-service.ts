import { SemesterConfig } from "./semester-repository";

export interface DayInfo {
  date: Date;
  relativeIndex: number; // 1-based index of the day within the semester
  isSchoolDay: boolean;
  isMonday: boolean;
  weekNumber: number; // 1-based week number within the semester
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
      const isSchoolDay = !nonSchoolDays.has(currentDate.toDateString());
      const isMonday = weekday === 1;
      dates.push({ date: new Date(currentDate), relativeIndex, isSchoolDay, isMonday, weekNumber });
      if (weekday === 5) weekNumber++; // Increment week number after Friday
      relativeIndex++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }
}
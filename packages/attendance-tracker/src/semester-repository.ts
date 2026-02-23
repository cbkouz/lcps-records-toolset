import { dateToString } from "@shared/utilities/data-utils";
import { NAMED_RANGES } from "./schema";
import { isValidDate } from "./utilities";


export interface SemesterConfig {
  startDate: Date;
  endDate: Date;
  endOfNineWeeks: Date;
  nonSchoolDays: Set<string>;
  snowDays?: Set<string>;
}

export class SemesterRepository {
  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet) { }
 
  public getSemesterConfig(): SemesterConfig {
    const ranges = Object.entries(NAMED_RANGES).reduce((acc, [key, name]) => {
      const range = this.ss.getRangeByName(name);
      if (!range) throw new Error(`Named range "${name}" not found`);
      acc[key] = range;
      return acc;
    }, {} as Record<string, GoogleAppsScript.Spreadsheet.Range>);
    
    const [startDate, endDate] = ranges.SEMESTER_DATES.getValues()[0] as [Date, Date];
    const endOfNineWeeks = ranges.NINE_WEEKS.getValue() as Date;
    if (!isValidDate(startDate) || !isValidDate(endDate) || !isValidDate(endOfNineWeeks)) {
      throw new Error("Invalid semester dates in named ranges");
    };

    const [nonSchoolDays, snowDays] = [ranges.NON_SCHOOL_DAYS, ranges.SNOW_DAYS].map(range => {
      const values = range.getValues().flat() as any[];
      const validDates = values.filter(isValidDate).map(date => dateToString(date));
      return new Set(validDates);
    });
    
    return { startDate, endDate, endOfNineWeeks, nonSchoolDays, snowDays };
  }
}
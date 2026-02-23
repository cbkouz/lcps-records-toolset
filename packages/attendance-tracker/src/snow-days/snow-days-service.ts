import { dateToString } from "@shared/utilities/data-utils";
import { LOG_COLUMNS } from "../schema";

export class SnowDaysService {
  constructor() { }

  public filterSnowDays(attendanceLogs: any[][], dates: Set<string>): any[][] {
    return attendanceLogs.filter(log => {
      const logDateStr = dateToString(log[LOG_COLUMNS.DATE]);
      return !dates.has(logDateStr);
    });
  }
}
import { dateToString } from "@shared/utilities/data-utils";
import { NAMED_RANGES } from "../schema";
import { SnowDayQueue } from "../types";
import { FORMATTING } from "../settings";

export class snowDaysRepository {
  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet) { }
  
  public getUnprocessedSnowDays(): SnowDayQueue {
    const snowDayRange = this.ss.getRangeByName(NAMED_RANGES.SNOW_DAYS);
    if (!snowDayRange) {
      throw new Error(`Named range ${NAMED_RANGES.SNOW_DAYS} not found.`);
    }
    const values = snowDayRange.getValues();
    const backgrounds = snowDayRange.getBackgrounds();

    const snowDayQueue: SnowDayQueue = values.reduce((queue, row, index) => {
      const dateStr = dateToString(row[0] as Date);
      const isProcessed = backgrounds[index][0] === FORMATTING.COLORS.SNOW_DAY;
      if (dateStr !== "" && !isProcessed) {
        queue.dates.add(dateStr);
        const rowA1 = snowDayRange.getCell(index + 1, 1).getA1Notation();
        queue.rowsA1.push(rowA1);
      }
      return queue;
    }, { dates: new Set<string>(), rowsA1: [] as string[] });
    
    return snowDayQueue;
  }
}

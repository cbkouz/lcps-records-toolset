import { columnNumberToLetter } from "@shared/utilities/data-utils";
import { CORE_TABS, NAMED_RANGES } from "./schema";
import { SheetIndex } from "@shared/types";
import { FORMATTING } from "./settings";

export function isValidDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function deleteReportSheets(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
    const sheets = ss.getSheets();
    const tabsToKeep = Object.values(CORE_TABS) as readonly string[];

    let deletedSheetCounter = 0;
    sheets.forEach((sheet) => {
      const sheetName = sheet.getName();
      if (!tabsToKeep.includes(sheetName)) {
        ss.deleteSheet(sheet);
        deletedSheetCounter++;
      }
    });
    console.log(`Deleted ${deletedSheetCounter} report sheets.`);
}
  
export function createSnowDayRule(
  ranges: GoogleAppsScript.Spreadsheet.Range[],
  anchorRow: number = 1,
): GoogleAppsScript.Spreadsheet.ConditionalFormatRule {
  const firstRange = ranges[0];
  const startColumnLetter = columnNumberToLetter(firstRange.getColumn() as SheetIndex);

  const formula = `=COUNTIF(INDIRECT("${NAMED_RANGES.SNOW_DAYS}"), ${startColumnLetter}$${anchorRow})>0`;

  return SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(formula)
    .setBackground(FORMATTING.COLORS.SNOW_DAY)
    .setRanges(ranges)
    .build();
}
import { dateToString } from "@shared/utilities/data-utils";
import { LINKED_SHEET_TAG } from "../settings";
import { CORE_TABS, SUMMARY_SHEET } from "../schema";

export class ReportRepository {
  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet) { }

  public getClassReportSheets(): { sheet: GoogleAppsScript.Spreadsheet.Sheet, linkedClassId: string }[] {
    const sheets = this.ss.createDeveloperMetadataFinder()
      .withKey(LINKED_SHEET_TAG)
      .find()
      .map((metadata) => {
        const sheet = metadata.getLocation().getSheet();
        const linkedClassId = String(metadata.getValue());
        return { sheet, linkedClassId };
      })
      .filter((data): data is { sheet: GoogleAppsScript.Spreadsheet.Sheet, linkedClassId: string } => data.sheet !== null);
    
    if (sheets.length === 0) {
      throw new Error("No report sheets found. Please check that the report sheets are properly linked with the correct metadata tag.");
    }
    return sheets;
  }

  public getClassTabHeaders(sheet: GoogleAppsScript.Spreadsheet.Sheet): string[] {
    const rawHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return rawHeaders.map((header) => {
      if (header instanceof Date) {
        return dateToString(header);
      } else {
        return header.toString();
      }
    });
  }

  public writeClassReportData(sheet: GoogleAppsScript.Spreadsheet.Sheet, reportData: string[][], headerCount: number, tabName: string): void {
    if (reportData.length === 0) {
      console.warn(`No data to write for sheet ${sheet.getName()}. Skipping.`);
      return;
    }
    // Clear existing data below headers before writing new data
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getLastColumn()).clearContent();
    sheet.getRange(2, 1, reportData.length, headerCount).setValues(reportData);

    const sheetName = sheet.getName();
    if (sheetName !== tabName) {
      sheet.setName(tabName);
    }
  }

  public getSummaryReportSheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    return this.ss.getSheetByName(SUMMARY_SHEET);
  }
}
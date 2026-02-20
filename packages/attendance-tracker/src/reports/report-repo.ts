import { columnNumberToLetter, dateToString } from "@shared/utilities/data-utils";
import { FORMATTING, LINKED_SHEET_TAG } from "../settings";
import { CORE_TABS, SUMMARY_SHEET } from "../schema";
import { SheetIndex } from "@shared/types";

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

  public writeWeeklySummary(matrix: string[][], formattingPlan: { sectionHeaders: number[], targetZones: { startRow: number, endRow: number }[] }, summaryCols: number): void {
    const sheet = this.createOrResetSummarySheet();

    if (matrix.length === 0) {
      console.warn("No data to write to the summary sheet. Skipping.");
      return;
    }

    const maxCols = matrix[0].length;
    const dataRange = sheet.getRange(1, 1, matrix.length, maxCols);
    dataRange.setFontSize(FORMATTING.DEFAULT_FONT_SIZE);
    dataRange.setValues(matrix);

    // Format sheet title
    const titleCell = sheet.getRange(1, 1);
    titleCell.setFontSize(FORMATTING.DEFAULT_FONT_SIZE + 2).setFontWeight("bold");

    const endCol = columnNumberToLetter(maxCols as SheetIndex);
    // Apply formatting for section headers and data zones
    if (formattingPlan.sectionHeaders.length > 0) {
      const headerNotations = formattingPlan.sectionHeaders.map(row => `A${row}:${endCol}${row}`);
      sheet.getRangeList(headerNotations)
        .setBackground(FORMATTING.COLORS.HEADER_ROW)
        .setFontWeight("bold");
    };

    const lastDateCol = maxCols - summaryCols;
    for (const zone of formattingPlan.targetZones) {
      const zoneHeight = zone.endRow - zone.startRow + 1;
      // Add borders
      // Horizontal border below subheader
      sheet.getRange(zone.startRow, 1, 1, maxCols)
        .setBorder(null, null, true, null, null, null);

      // Vertical border between name column and date columns
      sheet.getRange(zone.startRow, 1, zoneHeight, 1)
        .setBorder(null, null, null, true, null, null);
      
      // Vertical border between date columns and summary columns
      sheet.getRange(zone.startRow, lastDateCol, zoneHeight, 1)
        .setBorder(null, true, null, null, null, null);
    }
  }

  private createOrResetSummarySheet(): GoogleAppsScript.Spreadsheet.Sheet {
    let sheet = this.ss.getSheetByName(SUMMARY_SHEET);
    if (!sheet) {
      sheet = this.ss.insertSheet(SUMMARY_SHEET, 0);
      sheet.setColumnWidth(1, 200); // Student Name column
      sheet.setColumnWidths(2, 5, 45); // Date columns
    } else {
      sheet.clear();
    }
    return sheet;
  }
}
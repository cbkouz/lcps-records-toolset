import { SheetIndex } from "@shared/types";
import { ClassInfo } from "../record-attendance/attendance-records-repo";
import { DayInfo } from "../calendar-service";
import { createSnowDayRule, deleteReportSheets } from "../utilities";
import { columnNumberToLetter } from "@shared/utilities/data-utils";
import { FORMATTING, LINKED_SHEET_TAG } from "../settings";

export class SemesterProvisioningService {
  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet, private days: DayInfo[], private classInfo: ClassInfo[]) { }

  public run(): void {
    // First, delete any existing report sheets to start fresh
    console.log(`Deleting existing report sheets from spreadsheet: ${this.ss.getName()} `);
    deleteReportSheets(this.ss);

    // Then, create a new sheet for the first class and set it up with the appropriate formatting and metadata
    console.log(`Creating new report sheets for ${this.classInfo.length} classes...`);
    const firstSheet = this.createFirstClassSheet();
    console.log(`Created sheet: ${firstSheet.getName()}`);
    // Copy the first sheet for each additional class and update the metadata to link it to the correct class info
    for (let i = 1; i < this.classInfo.length; i++) {
      const classInfo = this.classInfo[i];
      const newSheet = firstSheet.copyTo(this.ss).setName(classInfo.tabName);
      this.ss.setActiveSheet(newSheet);
      this.ss.moveActiveSheet(i + 1); // Move the new sheet to the correct position in the tab order
      this.addIdTag(newSheet, classInfo.tabId);
      console.log(`Created sheet: ${newSheet.getName()}`);
    }
    console.log("Semester provisioning complete.");
  }

  private createFirstClassSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const firstClass = this.classInfo[0];
    
    // Create the new sheet and ensure it has enough columns
    const newSheet = this.ss.insertSheet(firstClass.tabName, 0);
    const requiredColumns = this.days.length + 1; // +1 for student name column
    if (newSheet.getMaxColumns() < requiredColumns) {
      newSheet.insertColumnsAfter(1, requiredColumns - newSheet.getMaxColumns());
    }
    
    // Set up header row with dates, then format it
    const headerDates = this.days.map(day => day.date);
    const header = ["Student Name", ...headerDates];
    newSheet.getRange(1, 1, 1, header.length)
      .setValues([header])
      .setFontWeight("bold")
      .setNumberFormat("mm/dd")
      .setBorder(false, false, true, false, false, false);
    
    // Set column widths and alignment
    newSheet.setColumnWidth(1, 200); // Wider column for student names
    newSheet.setFrozenColumns(1); // Freeze the first column

     // Remove extra rows from bottom if the sheet has more than needed
    const maxRows = 40; // Set a reasonable number of rows for students
    const currentRows = newSheet.getMaxRows();
    if (maxRows < currentRows) {
      newSheet.deleteRows(maxRows + 1, currentRows - maxRows);
    }

    // Set narrower column widths for date columns and center align them
    newSheet.setColumnWidths(2, header.length - 1, 45); // Narrower columns for dates
    newSheet.getRange(1, 2, maxRows, header.length - 1).setHorizontalAlignment("center");

   

    // Paint even-numbered weeks with a light gray background
    this.getRangeToPaint(newSheet, maxRows, day => day.weekNumber % 2 === 0)?.setBackground(FORMATTING.COLORS.WEEK_BANDING);
    
    // Paint non-school days with a dark gray background
    this.getRangeToPaint(newSheet, maxRows, day => !day.isSchoolDay)?.setBackground(FORMATTING.COLORS.NON_SCHOOL_DAY);

    // Add snow day conditional formatting rule
    const snowDayRule = createSnowDayRule([newSheet.getRange(1, 2, maxRows, header.length - 1)]);
    newSheet.setConditionalFormatRules([snowDayRule]);

    // Add developer metadata to link this sheet to the class info
    this.addIdTag(newSheet, firstClass.tabId);

    return newSheet;
  }
  
  private getRangeToPaint(sheet: GoogleAppsScript.Spreadsheet.Sheet, maxRows: number, predicate: (day: DayInfo) => boolean): GoogleAppsScript.Spreadsheet.RangeList | null {
    const colsToPaint = this.days
      .filter(predicate)
      .map(day => {
        const index = day.relativeIndex + 1 as SheetIndex; // +1 to account for student name column
        const colLetter = columnNumberToLetter(index);
        return `${colLetter}1:${colLetter}${maxRows}`;
      });
    console.log(`Found ${colsToPaint.length} columns to paint`);
    return colsToPaint.length > 0 ? sheet.getRangeList(colsToPaint) : null;
  }

  private addIdTag(sheet: GoogleAppsScript.Spreadsheet.Sheet, tabId: string): void {
    const key = LINKED_SHEET_TAG;
    const value = tabId;
    const existingMetadata = sheet.getDeveloperMetadata().filter(meta => meta.getKey() === key);
    if (existingMetadata.length > 0) {
      existingMetadata[0].setValue(value);
    } else {
      sheet.addDeveloperMetadata(key, value, SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT);
    }
  }
}
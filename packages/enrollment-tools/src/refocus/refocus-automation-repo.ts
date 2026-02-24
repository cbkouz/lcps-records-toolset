import { ArrayIndex, SheetIndex, toArrayIndex, toSheetIndex } from "@shared/types";
import { RefocusSections, SectionPayload } from "./refocus-types";


export class RefocusAutomationRepository {
  private divider = { text: "LCMS Student", col: 2 as SheetIndex }; // Col B
  constructor(private refocusSheet: GoogleAppsScript.Spreadsheet.Sheet,
    private msArchiveSheet: GoogleAppsScript.Spreadsheet.Sheet,
    private hsArchiveSheet: GoogleAppsScript.Spreadsheet.Sheet) {
  }

  public getRefocusSections(): RefocusSections {
    const allData = this.refocusSheet.getDataRange().getValues();
    const dividerArrayIndex = allData.findIndex(row =>
      String(row[toArrayIndex(this.divider.col)]).trim().toLowerCase().includes(this.divider.text.toLowerCase())
    ) as ArrayIndex;

    if (dividerArrayIndex === -1) {
      throw new Error(`Divider row with text "${this.divider.text}" not found in column ${this.divider.col}`);
    }

    const hsData = allData.slice(1, dividerArrayIndex); // Exclude header row
    const msData = allData.slice(dividerArrayIndex + 1); // Exclude divider row
    const dividerRowIndex = toSheetIndex(dividerArrayIndex);
    
    return { msData, hsData, dividerRowIndex };
  }

  public rewriteRefocusSection(payload: SectionPayload, startRow: SheetIndex = 1 as SheetIndex,
    endRow?: SheetIndex
  ): void {
    const { data: sectionData, backgrounds: sectionBackgrounds } = payload;

    if (!endRow) {
      endRow = this.refocusSheet.getLastRow() as SheetIndex;
    }

    const oldSectionHeight = endRow - startRow + 1;
    const newSectionHeight = sectionData.length;
    
    // Always trust the data payload's width to prevent dimension mismatch errors
    const sectionWidth = sectionData[0].length as SheetIndex;

    this.refocusSheet.getRange(startRow, 1, oldSectionHeight, sectionWidth)
      .clearContent()
      .setFontColor(null)
      .setFontWeight(null)
      .setBackground(null);

    // 1. Resize the room FIRST
    if (newSectionHeight > oldSectionHeight) {
      const rowsToAdd = newSectionHeight - oldSectionHeight;
      this.refocusSheet.insertRowsAfter(endRow, rowsToAdd);
    } else if (newSectionHeight < oldSectionHeight) {
      const rowsToDelete = oldSectionHeight - newSectionHeight;
      this.refocusSheet.deleteRows((endRow - rowsToDelete) + 1, rowsToDelete);
    }

    // 2. Define the exact range using the NEW dimensions AFTER resizing
    const targetRange = this.refocusSheet.getRange(
      startRow,
      1,
      newSectionHeight,
      sectionWidth
    );

    // 3. Etch-A-Sketch the perfectly sized room
    targetRange.setValues(sectionData);
    console.log(`Rewrote section starting at row ${startRow} with ${newSectionHeight} rows and ${sectionWidth} columns.`);
    targetRange.setBackgrounds(sectionBackgrounds);
  }
}
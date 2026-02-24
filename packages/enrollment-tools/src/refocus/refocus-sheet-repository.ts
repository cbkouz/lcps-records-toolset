import { MODULES } from "@shared/schema";
import { MetadataUtils } from "@shared/utilities/metadata-utils";
import { RefocusCatalog } from "./refocus-types";
import { SheetIndex } from "@shared/types";
import { COLORS } from "@shared/settings";

export class RefocusSheetRepository {
  public catalog: RefocusCatalog;
  private readonly moduleKey = MODULES.REFOCUS.key;

  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet, isDemoMode: boolean = false) {
    this.catalog = this.buildRefocusCatalog(isDemoMode);
  }

  public buildRefocusCatalog(demoMode: boolean): RefocusCatalog {
    const refocusSheets = MetadataUtils.getModuleSheetsWithTags(
      this.ss,
      this.moduleKey,
    );
    const catalog: Partial<RefocusCatalog> = {};
    for (const { tags, sheet } of refocusSheets) {
      let mappedRole: keyof RefocusCatalog | null = null;
      if (tags.layout === "refocus") {
        mappedRole = "refocus";
      } else if (tags.label === "lcmsArchive") {
        mappedRole = "msArchive";
      } else if (tags.label === "lchsArchive") {
        mappedRole = "hsArchive";
      }

      if (mappedRole) {
        if (catalog[mappedRole]) {
          throw new Error(`Multiple sheets found for role ${mappedRole}`);
        }
        catalog[mappedRole] = sheet;
      }
    }

    const missingRoles = (
      Object.keys(catalog) as Array<keyof RefocusCatalog>
    ).filter((role) => !catalog[role]);
    if (missingRoles.length > 0) {
      throw new Error(`Missing sheets for roles: ${missingRoles.join(", ")}`);
    }

    if (!demoMode) {
      return catalog as RefocusCatalog;
    } else {
      return this.createDemoCatalog(catalog as RefocusCatalog);
    }     
  }

  public appendToArchive(
    targetArchive: "msArchive" | "hsArchive",
    data: any[][],
  ): void {
    if (data.length === 0) {
      return; // Nothing to append
    }
    const sheet = this.catalog[targetArchive];
    const lastRow = this.getLastRowInColumns(sheet, data[0].length);
    const targetRange = sheet.getRange(
      lastRow + 1,
      1,
      data.length,
      data[0].length,
    );
    targetRange.setValues(data);
    targetRange.setBackground(COLORS.DEFAULT);
    targetRange.setFontColor(null); // Reset to default font color
    console.log(`Appended ${data.length} rows to ${targetArchive} starting at row ${lastRow + 1}.`);
  }

  private getLastRowInColumns(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    numColumns: number,
  ): SheetIndex {
    if (sheet.getLastRow() === 0) {
      return 0 as SheetIndex; // Sheet is completely empty
    }

    const data = sheet
      .getRange(1, 1, sheet.getLastRow(), numColumns)
      .getValues();
    for (let rowIndex = data.length - 1; rowIndex >= 0; rowIndex--) {
      if (data[rowIndex].some((cell) => cell !== "")) {
        return (rowIndex + 1) as SheetIndex; // Convert to 1-based index
      }
    }
    return 0 as SheetIndex; // No data found
  }

  private createDemoCatalog(
    liveCatalog: RefocusCatalog
  ): RefocusCatalog {
    console.log("Creating DEMO catalog based on live catalog");
    const demoCatalog: Partial<RefocusCatalog> = {};

    // 1. Refocus Active (Always destroy and recreate)
    const demoRefocus = this.ss.getSheetByName("DEMO_Refocus");
    demoCatalog.refocus = demoRefocus ? demoRefocus : this.cloneAndCleanSheet(liveCatalog.refocus, "DEMO_Refocus");
    this.applyDemoFormattingRules(demoCatalog.refocus);

    // 2. MS Archive (Preserve or Create)
    const existingMs = this.ss.getSheetByName("DEMO_MS_Archive");
    demoCatalog.msArchive = existingMs ? existingMs : this.cloneAndCleanSheet(liveCatalog.msArchive, "DEMO_MS_Archive");

    // 3. HS Archive (Preserve or Create)
    const existingHs = this.ss.getSheetByName("DEMO_HS_Archive");
    demoCatalog.hsArchive = existingHs ? existingHs : this.cloneAndCleanSheet(liveCatalog.hsArchive, "DEMO_HS_Archive");

    return demoCatalog as RefocusCatalog;
  }

  private cloneAndCleanSheet(
    source: GoogleAppsScript.Spreadsheet.Sheet,
    newName: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    const clone = source.copyTo(this.ss).setName(newName);
    clone.getDeveloperMetadata().forEach(md => md.remove());

    // For Archive sheets, wipe everything EXCEPT the headers
    if (newName.toLowerCase().includes("archive")) {
      const lastRow = clone.getLastRow();
      const lastCol = clone.getLastColumn();
    
      if (lastRow > 1) {
        // Grab everything from Row 3 down to the last row/column and wipe the data
        clone.getRange(3, 1, lastRow - 2, lastCol)
          .clearContent()
          .setBackground(null)
          .setFontColor(null)
          .setFontWeight(null);
      }
    }
    return clone;
  }

  private applyDemoFormattingRules(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    const rules = [];
    const redTextRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISBLANK($A2)')
      .setFontColor("red")
      .setRanges([sheet.getRange("A2:B1000")])
      .build();
    rules.push(redTextRule);
    
    const boldNotesRow = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISBLANK($A2)')
      .setBold(true)
      .setRanges([sheet.getRange("A2:Z1000")])
      .build();
    rules.push(boldNotesRow);

    const pendingBold = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("PENDING")
      .setBold(true)
      .setRanges([sheet.getRange("A2:A1000")])
      .build();
    rules.push(pendingBold);

    sheet.setConditionalFormatRules(rules);
  } 
}

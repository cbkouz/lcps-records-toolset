import { MetadataModuleKey, SheetWithTags } from "@shared/types";
import { SheetUtils } from "./sheet-utils";

export class MetadataUtils {
  public static createMetadataMap(sheet: GoogleAppsScript.Spreadsheet.Sheet): Map<string, string> {
    const metadata = sheet.getDeveloperMetadata();
    return new Map(metadata.map(item => [item.getKey(), String(item.getValue())] as [string, string]));
  }
 
  public static getModuleSheetsWithTags(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    moduleKey: MetadataModuleKey
  ): SheetWithTags[] {
    const finder = ss.createDeveloperMetadataFinder()
      .withKey(moduleKey)
      .withValue("true")
      .withLocationType(SpreadsheetApp.DeveloperMetadataLocationType.SHEET)
      .find();
    
    if (finder.length === 0) return [];

    const results: SheetWithTags[] = [];
    finder.forEach(meta => {
      const sheet = meta.getLocation().getSheet();
      if (sheet) {
        const tags = this.createMetadataMap(sheet);
        results.push({ sheet, tags })
      }
    });
    return results;
  }
}
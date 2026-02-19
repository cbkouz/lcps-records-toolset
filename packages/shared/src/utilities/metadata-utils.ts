import { MetadataModuleKey, SheetMetadata, SheetWithTags } from "@shared/types";

export class MetadataUtils {
  public static createMetadataMap(sheet: GoogleAppsScript.Spreadsheet.Sheet): SheetMetadata {
    const metadata = sheet.getDeveloperMetadata();
    return Object.fromEntries(metadata.map(meta => [meta.getKey(), meta.getValue()])) as SheetMetadata;
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
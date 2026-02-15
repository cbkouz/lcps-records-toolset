import { SheetMetadata } from "@shared/types";

export class MetadataManager {

  public static syncSheetMetadata(sheet: GoogleAppsScript.Spreadsheet.Sheet, config: SheetMetadata): void {
    const liveMetadata = this.mapExistingMetadata(sheet);
    Object.entries(config).forEach(([key, value]) => {
      const existingMeta = liveMetadata[key];
      const isEmpty = value === null || value === undefined || value === "";
      const desiredStr = isEmpty ? null : String(value);
      if (existingMeta) {
        const currentStr = String(existingMeta.getValue());
        if (desiredStr === null) {
          existingMeta.remove();
        } else if (currentStr !== desiredStr) {
          existingMeta.setValue(desiredStr);
        }
      } else {
        if (desiredStr !== null) {
          sheet.addDeveloperMetadata(key, desiredStr, SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT);
        }
      }
    });
  }

  private static mapExistingMetadata(sheet: GoogleAppsScript.Spreadsheet.Sheet): Record<string, GoogleAppsScript.Spreadsheet.DeveloperMetadata> {
    const meta = sheet.getDeveloperMetadata();
    return meta.reduce((acc, item) => {
      acc[String(item.getKey())] = item;
      return acc;
    }, {} as Record<string, GoogleAppsScript.Spreadsheet.DeveloperMetadata>);
  }
}
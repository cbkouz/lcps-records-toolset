import { LAYOUT_REGISTRY, LayoutKey } from "./layouts";
import { CORE_COLUMNS } from "./shared-config";
import { BaseLayout } from "./types";

export interface SheetWithTags {
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  tags: Map<string, string>;
}

export interface SheetWithLayout {
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  layout: BaseLayout;
}
export class MetadataUtils {
  static createMetadataMap(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
  ): Map<string, string> {
    const metadata = sheet.getDeveloperMetadata();
    return metadata.reduce((map, entry) => {
      map.set(String(entry.getKey()), String(entry.getValue()));
      return map;
    }, new Map<string, string>());
  }

  static getSheetsByModule(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    moduleKey: string,
    value: string = "true",
  ): GoogleAppsScript.Spreadsheet.Sheet[] {
    return ss
      .createDeveloperMetadataFinder()
      .withKey(moduleKey)
      .withValue(value)
      .withLocationType(SpreadsheetApp.DeveloperMetadataLocationType.SHEET)
      .find()
      .map((entry) => {
        const sheet = entry.getLocation().getSheet();
        if (!sheet) {
          throw new Error(`Developer metadata found but sheet is missing.`);
        }
        return sheet;
      });
  }

  static getSheetsWithTags(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    moduleKey: string,
  ): SheetWithTags[] {
    const sheets = this.getSheetsByModule(ss, moduleKey);
    return sheets.map((sheet) => {
      const tags = this.createMetadataMap(sheet);
      return { sheet, tags };
    });
  }

  static getSheetsWithLayouts(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    moduleKey: string,
  ): SheetWithLayout[] {
    const taggedSheets = this.getSheetsWithTags(ss, moduleKey);
    return taggedSheets
      .filter((sheetData) => sheetData.tags.has(CORE_COLUMNS.LAYOUT.key))
      .map((sheetData) => {
        const layoutKey = sheetData.tags.get(
          CORE_COLUMNS.LAYOUT.key,
        ) as LayoutKey;
        const layout = LAYOUT_REGISTRY[layoutKey];
        return { sheet: sheetData.sheet, layout: layout };
      }) as SheetWithLayout[];
  }
}

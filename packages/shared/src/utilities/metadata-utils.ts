import {
  ClassSheetLayout,
  DayProgram,
  LayoutKey,
  layoutRegistry,
} from "@shared/config/class-layouts";
import { CORE_COLUMNS } from "@shared/config/shared-config";

export interface SheetWithTags {
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  tags: Map<string, string>;
}

export interface SheetsByLayout {
  default: GoogleAppsScript.Spreadsheet.Sheet[];
  other: {
    sheet: GoogleAppsScript.Spreadsheet.Sheet;
    layout: ClassSheetLayout;
  }[];
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

  static inspectActiveSheetMetadata() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();

    // 1. Get the data using your helper
    const metaMap = this.createMetadataMap(sheet);

    if (metaMap.size === 0) {
      ui.alert(`No metadata found on sheet: ${sheet.getName()}`);
      return;
    }

    // 2. Build the HTML string manually
    let html = `
      <style>
        body { font-family: sans-serif; padding: 10px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #eee; }
      </style>
      <h3>Metadata: ${sheet.getName()}</h3>
      <table>
        <tr><th>Key</th><th>Value</th></tr>`;

    // 3. Loop through map to add rows
    metaMap.forEach((value, key) => {
      html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
    });

    html += `</table>
      <br>
      <button onclick="google.script.host.close()">Close</button>
    `;

    // 4. Render
    const output = HtmlService.createHtmlOutput(html)
      .setWidth(400)
      .setHeight(600);

    ui.showModalDialog(output, "Metadata Inspector");
  }

  static buildCatalogForModule(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
    moduleKey: string,
  ): SheetsByLayout {
    const taggedSheets = MetadataUtils.getSheetsWithTags(ss, moduleKey);
    const catalog: SheetsByLayout = {
      default: [],
      other: [],
    };

    for (const { sheet, tags } of taggedSheets) {
      const layoutKey = tags.get(CORE_COLUMNS.LAYOUT.key) as LayoutKey;
      const layout = layoutRegistry[layoutKey];
      if (layout === DayProgram) {
        catalog.default.push(sheet);
      } else {
        catalog.other.push({ sheet, layout });
      }
    }
    console.log(
      `Catalog built for module '${moduleKey}': ${catalog.default.length} default sheets, ${catalog.other.length} other sheets.`,
    );
    return catalog;
  }
}

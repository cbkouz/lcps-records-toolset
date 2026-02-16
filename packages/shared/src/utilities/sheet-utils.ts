export class SheetUtils {
  static getLocalSs(sheetIdProp: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const sheetId = this.getSheetIdFromProperty(sheetIdProp);
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId() === sheetId) {
      return active;
    }
    return SpreadsheetApp.openById(sheetId);
  }

  static getSheetIdFromProperty(sheetIdProp: string): string {
    const sheetId = PropertiesService.getScriptProperties().getProperty(sheetIdProp);
    if (!sheetId) {
      throw new Error(`Spreadsheet ID not found in script properties for key: ${sheetIdProp}`);
    }
    return sheetId;
  }

  static buildSheetDictionary(ss: GoogleAppsScript.Spreadsheet.Spreadsheet):
    Map<number, GoogleAppsScript.Spreadsheet.Sheet> {
    return new Map(ss.getSheets().map(sheet => [sheet.getSheetId(), sheet]));
  }
}
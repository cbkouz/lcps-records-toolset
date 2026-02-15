export class SheetUtils {
  static getLocalSs(sheetIdProp: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const sheetId = PropertiesService.getScriptProperties().getProperty(sheetIdProp);
    if (!sheetId) {
      throw new Error(`Spreadsheet ID not found in script properties for key: ${sheetIdProp}`);
    }
    return this.smartOpenSs(sheetId);
  }

  static smartOpenSs(sheetId: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId() === sheetId) {
      return active;
    }
    return SpreadsheetApp.openById(sheetId);
  }

  static buildSheetDictionary(ss: GoogleAppsScript.Spreadsheet.Spreadsheet):
    Map<number, GoogleAppsScript.Spreadsheet.Sheet> {
    return new Map(ss.getSheets().map(sheet => [sheet.getSheetId(), sheet]));
  }
}
export class SheetUtils {
  static getLocalSpreadsheet(
    sheetIdProperty: string,
  ): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const sheetId =
      PropertiesService.getScriptProperties().getProperty(sheetIdProperty);
    if (!sheetId) {
      throw new Error(
        `Sheet ID for ${sheetIdProperty} not found in script properties.`,
      );
    }
    return this.smartOpenById(sheetId);
  }

  private static smartOpenById(
    sheetId: string,
  ): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId() === sheetId) {
      return active;
    }
    return SpreadsheetApp.openById(sheetId);
  }

  static buildSheetsDictionary(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  ): Map<number, GoogleAppsScript.Spreadsheet.Sheet> {
    return new Map(ss.getSheets().map((sheet) => [sheet.getSheetId(), sheet]));
  }
}

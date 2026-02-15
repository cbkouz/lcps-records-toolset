export class SheetUtils {
  public static buildSheetDictionary(ss: GoogleAppsScript.Spreadsheet.Spreadsheet):
    Map<number, GoogleAppsScript.Spreadsheet.Sheet> {
    return new Map(ss.getSheets().map(sheet => [sheet.getSheetId(), sheet]));
  }
}
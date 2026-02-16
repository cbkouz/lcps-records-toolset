export class ProvisionSemesterControllers {
  private static ss: GoogleAppsScript.Spreadsheet.Spreadsheet;

  public static deleteReportSheets(): void {
    const sheets = this.ss.getSheets();
  const tabsToKeep = Object.values(CONFIG.CORE_TABS) as readonly string[];

  let deletedSheetCounter = 0;
  sheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    if (!tabsToKeep.includes(sheetName)) {
      this.ss.deleteSheet(sheet);
      deletedSheetCounter++;
    }
  });
  console.log(`Deleted ${deletedSheetCounter} report sheets.`);
}
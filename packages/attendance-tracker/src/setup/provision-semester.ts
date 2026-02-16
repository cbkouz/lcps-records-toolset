import { DayInfo } from "../calendar-service";

export class SemesterProvisioningService {
  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet, private days: DayInfo[], private classConfig: any[][]) { }

  public run(): void {
    const firstSheet = this.createFirstClassSheet();
  }

  private createFirstClassSheet(): GoogleAppsScript.Spreadsheet.Sheet {

  }
}
  
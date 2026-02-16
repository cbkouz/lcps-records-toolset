import { SheetUtils } from "@shared/utilities/sheet-utils";
import { LOCAL_SHEET_ID_PROPERTY } from "../schema";
import { AttendanceCatalogRepository } from "../record-attendance/attendance-records-repo";
import { SemesterRepository } from "./semester-repository";
import { SemesterProvisioningService } from "./provision-semester";
import { CalendarService } from "./calendar-service";

export class ProvisionSemesterController {
  private static _ss: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;

  private static get ss() {
    if (!this._ss) {
      console.log("Fetching spreadsheet...");
      this._ss = SheetUtils.getLocalSs(LOCAL_SHEET_ID_PROPERTY);
    }
    return this._ss;
  };

  static setUpSemester(): void { 
    const remoteClassInfo = AttendanceCatalogRepository.getRemoteClassInfoForReportSheets();
    if (remoteClassInfo.length === 0) {
      console.warn("No class info found in attendance catalog. Semester provisioning aborted.");
      return;
    }

    const semesterConfig = new SemesterRepository(this.ss).getSemesterConfig();
    const semesterDaysInfo = new CalendarService(semesterConfig).generateSemesterDates();

    new SemesterProvisioningService(this.ss, semesterDaysInfo, remoteClassInfo).run();
  }
}
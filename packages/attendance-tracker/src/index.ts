import { dailyControllers } from "./controllers";
import { LOCAL_SHEET_ID_PROPERTY } from "./schema";
import { ProvisionSemesterController } from "./setup/provision-semester-controllers";
import { deleteReportSheets } from "./utilities";
import { SheetUtils} from "@shared/utilities/sheet-utils";


export function createReportSheets(): void {
  ProvisionSemesterController.setUpSemester();
}

export function deleteExtraSheets(): void {
  const ss = SheetUtils.getLocalSs(LOCAL_SHEET_ID_PROPERTY);
  deleteReportSheets(ss);
}

export function runDailyProcess(): void {
  dailyControllers.dailyProcess();
}

export { cleanAttendanceData } from "./clean-up";
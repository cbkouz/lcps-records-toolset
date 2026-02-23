import { SheetUtils } from "@shared/utilities/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { RefocusRepository } from "./refocus-repository";
import { RefocusAttendanceService } from "./refocus-attendance-service";
import { RefocusAttendanceRepository } from "./refocus-attendance";
import { REFOCUS_LAYOUT } from "@shared/layouts";

export class RefocusControllers {
  public runAttendance(): void {
    const ss = SheetUtils.getLocalSs(SHEET_ID_PROPERTY);
    const sheet = new RefocusRepository(ss).catalog.refocus;
    const service = new RefocusAttendanceService(new RefocusAttendanceRepository(sheet, REFOCUS_LAYOUT));
    const today = new Date();
    service.processRefocusAttendance(today);
  }
}
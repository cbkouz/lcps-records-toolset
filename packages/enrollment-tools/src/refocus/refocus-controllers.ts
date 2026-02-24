import { SheetUtils } from "@shared/utilities/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { RefocusSheetRepository } from "./refocus-sheet-repository";
import { RefocusAttendanceService } from "./refocus-attendance-service";
import { RefocusAttendanceRepository } from "./refocus-attendance";
import { REFOCUS_LAYOUT } from "@shared/layouts";
import { RefocusAutomationRepository } from "./refocus-automation-repo";
import { RefocusAutomationService } from "./refocus-automation-service";
import { SheetIndex } from "@shared/types";

export class RefocusControllers {
  private sheetsRepo: RefocusSheetRepository;

  constructor(isDemoMode: boolean = false) {
    const ss = SheetUtils.getLocalSs(SHEET_ID_PROPERTY);
    this.sheetsRepo = new RefocusSheetRepository(ss, isDemoMode);
  }

  public runAttendance(): void {
    const sheet = this.sheetsRepo.catalog.refocus;
    const service = new RefocusAttendanceService(new RefocusAttendanceRepository(sheet, REFOCUS_LAYOUT));
    const today = new Date();
    service.processRefocusAttendance(today);
  }

  public runAutomation(simDate?: Date): void {
    // gather sheets and initialize repo + service
    const catalog = this.sheetsRepo.catalog;
    const repo = new RefocusAutomationRepository(catalog.refocus, catalog.msArchive, catalog.hsArchive);
    const service = new RefocusAutomationService();
    const today = simDate ? simDate : new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to avoid timezone issues

    const sections = repo.getRefocusSections();

    // process ms section first
    const processedMsSection = service.processRefocusSection(sections.msData, today);
    const msSectionStart = sections.dividerRowIndex + 1 as SheetIndex;
    repo.rewriteRefocusSection(processedMsSection.sectionData, msSectionStart);
    this.sheetsRepo.appendToArchive("msArchive", processedMsSection.archiveData);

    // then hs section
    const processedHsSection = service.processRefocusSection(sections.hsData, today);
    const hsSectionStart = 2 as SheetIndex; // HS section starts at row 2 (row 1 is header)
    const hsSectionEnd = sections.dividerRowIndex - 1 as SheetIndex;
    repo.rewriteRefocusSection(processedHsSection.sectionData, hsSectionStart, hsSectionEnd);
    this.sheetsRepo.appendToArchive("hsArchive", processedHsSection.archiveData);
  }
}
import { SheetUtils } from "@shared/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { RefocusCatalogService } from "./refocus-catalog-service";
import { SecondaryRefocusRepository } from "./secondary-refocus-repo";
import { setMidnight } from "@shared/data-utils";
import { REFOCUS_LAYOUT } from "@shared/layouts";
import { RefocusStudent, SortedStudents, StudentStatus } from "./types";

export class RefocusLifecycleService {
  private static get ss() {
    return SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
  }

  static run(): void {
    const today = setMidnight(new Date());
    const catalog = new RefocusCatalogService(this.ss)
    const sheets = catalog.run().secondary;

    const repo = new SecondaryRefocusRepository(sheets.msHsRefocus, REFOCUS_LAYOUT, today.getFullYear());
    const { ms, hs } = repo.getRefocusData();

    this.processSubsection(ms, sheets.msArchive, today);
    this.processSubsection(hs, sheets.hsArchive, today);
  }

  static processSubsection(data: RefocusStudent[], archiveSheet: GoogleAppsScript.Spreadsheet.Sheet, date: Date): void {
    const { pending, active, archive } = this.sortStudents(data, date);
    if (archive.length > 0) {
      this.repo.
    }
  }

  static sortStudents(students: RefocusStudent[], date: Date): SortedStudents {
    const groups: SortedStudents = {
      pending: [],
      active: [],
      archive: [],
    };

    for (const student of students) {
      if (student.endDate < date) {
        groups.archive.push(student)
      } else if (student.startDate > date) {
        groups.pending.push(student)
      } else {
        groups.active.push(student)
      }
    };

    return groups;
  }
}

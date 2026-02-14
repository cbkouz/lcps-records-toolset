import { SheetUtils } from "@shared/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { MODULES } from "@shared/shared-config";
import { MetadataUtils } from "@shared/metadata-utils";
import { REFOCUS_LAYOUT, RefocusLayout } from "@shared/layouts";
import { SecondaryRefocusRepository } from "../repositories/secondary-refocus-repo";
import { setMidnight } from "@shared/data-utils";
import { RefocusStudent, SortedStudents } from "../types";

export class RefocusLifecycleService {
  private static get ss() {
    return SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
  }

  static run(): void {
    const today = setMidnight(new Date());
    const module = MODULES.REFOCUS.key;
    const sheets = MetadataUtils.getSheetsWithLayouts(this.ss, module).filter(
      (item) => item.layout === REFOCUS_LAYOUT,
    );

    const repo = new SecondaryRefocusRepository(
      sheets[0].sheet,
      sheets[0].layout as RefocusLayout,
      today.getFullYear(),
    );
    const { ms, hs } = repo.getRefocusData();

    this.processSubsection(ms, today);
    this.processSubsection(hs, today);
  }

  static processSubsection(data: RefocusStudent[], date: Date): void {
    const sortedStudents = this.sortStudents;
  }

  static sortStudents(data: RefocusStudent[], date: Date): SortedStudents {
    const students = {
      pending: [],
      active: [],
      archive: [],
    } as SortedStudents;

    data.forEach(student => {
      if {}
    })
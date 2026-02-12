import {
  BaseStudentRepository,
  StudentRowPair,
} from "@shared/repositories/base-student";
import { SecondaryRefocusStudent } from "./types";
import { layoutRegistry } from "@shared/config/class-layouts";
import { ArrayIndex } from "@shared/config/types";

const msHsDivider = { text: "LCMS Student", col: 2 } as const;

class SecondaryRefocusRepository extends BaseStudentRepository<SecondaryRefocusStudent> {
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    super(sheet, layoutRegistry.refocus);
  }

  public getHsStudents(): SecondaryRefocusStudent[] {
    const { dividerRowIndex, data } = this.readRefocusSheet();
    const hsSection = data.slice(1, dividerRowIndex); // skip header row
    return this.getStudents(hsSection);
  }

  public getMsStudents(): SecondaryRefocusStudent[] {
    const { dividerRowIndex, data } = this.readRefocusSheet();
    const msSection = data.slice(dividerRowIndex + 1); // start after the divider
    return this.getStudents(msSection);
  }

  private readRefocusSheet(): { dividerRowIndex: ArrayIndex; data: any[][] } {
    const data = this.sheet.getDataRange().getValues();
    const dividerRowIndex = data.findIndex(
      (row) =>
        String(row[msHsDivider.col]).toLowerCase() ===
        msHsDivider.text.toLowerCase(),
    ) as ArrayIndex;
    return { dividerRowIndex, data };
  }
}

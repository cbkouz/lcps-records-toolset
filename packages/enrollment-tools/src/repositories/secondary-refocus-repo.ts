import { ArrayIndex } from "@shared/types";

interface RefocusRecord {
  dataRow: any[];
  notesRow: any[];
}

interface RefocusStudent {
  id: string;
  name: string;
  gradeLevel: string;
  enrollmentDate: string;
  startDate: Date;
  endDate: Date;
  supportNeeded?: string;
  datesAttended?: string[];
  rows: RefocusRecord;
}

export interface RefocusSections {
  ms: RefocusStudent[];
  hs: RefocusStudent[];
}

const HS_MS_DIVIDER = { text: "LCMS Student", column: 1 as ArrayIndex };

export class SecondaryRefocusRepository {
  private hsMsDividerRowIndex?: ArrayIndex;
  constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet) {}

  public getRefocusData(): RefocusSections {
    const data = this.sheet.getDataRange().getValues();
    const dividerIndex = this.findDividerRow(
      data,
      HS_MS_DIVIDER.text,
      HS_MS_DIVIDER.column,
    );
    if (dividerIndex === -1) {
      throw new Error(
        `Divider row with text "${HS_MS_DIVIDER.text}" not found in column ${HS_MS_DIVIDER.column}`,
      );
    }

    this.hsMsDividerRowIndex = dividerIndex;

    const msData = data.slice(dividerIndex + 1);
    const hsData = data.slice(1, dividerIndex); // Assume header in row 1

    const sections = {
      ms: this.createRefocusStudents(msData),
      hs: this.createRefocusStudents(hsData),
    };

    return sections;
  }

  private createRefocusStudents(data: any[][]): RefocusStudent[] {
    const records = this.createRowPairs(data);
    return [];
  }

  private createRowPairs(data: any[][]): RefocusRecord[] {
    return [];
  }

  private findDividerRow(
    data: any[][],
    text: string,
    column: ArrayIndex,
  ): ArrayIndex {
    return data.findIndex(
      (row) => String(row[column]).toLowerCase() === text.toLowerCase(),
    ) as ArrayIndex;
  }
}

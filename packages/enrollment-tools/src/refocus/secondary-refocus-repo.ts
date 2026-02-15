import { isStudentRow, setMidnight } from "@shared/data-utils";
import { RefocusLayout } from "@shared/layouts";
import { ArrayIndex } from "@shared/types";
import { RefocusSections, RefocusStudent, RefocusRecord } from "./types";

// Divider text in col B
const HS_MS_DIVIDER = { text: "LCMS Student", column: 1 as ArrayIndex };
const PENDING_DIVIDER = { text: "pending", column: 0 as ArrayIndex };

export class SecondaryRefocusRepository {
  private hsMsDividerRowIndex?: ArrayIndex;

  constructor(
    private sheet: GoogleAppsScript.Spreadsheet.Sheet,
    private layout: RefocusLayout,
    private year: number,
  ) {}

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

    return {
      ms: this.createRefocusStudents(msData),
      hs: this.createRefocusStudents(hsData),
    };
  }

  private createRefocusStudents(data: any[][]): RefocusStudent[] {
    const records = this.createRowPairs(data);
    return records.map((record) => {
      const student = {
        rows: record,
      } as RefocusStudent;

      (Object.keys(this.layout) as Array<keyof RefocusLayout>).forEach(
        (key) => {
          const colIndex = this.layout[key];
          (student as any)[key] = record.dataRow[colIndex];
        },
      );

      const dates = this.parseEnrollmentDates(student.enrollmentDate);
      if (dates === null) {
        throw new Error(
          `Invalid enrollment date format for student "${student.name}" (ID: ${student.id}). Expected format: "MM/DD - MM/DD". Found: "${student.enrollmentDate}"`,
        );
      }

      student.startDate = dates.start;
      student.endDate = dates.end;
      return student;
    });
  }

  private createRowPairs(data: any[][]): RefocusRecord[] {
    const rows = data.filter(
      (row) =>
        String(row[PENDING_DIVIDER.column]).toLowerCase() !==
        PENDING_DIVIDER.text,
    );
    const records: RefocusRecord[] = [];
    for (let i = 0; i < rows.length; i += 2) {
      const dataRow = rows[i];
      const notesRow = rows[i + 1];

      if (!isStudentRow(dataRow, this.layout.id)) {
        throw new Error(
          `Data Corruption: Expected a Student Row at index ${i}, but found a support/blank row. ID: ${dataRow[0]}`,
        );
      }

      if (!notesRow || isStudentRow(notesRow, this.layout.id)) {
        throw new Error(
          `Data Corruption: Student "${dataRow[this.layout.name]}" (Index ${i}) is missing their support row. Found: ${notesRow ? "Another Student" : "End of Data"}`,
        );
      }

      records.push({ dataRow, notesRow });
    }
    return records;
  }

  private parseEnrollmentDates(
    dateRange: string,
  ): { start: Date; end: Date } | null {
    const parts = dateRange.split("-");
    if (parts.length !== 2) return null;
    const dates = parts.map((part) => {
      const date = setMidnight(new Date(`${part.trim()}/${this.year}`));
      if (date.getMonth() < 7) date.setFullYear(this.year + 1);
      return date;
    });

    if (isNaN(dates[0].getTime()) || isNaN(dates[1].getTime())) {
      return null;
    }
    return { start: dates[0], end: dates[1] };
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

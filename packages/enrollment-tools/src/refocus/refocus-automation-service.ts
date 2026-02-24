import { REFOCUS_LAYOUT } from "@shared/layouts";
import { ProcessedSection } from "./refocus-types";
import { isStudentRow } from "@shared/utilities/data-utils";
import { COLORS } from "@shared/settings";

interface Groups {
  active: any[][];
  pending: any[][];
  archive: any[][];
}

interface Backgrounds {
  active: string[][];
  pending: string[][];
}

export class RefocusAutomationService {
  private layout = REFOCUS_LAYOUT;
  
  public processRefocusSection(sectionData: any[][], date: Date): ProcessedSection {
    const pendingDividerText = "PENDING";
    const pendingDividerBackground = "#ff0000";
    const anchorYear = date.getMonth() < 7 ? date.getFullYear() - 1 : date.getFullYear();
    const stripes = {
      white: COLORS.DEFAULT,
      gray: "#b7b7b7",
    }

    const studentRows = sectionData.filter(row =>
      !String(row[0]).trim().toUpperCase().includes(pendingDividerText)
    );

    const groups: Groups = {
      active: [],
      pending: [],
      archive: [],
    };

    const backgrounds: Backgrounds = {
      active: [],
      pending: [],
    };

    const gridWidth = sectionData[0].length;
    const whiteBgRow = Array(gridWidth).fill(stripes.white);
    const grayBgRow = Array(gridWidth).fill(stripes.gray);

    for (let i = 0; i < studentRows.length; i += 2) { // Student data is in paired rows
      const dataRow = studentRows[i];
      const notesRow = studentRows[i + 1];
      if (!notesRow) {
        throw new Error(`Expected paired notes row for student data at index ${i}`);
      }

      if (!isStudentRow(dataRow[this.layout.id])) {
        continue; // Skip non-student rows
      }

      const dates = this.parseEnrollmentDates(
        String(dataRow[this.layout.enrollmentDate] || ""),
        anchorYear
      );

      if (!dates || !(dates.start instanceof Date) || !(dates.end instanceof Date)) {
        groups.pending.push(dataRow, notesRow);
        backgrounds.pending.push(whiteBgRow, grayBgRow);
      } else if (dates.end < date) {
        const archiveRow = this.transformForArchive(dataRow);
        groups.archive.push(archiveRow);
      } else if (dates.start > date) {
        groups.pending.push(dataRow, notesRow);
        backgrounds.pending.push(whiteBgRow, grayBgRow);
      } else {
        groups.active.push(dataRow, notesRow);
        backgrounds.active.push(whiteBgRow, grayBgRow);
      }
    }
    const dividerRow = Array(gridWidth).fill("");
    dividerRow[0] = pendingDividerText;
    const blankDataRow = Array(gridWidth).fill("");
    const blankNotesRow = Array(gridWidth).fill("");

    const blankStudentsToAdd = 4; // Add 4 pairs of blank rows

    for (let i = 0; i < blankStudentsToAdd; i++) {
      groups.active.push(blankDataRow, blankNotesRow);
      backgrounds.active.push(whiteBgRow, grayBgRow);
      groups.pending.push(blankDataRow, blankNotesRow);
      backgrounds.pending.push(whiteBgRow, grayBgRow);
    }

    const dataToWrite = [...groups.active, dividerRow, ...groups.pending];
    const backgroundsToWrite = [...backgrounds.active, Array(gridWidth).fill(pendingDividerBackground), ...backgrounds.pending];

    return {
      sectionData: { data: dataToWrite, backgrounds: backgroundsToWrite },
      archiveData: groups.archive,
    };
  }

  private parseEnrollmentDates(dateRange: string, year: number): { start: Date; end: Date } | null {
    const parts = dateRange.split("-");
    if (parts.length !== 2) return null;
    const dates = parts.map((part) => {
      const date = new Date(`${part.trim()}/${year}`);

      if (date.getMonth() < 7) date.setFullYear(year + 1);
      date.setHours(0, 0, 0, 0); // Normalize time to avoid timezone issues
      return date;
    });

    if (isNaN(dates[0].getTime()) || isNaN(dates[1].getTime())) {
      return null;
    }
    return { start: dates[0], end: dates[1] };
  }

  private transformForArchive(dataRow: any[]): any[] {
    const rawDatesString = String(dataRow[REFOCUS_LAYOUT.datesAttended] || "");
    let attendanceCount = 0;

    try {
      // Only try to parse if there's actually something there
      if (rawDatesString.trim()) {
        const parsedArray = JSON.parse(rawDatesString);
        
        // Ensure it's actually an array before asking for .length
        if (Array.isArray(parsedArray)) {
          attendanceCount = parsedArray.length;
        }
      }
    } catch (error) {
      // If the JSON is corrupted or someone manually typed "5", 
      // it falls back here safely instead of crashing the script.
      // We can try to salvage a number, or just default to 0.
      attendanceCount = parseInt(rawDatesString, 10) || 0;
    }

    return [
      dataRow[this.layout.id],             // Col A
      dataRow[this.layout.name],           // Col B
      dataRow[this.layout.gradeLevel],     // Col C
      dataRow[this.layout.enrollmentDate], // Col F
      dataRow[this.layout.supportNeeded],  // Col G      
      attendanceCount                      // Col P 
    ];
  }
}
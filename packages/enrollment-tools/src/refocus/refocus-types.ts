import { SheetIndex } from "@shared/types";

export type RefocusCatalog = Record<"refocus" | "msArchive" | "hsArchive", GoogleAppsScript.Spreadsheet.Sheet>;

export interface RefocusAttendanceStudent {
  datesAttended: string[];
}

export interface RefocusSections {
  msData: any[][];
  hsData: any[][];
  dividerRowIndex: SheetIndex;
};

export interface SectionPayload {
  data: any[][];
  backgrounds: string[][];
}

export interface ProcessedSection {
  sectionData: SectionPayload;
  archiveData: any[][];
}
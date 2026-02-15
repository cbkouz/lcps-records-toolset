export interface RefocusRecord {
  dataRow: any[];
  notesRow: any[];
}

interface BaseRefocus {
  id: string;
  name: string;
  gradeLevel: string;
  enrollmentDate: string;
  supportNeeded?: string;
}

export interface RefocusStudent extends BaseRefocus {
  startDate: Date;
  endDate: Date;
  datesAttended?: string[];
  rows: RefocusRecord;
}

export interface RefocusSections {
  ms: RefocusStudent[];
  hs: RefocusStudent[];
}

export type StudentStatus = "pending" | "active" | "archive";
export type SortedStudents = Record<StudentStatus, RefocusStudent[]>;

export interface ArchiveStudent extends BaseRefocus {
  datesAttended: number;
}

export const REFOCUS_ROLES = [
  "msHsRefocus",
  "msArchive",
  "hsArchive",
] as const;

export type RefocusRole = (typeof REFOCUS_ROLES)[number];

export type SecondarySheets = Record<RefocusRole, GoogleAppsScript.Spreadsheet.Sheet>;

export interface RefocusSheets {
  secondary: SecondarySheets;
}


export interface RefocusRecord {
  dataRow: any[];
  notesRow: any[];
}

interface BaseRefocus {
  id: string;
  name: string;
  gradeLevel: string;
  supportNeeded?: string;
  enrollmentDate: string;
}

export interface RefocusStudent extends BaseRefocus {
  startDate: Date;
  endDate: Date;
  datesAttended?: string[];
  rows: RefocusRecord;
}

export interface ArchiveStudent extends BaseRefocus {
  datesAttended: number;
}

export interface RefocusSections {
  ms: RefocusStudent[];
  hs: RefocusStudent[];
}

export interface SortedStudents {
  pending: RefocusStudent[];
  active: RefocusStudent[];
  archive: ArchiveStudent[];
}

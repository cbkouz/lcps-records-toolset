import { SheetIndex } from "./config-types";

interface BaseStudent {
  id: string;
  name: string;
}

export interface AttendanceStudent extends BaseStudent {
  /** The 1-based row index in the spreadsheet */
  row: SheetIndex;
  /** The hex color code of the student's name cell */
  statusColor: string;
}

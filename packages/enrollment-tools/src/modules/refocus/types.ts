import { BaseStudent } from "@shared/config/types";

export interface SecondaryRefocusStudent extends BaseStudent {
  grade: string;
  enrollmentDates: string;
  supportNeeded?: string;
  datesAttended: string;
}

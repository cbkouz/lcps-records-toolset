import { SheetIndex } from "@shared/types";

export interface GridContext {
  id: string;
  rowIndex: SheetIndex;
  statusColor: string;
}

export type LocatedStudent<T> = T & GridContext;
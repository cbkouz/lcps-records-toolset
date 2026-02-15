import { CORE_COLUMNS, MODULES } from "@shared/schema";
import { ArrayIndex, SheetConfig, SheetMetadata } from "@shared/types";

export class ConfigRepository {
  constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet) {}

  /**
   * Reads the sheet, identifies column positions based on headers,
   * and maps rows to the SheetMetadata interface.
   */
  public getAllConfigs(): SheetConfig[] {
    const [, headerRow, ...configData] = this.sheet.getDataRange().getValues(); // Assumes header is in the second row (index 1)
     const headerMap = headerRow.reduce((map: Map<string, ArrayIndex>, colName, index) => {
      if (typeof colName === "string" && colName.trim() !== "") {
        map.set(colName.trim(), index as ArrayIndex);
      }
      return map;
    }, new Map<string, ArrayIndex>());

    const allColumns = [...Object.values(CORE_COLUMNS), ...Object.values(MODULES)];
    const configs = [];
    const tabIdCol = headerMap.get(CORE_COLUMNS.TAB_ID.header) as ArrayIndex | undefined;
    if (tabIdCol === undefined) {
      throw new Error(`Tab ID column "${CORE_COLUMNS.TAB_ID.header}" not found in header.`);
    }

    for (const row of configData) {
      const tabId = Number(row[tabIdCol]);
      if (!tabId) continue;
      const meta: Partial<SheetMetadata> = {};

      allColumns.forEach(colDef => {
        if (colDef.key) {
          const colIndex = headerMap.get(colDef.header) as ArrayIndex | undefined;
          if (colIndex !== undefined) {
            meta[colDef.key] = row[colIndex];
          }
        }
      });
      configs.push({ tabId, meta });
    }
    return configs;
  }
}

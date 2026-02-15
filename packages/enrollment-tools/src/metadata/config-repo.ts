import { CORE_COLUMNS, MODULES } from "@shared/schema";
import { ArrayIndex, SheetConfig, SheetMetadata } from "@shared/types";

export class ConfigRepository {
  constructor(private sheet: GoogleAppsScript.Spreadsheet.Sheet) { }

  /**
   * Reads the sheet, identifies column positions based on headers,
   * and maps rows to the SheetMetadata interface.
   */
  public getAllConfigs(): SheetConfig[] {
    const configData = this.sheet.getDataRange().getValues();
    const tabIdHeader = CORE_COLUMNS.TAB_ID.header;
    const headerRowIndex = configData.findIndex(row =>
      row[0] === tabIdHeader
    );
    if (headerRowIndex === -1) {
      throw new Error(`Header row with "${CORE_COLUMNS.TAB_ID.header}" not found.`);
    }
    const headerRow = configData[headerRowIndex];
    const headerMap = headerRow.reduce((map: Map<string, ArrayIndex>, colName, index) => {
      if (typeof colName === "string" && colName.trim() !== "") {
        map.set(colName.trim(), index as ArrayIndex);
      }
      return map;
    }, new Map<string, ArrayIndex>());

    const allColumns = [...Object.values(CORE_COLUMNS), ...Object.values(MODULES)];
    const configs = [];
    const tabIdCol = headerMap.get(tabIdHeader);
    if (!tabIdCol) {
      throw new Error(`Tab ID column "${tabIdHeader}" not found in header.`);
    }

    for (const row of configData.slice(headerRowIndex + 1)) {
      const tabId = Number(row[tabIdCol]);
      if (!tabId) continue;
      const meta: Partial<SheetMetadata> = {};

      allColumns.forEach(colDef => {
        if (colDef.key) {
          const colIndex = headerMap.get(colDef.header);
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


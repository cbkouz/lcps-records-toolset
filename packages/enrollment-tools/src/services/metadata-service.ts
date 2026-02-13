import { CONFIG_SHEET_NAME, CORE_COLUMNS, ALL_COLUMNS } from "@shared/shared-config";
import { SheetUtils } from "@shared/sheet-utils";
import { SheetMetadata } from "@shared/types";
import { SHEET_ID_PROPERTY } from "../config";

export class MetadataConfigService {
  private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private readonly METADATA_VISIBILITY =
    SpreadsheetApp.DeveloperMetadataVisibility.DOCUMENT;

  constructor(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SheetUtils.getLocalSpreadsheet(
      SHEET_ID_PROPERTY,
    ),
  ) {
    this.ss = ss;
  }

  public syncMetadataConfig(): void {
    const configSheet = this.ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!configSheet) {
      throw new Error(`Config sheet "${CONFIG_SHEET_NAME}" not found.`);
    }

    const configRegistry = this.createConfigRegistry(configSheet);

    const sheetsIdMap = SheetUtils.buildSheetsDictionary(this.ss);

    this.validateTargetSheets(configRegistry, sheetsIdMap);

    configRegistry.forEach((metadata, sheetId) => {
      const sheet = sheetsIdMap.get(sheetId);
      this.syncSheetMetadata(sheet!, metadata);
    });
  }

  private createConfigRegistry(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
  ): Map<number, SheetMetadata> {
    const data = sheet.getDataRange().getValues();
    const [, header, ...rows] = data; // Header is in row 2
    const headerMap = header.reduce(
      (map: Map<string, number>, colName, index) => {
        if (typeof colName === "string" && colName.trim() !== "") {
          map.set(colName.trim(), index);
        }
        return map;
      },
      new Map<string, number>(),
    );

    const configRegistry = new Map<number, SheetMetadata>();
    for (const row of rows) {
      const tabIdCol = headerMap.get(CORE_COLUMNS.TAB_ID.header);
      if (tabIdCol === undefined || !row[tabIdCol]) {
        continue; // Skip rows without TabId
      }
      const tabId = Number(row[tabIdCol]);
      const meta: Partial<SheetMetadata> = {};

      Object.values(ALL_COLUMNS).forEach((colDef) => {
        if (colDef.key) {
          const colIndex = headerMap.get(colDef.header);
          if (colIndex !== undefined) {
            meta[colDef.key] = row[colIndex] as any;
          }
        }
      });
      configRegistry.set(tabId, meta as SheetMetadata);
    }
    return configRegistry;
  }

  private validateTargetSheets(
    configRegistry: Map<number, SheetMetadata>,
    sheetLookup: Map<number, GoogleAppsScript.Spreadsheet.Sheet>,
  ): void {
    configRegistry.forEach((_, sheetId) => {
      if (!sheetLookup.has(sheetId)) {
        throw new Error(`Sheet with ID ${sheetId} not found in spreadsheet.`);
      }
    });
  }

  private syncSheetMetadata(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    metadata: SheetMetadata,
  ): void {
    const liveMetadata = this.mapLiveMetadata(sheet);
    Object.entries(metadata).forEach(([key, value]) => {
      const existingMeta = liveMetadata[key];
      const isEmpty = value === null || value === undefined || value === "";
      const desiredStr = isEmpty ? null : String(value);
      if (existingMeta) {
        const currentStr = String(existingMeta.getValue());
        if (desiredStr === null) {
          existingMeta.remove();
        } else if (currentStr !== desiredStr) {
          existingMeta.setValue(desiredStr);
        }
      } else {
        if (desiredStr !== null) {
          sheet.addDeveloperMetadata(key, desiredStr, this.METADATA_VISIBILITY);
        }
      }
    });
  }

  private mapLiveMetadata(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
  ): Record<string, any> {
    const meta = sheet.getDeveloperMetadata();
    return meta.reduce(
      (map, item) => {
        map[String(item.getKey())] = item;
        return map;
      },
      {} as Record<string, any>,
    );
  }
}

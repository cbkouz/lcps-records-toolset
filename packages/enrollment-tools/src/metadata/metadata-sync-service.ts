import { SheetUtils } from "@shared/utilities/sheet-utils";
import { ConfigRepository } from "./config-repo";
import { MetadataManager } from "./metadata-manager";

export class MetadataSyncService {
  constructor(
    private readonly repo: ConfigRepository,
    private ss: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {}

  public syncAll(): void {
    const configs = this.repo.getAllConfigs();
    const sheetLookup = SheetUtils.buildSheetDictionary(this.ss);
    
    // check if sheets exist
    configs.forEach(config => {
      if (!sheetLookup.has(config.tabId)) {
        throw new Error(`Sheet with ID ${config.tabId} not found in spreadsheet.`);
      }
    });

    configs.forEach(config => {
      const sheet = sheetLookup.get(config.tabId);
      if (sheet) {
        MetadataManager.syncSheetMetadata(sheet, config.meta);
      }
    });
  }
}
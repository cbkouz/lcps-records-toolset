import { SheetUtils } from "@shared/utilities/sheet-utils";
import { CONFIG_TAB_NAME, SHEET_ID_PROPERTY } from "../config";
import { ConfigRepository } from "./config-repo";
import { MetadataSyncService } from "./metadata-sync-service";

export function syncConfigMetadata(): void {
  const ss = SheetUtils.getLocalSs(SHEET_ID_PROPERTY);
  if (!ss) {
    throw new Error("Spreadsheet not found.");
  };
  const configTab = ss.getSheetByName(CONFIG_TAB_NAME);
  if (!configTab) {
    throw new Error(`Config sheet "${CONFIG_TAB_NAME}" not found.`);
  }

  try {
    ss.toast("Syncing metadata...");
    const repo = new ConfigRepository(configTab);
    const service = new MetadataSyncService(repo, ss);

    service.syncAll();
    ss.toast("Metadata sync complete.");
  } catch (error) {
    console.error("Error syncing metadata:", error);
    ss.toast("Error syncing metadata. Check console for details.");
  }
}


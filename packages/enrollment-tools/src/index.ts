// import { SheetUtils } from "@shared/utilities/sheet-utils";
// import { SHEET_ID_PROPERTY } from "./config";
// import { MetadataConfigService } from "./modules/metadata-service";
// import { ClearAttendanceService } from "./modules/clear-attendance";
// import { buildCatalogForModule } from "@shared/utilities/data-utils";
// import { MODULES } from "@shared/config/shared-config";
// import { MetadataUtils } from "@shared/utilities/metadata-utils";
// import { BackupService } from "./modules/backup-service";

// // ----------------------------------------------------------------
// // 1. STANDARD TRIGGERS & MENUS
// // ----------------------------------------------------------------
// export function onOpen() {
//   const ui = SpreadsheetApp.getUi();
//   const adminMenu = ui
//     .createMenu("🛠️ Admin Tools")
//     .addItem("Update Sheet Metadata", "runMetadataSync")
//     .addItem("Inspect Active Sheet Metadata", "runInspectMetadata");

//   ui.createMenu("🎓 Attendance Tools")
//     .addItem("Clear All School Attendance", "handleClearAllAttendance")
//     .addItem("Clear Active Sheet Attendance", "handleClearCurrentAttendance")
//     .addSeparator()
//     .addSubMenu(adminMenu)
//     .addToUi();
// }

// // ----------------------------------------------------------------
// // 2. MENU ACTIONS (User-Initiated)
// // ----------------------------------------------------------------

// /**
//  * Handler for clearing attendance on all sheets in the CLEAR_ATTENDANCE module.
//  */
// export function handleClearAllAttendance() {
//   const ss = SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
//   const ui = SpreadsheetApp.getUi();
//   const catalog = buildCatalogForModule(ss, MODULES.CLEAR_ATTENDANCE.key);
//   const response = ui.alert(
//     "Confirm Clear All Attendance",
//     `This will clear attendance on ${catalog.default.length + catalog.other.length} sheets. Do you want to proceed?`,
//     ui.ButtonSet.YES_NO,
//   );
//   if (response === ui.Button.YES) {
//     const service = new ClearAttendanceService(ss);
//     service.clearAllAttendanceSheets(catalog);
//     ss.toast("Attendance cleared on all sheets.");
//   } else {
//     ui.alert("Action cancelled. No changes made.");
//   }
// }

// /**
//  * Handler for clearing attendance on the active sheet. Validates that the active sheet is tagged for attendance before proceeding.
//  * Provides user feedback via toasts and alerts for success or error states.
//  */
// export function handleClearCurrentAttendance() {
//   const ss = SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
//   try {
//     ss.toast("Clearing attendance for active sheet...");
//     const service = new ClearAttendanceService(ss);
//     service.clearCurrentSheetAttendance();
//     ss.toast("Attendance cleared for active sheet.");
//   } catch (error: any) {
//     ss.toast(`Error clearing attendance: ${error.message || error}`);
//   }
// }

// /**
//  * Wrapper function for the "Update Sheet Metadata" menu item.
//  * Synchronizes metadata using the MetadataConfigService.
//  */
// export function runMetadataSync() {
//   const ss = SheetUtils.getLocalSpreadsheet(SHEET_ID_PROPERTY);
//   const service = new MetadataConfigService(ss);
//   try {
//     ss.toast("Updating metadata...");
//     service.syncMetadataConfig();
//     ss.toast("Metadata update complete.");
//   } catch (error: any) {
//     ss.toast(`Error updating metadata: ${error.message || error}`);
//   }
// }

// /**
//  * Wrapper function for the "Inspect Active Sheet Metadata" menu item.
//  * Uses MetadataUtils to display metadata of the active sheet.
//  */
// export function runInspectMetadata() {
//   try {
//     MetadataUtils.inspectActiveSheetMetadata();
//   } catch (error: any) {
//     SpreadsheetApp.getUi().alert(
//       `Error inspecting metadata: ${error.message || error}`,
//     );
//   }
// }

// // ----------------------------------------------------------------
// // 3. AUTOMATION TRIGGERS (Time-Based)
// // ----------------------------------------------------------------

// /**
//  * Time-based trigger for nightly backups. Creates a backup snapshot and purges old backups.
//  */
// export function triggerNightlyBackup() {
//   try {
//     const service = new BackupService();
//     service.createBackupSnapshot();
//     service.purgeOldBackups();
//   } catch (error: any) {
//     console.error(`Error during nightly backup: ${error.message || error}`);
//   }
// }

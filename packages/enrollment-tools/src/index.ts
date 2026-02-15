// ----------------------------------------------------------------
// 1. STANDARD TRIGGERS & MENUS
// ----------------------------------------------------------------
export function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const adminMenu = ui
    .createMenu("🛠️ Admin Tools")
    .addItem("Update Sheet Metadata", "syncConfigMetadata")
    .addItem("Inspect Active Sheet Metadata", "inspectActiveSheetMetadata");

  ui.createMenu("🎓 Attendance Tools")
//     .addItem("Clear All School Attendance", "handleClearAllAttendance")
//     .addItem("Clear Active Sheet Attendance", "handleClearCurrentAttendance")
    .addSeparator()
    .addSubMenu(adminMenu)
    .addToUi();
}

// // ----------------------------------------------------------------
// // 2. MENU ACTIONS (User-Initiated)
// // ---------------------------------------------------------------
export { syncConfigMetadata } from "./metadata/metadata-controllers";
export { inspectActiveSheetMetadata } from "@shared/utilities/debug";


// // ----------------------------------------------------------------
// // 3. TRIGGER FUNCTIONS (Time-Driven or Event-Driven)
// // ----------------------------------------------------------------

// // ----------------------------------------------------------------
// // 4. Custom Functions
// // ----------------------------------------------------------------
export { getSheetNameByGID_ } from './customFunctions';
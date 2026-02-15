/**
 * Retrieves the name of a sheet by its GID (Sheet ID).
 * @customfunction <--- This tag is vital. It tells Sheets to show autocomplete help.
 * @param {number | string} gid - The GID to look up.
 * @returns {string} The uppercase sheet name.
 */
export const getSheetNameByGID_ = (gid: number | string): string => {
  if (!gid) return "No GID provided";

  // Force input to number just in case the cell sends it as a string "123"
  const targetId = Number(gid);
  if (isNaN(targetId)) return "Invalid GID";

  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  
  // Use .find() - it's cleaner than a for-loop
  const foundSheet = sheets.find(sheet => sheet.getSheetId() === targetId);
  
  return foundSheet ? foundSheet.getName().toUpperCase() : `Sheet not found: ${gid}`;
};
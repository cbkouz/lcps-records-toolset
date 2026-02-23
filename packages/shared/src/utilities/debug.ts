import { MetadataUtils } from "./metadata-utils";

export function inspectActiveSheetMetadata() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();

  // 1. Get the data using your helper
  const metaMap = MetadataUtils.createMetadataMap(sheet);

  const entries = Object.entries(metaMap).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    ui.alert(`No metadata found on sheet: ${sheet.getName()}`);
    return;
  }

  // 2. Build the HTML string manually
  let html = `
      <style>
        body { font-family: sans-serif; padding: 10px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #eee; }
      </style>
      <h3>Metadata: ${sheet.getName()}</h3>
      <table>
        <tr><th>Key</th><th>Value</th></tr>`;

  // 3. Loop through metadata object to add rows
  entries.forEach(([key, value]) => {
    html += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
  });

  html += `</table>
      <br>
      <button onclick="google.script.host.close()">Close</button>
    `;

  // 4. Render
  const output = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(600);

  ui.showModalDialog(output, "Metadata Inspector");
}
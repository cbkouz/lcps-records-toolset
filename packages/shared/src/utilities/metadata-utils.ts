export class MetadataUtils {
  public static createMetadataMap(sheet: GoogleAppsScript.Spreadsheet.Sheet): Map<string, string> {
    const metadata = sheet.getDeveloperMetadata();
    return new Map(metadata.map(item => [item.getKey(), String(item.getValue())] as [string, string]));
  }
}
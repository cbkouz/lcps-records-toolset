import { formatDate } from "@shared/data-utils";
import { SheetUtils } from "@shared/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";

export class BackupService {
  private static readonly BACKUP_FOLDER_ID_PROPERTY_KEY = "backupFolderId";
  private static readonly RETENTION_COUNT = 7;
  private static readonly FILE_PREFIX = "Alt_Ed_Enrollment_Backup_";
  private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private readonly backupFolderId: string;

  constructor(
    ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SheetUtils.getLocalSpreadsheet(
      SHEET_ID_PROPERTY,
    ),
  ) {
    this.ss = ss;
    const backupFolderId =
      PropertiesService.getDocumentProperties().getProperty(
        BackupService.BACKUP_FOLDER_ID_PROPERTY_KEY,
      );
    if (!backupFolderId) {
      throw new Error("Backup folder ID is not set in document properties.");
    }
    this.backupFolderId = backupFolderId;
  }

  public createBackupSnapshot(): void {
    const timestamp = formatDate(new Date(), "yyyyMMdd_HHmmss");
    const fileName = `${BackupService.FILE_PREFIX}${timestamp}`;
    const backupFolder = DriveApp.getFolderById(this.backupFolderId);

    const file = DriveApp.getFileById(this.ss.getId()).makeCopy(
      fileName,
      backupFolder,
    );
    console.log(`Backup created: ${file.getName()}`);
  }

  public purgeOldBackups(): void {
    const files = DriveApp.getFolderById(this.backupFolderId).getFiles(); // Collect files in an array to sort by date
    const fileArray: GoogleAppsScript.Drive.File[] = [];
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().startsWith(BackupService.FILE_PREFIX)) {
        fileArray.push(file);
      }
    }

    fileArray.sort(
      (a, b) => b.getDateCreated().getTime() - a.getDateCreated().getTime(),
    );

    const filesToDelete = fileArray.slice(BackupService.RETENTION_COUNT);
    for (const file of filesToDelete) {
      console.log(`Deleting old backup: ${file.getName()}`);
      try {
        file.setTrashed(true);
      } catch (error) {
        console.error(`Failed to delete backup: ${file.getName()}`, error);
      }
    }
  }
}

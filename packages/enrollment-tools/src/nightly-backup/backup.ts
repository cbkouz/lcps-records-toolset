import { SheetUtils } from "@shared/utilities/sheet-utils";
import { SHEET_ID_PROPERTY } from "../config";
import { formatDate } from "@shared/utilities/data-utils";

export class BackupService {
  private static readonly RETENTION_COUNT = 7;
  private static readonly FILE_PREFIX = "Alt_Ed_Enrollment_Backup_";
  private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private readonly backupFolder: GoogleAppsScript.Drive.Folder;

  constructor(backupFolderId: string) {
    this.ss = SheetUtils.getLocalSs(SHEET_ID_PROPERTY);
    try {
      this.backupFolder = DriveApp.getFolderById(backupFolderId);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Backup folder not found. Please check the backup folder ID: ${backupFolderId}. Original error: ${message}`,
      );
    }
  }

  public executeBackup(): void {
    console.log("Starting backup process...");
    const backupSuccess = this.createBackupSnapshot();
    if (backupSuccess) {
      console.log("Backup snapshot created successfully.");
      this.purgeOldBackups();
    } else {
      console.warn(
        "Backup snapshot creation failed. Old backups have been preserved.",
      );
    }
  }

  private createBackupSnapshot(): boolean {
    const timestamp = formatDate(new Date(), "yyyyMMdd_HHmmss");
    const fileName = `${BackupService.FILE_PREFIX}${timestamp}`;
    try {
      const file = DriveApp.getFileById(this.ss.getId()).makeCopy(
        fileName,
        this.backupFolder,
      );
      console.log(`Backup created: ${file.getName()}`);
      return true; // Success!
    } catch (error: unknown) {
      console.error(
        `CRITICAL: Failed to create backup snapshot ${fileName}`,
        error,
      );
      return false; // Failed! Protect the old backups!
    }
  }

  private purgeOldBackups(): void {
    const files = this.backupFolder.getFiles();
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

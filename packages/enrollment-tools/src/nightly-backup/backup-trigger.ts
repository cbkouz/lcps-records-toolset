import { BACKUP_FOLDER_ID_PROPERTY } from "../config";
import { BackupService } from "./backup";

export function nightlyBackupTrigger(): void {
  const backupFolderId = PropertiesService.getScriptProperties().getProperty(
    BACKUP_FOLDER_ID_PROPERTY,
  );
  if (!backupFolderId) {
    console.error(
      `Backup folder ID not configured. Please set the backup folder ID in the script properties with the key: ${BACKUP_FOLDER_ID_PROPERTY}`,
    );
    return;
  }
  try {
    const backupService = new BackupService(backupFolderId);
    backupService.executeBackup();
  } catch (error: unknown) {
    console.error(
      "CRITICAL: Nightly backup process failed to execute.",
      error,
    );
  }
}
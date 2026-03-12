import { BACKUP_FOLDER_ID_PROPERTY } from "../config";
import { RefocusControllers } from "../refocus/refocus-controllers";
import { BackupService } from "./backup";

/**
 * The core logic. Note that this THROWS errors so the caller knows it failed.
 */
export function runBackupLogic(): void {
  const backupFolderId = PropertiesService.getScriptProperties().getProperty(BACKUP_FOLDER_ID_PROPERTY);
  
  if (!backupFolderId) {
    throw new Error(`Backup folder ID not configured (${BACKUP_FOLDER_ID_PROPERTY})`);
  }

  const backupService = new BackupService(backupFolderId);
  backupService.executeBackup();
}

export function nightlyBackupTrigger(): void {
  try {
    runBackupLogic();
  } catch (error: unknown) {
    console.error("CRITICAL: Nightly backup process failed.", error);
  }
}

export function TRIGGER_FullNightlyAutomation(): void {
  console.log("--- Starting Nightly Pipeline ---");

  try {
    // 1. Attempt Backup
    console.log("Step 1: Running Backup...");
    runBackupLogic();
    console.log("Step 1: Backup Successful.");

    // 2. Run Refocus Automation (only happens if Step 1 didn't throw an error)
    // console.log("Step 2: Running Refocus Automation...");
    // const controller = new RefocusControllers();
    // controller.runAutomation(); 
    // console.log("Step 2: Refocus Successful.");

    console.log("--- Pipeline Completed Successfully ---");

  } catch (error: unknown) {
    // This catches errors from BOTH the backup and the automation
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error("PIPELINE ABORTED: " + errorMessage);

    // Send an alert so you know the Refocus didn't run
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      "⚠️ Refocus Automation Skipped",
      `The nightly automation was aborted because an error occurred:\n\n${errorMessage}\n\nNo data was moved or deleted.`
    );
  }
}
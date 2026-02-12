# Copilot instructions for LCPS Records Toolset

## Big picture architecture

- This repo is Google Apps Script (V8) written in TypeScript, split into three packages: enrollment-tools (entry points), attendance-tracker (placeholder entry), and shared (common config/utils).
- Enrollment tools exposes Apps Script triggers and menus in [src/index.ts](src/index.ts). Handlers mostly delegate to service classes in [src/modules](src/modules).
- Shared logic lives in the shared package and is imported via the @shared alias (e.g., [shared/src/utilities/metadata-utils.ts](shared/src/utilities/metadata-utils.ts), [shared/src/config/shared-config.ts](shared/src/config/shared-config.ts)).

## Core data flow and metadata

- Sheet metadata is the central “source of truth”: [shared/src/utilities/metadata-utils.ts](shared/src/utilities/metadata-utils.ts) reads developer metadata on sheets; [src/modules/metadata-service.ts](src/modules/metadata-service.ts) syncs metadata from the \_ConfigData sheet using headers in [shared/src/config/shared-config.ts](shared/src/config/shared-config.ts).
- Module membership is determined by metadata keys in `MODULES` (shared-config). `buildCatalogForModule()` in [shared/src/utilities/data-utils.ts](shared/src/utilities/data-utils.ts) collects tagged sheets and pairs them with layout definitions from [shared/src/config/class-layouts.ts](shared/src/config/class-layouts.ts).
- Attendance clearing uses layout column indices (0-based) and background colors: see [src/modules/clear-attendance.ts](src/modules/clear-attendance.ts) and [shared/src/config/shared-config.ts](shared/src/config/shared-config.ts).

## Configuration & integration points

- Spreadsheet ID is stored in Script Properties under `sheetId` (see [src/config.ts](src/config.ts) and `SheetUtils.getLocalSpreadsheet()` in [shared/src/utilities/sheet-utils.ts](shared/src/utilities/sheet-utils.ts)).
- Backups use a Document Property `backupFolderId` and DriveApp (see [src/modules/backup-service.ts](src/modules/backup-service.ts)).
- UI interactions are Apps Script Spreadsheet UI + HtmlService dialogs (see `onOpen()` and `MetadataUtils.inspectActiveSheetMetadata()`).

## Conventions and patterns

- Prefer thin trigger/menu handlers that delegate to service classes (pattern in [src/index.ts](src/index.ts) and [src/modules](src/modules)).
- When adding a new module/tag, update `MODULES` and `SheetMetadata` in the shared config/types, and ensure `_ConfigData` includes matching headers (see [shared/src/config/shared-config.ts](shared/src/config/shared-config.ts) and [shared/src/config/types.ts](shared/src/config/types.ts)).

## Workflows

- No build/test scripts are defined in the workspace. Apps Script runtime metadata is in appsscript.json (e.g., [appsscript.json](appsscript.json)).
- Enrollment tools includes a clasp test config at [clasp-test.json](clasp-test.json) with `scriptId` and `rootDir`.

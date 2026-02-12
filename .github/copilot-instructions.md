# Copilot Instructions (lcps-records-toolset)

## Big picture

- This is a Google Apps Script TypeScript monorepo with packages under packages/\*.
- Shared code lives in packages/shared/src and is imported via the @shared/\* path alias.
- Each tool package is expected to expose a GAS entrypoint in packages/<tool>/src/index.ts (currently empty in attendance-tracker and enrollment-tools).
- Build output is a single IIFE bundle for GAS (see rollup.config.mjs output.format="iife" and name="Server").

## Key domain patterns

- Spreadsheet configuration is driven by a \_ConfigData sheet (CONFIG_TAB_NAME in packages/shared/src/shared-config.ts).
- Column definitions (ALL_COLUMNS) map config headers to metadata keys used by enrollment metadata syncing (packages/enrollment-tools/src/metadata-service.ts).
- Sheet access is centralized in SheetUtils (packages/shared/src/utilities/sheet-utils.ts), including script-property based spreadsheet selection (getLocalSpreadsheet).

## Build, deploy, and formatting

- Use pnpm scripts in package.json. Current build/deploy scripts are named build:project1:_ / build:project2:_ and use rollup + clasp.
- Rollup requires TARGET to select the package (rollup.config.mjs uses packages/${TARGET}/src/index.ts).
- Lint/format with Biome: pnpm lint, pnpm format (see biome.json for formatting rules).
- TypeScript is strict and targets ESNext with moduleResolution="bundler" (tsconfig.base.json).

## Conventions to follow

- Prefer shared constants/types over hardcoded strings: CONFIG_TAB_NAME, ALL_COLUMNS, SheetMetadata (packages/shared/src).
- Use GoogleAppsScript.\* types (see packages/shared/src/types.ts and existing services for examples).
- When asked to add JSDoc function/method headers, keep them minimal and only include required information.
- Spreadsheet IDs are stored in script properties using SHEET_ID_PROPERTY_KEY (packages/enrollment-tools/src/enrollment-config.ts).
- When working with spreadsheet IDs, use script properties via SheetUtils.getLocalSpreadsheet rather than direct SpreadsheetApp.openById calls.

## Integration points

- GAS runtime only (no browser/Node APIs). Types provided via @types/google-apps-script.
- Deployment uses clasp in package-level dist folders (see package.json scripts).

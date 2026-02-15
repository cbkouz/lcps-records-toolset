import { MetadataUtils } from "@shared/metadata-utils";
import { REFOCUS_ROLES, RefocusRole, RefocusSheets, SecondarySheets } from "./types"
import { CORE_COLUMNS, MODULES } from "@shared/shared-config";

export class RefocusCatalogService {
  private module: string = MODULES.REFOCUS.key;

  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet) { }
  
  public run(): RefocusSheets {
    const collection: Partial<
      Record<RefocusRole, GoogleAppsScript.Spreadsheet.Sheet>
    > = {};

    const allRefocusSheets = MetadataUtils.getSheetsWithTags(this.ss, this.module);
    for (const entry of allRefocusSheets) {
      const label = entry.tags.get(CORE_COLUMNS.LABEL.key);
      if (REFOCUS_ROLES.includes(label as any)) {
        if (collection[label as RefocusRole]) {
          throw new Error(`Duplicate sheet with label "${label}" found: "${entry.sheet.getName()}"`);
        };
        collection[label as RefocusRole] = entry.sheet;
      }
    };

    const missingRoles = REFOCUS_ROLES.filter((role) => !collection[role]);
    if (missingRoles.length > 0) {
      throw new Error(
        `Refocus registry is missing sheets for roles: ${missingRoles.join(', ')}`,
      );
    }
    
    return {
      secondary: {
        msHsRefocus: collection.msHsRefocus!,
        msArchive: collection.msArchive!,
        hsArchive: collection.hsArchive!,
      } as SecondarySheets,
    } as RefocusSheets;
  }
}

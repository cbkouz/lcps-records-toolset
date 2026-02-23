import { MODULES } from "@shared/schema";
import { MetadataUtils } from "@shared/utilities/metadata-utils";

export type RefocusCatalog = Record<"refocus" | "msArchive" | "hsArchive", GoogleAppsScript.Spreadsheet.Sheet>;

export class RefocusRepository {
  public catalog: RefocusCatalog;
  private readonly moduleKey = MODULES.REFOCUS.key;
  
  constructor(private ss: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    this.catalog = this.buildRefocusCatalog();
  }

  public buildRefocusCatalog(): RefocusCatalog {
    const refocusSheets = MetadataUtils.getModuleSheetsWithTags(this.ss, this.moduleKey);
    const catalog: Partial<RefocusCatalog> = {};
    for (const { tags, sheet } of refocusSheets) {
      let mappedRole: keyof RefocusCatalog | null = null;
      if (tags.layout === "refocus") {
        mappedRole = "refocus";
      } else if (tags.label === "lcmsArchive") {
        mappedRole = "msArchive";
      } else if (tags.label === "lchsArchive") {
        mappedRole = "hsArchive";
      }

      if (mappedRole) {
        if (catalog[mappedRole]) {
          throw new Error(`Multiple sheets found for role ${mappedRole}`);
        }
        catalog[mappedRole] = sheet;
      }
    }

    const missingRoles = (Object.keys(catalog) as Array<keyof RefocusCatalog>).filter(
      role => !catalog[role]
    );
    if (missingRoles.length > 0) {
      throw new Error(`Missing sheets for roles: ${missingRoles.join(", ")}`);
    }

    return catalog as RefocusCatalog;
  }
}
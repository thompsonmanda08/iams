import type { ModulePermissions } from "@/lib/types";

/**
 * Builds a flat map of module_code -> permissions from the nested API response.
 * Handles both parent modules and their sub_modules.
 */
export function buildPermissionMap(permissions: any[]): Map<string, ModulePermissions> {
  const map = new Map<string, ModulePermissions>();

  if (!Array.isArray(permissions)) return map;

  for (const mod of permissions) {
    if (mod?.module_code && mod?.permissions) {
      map.set(mod.module_code, mod.permissions);
    }

    if (Array.isArray(mod?.sub_modules)) {
      for (const sub of mod.sub_modules) {
        if (sub?.module_code && sub?.permissions) {
          map.set(sub.module_code, sub.permissions);
        }
      }
    }
  }

  return map;
}

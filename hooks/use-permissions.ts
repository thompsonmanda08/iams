import { useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useSystemSetup } from "@/hooks/use-users-query-data";
import type { ModulePermissions, PermissionAction } from "@/lib/types";

/** Maps permission actions to human-readable verbs for contextual toast messages */
const ACTION_LABELS: Record<PermissionAction, string> = {
  can_view: "view",
  can_create: "create",
  can_edit: "edit",
  can_delete: "delete",
  can_approve: "approve or reject",
  can_export: "export",
  can_assign: "assign",
  can_configure: "configure"
};

/**
 * Builds a flat map of module_code -> permissions from the nested API response.
 * Handles both parent modules and their sub_modules.
 */
function buildPermissionMap(permissions: any[]): Map<string, ModulePermissions> {
  const map = new Map<string, ModulePermissions>();

  for (const mod of permissions) {
    if (mod.module_code && mod.permissions) {
      map.set(mod.module_code, mod.permissions);
    }

    if (Array.isArray(mod.sub_modules)) {
      for (const sub of mod.sub_modules) {
        if (sub.module_code && sub.permissions) {
          map.set(sub.module_code, sub.permissions);
        }
      }
    }
  }

  return map;
}

/**
 * Hook that provides permission checking utilities based on the current user's session.
 *
 * Usage:
 * ```ts
 * const { hasPermission, checkPermission } = usePermissions();
 *
 * // Silent check (no toast)
 * if (hasPermission("RISK_REGISTERS", "can_create")) { ... }
 *
 * // Check + toast on denial (use in onClick/onSubmit handlers)
 * const handleCreate = () => {
 *   if (!checkPermission("RISK_REGISTERS", "can_create")) return;
 *   // proceed with action...
 * };
 * ```
 */
export function usePermissions() {
  const { data: sessionResponse } = useSystemSetup(true);
  const session = sessionResponse?.data;

  const permissionMap = useMemo(() => {
    if (!session?.permissions || !Array.isArray(session.permissions)) {
      return new Map<string, ModulePermissions>();
    }
    return buildPermissionMap(session.permissions);
  }, [session?.permissions]);

  /**
   * Returns the full permission object for a given module code.
   * Returns null if the module is not found.
   */
  const getPermissions = useCallback(
    (moduleCode: string): ModulePermissions | null => {
      return permissionMap.get(moduleCode) ?? null;
    },
    [permissionMap]
  );

  /**
   * Silently checks if the user has a specific permission on a module.
   * Returns true if the permission is granted, false otherwise.
   */
  const hasPermission = useCallback(
    (moduleCode: string, action: PermissionAction): boolean => {
      const perms = permissionMap.get(moduleCode);
      if (!perms) return false;
      return perms[action] === true;
    },
    [permissionMap]
  );

  /**
   * Checks if the user has a specific permission on a module.
   * If denied, shows a contextual toast error and returns false.
   * Use this in onClick/onSubmit handlers as a guard.
   *
   * @param moduleCode - The module code to check (e.g., "RISK_REGISTERS")
   * @param action - The permission action to check (e.g., "can_create")
   * @param customMessage - Optional custom message to override the default contextual message
   */
  const checkPermission = useCallback(
    (moduleCode: string, action: PermissionAction, customMessage?: string): boolean => {
      const perms = permissionMap.get(moduleCode);
      if (!perms || perms[action] !== true) {
        const actionLabel = ACTION_LABELS[action] || action;
        const message =
          customMessage ||
          `Access denied: You do not have permission to ${actionLabel} this resource. Please contact your administrator if you need access.`;
        toast.error(message);
        return false;
      }
      return true;
    },
    [permissionMap]
  );

  return { getPermissions, hasPermission, checkPermission };
}

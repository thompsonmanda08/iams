import { useMemo, useCallback } from "react";
import { notify } from "@/lib/utils";
import { useSystemSetup } from "@/hooks/use-users-query-data";
import { buildPermissionMap } from "@/lib/permissions/build-permission-map";
import type { ModuleCode } from "@/lib/constants/module-codes";
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
 * Hook that provides permission checking utilities based on the current user's session.
 *
 * Usage:
 * ```ts
 * const { hasPermission, checkPermission } = usePermissions();
 *
 * // Silent check (no toast)
 * if (hasPermission(MODULE_CODES.RISK_REGISTERS, "can_create")) { ... }
 *
 * // Check + toast on denial (use in onClick/onSubmit handlers)
 * const handleCreate = () => {
 *   if (!checkPermission(MODULE_CODES.RISK_REGISTERS, "can_create")) return;
 *   // proceed with action...
 * };
 * ```
 */
export function usePermissions() {
  const { data: session } = useSystemSetup(true);

  const isBackofficeAdmin = session?.user?.user_type === "BACKOFFICE_ADMIN";

  const permissionMap = useMemo(
    () => buildPermissionMap(session?.permissions ?? []),
    [session?.permissions]
  );

  /**
   * Returns the full permission object for a given module code.
   * Returns null if the module is not found.
   */
  const getPermissions = useCallback(
    (moduleCode: ModuleCode): ModulePermissions | null => {
      return permissionMap.get(moduleCode) ?? null;
    },
    [permissionMap]
  );

  /**
   * Silently checks if the user has a specific permission on a module.
   * Returns true if the permission is granted, false otherwise.
   * BACKOFFICE_ADMIN users are granted all permissions.
   */
  const hasPermission = useCallback(
    (moduleCode: ModuleCode, action: PermissionAction): boolean => {
      if (isBackofficeAdmin) return true;
      const perms = permissionMap.get(moduleCode);
      if (!perms) return false;
      return perms[action] === true;
    },
    [permissionMap, isBackofficeAdmin]
  );

  /**
   * Checks if the user has a specific permission on a module.
   * If denied, shows a contextual toast error and returns false.
   * Use this in onClick/onSubmit handlers as a guard.
   * BACKOFFICE_ADMIN users are granted all permissions.
   *
   * @param moduleCode - The module code to check (e.g., MODULE_CODES.RISK_REGISTERS)
   * @param action - The permission action to check (e.g., "can_create")
   * @param customMessage - Optional custom message to override the default contextual message
   */
  const checkPermission = useCallback(
    (moduleCode: ModuleCode, action: PermissionAction, customMessage?: string): boolean => {
      if (isBackofficeAdmin) return true;
      const perms = permissionMap.get(moduleCode);
      if (!perms || perms[action] !== true) {
        const actionLabel = ACTION_LABELS[action] || action;
        const message =
          customMessage ||
          `Access denied: You do not have permission to ${actionLabel} this resource. Please contact your administrator if you need access.`;
        notify({ description: message, type: "error" });
        return false;
      }
      return true;
    },
    [permissionMap, isBackofficeAdmin]
  );

  return { getPermissions, hasPermission, checkPermission };
}

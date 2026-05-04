"use client";

import * as React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/use-permissions";
import type { ModuleCode } from "@/lib/constants/module-codes";
import type { PermissionAction } from "@/lib/types";

const ACTION_VERB: Record<PermissionAction, string> = {
  can_view: "view",
  can_create: "create",
  can_edit: "edit",
  can_delete: "delete",
  can_approve: "approve or reject",
  can_export: "export",
  can_assign: "assign",
  can_configure: "configure"
};

type PermissionDropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuItem> & {
  moduleCode: ModuleCode;
  action: PermissionAction;
  noPermissionTooltip?: string;
};

/**
 * Drop-in replacement for <DropdownMenuItem> that disables itself + shows a
 * tooltip when the current user lacks the required permission.
 * BACKOFFICE_ADMIN bypasses the check.
 */
export function PermissionDropdownMenuItem({
  moduleCode,
  action,
  noPermissionTooltip,
  disabled,
  children,
  ...props
}: PermissionDropdownMenuItemProps) {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(moduleCode, action);
  const finalDisabled = disabled || !allowed;

  const item = (
    <DropdownMenuItem {...props} disabled={finalDisabled}>
      {children}
    </DropdownMenuItem>
  );

  if (allowed) return item;

  const message =
    noPermissionTooltip ??
    `You do not have permission to ${ACTION_VERB[action]} this resource`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block">{item}</span>
        </TooltipTrigger>
        <TooltipContent side="left">{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

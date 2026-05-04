"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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

type PermissionButtonProps = React.ComponentProps<typeof Button> & {
  moduleCode: ModuleCode;
  action: PermissionAction;
  /**
   * Optional tooltip override shown when the user lacks the permission.
   * Defaults to a generic "You do not have permission to {action} this resource" message.
   */
  noPermissionTooltip?: string;
};

/**
 * Drop-in replacement for <Button> that visually disables itself when the
 * current user lacks the required module permission. Renders a tooltip
 * explaining why the button is disabled. BACKOFFICE_ADMIN bypasses the check.
 *
 * Usage:
 *   <PermissionButton moduleCode={MODULE_CODES.RISK_REGISTERS} action="can_create" onClick={...}>
 *     Add Risk
 *   </PermissionButton>
 */
export function PermissionButton({
  moduleCode,
  action,
  noPermissionTooltip,
  disabled,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(moduleCode, action);
  const finalDisabled = disabled || !allowed;

  const button = <Button {...props} disabled={finalDisabled} />;

  if (allowed) return button;

  const message =
    noPermissionTooltip ??
    `You do not have permission to ${ACTION_VERB[action]} this resource`;

  return (
    <TooltipProvider>
      <Tooltip>
        {/* span wrapper required: disabled buttons don't fire pointer events for tooltip */}
        <TooltipTrigger asChild>
          <span className="inline-flex">{button}</span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

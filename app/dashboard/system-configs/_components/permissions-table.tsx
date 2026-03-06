"use client";

import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import type { ModuleHierarchy } from "@/lib/stores/modules-store";

type PermissionType =
  | "can_view"
  | "can_create"
  | "can_edit"
  | "can_delete"
  | "can_approve"
  | "can_export"
  | "can_assign"
  | "can_configure";

const PERMISSION_LABELS: Record<PermissionType, string> = {
  can_view: "View",
  can_create: "Create",
  can_edit: "Edit",
  can_delete: "Delete",
  can_approve: "Approve",
  can_export: "Export",
  can_assign: "Assign",
  can_configure: "Configure"
};

interface PermissionsTableProps {
  modules: ModuleHierarchy[];
  permissionsMatrix: Record<string, Record<PermissionType, boolean>>;
  onTogglePermission: (moduleId: string, permType: PermissionType) => void;
  onToggleColumnPermissions?: (permType: PermissionType) => void;
  disabled?: boolean;
  showColumnToggles?: boolean;
}

export function PermissionsTable({
  modules,
  permissionsMatrix,
  onTogglePermission,
  onToggleColumnPermissions,
  disabled = false,
  showColumnToggles = true
}: PermissionsTableProps) {
  if (modules.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">No modules in this group</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">Module</TableHead>
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
              const permType = key as PermissionType;

              if (!showColumnToggles || !onToggleColumnPermissions) {
                return (
                  <TableHead key={key} className="text-center">
                    {label}
                  </TableHead>
                );
              }

              const allEnabled = modules.every((m) => permissionsMatrix[m.id]?.[permType] === true);
              const someEnabled = modules.some((m) => permissionsMatrix[m.id]?.[permType] === true);

              return (
                <TableHead key={key} className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          role="button"
                          tabIndex={disabled ? -1 : 0}
                          onClick={() => !disabled && onToggleColumnPermissions(permType)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && !disabled && onToggleColumnPermissions(permType)
                          }
                          className="hover:text-primary mx-auto flex cursor-pointer flex-col items-center gap-1 transition-colors aria-disabled:opacity-50"
                          aria-disabled={disabled}>
                          <div className="flex items-center gap-1">
                            {label}
                            <InfoIcon className="text-muted-foreground h-3 w-3" />
                          </div>
                          <Checkbox
                            checked={allEnabled}
                            data-state={
                              allEnabled ? "checked" : someEnabled ? "indeterminate" : "unchecked"
                            }
                            className="pointer-events-none h-3.5 w-3.5"
                            aria-label={`Toggle all ${label} permissions`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {allEnabled ? "Disable" : "Enable"} all {label} permissions for this group
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{module.displayName}</span>
                  {module.description && (
                    <span className="text-muted-foreground text-xs">{module.description}</span>
                  )}
                </div>
              </TableCell>
              {Object.keys(PERMISSION_LABELS).map((permType) => (
                <TableCell key={permType} className="text-center">
                  <Switch
                    checked={permissionsMatrix[module.id]?.[permType as PermissionType] || false}
                    onCheckedChange={() =>
                      onTogglePermission(module.id, permType as PermissionType)
                    }
                    disabled={disabled}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

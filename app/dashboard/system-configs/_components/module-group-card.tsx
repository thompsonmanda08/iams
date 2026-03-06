"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldX, ShieldAlert, ClipboardCheck, Settings } from "lucide-react";
import { PermissionsTable } from "./permissions-table";
import type { ModuleGroup } from "@/lib/stores/modules-store";

type PermissionType =
  | "can_view"
  | "can_create"
  | "can_edit"
  | "can_delete"
  | "can_approve"
  | "can_export"
  | "can_assign"
  | "can_configure";

interface ModuleGroupCardProps {
  group: ModuleGroup;
  permissionsMatrix: Record<string, Record<PermissionType, boolean>>;
  onTogglePermission: (moduleId: string, permType: PermissionType) => void;
  onToggleColumnPermissions: (permType: PermissionType) => void;
  onGrantAll: () => void;
  onRevokeAll: () => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ShieldAlert: <ShieldAlert className="h-5 w-5" />,
  ClipboardCheck: <ClipboardCheck className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />
};

export function ModuleGroupCard({
  group,
  permissionsMatrix,
  onTogglePermission,
  onToggleColumnPermissions,
  onGrantAll,
  onRevokeAll,
  disabled = false
}: ModuleGroupCardProps) {
  // Don't render if no children
  if (group.children.length === 0) {
    return null;
  }

  const icon = ICON_MAP[group.icon] || ICON_MAP.Settings;

  // Calculate stats
  const totalPermissions = group.children.length * 8; // 8 permission types per module
  const enabledPermissions = group.children.reduce((count, module) => {
    const modulePerms = permissionsMatrix[module.id];
    if (!modulePerms) return count;

    return count + Object.values(modulePerms).filter((val) => val === true).length;
  }, 0);

  const percentageEnabled =
    totalPermissions > 0 ? Math.round((enabledPermissions / totalPermissions) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary mt-1 rounded-lg p-2">{icon}</div>
            <div>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <CardDescription className="mt-1">
                {group.parent?.description || `Manage ${group.name.toLowerCase()} permissions`}
              </CardDescription>
              <div className="mt-2 flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                  {group.children.length} module{group.children.length !== 1 ? "s" : ""}
                </div>
                <div className="text-muted-foreground text-xs">
                  {enabledPermissions} / {totalPermissions} permissions enabled ({percentageEnabled}
                  %)
                </div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onGrantAll}
              disabled={disabled}
              className="gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Grant All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onRevokeAll}
              disabled={disabled}
              className="gap-1.5">
              <ShieldX className="text-destructive h-4 w-4" />
              Revoke All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <PermissionsTable
          modules={group.children}
          permissionsMatrix={permissionsMatrix}
          onTogglePermission={onTogglePermission}
          onToggleColumnPermissions={onToggleColumnPermissions}
          disabled={disabled}
          showColumnToggles={true}
        />
      </CardContent>
    </Card>
  );
}

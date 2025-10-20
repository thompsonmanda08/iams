"use client";

import { InfoIcon, ShieldIcon, SaveIcon, RefreshCwIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Switch,
  Tab,
  Tabs,
  Tooltip,
} from "@heroui/react";

import {
  getAllRolePermissions,
  bulkUpdateRolePermissions,
  resetRolePermissionsToDefaults,
  type RolePermissionData,
} from "@/app/actions/permissions-actions";

// Type definitions matching TeamMember model from Prisma schema
type TeamRole = "OWNER" | "ADMIN" | "EDITOR" | "MODERATOR" | "VIEWER";

type PermissionKey =
  | "canCreateEvents"
  | "canEditEvents"
  | "canDeleteEvents"
  | "canManageTickets"
  | "canManageTeam"
  | "canManageVendors"
  | "canViewAnalytics"
  | "canCheckIn";

type PermissionsMatrix = Record<PermissionKey, Record<TeamRole, boolean>>;

export default function PermissionsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  // Define permission categories
  const permissionsByCategory: Record<string, Array<{ key: PermissionKey; label: string; description: string }>> = {
    events: [
      {
        key: "canCreateEvents",
        label: "Create Events",
        description: "Ability to create new events",
      },
      {
        key: "canEditEvents",
        label: "Edit Events",
        description: "Ability to edit existing events",
      },
      {
        key: "canDeleteEvents",
        label: "Delete Events",
        description: "Ability to permanently delete events",
      },
      {
        key: "canManageTickets",
        label: "Manage Tickets",
        description: "Ability to manage ticket types and pricing",
      },
    ],
    team: [
      {
        key: "canManageTeam",
        label: "Manage Team",
        description: "Ability to invite, remove, and manage team members",
      },
    ],
    vendors: [
      {
        key: "canManageVendors",
        label: "Manage Vendors",
        description: "Ability to manage vendor applications and assignments",
      },
    ],
    analytics: [
      {
        key: "canViewAnalytics",
        label: "View Analytics",
        description: "Ability to view event analytics and reports",
      },
      {
        key: "canCheckIn",
        label: "Check-in Attendees",
        description: "Ability to check-in attendees at events",
      },
    ],
  };

  // Define roles based on TeamRole enum from schema
  const roles: Array<{
    id: TeamRole;
    name: string;
    description: string;
    color: string;
  }> = [
    {
      id: "OWNER",
      name: "Owner",
      description: "Team owner with full access to all features and settings",
      color: "primary",
    },
    {
      id: "ADMIN",
      name: "Admin",
      description: "Can manage team members and all events with full permissions",
      color: "secondary",
    },
    {
      id: "EDITOR",
      name: "Editor",
      description: "Can create and edit events, manage tickets",
      color: "success",
    },
    {
      id: "MODERATOR",
      name: "Moderator",
      description: "Can moderate content, check-in attendees, and view analytics",
      color: "warning",
    },
    {
      id: "VIEWER",
      name: "Viewer",
      description: "Read-only access to events and analytics",
      color: "default",
    },
  ];

  const [permissionsMatrix, setPermissionsMatrix] = useState<PermissionsMatrix | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load permissions from database on mount
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const result = await getAllRolePermissions();

      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to load permissions");
        return;
      }

      // Convert database format to matrix format
      const matrix: any = {
        canCreateEvents: {},
        canEditEvents: {},
        canDeleteEvents: {},
        canManageTickets: {},
        canManageTeam: {},
        canManageVendors: {},
        canViewAnalytics: {},
        canCheckIn: {},
      };

      result.data.forEach((rolePermission: any) => {
        const role = rolePermission.role as TeamRole;
        matrix.canCreateEvents[role] = rolePermission.canCreateEvents;
        matrix.canEditEvents[role] = rolePermission.canEditEvents;
        matrix.canDeleteEvents[role] = rolePermission.canDeleteEvents;
        matrix.canManageTickets[role] = rolePermission.canManageTickets;
        matrix.canManageTeam[role] = rolePermission.canManageTeam;
        matrix.canManageVendors[role] = rolePermission.canManageVendors;
        matrix.canViewAnalytics[role] = rolePermission.canViewAnalytics;
        matrix.canCheckIn[role] = rolePermission.canCheckIn;
      });

      setPermissionsMatrix(matrix);
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle permission
  const togglePermission = (permission: PermissionKey, role: TeamRole) => {
    if (!permissionsMatrix) return;

    setPermissionsMatrix((prev: any) => ({
      ...prev,
      [permission]: {
        ...prev[permission],
        [role]: !prev[permission][role],
      },
    }));
    setHasChanges(true);
  };

  // Save permissions
  const savePermissions = async () => {
    if (!permissionsMatrix) return;

    setSaving(true);
    try {
      // Convert matrix format to database format
      const updates: Record<TeamRole, Partial<RolePermissionData>> = {} as any;

      roles.forEach((role) => {
        updates[role.id] = {
          canCreateEvents: permissionsMatrix.canCreateEvents[role.id],
          canEditEvents: permissionsMatrix.canEditEvents[role.id],
          canDeleteEvents: permissionsMatrix.canDeleteEvents[role.id],
          canManageTickets: permissionsMatrix.canManageTickets[role.id],
          canManageTeam: permissionsMatrix.canManageTeam[role.id],
          canManageVendors: permissionsMatrix.canManageVendors[role.id],
          canViewAnalytics: permissionsMatrix.canViewAnalytics[role.id],
          canCheckIn: permissionsMatrix.canCheckIn[role.id],
          isActive: true,
        };
      });

      const result = await bulkUpdateRolePermissions(updates);

      if (!result.success) {
        toast.error(result.error || "Failed to save permissions");
        return;
      }

      toast.success(result.message || "Permission defaults saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset all permissions to their default values? This cannot be undone.")) {
      return;
    }

    setResetting(true);
    try {
      const result = await resetRolePermissionsToDefaults();

      if (!result.success) {
        toast.error(result.error || "Failed to reset permissions");
        return;
      }

      toast.success(result.message || "Reset to default permissions");

      // Reload permissions from database
      await loadPermissions();
      setHasChanges(false);
    } catch (error) {
      console.error("Error resetting permissions:", error);
      toast.error("Failed to reset permissions");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading permissions...</span>
        </div>
      </div>
    );
  }

  if (!permissionsMatrix) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-muted-foreground mb-4">Failed to load permissions</p>
          <Button onClick={loadPermissions}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Role Permissions</h1>
          <p className="text-muted-foreground mt-2">
            Configure default permissions for team member roles. These defaults
            apply when adding new team members.
          </p>
        </div>
      </div>

      {/* Roles Overview */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Roles Overview</h2>
          <p className="text-muted-foreground">
            Understanding team member roles and their responsibilities
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{role.name}</h3>
                  {role.id === "OWNER" && (
                    <Chip size="sm" color="primary">
                      Default
                    </Chip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Permission Matrix by Category */}
      <Tabs aria-label="Permission categories" defaultSelectedKey="events">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <Tab
            key={category}
            title={
              <div className="flex items-center gap-2">
                <span className="capitalize">{category}</span>
                <Chip size="sm" variant="flat">
                  {permissions.length}
                </Chip>
              </div>
            }
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold capitalize">
                  {category} Permissions
                </h2>
                <p className="text-muted-foreground">
                  Configure which roles can access {category} features
                </p>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Permission</TableHead>
                        {roles.map((role) => (
                          <TableHead key={role.id} className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span>{role.name}</span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.key}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {permission.label}
                                </span>
                                <Tooltip content={permission.description}>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </Tooltip>
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">
                                {permission.key}
                              </span>
                            </div>
                          </TableCell>
                          {roles.map((role) => (
                            <TableCell key={role.id} className="text-center">
                              <div className="flex justify-center">
                                <Switch
                                  size="sm"
                                  isSelected={permissionsMatrix[permission.key][role.id]}
                                  onValueChange={() =>
                                    togglePermission(permission.key, role.id)
                                  }
                                  isDisabled={role.id === "OWNER"} // Owner always has all permissions
                                  color={
                                    permissionsMatrix[permission.key][role.id]
                                      ? "success"
                                      : "default"
                                  }
                                />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Tab>
        ))}
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={resetToDefaults} disabled={resetting}>
          {resetting ? (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset to Defaults"
          )}
        </Button>
        <div className="flex gap-2">
          {hasChanges && (
            <Chip color="warning" variant="flat">
              Unsaved Changes
            </Chip>
          )}
          <Button
            onClick={savePermissions}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? "Saving..." : "Save Permission Defaults"}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mt-6">
        <CardBody>
          <div className="flex gap-3">
            <InfoIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">How Permissions Work</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>Owner</strong> role always has all permissions enabled
                  (cannot be changed)
                </li>
                <li>
                  These settings define <strong>default permissions</strong> for
                  each role
                </li>
                <li>
                  Individual team members can have custom permissions that override
                  these defaults
                </li>
                <li>
                  Changes apply to newly added team members and can be applied to
                  existing members
                </li>
                <li>
                  Permissions are stored in the database for all team roles and members
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

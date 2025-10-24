"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, ShieldIcon, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getRoles, getDepartmentModules } from "@/app/_actions/config-actions";
import {
  getRolePermissions,
  grantOrUpdateRolePermission,
  bulkUpdateRolePermissions
} from "@/app/_actions/permissions-actions";
import { toast } from "sonner";

interface RolesPermissionsProps {
  departmentId?: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
  department_id: string;
  description?: string;
}

interface Module {
  id: string;
  name: string;
  description?: string;
}

interface Permission {
  role_id: string;
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  can_assign: boolean;
  can_configure: boolean;
}

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

export default function RolesPermissions({ departmentId }: RolesPermissionsProps) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [permissionsMatrix, setPermissionsMatrix] = useState<
    Record<string, Record<PermissionType, boolean>>
  >({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch roles for this department
  const { data: rolesResponse, isLoading: rolesLoading } = useQuery({
    queryKey: [QUERY_KEYS.ROLES, departmentId],
    queryFn: () => getRoles({ departmentId }),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000
  });

  // Fetch modules assigned to this department
  const { data: modulesResponse, isLoading: modulesLoading } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENT_MODULES, departmentId],
    queryFn: () => getDepartmentModules(departmentId!),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000
  });

  const roles: Role[] = useMemo(
    () => (rolesResponse?.success && rolesResponse?.data ? rolesResponse.data : []),
    [rolesResponse]
  );

  const modules: Module[] = useMemo(
    () => (modulesResponse?.success && modulesResponse?.data ? modulesResponse.data : []),
    [modulesResponse]
  );

  // Fetch permissions for selected role
  const { data: permissionsResponse, isLoading: permissionsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ROLE_PERMISSIONS, selectedRole],
    queryFn: () => getRolePermissions(selectedRole!),
    enabled: !!selectedRole,
    staleTime: 5 * 60 * 1000
  });

  // Build permissions matrix when data loads
  useEffect(() => {
    if (permissionsResponse?.success && permissionsResponse?.data && selectedRole) {
      const matrix: Record<string, Record<PermissionType, boolean>> = {};

      // Initialize all modules with false permissions
      modules.forEach((module) => {
        matrix[module.id] = {
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false,
          can_approve: false,
          can_export: false,
          can_assign: false,
          can_configure: false
        };
      });

      // Fill in actual permissions
      (permissionsResponse.data as Permission[]).forEach((perm) => {
        if (matrix[perm.module_id]) {
          matrix[perm.module_id] = {
            can_view: perm.can_view,
            can_create: perm.can_create,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete,
            can_approve: perm.can_approve,
            can_export: perm.can_export,
            can_assign: perm.can_assign,
            can_configure: perm.can_configure
          };
        }
      });

      setPermissionsMatrix(matrix);
      setHasChanges(false);
    }
  }, [permissionsResponse, selectedRole, modules]);

  // Set first role as selected when roles load
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].id);
    }
  }, [roles, selectedRole]);

  // Toggle permission
  const togglePermission = (moduleId: string, permissionType: PermissionType) => {
    setPermissionsMatrix((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permissionType]: !prev[moduleId]?.[permissionType]
      }
    }));
    setHasChanges(true);
  };

  // Save permissions mutation
  const savePermissionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) {
        throw new Error("No role selected");
      }

      const permissions = modules.map((module) => ({
        moduleId: module.id,
        ...permissionsMatrix[module.id]
      }));

      const response = await bulkUpdateRolePermissions({
        roleId: selectedRole,
        permissions
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLE_PERMISSIONS, selectedRole] });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update permissions");
    }
  });

  const handleSave = () => {
    savePermissionsMutation.mutate();
  };

  const isLoading = rolesLoading || modulesLoading;
  const isSaving = savePermissionsMutation.isPending;

  if (!departmentId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please select a department to view roles and permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="text-muted-foreground ml-2">Loading roles and permissions...</span>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No roles found for this department.</p>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create First Role
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No modules assigned to this department. Please assign modules first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isSaving && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
          <Spinner className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-600">Saving permissions...</span>
        </div>
      )}

      {/* Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Roles in This Department</CardTitle>
          <CardDescription>
            Select a role to configure its permissions for assigned modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  if (hasChanges) {
                    if (
                      !confirm("You have unsaved changes. Are you sure you want to switch roles?")
                    ) {
                      return;
                    }
                  }
                  setSelectedRole(role.id);
                  setHasChanges(false);
                }}
                className={`hover:bg-accent rounded-md border p-4 text-left transition-colors ${
                  selectedRole === role.id ? "border-primary bg-accent" : ""
                }`}>
                <div className="mb-2 flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5" />
                  <h3 className="font-medium">{role.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {role.description || `Code: ${role.code}`}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle>Permissions for {roles.find((r) => r.id === selectedRole)?.name}</CardTitle>
            <CardDescription>
              Configure which modules and actions this role can access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
                <span className="text-muted-foreground ml-2">Loading permissions...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                        <TableHead key={key} className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center justify-center gap-1">
                                  {label}
                                  <InfoIcon className="text-muted-foreground h-3 w-3" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{key}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.name}</TableCell>
                        {Object.keys(PERMISSION_LABELS).map((permType) => (
                          <TableCell key={permType} className="text-center">
                            <Switch
                              checked={
                                permissionsMatrix[module.id]?.[permType as PermissionType] || false
                              }
                              onCheckedChange={() =>
                                togglePermission(module.id, permType as PermissionType)
                              }
                              disabled={isSaving}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {selectedRole && (
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-4">
          <div>
            <p className="text-sm font-medium text-amber-900">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </p>
            <p className="text-muted-foreground text-sm">
              {hasChanges
                ? "Click 'Save Permissions' to apply your changes"
                : "Permissions are up to date"}
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm">
            {isSaving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      )}
    </div>
  );
}

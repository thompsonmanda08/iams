"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, ShieldIcon, Plus, Edit } from "lucide-react";
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
import {
  getRoles,
  getDepartmentModules,
  createRole,
  updateRole,
  deleteRole
} from "@/app/_actions/config-actions";
import { getRolePermissions, bulkUpdateRolePermissions } from "@/app/_actions/permissions-actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input-field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";

interface RolesPermissionsProps {
  departmentId?: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
  department_id: string;
  description: string;
  is_active: boolean;
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

export default function UserRolesConfig({ departmentId }: { departmentId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [permissionsMatrix, setPermissionsMatrix] = useState<
    Record<string, Record<PermissionType, boolean>>
  >({});
  const [hasChanges, setHasChanges] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

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
    () => (rolesResponse?.success && rolesResponse?.data?.data ? rolesResponse.data.data : []),
    [rolesResponse]
  );

  const modules: Module[] = useMemo(
    () => (modulesResponse?.success && modulesResponse?.data ? modulesResponse.data.data : []),
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
      <>
        <div className="col-span-full rounded-lg border border-dashed">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No User Roles</EmptyTitle>
              <EmptyDescription>No roles found for this department.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingRole(null);
                    setOpenRoleModal(true);
                  }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Role
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
        <CreateOrUpdateRoleDialog
          openModal={openRoleModal}
          setOpenModal={setOpenRoleModal}
          departmentId={departmentId}
          initialData={editingRole}
          setInitialData={setEditingRole}
        />
      </>
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
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Roles & Permissions</h3>
            <p className="text-muted-foreground text-sm">
              List of all the roles and permissions in this department
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingRole(null);
              setOpenRoleModal(true);
            }}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Role
          </Button>
        </div>

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
                          !confirm(
                            "You have unsaved changes. Are you sure you want to switch roles?"
                          )
                        ) {
                          return;
                        }
                      }
                      setSelectedRole(role.id);
                      setHasChanges(false);
                    }}
                    className={cn(
                      "hover:bg-accent group relative rounded-md border p-4 text-left transition-colors",
                      selectedRole === role.id ? "border-primary bg-accent" : ""
                    )}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRole(role);
                        setOpenRoleModal(true);
                      }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <div
                      className="mb-2 flex items-center gap-2"
                      title={role.is_active ? "Active" : "Inactive"}>
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
                <CardTitle>
                  Permissions for {roles.find((r) => r.id === selectedRole)?.name}
                </CardTitle>
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
                                    permissionsMatrix[module.id]?.[permType as PermissionType] ||
                                    false
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
      </Card>

      <CreateOrUpdateRoleDialog
        openModal={openRoleModal}
        setOpenModal={setOpenRoleModal}
        departmentId={departmentId}
        initialData={editingRole}
        setInitialData={setEditingRole}
      />
    </>
  );
}

const ROLE_INITIAL_STATE: Omit<Role, "id" | "department_id"> = {
  name: "",
  code: "",
  description: "",
  is_active: true
};

interface CreateOrUpdateRoleDialogProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  departmentId: string;
  initialData: Role | null;
  setInitialData: React.Dispatch<React.SetStateAction<Role | null>>;
}

function CreateOrUpdateRoleDialog({
  openModal,
  setOpenModal,
  departmentId,
  initialData,
  setInitialData
}: CreateOrUpdateRoleDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialData || ROLE_INITIAL_STATE);
  const [error, setError] = useState<{ status: boolean; message: string }>({
    status: false,
    message: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(ROLE_INITIAL_STATE);
    }
  }, [initialData, openModal]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        name: data.name,
        code: data.code,
        description: data.description,
        departmentId: departmentId,
        isActive: data.is_active
      };
      return initialData ? updateRole({ ...payload, id: initialData.id }) : createRole(payload);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Role ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES, departmentId] });
        setOpenModal(false);
      } else {
        toast.error(response.message);
        setError({ status: true, message: response.message });
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "An error occurred");
      setError({ status: true, message: err.message });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpenModal(open);
      if (!open) {
        setInitialData(null);
        setFormData(ROLE_INITIAL_STATE);
        setError({ status: false, message: "" });
      }
    },
    [setOpenModal, setInitialData]
  );

  return (
    <Dialog open={openModal} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g., Auditor, Manager"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Role Code"
            placeholder="e.g., AUD, MGR"
            value={formData.code}
            onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            required
          />
          <Textarea
            label="Description"
            placeholder="A short description of the role (optional)"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="destructive">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={saveMutation.isPending || !formData.name || !formData.code}
              isLoading={saveMutation.isPending}>
              {initialData ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

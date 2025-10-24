"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppModule, Department, ErrorState } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input-field";
import {
  updateDepartment,
  getModules,
  getDepartmentModules,
  assignModuleToDepartment,
  removeModuleFromDepartment
} from "@/app/_actions/config-actions";
import { useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, FolderCode } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { add } from "date-fns";
import { capitalize, cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

import { ArrowUpRightIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import Link from "next/link";

export const UpdateDepartmentForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const departmentId = params?.id as string;

  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<Department>({
    id: undefined,
    name: "",
    code: "",
    description: ""
  });

  async function handleUpdateDepartment(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await updateDepartment({ ...formData, id: departmentId });
    if (res.success) {
      toast.success(`Department updated successfully`);
    } else {
      toast.error(res.message);
      setError({ status: true, message: res.message });
    }

    setIsLoading(false);
  }
  return (
    <form onSubmit={handleUpdateDepartment} className="space-y-4">
      <div className="flex flex-col items-end justify-start gap-2 md:flex-row">
        <Input
          label="Name"
          placeholder="Department Name"
          classNames={{
            wrapper: "md:max-w-xs w-full"
          }}
          value={formData.name}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, name: e.target.value }));
          }}
          required
          // descriptionText="A unique code will be automatically generated from the name"
        />
        <Input
          label="Description"
          placeholder="Department description (optional)"
          value={formData.description}
          className="w-full"
          classNames={{
            wrapper: "md:max-w-none w-full"
          }}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, description: e.target.value }));
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !formData.parentId || !formData.name}
          isLoading={isLoading}
          loadingText="Saving..."
          className="col-end-1">
          Save
        </Button>
      </div>
      {error.status && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};
export const AddNewRoleForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const departmentId = params?.id as string;

  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<Department>({
    id: undefined,
    name: "",
    code: "",
    description: ""
  });

  async function handleUpdateDepartment(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await updateDepartment({ ...formData, id: departmentId });
    if (res.success) {
      toast.success(`Department updated successfully`);
    } else {
      toast.error(res.message);
      setError({ status: true, message: res.message });
    }

    setIsLoading(false);
  }
  return (
    <form onSubmit={handleUpdateDepartment} className="space-y-4">
      <div className="flex flex-col items-end justify-start gap-2 md:flex-row">
        <Input
          label="Name"
          placeholder="Department Name"
          classNames={{
            wrapper: "md:max-w-xs w-full"
          }}
          value={formData.name}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, name: e.target.value }));
          }}
          required
          // descriptionText="A unique code will be automatically generated from the name"
        />
        <Input
          label="Description"
          placeholder="Department description (optional)"
          value={formData.description}
          className="w-full"
          classNames={{
            wrapper: "md:max-w-none w-full"
          }}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, description: e.target.value }));
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !formData.parentId || !formData.name}
          isLoading={isLoading}
          loadingText="Saving..."
          className="col-end-1">
          Save
        </Button>
      </div>
      {error.status && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

const ModuleItem = ({
  name,
  description,
  onSelection,
  allowSelect = false,
  backendKey,
  selectedModules = []
}: {
  name: string;
  description: string;
  onSelection: (key: string) => void;
  allowSelect?: boolean;
  backendKey: string;
  selectedModules?: string[];
}) => {
  return (
    <div
      key={name}
      className="relative flex w-full cursor-pointer justify-start gap-x-2 rounded-lg border border-blue-100 bg-blue-50 p-3 hover:bg-blue-100">
      <Checkbox
        checked={selectedModules?.includes(backendKey)}
        onCheckedChange={(checked) => {
          if (!allowSelect) return;
          onSelection(backendKey);
        }}
        disabled={!allowSelect}
        className="h-4 w-4"
      />
      <div className="gap-3s flex items-center justify-center rounded">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <div className="flex w-max flex-col items-start justify-start gap-y-1">
          <span className="text-sm font-medium text-gray-900 uppercase">{name}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>
    </div>
  );
};

export function ModuleSelection({
  departmentId,
  allowSelect = true
}: {
  departmentId?: string;
  allowSelect?: boolean;
}) {
  const queryClient = useQueryClient();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [initialModules, setInitialModules] = useState<string[]>([]);

  // Fetch all available modules
  const { data: modulesResponse, isLoading: modulesLoading } = useQuery({
    queryKey: [QUERY_KEYS.MODULES],
    queryFn: () => getModules(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch department modules if departmentId is provided
  const { data: departmentModulesResponse, isLoading: departmentModulesLoading } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENT_MODULES, departmentId],
    queryFn: () => getDepartmentModules(departmentId!),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Transform API modules to AppModule format
  const modules: AppModule[] = useMemo(
    () =>
      modulesResponse?.success && modulesResponse?.data
        ? (modulesResponse.data as any[]).map((module: any) => ({
            id: module.id,
            name: module.name,
            description: module.description || "",
            department: "",
            backendKey: module.id,
            isActive: module.is_active ?? true
          }))
        : [],
    [modulesResponse]
  );

  // Update selected modules when department modules are loaded
  useEffect(() => {
    if (departmentModulesResponse?.success && departmentModulesResponse?.data) {
      const assignedIds = (departmentModulesResponse.data as any[]).map((module: any) => module.id);
      setSelectedModules(assignedIds);
      setInitialModules(assignedIds);
    } else if (!departmentId && modules.length > 0 && selectedModules.length === 0) {
      // If no departmentId, select all modules by default
      const allIds = modules.map((m) => m.backendKey);
      setSelectedModules(allIds);
      setInitialModules(allIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentModulesResponse, departmentId, modules.length]);

  // Mutation for saving module assignments
  const saveModulesMutation = useMutation({
    mutationFn: async () => {
      if (!departmentId) {
        throw new Error("Department ID is required to save module assignments");
      }

      // Determine which modules to add and which to remove
      const modulesToAdd = selectedModules.filter((id) => !initialModules.includes(id));
      const modulesToRemove = initialModules.filter((id) => !selectedModules.includes(id));

      const results = {
        added: 0,
        removed: 0,
        errors: [] as string[]
      };

      // Add new module assignments
      for (const moduleId of modulesToAdd) {
        const response = await assignModuleToDepartment({
          departmentId,
          moduleId
        });

        if (response.success) {
          results.added++;
        } else {
          results.errors.push(`Failed to add module: ${response.message}`);
        }
      }

      // Remove module assignments
      for (const moduleId of modulesToRemove) {
        const response = await removeModuleFromDepartment({
          departmentId,
          moduleId
        });

        if (response.success) {
          results.removed++;
        } else {
          results.errors.push(`Failed to remove module: ${response.message}`);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      // Show results
      if (results.errors.length === 0) {
        let message = "Module assignments updated successfully";
        if (results.added > 0 && results.removed > 0) {
          message = `Added ${results.added} module(s), removed ${results.removed} module(s)`;
        } else if (results.added > 0) {
          message = `Added ${results.added} module(s)`;
        } else if (results.removed > 0) {
          message = `Removed ${results.removed} module(s)`;
        }

        toast.success(message);
      } else {
        toast.error(`Some operations failed: ${results.errors.join(", ")}`);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENT_MODULES, departmentId] });

      // Update initial modules to match current selection
      setInitialModules(selectedModules);
    },
    onError: (error) => {
      console.error("Error saving module assignments:", error);
      toast.error("Failed to save module assignments");
    }
  });

  const handleSave = () => {
    saveModulesMutation.mutate();
  };

  const isLoading = modulesLoading || departmentModulesLoading;
  const isSaving = saveModulesMutation.isPending;

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="text-muted-foreground ml-2">Loading modules...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {isSaving && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
          <Spinner className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-600">Saving changes...</span>
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3",
          modules.length === 0 && "place-items-center"
        )}>
        {modules && modules.length > 0 ? (
          modules.map((module) => {
            return (
              <ModuleItem
                key={module.backendKey + "-display"}
                name={capitalize(module.name)}
                description={module.description || "No Description"}
                allowSelect={allowSelect}
                backendKey={module.backendKey}
                selectedModules={selectedModules}
                onSelection={handleModuleToggle}
              />
            );
          })
        ) : (
          <div className="col-span-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCode />
                </EmptyMedia>
                <EmptyTitle>No Modules Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any modules yet. Get started by creating your first
                  module.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Link href="/dashboard/system-configs/modules">
                    <Button>Create module</Button>
                  </Link>
                </div>
              </EmptyContent>
              <Button variant="link" asChild className="text-muted-foreground" size="sm">
                <Link href="/dashboard/system-configs/modules">
                  Configure Modules <ArrowUpRightIcon />
                </Link>
              </Button>
            </Empty>
          </div>
        )}
      </div>

      {allowSelect && departmentId && (
        <div className="space-y-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {selectedModules.length} module{selectedModules.length !== 1 ? "s" : ""} selected
            </span>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Selection"}
            </Button>
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-blue-900">
              About Department Module Assignment
            </h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Modules assigned here will be available for roles within this department</p>
              <p>• Roles can only receive permissions for modules assigned to their department</p>
              <p>• This implements the department-constrained RBAC system</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

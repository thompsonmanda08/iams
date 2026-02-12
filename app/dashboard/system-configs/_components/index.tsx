"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppModule, Department, ErrorState } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  updateDepartment,
  getModules,
  getDepartmentModules,
  assignModuleToDepartment,
  removeModuleFromDepartment
} from "@/app/_actions/config-actions";
import { useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderCode, PuzzleIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";

export const AddNewRoleForm = () => {
  const { checkPermission } = usePermissions();
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
    description: "",
    parent_id: null,
    is_active: true
  });

  async function handleUpdateDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!checkPermission("DEPT_MGMT", "can_edit")) return;
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

// Helper function to format module display name for layman users
const formatModuleName = (name: string, moduleCode: string) => {
  // Priority 1: If name is meaningful (not "overview" or generic), use it
  const nameLower = name.toLowerCase().trim();
  const isGenericName = nameLower === "overview" || nameLower === moduleCode.toLowerCase();

  if (!isGenericName && name.length > 0) {
    // Use the provided name, just clean it up
    return name
      .trim()
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Priority 2: Use module_code if name is generic or empty
  if (moduleCode && moduleCode.length > 0) {
    // Convert module_code to readable format
    // Examples: "audit_universe" -> "Audit Universe", "risk-kri" -> "Risk KRI"
    return moduleCode
      .replace(/[_-]/g, " ")
      .split(" ")
      .map((word) => {
        // Keep acronyms uppercase (2-3 letter words)
        if (word.length <= 3 && word.toUpperCase() === word) {
          return word.toUpperCase();
        }
        // Capitalize first letter of longer words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  // Fallback: return name as-is
  return name;
};

const ModuleItem = ({
  name,
  description,
  onSelection,
  allowSelect = false,
  backendKey,
  selectedModules = [],
  isParent = false,
  moduleCode = ""
}: {
  name: string;
  description: string;
  onSelection: (key: string) => void;
  allowSelect?: boolean;
  backendKey: string;
  selectedModules?: string[];
  isParent?: boolean;
  moduleCode?: string;
}) => {
  const displayName = formatModuleName(name, moduleCode);

  return (
    <Label
      key={name}
      htmlFor={backendKey}
      className={cn(
        "hover:bg-primary/10 border-primary/10 bg-primary/5 relative flex w-full cursor-pointer justify-start gap-2 gap-x-2 rounded-lg border p-3",
        isParent && "border-primary/30 bg-primary/10 font-semibold"
      )}>
      <Checkbox
        id={backendKey}
        checked={selectedModules?.includes(backendKey)}
        onCheckedChange={(checked) => {
          if (!allowSelect) return;
          onSelection(backendKey);
        }}
        disabled={!allowSelect}
        className="absolute top-3 right-2 h-4 w-4"
      />
      <div className="flex items-center justify-center gap-3 rounded">
        <div
          className={cn(
            "bg-primary flex h-8 w-8 items-center justify-center rounded",
            isParent && "bg-primary/80"
          )}>
          <PuzzleIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex w-max flex-col items-start justify-start">
          <span className={cn("text-sm font-medium text-gray-900", isParent && "text-base")}>
            {displayName}
          </span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>
    </Label>
  );
};

export function ModuleSelection({
  departmentId,
  department,
  allowSelect = true
}: {
  departmentId?: string;
  department: Department;
  allowSelect?: boolean;
}) {
  const { checkPermission } = usePermissions();
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
        ? (modulesResponse.data?.data as any[]).map((module: any) => ({
            id: module.id,
            name: module.name,
            module_code: module.module_code || module.code || "",
            href: module.href || "",
            parent_module_id: module.parent_module_id || null,
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
      toast.error("Failed to save module assignments");
    }
  });

  const handleSave = () => {
    if (!checkPermission("DEPT_MGMT", "can_edit")) return;
    saveModulesMutation.mutate();
  };

  const isLoading = modulesLoading || departmentModulesLoading;
  const isSaving = saveModulesMutation.isPending;

  // Helper to categorize modules based on their route and parent-child relationships
  const categorizeModules = useMemo(() => {
    // Initialize categories in the desired order
    const categorized: Record<
      string,
      { parent: AppModule | null; children: AppModule[]; parentId?: string; order: number }
    > = {
      Risk: { parent: null, children: [], order: 1 },
      Audit: { parent: null, children: [], order: 2 },
      "System Configuration": { parent: null, children: [], order: 3 },
      Other: { parent: null, children: [], order: 4 }
    };

    // First pass: identify parent modules (modules with no parent_module_id)
    const parentModules = modules.filter((m) => !m.parent_module_id);
    const childModules = modules.filter((m) => m.parent_module_id);

    // Categorize parent modules based on their href
    parentModules.forEach((module) => {
      const hrefValue = (module.href || "").toLowerCase();
      const moduleCodeValue = (module.module_code || "").toLowerCase();

      let category = "Other";

      // Determine category based on href path
      if (hrefValue.includes("/risk")) {
        category = "Risk";
      } else if (hrefValue.includes("/audit")) {
        category = "Audit";
      } else if (hrefValue.includes("/system-config")) {
        category = "System Configuration";
      }
      // Fallback to module_code if no href match
      else if (moduleCodeValue.includes("risk")) {
        category = "Risk";
      } else if (moduleCodeValue.includes("audit")) {
        category = "Audit";
      } else if (
        moduleCodeValue.includes("system") ||
        moduleCodeValue.includes("config") ||
        moduleCodeValue.includes("setting")
      ) {
        category = "System Configuration";
      }

      categorized[category].parent = module;
      categorized[category].parentId = module.id;
    });

    // Categorize child modules based on their parent's category
    childModules.forEach((module) => {
      const hrefValue = (module.href || "").toLowerCase();
      const moduleCodeValue = (module.module_code || "").toLowerCase();

      // Find parent's category
      let category = "Other";
      const parentId = module.parent_module_id;

      // Check if this child belongs to any of our identified parents
      for (const [catName, catData] of Object.entries(categorized)) {
        if (catData.parentId === parentId) {
          category = catName;
          break;
        }
      }

      // If parent not found in our categories, determine by href/module_code
      if (category === "Other") {
        if (hrefValue.includes("/risk") || moduleCodeValue.includes("risk")) {
          category = "Risk";
        } else if (hrefValue.includes("/audit") || moduleCodeValue.includes("audit")) {
          category = "Audit";
        } else if (hrefValue.includes("/system-config")) {
          category = "System Configuration";
        }
      }

      categorized[category].children.push(module);
    });

    return categorized;
  }, [modules]);

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => {
      const isCurrentlySelected = prev.includes(moduleId);
      const clickedModule = modules.find((m) => m.backendKey === moduleId);

      if (!clickedModule) return prev;

      // Check if this is a parent module (no parent_module_id)
      const isParentModule = !clickedModule.parent_module_id;

      // Find all children of this module (if it's a parent)
      const childModuleIds = isParentModule
        ? modules.filter((m) => m.parent_module_id === moduleId).map((m) => m.backendKey)
        : [];

      // Find the parent of this module (if it's a child)
      const parentModuleId = clickedModule.parent_module_id;

      if (isCurrentlySelected) {
        // DESELECTING
        if (isParentModule) {
          // Deselecting a parent: remove parent and ALL its children
          return prev.filter((id) => id !== moduleId && !childModuleIds.includes(id));
        } else {
          // Deselecting a child: only remove this child (keep parent and other children)
          return prev.filter((id) => id !== moduleId);
        }
      } else {
        // SELECTING
        if (isParentModule) {
          // Selecting a parent: add parent and ALL its children
          const newSelection = [moduleId, ...childModuleIds.filter((id) => !prev.includes(id))];
          return [...prev, ...newSelection.filter((id) => !prev.includes(id))];
        } else {
          // Selecting a child: add child AND ensure parent is selected
          const newSelection = [moduleId];

          // Always include the parent if not already selected
          if (parentModuleId && !prev.includes(parentModuleId)) {
            newSelection.push(parentModuleId);
          }

          return [...prev, ...newSelection.filter((id) => !prev.includes(id))];
        }
      }
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="space-y-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex w-full flex-col gap-4">
          {/* Info Banner Skeleton */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <Skeleton className="mb-2 h-5 w-64" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Module Categories Skeleton */}
            {[...Array(3)].map((_, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 h-px flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <div className="bg-primary/20 h-px flex-1" />
                </div>

                {/* Parent Module with Children */}
                <div className="border-primary/20 rounded-lg border-2 border-dashed p-4">
                  {/* Parent Module Item */}
                  <div className="hover:bg-primary/10 border-primary/30 bg-primary/10 relative flex w-full gap-2 rounded-lg border p-3">
                    <Skeleton className="h-4 w-4 absolute top-3 right-2 rounded" />
                    <div className="flex items-center justify-center gap-3 rounded">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="flex w-max flex-col items-start justify-start gap-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>

                  {/* Child Modules */}
                  <div className="border-primary/20 mt-3 ml-4 space-y-2 border-l-2 pl-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[...Array(4)].map((_, childIndex) => (
                        <div
                          key={childIndex}
                          className="hover:bg-primary/10 border-primary/10 bg-primary/5 relative flex w-full gap-2 rounded-lg border p-3">
                          <Skeleton className="h-4 w-4 absolute top-3 right-2 rounded" />
                          <div className="flex items-center justify-center gap-3 rounded">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="flex w-max flex-col items-start justify-start gap-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button Area Skeleton */}
          <div className="space-y-3">
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Department Modules</h4>
        <p className="text-muted-foreground text-sm">
          List of all the modules accessible to this department
        </p>
      </div>
      <div className="flex w-full flex-col gap-4">
        {isSaving && (
          <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
            <Spinner className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">Saving changes...</span>
          </div>
        )}

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

        <div className={cn("space-y-6", modules.length === 0 && "place-items-center")}>
          {modules && modules.length > 0 ? (
            <>
              {/* Sort categories by order and render */}
              {Object.entries(categorizeModules)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([categoryName, category]) => {
                  const hasContent = category.parent || category.children.length > 0;
                  if (!hasContent) return null;

                  return (
                    <div key={categoryName} className="space-y-3">
                      {/* Category Header */}
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 h-px flex-1" />
                        <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          {categoryName}
                        </h4>
                        <div className="bg-primary/20 h-px flex-1" />
                      </div>

                      {/* Parent Module */}
                      {category.parent && (
                        <div className="border-primary/20 rounded-lg border-2 border-dashed p-4">
                          <ModuleItem
                            key={category.parent.backendKey + "-parent"}
                            name={category.parent.name}
                            moduleCode={category.parent.module_code || ""}
                            description={category.parent.description || "Main Module"}
                            allowSelect={allowSelect}
                            backendKey={category.parent.backendKey}
                            selectedModules={selectedModules}
                            onSelection={handleModuleToggle}
                            isParent={true}
                          />

                          {/* Child Modules */}
                          {category.children.length > 0 && (
                            <div className="border-primary/20 mt-3 ml-4 space-y-2 border-l-2 pl-4">
                              <p className="text-muted-foreground mb-2 text-xs">Sub-modules:</p>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {category.children.map((child) => (
                                  <ModuleItem
                                    key={child.backendKey + "-child"}
                                    name={child.name}
                                    moduleCode={child.module_code || ""}
                                    description={child.description || "No Description"}
                                    allowSelect={allowSelect}
                                    backendKey={child.backendKey}
                                    selectedModules={selectedModules}
                                    onSelection={handleModuleToggle}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Standalone modules (no parent) */}
                      {!category.parent && category.children.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {category.children.map((module) => (
                            <ModuleItem
                              key={module.backendKey + "-standalone"}
                              name={module.name}
                              moduleCode={module.module_code || ""}
                              description={module.description || "No Description"}
                              allowSelect={allowSelect}
                              backendKey={module.backendKey}
                              selectedModules={selectedModules}
                              onSelection={handleModuleToggle}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </>
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
          </div>
        )}
      </div>
    </>
  );
}

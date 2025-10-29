"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PencilLine, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { AuditableArea as Area, Pagination } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input-field";
import {
  updateDepartment,
  deleteDepartment,
  createDepartment
} from "@/app/_actions/config-actions";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import CustomAlert from "@/components/ui/custom-alert";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { useDepartments } from "@/hooks/use-query-data";
import { Textarea } from "@/components/ui/textarea";
import type {
  Workpaper,
  AuditPlan,
  CustomTemplate,
  WorkpaperTemplate
} from "@/lib/types/audit-types";
import { WorkpaperTemplateDialog } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-template-dialog";
import { WorkpaperTemplatesTable } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-templates-table";

interface WorkingPaperTemplate {
  id: string;
  name: string;
  standard: string;
  description?: string;
  is_active?: boolean;
}

interface WorkpapersPageClientProps {
  templates?: WorkingPaperTemplate[];
}

// Mock custom templates - replace with actual data fetch
const mockCustomTemplates: CustomTemplate[] = [
  {
    id: "custom-1",
    name: "IT Security Assessment",
    description: "Comprehensive IT security controls testing template",
    type: "custom",
    createdBy: "John Doe",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
    isPublic: true,
    includeEvidenceGrid: false,
    sections: [
      {
        id: "sec-1",
        title: "Scope & Objectives",
        description: "Define assessment scope",
        order: 0,
        fields: [
          {
            id: "field-1",
            label: "Assessment Scope",
            type: "textarea",
            required: true,
            placeholder: "Describe the scope...",
            order: 0
          },
          {
            id: "field-2",
            label: "Risk Level",
            type: "select",
            required: true,
            options: ["Low", "Medium", "High", "Critical"],
            order: 1
          }
        ]
      }
    ],
    usageCount: 15
  }
];

export default function WorkpaperTemplatesTab({
  templates,
  pagination
}: {
  templates: Area[];
  pagination?: Pagination;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Area | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const [items, setItems] = useState<Area[]>(templates);

  useEffect(() => {
    setItems(templates);
  }, [templates]);

  const router = useRouter();
  const queryClient = useQueryClient();

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Area deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
      } else {
        toast.error(response.message || "Failed to delete item");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete item");
      console.error("Error deleting item:", error);
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  });

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Opens the delete item dialog for the item with the given id.
   * @param {string} id - The id of the item to delete.
   */
  /*******  7df535e1-228a-4281-91c5-50dc0fe4cb5b  *******/
  const handleDeleteClick = (id: string) => {
    setDepartmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;
    // if (true) {
    //   return toast.warning("This action currently is disabled");
    // }
    deleteMutation.mutate(departmentToDelete as any);
  };

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Workpaper Templates</h3>
          <Button className="gap-2" onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Workpaper Template
          </Button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Results Summary */}
            {templates && templates.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Showing {templates.length} workpaper{templates.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Table */}
            <WorkpaperTemplatesTable
              templates={templates || []}
              // onCreateClick={handleOpenCreateDialog}
            />
          </div>
        </div>

        {/* Create Workpaper Template Selection Dialog */}
        <WorkpaperTemplateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          // audits={audits}
          customTemplates={mockCustomTemplates}
        />
      </div>

      <CreateOrUpdateArea
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingDepartment}
        departmentId={editingDepartment?.id}
        setInitialData={setEditingDepartment}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Area"
        description="Are you sure you want to delete this item? This action cannot be undone and may affect related data."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

type ErrorState = {
  status: boolean;
  message: string;
  onParentId?: boolean;
};

const INIT_AREA: Area = {
  id: undefined,
  name: "",
  description: "",
  department_id: null
  // code: "",
  // is_active: true
};

export function CreateOrUpdateArea({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  departmentId,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  departmentId?: string;
  initialData?: Area | null;
  setInitialData?: React.Dispatch<React.SetStateAction<Area | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  // Initialize with initialData if provided, otherwise use INIT_AREA
  const [formData, setFormData] = useState<Area>(() => {
    if (initialData && departmentId) {
      return {
        id: initialData.id,
        name: initialData.name || "",
        department_id: initialData.department_id || "",
        description: initialData.description || ""
        // parent_id: initialData.parent_id || undefined,
        // is_active: initialData.is_active || true
      } as Area;
    }
    return INIT_AREA;
  });

  const { data } = useDepartments({
    isActive: true,
    page_size: 100,
    page: 1
  });

  const items = (data?.data?.data || []) as Area[];

  // Update form when initialData changes
  useEffect(() => {
    console.log("🔄 Effect triggered:", { initialData, departmentId, openModal });

    if (openModal) {
      if (initialData && departmentId) {
        setFormData({
          id: initialData.id,
          name: initialData.name || "",
          department_id: initialData.department_id || "",
          description: initialData.description || ""
          // parent_id: initialData.parent_id || null,
          // is_active: initialData.is_active || true
        });
      } else if (!initialData) {
        // Only reset if no initialData (create mode)
        setFormData(INIT_AREA);
      }
      setError({ status: false, message: "" });
    }
  }, [initialData, departmentId]);

  // Reset form when modal closes (only for client-side modal usage)
  useEffect(() => {
    if (!openModal && setOpenModal) {
      // Only run cleanup if we have modal control (client-side)
      const timer = setTimeout(() => {
        setFormData(INIT_AREA);
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setOpenModal, setInitialData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: Area) => {
      return initialData && departmentId
        ? updateDepartment({ ...data, id: String(departmentId) })
        : createDepartment(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Area ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_AREA);
        setError({ status: false, message: "" });
      } else {
        toast.error(response.message);
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving item:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  const departmentOptions = useMemo(() => {
    return items
      .filter((dept) => dept.id !== departmentId) // Prevent self-parenting
      .map((item) => ({
        id: item?.id as string,
        name: item?.name
      }));
  }, [items, departmentId]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Area
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Area
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Area" : "Create New Area"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Unit/Department"
            placeholder="Select parent unit (optional)"
            value={formData.department_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value || null }));
            }}
            options={departmentOptions}
          />
          <Input
            label="Name"
            placeholder="Area Name"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
            descriptionText="A unique code will be automatically generated from the name"
          />
          <Textarea
            label="Description"
            placeholder="Area description (optional)"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          {/* <div className="flex items-center space-x-2 self-end pl-2">
            <Checkbox
              id="is_active"
              checked={formData?.is_active}
              title="Define whether this item is currently active"
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }) as any)
              }
            />
            <Label
              htmlFor="is_active"
              className="text-foreground cursor-pointer text-sm font-medium text-nowrap">
              Is Active Area
            </Label>
          </div> */}
          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpenModal?.(false);
                  setFormData(INIT_AREA);
                  setError({ status: false, message: "" });
                }}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending || !formData.name.trim()}
              isLoading={saveMutation.isPending}
              loadingText="Saving...">
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

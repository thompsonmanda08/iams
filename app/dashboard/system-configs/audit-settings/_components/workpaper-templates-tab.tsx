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
import { Input } from "@/components/ui/input";
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

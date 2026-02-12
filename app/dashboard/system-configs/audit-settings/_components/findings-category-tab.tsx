"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Edit, Trash2, AlertCircle, PencilLine, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { AuditConfigurableItem, ErrorState, Pagination } from "@/lib/types";
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
  createFindingsCategory,
  updateFindingsCategory,
  deleteFindingsCategory
} from "@/app/_actions/audit-settings-actions";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import CustomAlert from "@/components/ui/custom-alert";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/hooks/use-permissions";

interface CategoryFormData {
  name: string;
  code: string;
  description: string;
  [key: string]: any;
}

const INIT_FORM_DATA: CategoryFormData = {
  name: "",
  code: "",
  description: ""
};

export default function FindingsCategoryTab({
  categories = [],
  pagination
}: {
  categories: CategoryFormData[];
  pagination?: Pagination;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { checkPermission } = usePermissions();
  const [items, setItems] = useState<CategoryFormData[]>(categories);

  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFindingsCategory(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Findings Category deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete category");
      console.error("Error deleting category:", error);
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
      setSelectedId(null);
    }
  });

  const handleDeleteClick = (id: string) => {
    if (!checkPermission("AUDIT_MODULE_CONFIG", "can_delete")) return;
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    deleteMutation.mutate(selectedId);
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Findings Categories</h4>
            <p className="text-muted-foreground text-sm">
              Define categories for classifying audit findings
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (!checkPermission("AUDIT_MODULE_CONFIG", "can_create")) return;
              setFormData(null);
              setOpenModal(true);
            }}>
            <Plus className="h-4 w-4" />
            New Findings Category
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" align="center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <AlertCircle />
                      </EmptyMedia>
                      <EmptyTitle>No findings categories yet</EmptyTitle>
                      <EmptyDescription>
                        You haven&apos;t created any findings categories yet. Get started by
                        creating your first category.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!checkPermission("AUDIT_MODULE_CONFIG", "can_create")) return;
                            setFormData(null);
                            setOpenModal(true);
                          }}>
                          <Plus className="h-4 w-4" /> Create New Findings Category
                        </Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {item.description || "No description provided"}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checkPermission("AUDIT_MODULE_CONFIG", "can_edit")) return;
                          setFormData({ ...item });
                          setSelectedId(item.id);
                          setOpenModal(true);
                        }}
                        className="h-8 gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          handleDeleteClick(String(item.id));
                          e.stopPropagation();
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateOrUpdate
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={formData}
        selectedId={selectedId}
        setInitialData={setFormData}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Findings Category"
        description="Are you sure you want to delete this findings category? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

function CreateOrUpdate({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  selectedId = null,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  selectedId: string | null;
  initialData?: CategoryFormData | null;
  setInitialData?: React.Dispatch<React.SetStateAction<CategoryFormData | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<CategoryFormData>(() => {
    if (initialData && selectedId) {
      return {
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || ""
      };
    }
    return INIT_FORM_DATA;
  });

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          name: initialData.name || "",
          code: initialData.code || "",
          description: initialData.description || ""
        });
      } else if (!initialData) {
        setFormData(INIT_FORM_DATA);
      }
      setError({ status: false, message: "" });
    }
  }, [initialData, selectedId, openModal]);

  useEffect(() => {
    if (!openModal && setOpenModal) {
      const timer = setTimeout(() => {
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setOpenModal, setInitialData]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return initialData && selectedId
        ? updateFindingsCategory({ ...data, id: String(selectedId) })
        : createFindingsCategory(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Findings Category ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FINDINGS_CATEGORIES] });
        router.refresh();
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      } else {
        toast.error(response.message);
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving category:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Findings Category
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Findings Category
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Findings Category" : "Add Findings Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <Input
            label="Category Name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
          />
          <Input
            label="Category Code"
            placeholder="e.g. CAT-001, CAT-002, etc"
            value={formData.code}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, code: e.target.value }));
            }}
            required
          />
          <Textarea
            label="Category Description"
            placeholder="Enter category description"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  setOpenModal?.(false);
                  setFormData(INIT_FORM_DATA);
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
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

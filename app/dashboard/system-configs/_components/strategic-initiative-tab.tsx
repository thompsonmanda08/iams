"use client";

import { useState, useEffect, PropsWithChildren, useCallback, useMemo } from "react";
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
import { Plus, Edit, Trash2, Building, PencilLine, ShieldAlert, ArrowRight } from "lucide-react";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import CustomAlert from "@/components/ui/custom-alert";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { useDepartments } from "@/hooks/use-query-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function StrategicInitiativeTab({
  areas,
  pagination
}: {
  areas: Area[];
  pagination?: Pagination;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Area | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const [items, setItems] = useState<Area[]>(areas);

  useEffect(() => {
    setItems(areas);
  }, [areas]);

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

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Strategic Initiative</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingDepartment(null);
              setOpenModal(true);
            }}>
            <Plus className="h-4 w-4" />
            New Auditable Area
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Auditable Area</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description of Area</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead className="w-24" align="center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Building />
                      </EmptyMedia>
                      <EmptyTitle>No areas yet</EmptyTitle>
                      <EmptyDescription>
                        You haven&apos;t created any areas yet. Get started by creating your first
                        auditable area.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingDepartment(null);
                            setOpenModal(true);
                          }}>
                          <Plus className="h-4 w-4" /> Create New Auditable Area
                        </Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const departmentName =
                  item?.department || "No department assigned - map from departments";
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    // onClick={() => {
                    //   router.push(`/dashboard/system-configs/items/${item.id}`);
                    // }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {item.description || "No description provided"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{departmentName}</span>
                    </TableCell>
                    {/* <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      )}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell> */}
                    <TableCell align="center">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            setEditingDepartment(item);
                            setOpenModal(true);
                            e.stopPropagation();
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
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

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

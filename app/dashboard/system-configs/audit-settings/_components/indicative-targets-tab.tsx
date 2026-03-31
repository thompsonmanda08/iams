"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Building,
  PencilLine,
  ShieldAlert,
  Target,
  Briefcase
} from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { Department, ErrorState, Pagination } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIndicativeTargetsMutations } from "@/hooks/use-audit-settings-mutations";
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
import { useIndicativeTargets } from "@/hooks/use-audit-settings-query-data";
import { Textarea } from "@/components/ui/textarea";
import { QUERY_KEYS } from "@/lib/constants";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";

interface TargetFormData {
  id: string;
  name: string;
  department_id: string;
  description: string;
}

const INIT_FORM_DATA: Omit<TargetFormData, "id"> = {
  name: "",
  description: "",
  department_id: ""
  // code: "",
  // is_active: true
};

export default function IndicativeTargetsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<Omit<TargetFormData, "id"> | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data: indicativeTargetsData, isFetching } = useIndicativeTargets({
    page,
    page_size: pageSize
  });

  const { data: departmentsData } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (departmentsData?.data?.data || []) as Department[];
  const items = indicativeTargetsData?.data || [];
  const pagination = indicativeTargetsData?.pagination;

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    setPage(pageConfig.page);
    if (pageConfig.page_size) {
      setPageSize(pageConfig.page_size);
    }
  };

  const { checkPermission } = usePermissions();
  const { deleteIndicativeTargetMutation } = useIndicativeTargetsMutations();

  const handleDeleteSettled = () => {
    setDeleteDialogOpen(false);
    setSelectedId(null);
  };

  const handleDeleteClick = (id: string) => {
    if (!checkPermission("AUDIT_MODULE_CONFIG", "can_delete")) return;
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    // if (true) {
    //   return toast.warning("This action currently is disabled");
    // }
    deleteIndicativeTargetMutation.mutate({
      id: selectedId,
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedId(null);
      }
    });
  };

  const getDepartmentName = useCallback(
    (departmentId: string) => {
      const department = departments.find((d) => d.id === departmentId);
      return department ? department.name : "No parent department ";
    },
    [departments]
  );

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Indicative Targets</h4>
            <p className="text-muted-foreground text-sm">
              List of all the indicative targets across all departments
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
            New Indicative Target
          </Button>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>INDICATIVE TARGET</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>DEPARTMENT</TableHead>
                <TableHead className="w-24 text-center" align="center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items.length === 0 ? (
                // Show skeleton rows during initial loading
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="bg-muted h-12 animate-pulse rounded" />
                    <TableCell className="bg-muted h-12 animate-pulse rounded" />
                    <TableCell className="bg-muted h-12 animate-pulse rounded" />
                    <TableCell className="bg-muted h-12 animate-pulse rounded" />
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Target />
                        </EmptyMedia>
                        <EmptyTitle>No indicative targets yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any indicative targets yet. Get started by
                          creating your first Indicative Target.
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
                            <Plus className="h-4 w-4" /> Create New Indicative Target
                          </Button>
                        </div>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: any) => {
                  return (
                    <TableRow key={item.id} className="cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Target className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {item.description || "No description provided"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="gap-1 text-xs">
                          <Briefcase className="h-3 w-3" />
                          {getDepartmentName(item.department_id)}
                        </Badge>
                      </TableCell>

                      <TableCell align="center">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!checkPermission("AUDIT_MODULE_CONFIG", "can_edit")) return;
                              setFormData(item);
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && (
        <CustomPagination
          pagination={pagination}
          updatePagination={handlePaginationChange}
          showDetails={true}
          allowSetPageSize={true}
        />
      )}

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
        title="Delete Indicative Target"
        description="Are you sure you want to delete this item? This action cannot be undone and may affect related data."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteIndicativeTargetMutation.isPending}
      />
    </>
  );
}

export function CreateOrUpdate({
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
  initialData?: Omit<TargetFormData, "id"> | null;
  setInitialData?: React.Dispatch<React.SetStateAction<Omit<TargetFormData, "id"> | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  // Initialize with initialData if provided, otherwise use INIT_FORM_DATA
  const [formData, setFormData] = useState<Omit<TargetFormData, "id">>(() => {
    if (initialData && selectedId) {
      return {
        // id: selectedId,
        name: initialData.name || "",
        department_id: initialData.department_id || "",
        description: initialData.description || ""
        // parent_id: initialData.parent_id || undefined,
        // is_active: initialData.is_active || true
      } as TargetFormData;
    }
    return INIT_FORM_DATA;
  });

  const { data } = useDepartments({
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as TargetFormData[];

  // Update form when initialData changes
  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          // id: selectedId,
          name: initialData.name || "",
          department_id: initialData.department_id || "",
          description: initialData.description || ""
          // parent_id: initialData.parent_id || null,
          // is_active: initialData.is_active || true
        });
      } else if (!initialData) {
        // Only reset if no initialData (create mode)
        setFormData(INIT_FORM_DATA);
      }
      setError({ status: false, message: "" });
    }
  }, [initialData, selectedId]);

  // Reset form when modal closes (only for client-side modal usage)
  useEffect(() => {
    if (!openModal && setOpenModal) {
      // Only run cleanup if we have modal control (client-side)
      const timer = setTimeout(() => {
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setOpenModal, setInitialData]);

  const { saveIndicativeTargetMutation } = useIndicativeTargetsMutations();

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveIndicativeTargetMutation.mutate({
      ...formData,
      onSuccess: () => {
        setOpenModal(false);
      },
      onError: (message: string) => {
        setError({ status: true, message });
      }
    } as any);
  }

  const departmentOptions = useMemo(() => {
    return departments
      .filter((dept) => dept.id !== selectedId) // Prevent self-parenting
      .map((item) => ({
        id: item?.id as string,
        name: item?.name
      }));
  }, [departments, selectedId]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Target
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Target
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
          <DialogTitle>{initialData ? "Update Target " : "Create New Target"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Unit/Department"
            placeholder="Select parent unit (optional)"
            value={formData?.department_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
            options={departmentOptions}
            onModal
          />
          <Input
            label="Name"
            placeholder="Enter Target Name"
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
            placeholder="Enter Target description (optional)"
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
              disabled={
                saveIndicativeTargetMutation.isPending ||
                !formData.name.trim() ||
                !formData.department_id.trim() ||
                !formData.description.trim()
              }
              isLoading={saveIndicativeTargetMutation.isPending}
              loadingText="Saving...">
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

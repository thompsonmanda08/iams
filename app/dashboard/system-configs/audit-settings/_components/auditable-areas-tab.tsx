"use client";

import { useState, useEffect, PropsWithChildren, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRight,
  Cable,
  Briefcase
} from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { AuditConfigurableItem, Department, Pagination } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuditableAreasMutations } from "@/hooks/use-audit-settings-mutations";
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
import { useAuditableAreas } from "@/hooks/use-audit-settings-query-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { set } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";

interface AreaFormData {
  name: string;
  department_id: string;
  description: string;
}

const INIT_FORM_DATA: AreaFormData = {
  name: "",
  department_id: "",
  description: ""
};

export default function AuditableAreaConfig() {
  const { checkPermission } = usePermissions();
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<Omit<AuditConfigurableItem, "id"> | null>(
    INIT_FORM_DATA
  );
  const [areaId, setAreaId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  const { data: areasData, isFetching } = useAuditableAreas({ page, page_size: pageSize });

  const items = areasData?.data || [];
  const paginationData = areasData?.pagination;

  const router = useRouter();

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    setPage(pageConfig.page);
    if (pageConfig.page_size) {
      setPageSize(pageConfig.page_size);
    }
  };

  // Delete item mutation
  const { deleteAuditableAreaMutation } = useAuditableAreasMutations();

  const handleDeleteClick = (id: string) => {
    if (!checkPermission("AUDIT_MODULE_CONFIG", "can_delete")) return;
    setAreaId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!areaId) return;
    // if (true) {
    //   return toast.warning("This action currently is disabled");
    // }
    deleteAuditableAreaMutation.mutate({
      id: areaId,
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setAreaId(null);
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
            <h4 className="text-sm leading-none font-medium">Auditable Areas</h4>
            <p className="text-muted-foreground text-sm">
              List of all the auditable areas across all departments
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
            New Auditable Area
          </Button>
        </div>

        <div className="bg-card rounded-lg border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">AUDITABLE AREA</TableHead>
                <TableHead className="w-1/3">DESCRIPTION</TableHead>
                <TableHead className="w-1/4">DEPARTMENT</TableHead>
                <TableHead className="w-[120px] text-center" align="center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items?.length === 0 ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="p-3 align-top">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="p-3 align-top">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="p-3 align-top">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : !items || items?.length === 0 ? (
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
                              if (!checkPermission("AUDIT_MODULE_CONFIG", "can_create")) return;
                              setFormData(null);
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
                items &&
                items?.map((item: any) => {
                  return (
                    <TableRow key={item.id} className="cursor-pointer">
                      <TableCell className="p-3 align-top">
                        <div className="flex min-w-0 items-start gap-2">
                          <Building className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                          <div className="line-clamp-6 min-w-0 flex-1 font-medium">
                            {item.name || item?.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 align-top">
                        <div className="line-clamp-6 min-w-0 font-mono text-sm">
                          {item.description || "No description provided"}
                        </div>
                      </TableCell>
                      <TableCell className="p-3 align-top">
                        <Badge variant="info" className="gap-1 text-xs">
                          <Briefcase className="h-3 w-3" />
                          {getDepartmentName(item.department_id)}
                        </Badge>
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
                              e.stopPropagation();
                              if (!checkPermission("AUDIT_MODULE_CONFIG", "can_edit")) return;
                              setFormData(item);
                              setAreaId(item.id);
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
      {paginationData && (
        <CustomPagination
          pagination={paginationData}
          updatePagination={handlePaginationChange}
          showDetails={true}
          allowSetPageSize={true}
        />
      )}

      <CreateOrUpdateArea
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={formData}
        areaId={areaId}
        setInitialData={setFormData}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Area"
        description="Are you sure you want to delete this item? This action cannot be undone and may affect related data."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteAuditableAreaMutation.isPending}
      />
    </>
  );
}

type ErrorState = {
  status: boolean;
  message: string;
  onParentId?: boolean;
};

const INIT_AREA: Omit<AuditConfigurableItem, "id"> = {
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
  areaId = null,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  areaId: string | null;
  initialData?: Omit<AuditConfigurableItem, "id"> | null;
  setInitialData?: React.Dispatch<React.SetStateAction<Omit<AuditConfigurableItem, "id"> | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  // Initialize with initialData if provided, otherwise use INIT_AREA
  const [formData, setFormData] = useState<Omit<AuditConfigurableItem, "id">>(() => {
    if (initialData && areaId) {
      return {
        // id: areaId,
        name: initialData.name || "",
        department_id: initialData.department_id || "",
        description: initialData.description || ""
        // parent_id: initialData.parent_id || undefined,
        // is_active: initialData.is_active || true
      } as AuditConfigurableItem;
    }
    return INIT_AREA;
  });

  const { data } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const items = (data?.data?.data || []) as AuditConfigurableItem[];

  // Update form when initialData changes
  useEffect(() => {
    if (openModal) {
      if (initialData && areaId) {
        setFormData({
          // id: areaId,
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
  }, [initialData, areaId]);

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
  const router = useRouter();
  const { saveAuditableAreaMutation } = useAuditableAreasMutations();

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveAuditableAreaMutation.mutate({
      ...formData,
      onSuccess: () => {
        setOpenModal?.(false);
      },
      onError: (message: string) => {
        setError({ status: true, message });
      }
    } as any);
  }

  const departmentOptions = useMemo(() => {
    return [
      { id: "", name: "None (no department)" },
      ...items
        .filter((dept) => dept.id !== formData.department_id)
        .map((item) => ({ id: item?.id as string, name: item?.name }))
    ];
  }, [items, areaId]);

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
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Area" : "Create New Area"}</DialogTitle>
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
              Is Active AuditConfigurableItem
            </Label>
          </div> */}
          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
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
              disabled={saveAuditableAreaMutation.isPending || !formData.name.trim()}
              isLoading={saveAuditableAreaMutation.isPending}
              loadingText="Saving...">
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

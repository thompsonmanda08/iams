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
import { Plus, Edit, Trash2, Target, PencilLine, ShieldAlert, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { AuditConfigurableItem, Department, ErrorState, Pagination } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { QUERY_KEYS } from "@/lib/constants";
import { useStrategicPillarsMutations } from "@/hooks/use-audit-settings-mutations";
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
import { useStrategicPillars } from "@/hooks/use-audit-settings-query-data";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { usePermissions } from "@/hooks/use-permissions";

interface PillarFormData extends Omit<AuditConfigurableItem, "id"> {
  start_date?: string;
  end_date?: string;
}

const INIT_FORM_DATA: PillarFormData = {
  title: "",
  description: "",
  department_id: null,
  start_date: "",
  end_date: ""
};

export default function StrategicPillarsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<PillarFormData | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data: pillarsData, isFetching } = useStrategicPillars(undefined, {
    page,
    page_size: pageSize
  });
  const items = pillarsData?.data || [];
  const paginationData = pillarsData?.pagination;

  const { data } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  const router = useRouter();

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const newPageSize = pageConfig.page_size || pageSize || 15;
    setPage(pageConfig.page);
    setPageSize(newPageSize);
  };

  const { checkPermission } = usePermissions();
  const { deleteStrategicPillarMutation } = useStrategicPillarsMutations();

  const handleDeleteClick = (id: string) => {
    if (!checkPermission("AUDIT_MODULE_CONFIG", "can_delete")) return;
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    deleteStrategicPillarMutation.mutate({
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
      return department ? department.name : "No parent department";
    },
    [departments]
  );

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Strategic Pillars</h4>
            <p className="text-muted-foreground text-sm">
              Define strategic pillars that guide your organization&apos;s direction
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
            New Strategic Pillar
          </Button>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STRATEGIC PILLAR</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>DEPARTMENT</TableHead>
                <TableHead>DURATION</TableHead>
                <TableHead className="w-24 text-center" align="center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Building2 />
                        </EmptyMedia>
                        <EmptyTitle>No strategic pillars yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any strategic pillars yet. Get started by
                          creating your first strategic pillar.
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
                            <Plus className="h-4 w-4" /> Create New Strategic Pillar
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
                          <Building2 className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {item.description || "No description provided"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {getDepartmentName(item.department_id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {item.start_date && item.end_date
                            ? `${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()}`
                            : "No duration set"}
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
      {paginationData && (
        <CustomPagination
          pagination={paginationData}
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
        title="Delete Strategic Pillar"
        description="Are you sure you want to delete this strategic pillar? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteStrategicPillarMutation.isPending}
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
  initialData?: PillarFormData | null;
  setInitialData?: React.Dispatch<React.SetStateAction<PillarFormData | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<PillarFormData>(() => {
    if (initialData && selectedId) {
      return {
        title: initialData.title || "",
        department_id: initialData.department_id || "",
        description: initialData.description || "",
        start_date: (initialData as any).start_date || "",
        end_date: (initialData as any).end_date || ""
      };
    }
    return INIT_FORM_DATA;
  });

  const { data } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          title: initialData.title || "",
          department_id: initialData.department_id || "",
          description: initialData.description || "",
          start_date: (initialData as any).start_date || "",
          end_date: (initialData as any).end_date || ""
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

  const { saveStrategicPillarMutation } = useStrategicPillarsMutations();

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveStrategicPillarMutation.mutate({
      ...formData,
      ...(initialData && selectedId && { id: String(selectedId) }),
      onSuccess: () => {
        setOpenModal?.(false);
      },
      onError: (message: string) => {
        setError({ status: true, message });
      }
    });
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Strategic Pillar
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Strategic Pillar
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
            {initialData ? "Update Strategic Pillar" : "Add Strategic Pillar"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Area"
            placeholder="--Select Functional Area--"
            value={formData?.department_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
            options={departments as any}
          />
          <Input
            label="Strategic Pillar"
            placeholder="Strategic Pillar Title"
            value={formData.title}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, title: e.target.value }));
            }}
            required
          />
          <Textarea
            label="Strategic Pillar Description"
            placeholder="strategic pillar description"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          <div>
            <label className="mb-2 block text-sm font-medium">
              Strategic Pillar Duration (Start - End Dates)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                type="date"
                // label="Start Date"
                placeholder="Start Date"
                value={
                  formData.start_date
                    ? (new Date(formData.start_date) as unknown as any)
                    : undefined
                }
                onValueChange={(date) => {
                  setError({ status: false, message: "" });
                  setFormData((c) => ({
                    ...c,
                    start_date: date?.toISOString() || ""
                  }));
                }}
              />
              <DatePicker
                type="date"
                // label="End Date"
                placeholder="Start Date"
                value={
                  formData.end_date ? (new Date(formData.end_date) as unknown as any) : undefined
                }
                onValueChange={(date) => {
                  setError({ status: false, message: "" });
                  setFormData((c) => ({
                    ...c,
                    end_date: date?.toISOString() || ""
                  }));
                }}
              />
            </div>
          </div>
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
                Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={saveStrategicPillarMutation.isPending || !formData.title.trim()}
              isLoading={saveStrategicPillarMutation.isPending}
              loadingText="Saving...">
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

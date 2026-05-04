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
  Workflow,
  PencilLine,
  ShieldAlert,
  X,
  Briefcase,
  Cable
} from "lucide-react";
import { notify } from "@/lib/utils";
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
import { useProcessActivitiesMutations } from "@/hooks/use-audit-settings-mutations";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAuditableAreas,
  useStrategicPillars,
  useProcessActivities
} from "@/hooks/use-audit-settings-query-data";
import { de } from "zod/v4/locales";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

interface ProcessFormData {
  id?: string;
  title: string;
  description: string;
  strategic_pillar_id: string;
  auditable_area_id: string;
  department_id: string;
}

const INIT_FORM_DATA: ProcessFormData = {
  title: "",
  description: "",
  strategic_pillar_id: "",
  department_id: "",
  auditable_area_id: ""
};

export default function ProcessActivityTab() {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<ProcessFormData | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const router = useRouter();

  const { data: processesData, isFetching } = useProcessActivities({
    page,
    page_size: pageSize
  });

  const items = processesData?.data || [];
  const paginationData = processesData?.pagination;

  const { data } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    setPage(pageConfig.page);
    if (pageConfig.page_size) {
      setPageSize(pageConfig.page_size);
    }
  };

  const { checkPermission, hasPermission } = usePermissions();
  const { deleteProcessActivityMutation } = useProcessActivitiesMutations();

  const handleDeleteClick = (id: string) => {
    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_delete")) return;
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    deleteProcessActivityMutation.mutate({
      id: selectedId,
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedId(null);
      }
    });
  };

  const { data: pillarsResponse } = useStrategicPillars(undefined, {
    page: 1,
    page_size: 300
  });
  const pillars = pillarsResponse?.data || [];

  const { data: areasResponse } = useAuditableAreas({ page: 1, page_size: 300 });
  const areas = areasResponse?.data || [];

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "No parent department";
  };
  const getPillarName = useCallback((pillarId: string) => {
    const pillar = pillars.find((d: any) => d.id === pillarId);
    return pillar ? pillar.title : "No parent pillar";
  }, []);

  const getAuditableArea = useCallback((auditableAreaId: string) => {
    const auditableArea = areas.find((d: any) => d.id === auditableAreaId);
    return auditableArea ? auditableArea.name : "No auditable area assigned";
  }, []);

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Process/Activity</h4>
            <p className="text-muted-foreground text-sm">
              Manage business processes and their associated activities
            </p>
          </div>
          <PermissionButton moduleCode={MODULE_CODES.AUDIT_MODULE_CONFIG} action="can_create"
            size="sm"
            onClick={() => {
  setFormData(null);
              setOpenModal(true);
}}>
            <Plus className="h-4 w-4" />
            New Process/Activity
          </PermissionButton>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PROCESS NAME / ACTIVITY</TableHead>
                <TableHead>DEPARTMENT</TableHead>
                <TableHead>STRATEGIC PILLAR</TableHead>
                <TableHead>AUDITABLE AREA</TableHead>
                <TableHead className="text-right" align="center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items.length === 0 ? (
                <>
                  {[...Array(8)].map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-16 rounded-md" />
                          <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Workflow />
                        </EmptyMedia>
                        <EmptyTitle>No processes yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any processes yet. Get started by creating your
                          first process/activity.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <div className="flex gap-2">
                          <PermissionButton moduleCode={MODULE_CODES.AUDIT_MODULE_CONFIG} action="can_create"
                            size="sm"
                            onClick={() => {
  setFormData(null);
                              setOpenModal(true);
}}>
                            <Plus className="h-4 w-4" /> Create New Process/Activity
                          </PermissionButton>
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
                          <Workflow className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="gap-1 text-xs">
                          <Briefcase className="h-3 w-3" />
                          {item?.department_name || "No parent department"}
                        </Badge>
                        <span className="font-mono text-sm"></span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="gap-1 text-xs">
                          <Cable className="h-3 w-3" />
                          {item.strategic_pillar_name || "No strategic pillar"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" className="gap-1 text-xs">
                          <Cable className="h-3 w-3" />
                          {item.auditable_area_name || "No auditable area assigned"}
                        </Badge>
                      </TableCell>

                      <TableCell align="center">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_edit")) return;
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
        title="Delete Process/Activity"
        description="Are you sure you want to delete this process? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteProcessActivityMutation.isPending}
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
  initialData?: ProcessFormData | null;
  setInitialData?: React.Dispatch<React.SetStateAction<ProcessFormData | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useDepartments({
    page: 1,
    page_size: 100
  });

  const departments = departmentsResponse?.data?.data || [];

  const [formData, setFormData] = useState<ProcessFormData>(() => {
    if (initialData && selectedId) {
      return {
        title: initialData.title || "",
        description: initialData.description || "",
        department_id: initialData.department_id || "",
        auditable_area_id: (initialData as any).auditable_area_id || "",
        strategic_pillar_id: (initialData as any).pillar_id || ""
      };
    }
    return INIT_FORM_DATA;
  });

  const { data: areasResponse, isLoading: isLoadingAreas } = useAuditableAreas({
    department_id: formData?.department_id || ""
  });
  const auditableAreas = areasResponse?.data || [];

  const { data: pillarsResponse, isLoading: isLoadingPillars } = useStrategicPillars(undefined, {
    page: 1,
    page_size: 100,
    department_id: formData?.department_id || ""
  });
  const pillars = pillarsResponse?.data || [];

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          ...initialData
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

  const { saveProcessActivityMutation } = useProcessActivitiesMutations();

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveProcessActivityMutation.mutate({
      ...formData,
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
                <PencilLine className="mr-2 h-4 w-4" /> Update Process/Activity
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Process/Activity
              </>
            )}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="flex flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Process/Activity" : "Add Process/Activity"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          {/* DEPARTMENT */}
          <SearchSelectField
            label="Functional Area"
            placeholder="--Select Functional Area--"
            value={formData?.department_id || ""}
            isLoading={isLoadingDepartments}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
            options={departments as any}
            onModal
          />
          {/* PILLAR */}
          <SearchSelectField
            label="Strategic Pillar"
            placeholder="--Select Strategic Pillar--"
            value={formData?.strategic_pillar_id || ""}
            isLoading={isLoadingPillars}
            listItemName="title"
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, strategic_pillar_id: value }));
            }}
            options={pillars as any}
            onModal
          />
          {/* AUDITABLE AREA */}
          <SearchSelectField
            label="Auditable Area"
            placeholder="--Select Auditable Area--"
            value={formData?.auditable_area_id || ""}
            isLoading={isLoadingAreas}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, auditable_area_id: value }));
            }}
            options={auditableAreas as any}
            onModal
          />

          <Input
            label="Process/Activity Title"
            placeholder={`E.g. Financial Management Process`}
            value={formData.title || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, title: e.target.value }));
            }}
          />

          <Textarea
            label="Process/Activity Description"
            placeholder="E.g. To determine the usage of ..."
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
                Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={
                saveProcessActivityMutation.isPending ||
                !formData.title ||
                !formData.description ||
                !formData.department_id ||
                !formData.strategic_pillar_id ||
                !formData.auditable_area_id
              }
              isLoading={saveProcessActivityMutation.isPending}
              loadingText="Saving...">
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

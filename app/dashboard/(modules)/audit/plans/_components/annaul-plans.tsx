"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Plus, Edit, Trash2, Lightbulb, PencilLine, ShieldAlert, RefreshCcw } from "lucide-react";
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
import {
  createStrategicInitiative,
  updateStrategicInitiative,
  deleteStrategicInitiative
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
import { SearchSelectField } from "@/components/ui/search-select-field";
import { useDepartments } from "@/hooks/use-query-data";
import { useStrategicPillars } from "@/hooks/use-audit-settings-query-data";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import Loader from "@/components/ui/loader";

const years = Array.from({ length: 20 }).map((_, index: number) => {
  return { id: String(2025 + index), name: String(2025 + index) };
});

type AnnualAuditPlan = {
  department_id?: string;
  audit_date?: string;
  items: any;
  [x: string]: any;
};

const INIT_FORM_DATA: AnnualAuditPlan = {
  department_id: undefined,
  audit_date: new Date().toISOString(),
  items: []
};

export default function AuditAnnualPlan({
  plans = []
  // pagination
  // departments
}: {
  plans: AnnualAuditPlan[];
  pagination?: Pagination;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<AnnualAuditPlan | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string>(String(new Date().getFullYear()));
  const [deleteId, setDeleteId] = useState<string>(String(new Date().getFullYear()));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStrategicInitiative(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Strategic Initiative deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete initiative");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete initiative");
      console.error("Error deleting initiative:", error);
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
      setSelectedId(null);
    }
  });

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };
  const handleSelectYear = (id: string) => {
    setSelectedId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Annual Plan Items</h4>
            <p className="text-muted-foreground text-sm">
              Manage annual plans aligned with your organization&apos;s pillars
            </p>
          </div>
          <div className="flex items-end gap-2">
            <SearchSelectField
              placeholder="-- Select Year --"
              value={selectedId}
              onValueChange={handleSelectYear}
              isLoading={false}
              options={years}
            />
            <Button
              size="sm"
              variant={"outline"}
              className="h-9"
              onClick={() => {
                setFormData(null);
                handleSelectYear(String(new Date().getFullYear()));
              }}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setFormData(null);
                setOpenModal(true);
              }}>
              <Plus className="h-4 w-4" />
              Create a Plan
            </Button>
          </div>
        </div>

        {false ? (
          <Loader className="flex items-center justify-center" />
        ) : (
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UNIVERSE ITEMS</TableHead>
                  <TableHead>KRI(s)</TableHead>
                  <TableHead></TableHead>
                  <TableHead>DEPARTMENT</TableHead>
                  <TableHead className="w-24" align="center">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Lightbulb />
                          </EmptyMedia>
                          <EmptyTitle>Select a year</EmptyTitle>
                          <EmptyDescription>
                            If you haven&apos;t created any annual plans yet. Get started by
                            creating your first annual audit plan.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <div className="flex items-center gap-2">
                            <SearchSelectField
                              placeholder="-- Select Year --"
                              value={selectedId}
                              onValueChange={handleSelectYear}
                              isLoading={false}
                              options={years}
                            />
                            <Button
                              size="sm"
                              className="h-9"
                              onClick={() => {
                                setFormData(null);
                                setOpenModal(true);
                              }}>
                              <RefreshCcw className="h-4 w-4" />
                              Create a plan
                            </Button>
                          </div>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((item: any) => {
                    return (
                      <TableRow key={item.id} className="cursor-pointer">
                        <TableCell className="p-3 align-top">
                          <div className="flex min-w-0 items-start gap-2">
                            <Lightbulb className="text-muted-foreground h-4 w-4" />
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
                            {item?.pillar || "No parent pillar"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{item?.department_name}</span>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                setFormData(item);
                                setSelectedId(item.id);
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
          </div>
        )}
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
        title="Delete Strategic Initiative"
        description="Are you sure you want to delete this strategic initiative? This action cannot be undone."
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
  initialData?: AnnualAuditPlan | null;
  setInitialData?: React.Dispatch<React.SetStateAction<AnnualAuditPlan | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<AnnualAuditPlan>(
    initialData && selectedId
      ? {
          department_id: initialData.department_id || "",
          audit_date: initialData?.audit_date || "",
          items: initialData.items || []
        }
      : INIT_FORM_DATA
  );

  const { data } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  const { data: pillarsResponse, isLoading: loadingPillars } = useStrategicPillars(undefined, {
    page: 1,
    page_size: 100,
    department_id: formData?.department_id
  });

  const pillars = pillarsResponse?.data || [];

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          department_id: initialData?.department_id || "",
          audit_date: initialData.audit_date || "",
          items: initialData?.items || ""
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
        ? updateStrategicInitiative({ ...data, id: String(selectedId) })
        : createStrategicInitiative(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Strategic Initiative ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
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
      console.error("Error saving initiative:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();

    saveMutation.mutate(formData);
  }

  const departmentOptions = useMemo(() => {
    return departments.map((dept) => ({
      id: dept?.id as string,
      name: dept?.name
    }));
  }, [departments]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Annual Audit Plan
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Annual Audit Plan
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl!">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Annual Audit Plan" : "Create Annual Audit Plan"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Unit / Department"
            placeholder="--Select Functional Area--"
            value={formData?.department_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
            isLoading={loadingPillars}
            options={departmentOptions}
          />

          {/* <Textarea
            label="Strategic Initiative Description"
            placeholder="Strategic Initiative description"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          /> */}

          <DatePicker
            type="date"
            label="Engagement Date"
            minDate={new Date()}
            value={
              formData.audit_date ? (new Date(formData.audit_date) as unknown as any) : undefined
            }
            onValueChange={(date) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({
                ...c,
                audit_date: date?.toISOString() || ""
              }));
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
              disabled={saveMutation.isPending}
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

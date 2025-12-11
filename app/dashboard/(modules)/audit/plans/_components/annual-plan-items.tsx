"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash2,
  Loader2,
  Plus,
  ClipboardListIcon,
  PencilLine,
  ShieldAlert
} from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import { format } from "date-fns";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { AUDIT_QUERY_KEYS, useDeleteAnnualAuditPlanItem } from "@/hooks/use-audit-query-data";
import { Department, ErrorState } from "@/lib/types";
import { useDepartments } from "@/hooks/use-query-data";
import { useUniverseItems, useUniverses } from "@/hooks/use-audit-settings-query-data";
import { MultiSelectModal } from "@/components/ui/multi-select-modal";
import { useUsers } from "@/hooks/use-users-query-data";
import { User } from "@/lib/types/account";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAnnualAuditPlanItem,
  updateAnnualAuditPlan,
  generateAuditPlanFromItem
} from "@/app/_actions/audit-module-actions";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { DatePicker } from "@/components/ui/date-picker";
import CustomAlert from "@/components/ui/custom-alert";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { useHeadsOfDepartments } from "@/hooks/use-users-query-data";
import { useBudgetLines } from "@/hooks/use-audit-settings-query-data";
import { FRAMEWORK_TYPES } from "@/app/dashboard/system-configs/audit-settings/_components/iso-workpaper-form";
import { useGenerateAuditPlanFromItem } from "@/hooks/use-audit-query-data";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";

type AnnualPlanItem = {
  id?: string;
  department_id: string;
  universe_id: string;
  universe_item_ids: string[];
  engagement_date: string; // YYYY-MM-DD Date
  engagement_end_date: string; // YYYY-MM-DD Date
  responsible_person: string;
  [s: string]: any;
};

interface AnnualAuditPlanItemsTableProps {
  planId: string;
  items: AnnualPlanItem[];
  isLoading?: boolean;
}

const INIT_FORM_DATA: AnnualPlanItem = {
  department_id: "",
  universe_id: "",
  universe_item_ids: [],
  engagement_date: "",
  engagement_end_date: "",
  responsible_person: ""
};

export function AnnualPlanItems({ planId, items, isLoading }: AnnualAuditPlanItemsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<AnnualPlanItem | null>(INIT_FORM_DATA);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<AnnualPlanItem | null>(null);
  const [openAddPlanItemModal, setOpenAddPlanItemModal] = useState(false);

  const handleDeleteClick = (item: AnnualPlanItem) => {
    // Only allow deletion for DRAFT items
    if (item.status !== "DRAFT") {
      toast({
        title: "Cannot Delete",
        description: "Only draft audit items can be deleted.",
        variant: "destructive"
      });
      return;
    }
    setDeleteItem(item);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteAnnualAuditPlanItem(); // DELETE PLAN ITEM

  const handleDeleteConfirm = async () => {
    if (!deleteItem || !deleteItem?.id) return;

    await deleteMutation.mutateAsync({ registerId: planId, itemId: deleteItem?.id });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-foreground/70 font-bold">AUDIT TITLE</TableHead>
            <TableHead className="text-foreground/70 font-bold">STANDARD/FRAMEWORK TYPE</TableHead>
            <TableHead className="text-foreground/70 font-bold">TEAM LEADER</TableHead>
            <TableHead className="text-foreground/70 font-bold">PERIOD</TableHead>
            <TableHead className="text-foreground/70 font-bold">PROGRESS</TableHead>
            <TableHead className="text-foreground/70 font-bold">STATUS</TableHead>
            <TableHead className="text-foreground/70 w-20 text-center font-bold">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ClipboardListIcon />
                    </EmptyMedia>
                    <EmptyTitle>Select a year</EmptyTitle>
                    <EmptyDescription>
                      If you haven&apos;t created any annual plans yet. Get started by creating your
                      first annual audit item.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex items-center gap-2">
                      <CreateOrUpdatePlanItem
                        planId={planId}
                        showTrigger={true}
                        openModal={openAddPlanItemModal}
                        setOpenModal={setOpenAddPlanItemModal}
                      />
                    </div>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => {
                  router.push(`/dashboard/audit/items/engagement/${item.id}`);
                }}>
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      href={`/dashboard/audit/items/engagement/${item.id}`}
                      className="hover:text-primary/80 text-lg font-medium text-blue-500 hover:underline">
                      {item.title}
                    </Link>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {item.audit_scope || "-"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{item.management_standard || " - "}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.team_leader?.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.audit_team_members?.length || 0} Team member
                      {item.audit_team_members?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <p>
                      {item.start_date ? format(new Date(item.start_date), "MMM d, yyyy") : "-"}
                    </p>
                    <p className="text-muted-foreground">
                      {item.end_date ? format(new Date(item.end_date), "MMM d, yyyy") : "-"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-32 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{(item as any).progress || 0}%</span>
                      {(item as any).conformityRate && (
                        <span className="text-green-600">
                          {(item as any).conformityRate}% conform
                        </span>
                      )}
                    </div>
                    <Progress value={(item as any).progress || 0} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1.5" asChild>
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    {item.status === "DRAFT" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(item);
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
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </>
                    )}
                    {item.status === "APPROVED" && (
                      // THIS GENERATES AN ENGAGEMENT PLAN
                      <>
                        <GenerateAuditPlanModal item={item} planId={planId} />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audit item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.title}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-5 w-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateOrUpdatePlanItem
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={formData}
        selectedItemId={formData?.id}
        planId={planId}
        setInitialData={setFormData}
      />
    </div>
  );
}

export function CreateOrUpdatePlanItem({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  selectedItemId = null,
  planId = null,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  selectedItemId?: string | null;
  planId: string | null;
  initialData?: AnnualPlanItem | null;
  setInitialData?: React.Dispatch<React.SetStateAction<AnnualPlanItem | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<AnnualPlanItem>(
    initialData && selectedItemId
      ? {
          department_id: initialData.department_id || "",
          universe_id: initialData.universe_id || "",
          engagement_date: initialData?.engagement_date || "",
          engagement_end_date: initialData?.engagement_end_date || "",
          responsible_person: initialData?.responsible_person || "",
          universe_item_ids: initialData.universe_item_ids || []
        }
      : INIT_FORM_DATA
  );

  const { data, isLoading: loadingDepartments } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  // Fetch users for responsible person selection
  const { data: usersResponse, isLoading: loadingUsers } = useUsers({
    page_size: 100,
    department_id: formData.department_id
  });

  const users = ((usersResponse?.data?.data || []) as User[]) ?? [];

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedItemId) {
        setFormData({
          department_id: initialData.department_id || "",
          universe_id: initialData.universe_id || "",
          engagement_date: initialData?.engagement_date || "",
          engagement_end_date: initialData?.engagement_end_date || "",
          responsible_person: initialData?.responsible_person || "",
          universe_item_ids: initialData.universe_item_ids || []
        });
      } else if (!initialData) {
        setFormData(INIT_FORM_DATA);
      }
      setError({ status: false, message: "" });
    }
  }, [initialData, selectedItemId, openModal]);

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
      return initialData && selectedItemId
        ? updateAnnualAuditPlan(String(planId), { ...data, id: String(selectedItemId) })
        : createAnnualAuditPlanItem(String(planId), data);
    },
    onSuccess: (response) => {
      if (response.success) {
        notify({
          description: `Plan item ${initialData && selectedItemId ? "updated" : "created"} successfully`
        });
        queryClient.invalidateQueries({
          queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, planId, "items"]
        });
        router.refresh();
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      } else {
        notify({
          description: response.message,
          type: "error"
        });
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      notify({
        description: "Oops! Something went wrong.",
        type: "error"
      });
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving:", error);
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

  const usersOptions = useMemo(() => {
    return users.map((user: User) => ({
      id: user.id as string,
      name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email
    }));
  }, [users]);

  // Fetch universe items based on selected universe
  const { data: universeItemsResponse, isLoading: loadingUniverseItems } = useUniverseItems(
    "", //UNIVERSE ID NO REQUIRED
    {
      department_id: formData?.department_id
    }
  );

  const universeItemsData = Array.isArray(universeItemsResponse)
    ? universeItemsResponse
    : Array.isArray(universeItemsResponse?.data)
      ? universeItemsResponse.data
      : [];

  const universeItemsOptions = useMemo(() => {
    return universeItemsData.map((item: any) => ({
      value: item.id,
      label: `${item.kri_name} - (${item.auditable_area_name})`
    }));
  }, [universeItemsData]);

  console.log({ universeItemsData, universeItemsOptions });

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="h-4 w-4" /> Update Plan Item
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create New Plan Item
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl!">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Annual Audit Plan Item" : "Create Annual Audit Plan Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Unit / Department"
            placeholder="--Select Functional Area--"
            value={formData?.department_id || ""}
            isLoading={loadingDepartments}
            options={departmentOptions}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
          />

          <SearchSelectField
            label="Responsible Person"
            placeholder="-- Select Responsible Person --"
            value={formData.responsible_person || ""}
            isLoading={loadingUsers}
            options={usersOptions}
            disabled={loadingUsers || !formData.department_id}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, responsible_person: value }));
            }}
          />

          <MultiSelectModal
            label="Universe Items"
            placeholder="Select universe items to audit"
            value={formData.universe_item_ids}
            onValueChange={(values: string[]) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, universe_item_ids: values }));
            }}
            options={universeItemsOptions}
            disabled={loadingUniverseItems || !formData.department_id}
            isLoading={loadingUniverseItems}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DatePicker
              type="date"
              label="Engagement Date"
              minDate={new Date()}
              value={
                formData.engagement_date
                  ? (new Date(formData.engagement_date) as unknown as any)
                  : undefined
              }
              onValueChange={(date) => {
                setError({ status: false, message: "" });
                const formattedDate = date ? date.toISOString().split("T")[0] : "";
                setFormData((c) => ({
                  ...c,
                  engagement_date: formattedDate
                }));
              }}
            />
            <DatePicker
              type="date"
              label="Engagement End Date"
              minDate={new Date()}
              value={
                formData.engagement_end_date
                  ? (new Date(formData.engagement_end_date) as unknown as any)
                  : undefined
              }
              onValueChange={(date) => {
                setError({ status: false, message: "" });
                const formattedDate = date ? date.toISOString().split("T")[0] : "";
                setFormData((c) => ({
                  ...c,
                  engagement_end_date: formattedDate
                }));
              }}
            />
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

type GenerateAuditPlanFormData = {
  title: string;
  description: string;
  ref_no: string;
  audit_plan_date: Date | null;
  end_date: Date | null;
  audit_area: string;
  audit_scope: string;
  audit_criteria: string;
  audit_objective: string;
  management_standard: string;
  audit_team_members: string[];
  client_representative: string;
  budget_item_ids: string[];
};

const INIT_GENERATE_FORM_DATA: GenerateAuditPlanFormData = {
  title: "",
  description: "",
  ref_no: "",
  audit_plan_date: null,
  end_date: null,
  audit_area: "",
  audit_scope: "",
  audit_criteria: "",
  audit_objective: "",
  management_standard: FRAMEWORK_TYPES[0]?.id || "",
  audit_team_members: [],
  client_representative: "",
  budget_item_ids: []
};

interface GenerateAuditPlanModalProps {
  item: AnnualPlanItem;
  planId: string;
}

export function GenerateAuditPlanModal({ item, planId }: GenerateAuditPlanModalProps) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<GenerateAuditPlanFormData>(INIT_GENERATE_FORM_DATA);
  const queryClient = useQueryClient();

  // Fetch team members for the department
  const { data: teamMemberResponse, isLoading: loadingTeamMembers } = useUsers({
    page_size: 100,
    department_id: item.department_id
  });
  const teamMembers = ((teamMemberResponse?.data?.data || []) as User[]) ?? [];

  // Fetch heads of department for client representative
  const { data: headsOfDepartmentResponse, isLoading: loadingHeads } = useHeadsOfDepartments({
    page_size: 100,
    department_id: item.department_id
  });
  const headsOfDepartment: User[] = ((headsOfDepartmentResponse?.data || []) as User[]) ?? [];

  // Fetch budget lines
  const { data: budgetLinesResponse, isLoading: loadingBudgetLines } = useBudgetLines(
    "" // No budget_id pre-selected
  );
  const budgetLinesData = Array.isArray(budgetLinesResponse?.data?.data)
    ? budgetLinesResponse.data.data
    : Array.isArray(budgetLinesResponse?.data)
      ? budgetLinesResponse?.data
      : Array.isArray(budgetLinesResponse)
        ? budgetLinesResponse
        : [];

  const generateMutation = useGenerateAuditPlanFromItem();

  const handleOpenModal = () => {
    setFormData({
      ...INIT_GENERATE_FORM_DATA,
      title: `${item.title} - Engagement Plan`,
      audit_area: item.audit_area || "",
      audit_scope: item.audit_scope || "",
      audit_criteria: item.audit_criteria || "",
      audit_objective: item.audit_objective || "",
      management_standard: item.management_standard || FRAMEWORK_TYPES[0]?.id || ""
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      ref_no: formData.ref_no,
      audit_plan_date: formData.audit_plan_date?.toISOString() || new Date().toISOString(),
      end_date: formData.end_date?.toISOString().split("T")[0] || "",
      audit_area: formData.audit_area,
      audit_scope: formData.audit_scope,
      audit_criteria: formData.audit_criteria,
      audit_objective: formData.audit_objective,
      management_standard: formData.management_standard,
      audit_team_members: formData.audit_team_members || [],
      client_representative: formData.client_representative,
      budget_item_ids: formData.budget_item_ids || []
    };

    generateMutation.mutate(
      {
        registerId: planId,
        itemId: item.id || "",
        data: payload
      },
      {
        onSuccess: () => {
          setOpenModal(false);
          setFormData(INIT_GENERATE_FORM_DATA);
          queryClient.invalidateQueries({
            queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLAN, planId, "items"]
          });
        }
      }
    );
  };

  const teamMembersOptions = useMemo(() => {
    return teamMembers.map((member) => ({
      value: member.id,
      label: `${member.first_name} ${member.last_name} - (${member.role.name})`
    }));
  }, [teamMembers]);

  const headsOptions = useMemo(() => {
    return headsOfDepartment.map((head) => ({
      id: head.id,
      name: `${head.first_name} ${head.last_name} - (${head.role.name})`
    }));
  }, [headsOfDepartment]);

  const budgetLinesOptions = useMemo(() => {
    return budgetLinesData.map((budgetLine: any) => ({
      value: budgetLine.id,
      label: `${budgetLine.name} (${budgetLine.currency} ${budgetLine.allocated_amount?.toLocaleString("en-GB")}) - ${budgetLine.category}`
    }));
  }, [budgetLinesData]);

  return (
    <>
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal();
        }}
        className="h-8 gap-1.5">
        <ClipboardListIcon className="h-3.5 w-3.5" />
        Generate Plan
      </Button>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Audit Plan from Annual Item</DialogTitle>
            <DialogDescription>
              Create an engagement audit plan from the approved annual audit plan item
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title and Ref No */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="title"
                label="Audit Plan Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Annual Audit Plan 2025"
                required
              />
              <Input
                id="ref_no"
                label="Reference Number"
                value={formData.ref_no}
                onChange={(e) => setFormData({ ...formData, ref_no: e.target.value })}
                placeholder="e.g., AP-2025-001"
                required
              />
            </div>

            {/* Management Standard */}
            <SelectField
              id="management_standard"
              label="Management Standard"
              className="w-full"
              value={formData.management_standard}
              onValueChange={(value) => setFormData({ ...formData, management_standard: value })}
              options={FRAMEWORK_TYPES}
              placeholder="e.g., ISO 27001"
              required
            />

            {/* Description */}
            <Textarea
              id="description"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Comprehensive audit plan..."
              rows={2}
            />

            {/* Audit Area, Scope, Criteria, Objective */}
            <Textarea
              id="audit_area"
              label="Audit Area"
              value={formData.audit_area}
              onChange={(e) => setFormData({ ...formData, audit_area: e.target.value })}
              placeholder="e.g., ISMS based on ISO 27001:2022"
              rows={2}
              required
            />

            <Textarea
              id="audit_scope"
              label="Audit Scope"
              value={formData.audit_scope}
              onChange={(e) => setFormData({ ...formData, audit_scope: e.target.value })}
              placeholder="All information security controls across the organization..."
              rows={3}
              required
            />

            <Input
              id="audit_criteria"
              label="Audit Criteria"
              value={formData.audit_criteria}
              onChange={(e) => setFormData({ ...formData, audit_criteria: e.target.value })}
              placeholder="e.g., ISO 27001:2022 requirements"
              required
            />

            <Textarea
              id="audit_objective"
              label="Audit Objective"
              value={formData.audit_objective}
              onChange={(e) => setFormData({ ...formData, audit_objective: e.target.value })}
              placeholder="Assess compliance with ISO 27001:2022..."
              rows={4}
              required
            />

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DatePicker
                label="Audit Plan Date"
                value={(formData.audit_plan_date ?? undefined) as any}
                onValueChange={(date) =>
                  setFormData({ ...formData, audit_plan_date: date || null })
                }
              />
              <DatePicker
                label="Audit End Date"
                value={(formData.end_date ?? undefined) as any}
                onValueChange={(date) => setFormData({ ...formData, end_date: date || null })}
                required
              />
            </div>

            {/* Team and Stakeholders */}
            <SearchSelectField
              id="client_representative"
              label="Client Representative"
              value={formData.client_representative}
              onValueChange={(v) => setFormData({ ...formData, client_representative: v })}
              placeholder="Choose client representative"
              options={headsOptions}
              isLoading={loadingHeads}
            />

            <MultiSelectModal
              label="Audit Team Members"
              placeholder="Choose team members"
              value={formData.audit_team_members}
              onValueChange={(values: string[]) =>
                setFormData({ ...formData, audit_team_members: values })
              }
              options={teamMembersOptions}
              isLoading={loadingTeamMembers}
            />

            <MultiSelectModal
              label="Budget Lines"
              placeholder="Select budget lines"
              value={formData.budget_item_ids}
              onValueChange={(values: string[]) =>
                setFormData({ ...formData, budget_item_ids: values })
              }
              options={budgetLinesOptions}
              isLoading={loadingBudgetLines}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setOpenModal(false);
                  setFormData(INIT_GENERATE_FORM_DATA);
                }}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={generateMutation.isPending}
                isLoading={generateMutation.isPending}
                loadingText="Generating...">
                Generate Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

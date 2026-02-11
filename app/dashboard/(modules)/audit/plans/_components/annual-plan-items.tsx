"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Trash2,
  Plus,
  ClipboardListIcon,
  PencilLine,
  ShieldAlert,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { AnnualPlanItemWithDetails, UniverseItem, KRIColor } from "@/lib/types/audit-types";
import { format, formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/status-badge";
import {
  AUDIT_QUERY_KEYS,
  useDeleteAnnualAuditPlanItem,
  useCreateOrUpdateAnnualAuditPlanItem
} from "@/hooks/use-audit-query-data";
import { Department, ErrorState } from "@/lib/types";
import { useDepartments } from "@/hooks/use-query-data";
import { useUniverseItems } from "@/hooks/use-audit-settings-query-data";
import { MultiSelectModal } from "@/components/ui/multi-select-modal";
import { useUsers } from "@/hooks/use-users-query-data";
import { User } from "@/lib/types/account";
import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { useHeadsOfDepartments } from "@/hooks/use-users-query-data";
import { useBudgetLines, useBudgets } from "@/hooks/use-audit-settings-query-data";
import { FRAMEWORK_TYPES } from "@/app/dashboard/system-configs/audit-settings/_components/iso-workpaper-form";
import { useGenerateAuditPlanFromItem } from "@/hooks/use-audit-query-data";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TemplateSelectorSimple } from "./template-selector-simple";
import { Badge } from "@/components/ui/badge";

type AnnualPlanItem = {
  id?: string;
  department_id: string;
  universe_item_ids: string[];
  engagement_date: string; // YYYY-MM-DD Date
  engagement_end_date: string; // YYYY-MM-DD Date
  responsible_person: string;
  [s: string]: any;
};

interface AnnualAuditPlanItemsTableProps {
  annualPlan: any;
  planId: string;
  items: AnnualPlanItemWithDetails[];
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

// KRI Color Badge Component
const KRIColorBadge = ({ color }: { color: KRIColor }) => {
  const colorClasses = {
    Red: "bg-red-500",
    Amber: "bg-amber-500",
    Green: "bg-green-500"
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium text-white ${colorClasses[color]}`}>
      {color}
    </span>
  );
};

// Universe Item Tooltip Component
const UniverseItemTooltip = ({ item }: { item: UniverseItem }) => {
  return (
    <div className="max-w-xs space-y-2 text-xs">
      <div>
        <p className="text-foreground text-sm font-semibold">{item.kri_name}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Status:</span>
        <KRIColorBadge color={item.kri_color} />
      </div>

      <div>
        <p className="text-muted-foreground">
          Score: <span className="font-semibold">{item.kri_average_score}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Type: <span className="font-semibold">{item.kri_measurement_type}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Department: <span className="font-semibold">{item.department_name}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Area: <span className="font-semibold">{item.auditable_area_name}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Activity: <span className="font-semibold">{item.process_activity_name}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Pillar: <span className="font-semibold">{item.strategic_pillar_name}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Target: <span className="font-semibold">{item.indicative_target_name}</span>
        </p>
      </div>

      <div>
        <p className="text-muted-foreground">
          Frequency: <span className="font-semibold">{item.audit_frequency}</span>
        </p>
      </div>
    </div>
  );
};

export function AnnualPlanItems({
  planId,
  items,
  isLoading,
  annualPlan
}: AnnualAuditPlanItemsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<AnnualPlanItem | null>(INIT_FORM_DATA);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<AnnualPlanItem | null>(null);
  const [openAddPlanItemModal, setOpenAddPlanItemModal] = useState(false);

  const handleDeleteClick = (item: AnnualPlanItemWithDetails) => {
    // Delete is allowed for all items in draft plan
    setDeleteItem(item as unknown as AnnualPlanItem);
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
            <TableHead className="text-foreground/70 font-bold">UNIVERSE ITEMS</TableHead>
            <TableHead className="text-foreground/70 font-bold">RESPONSIBLE PERSON</TableHead>
            <TableHead className="text-foreground/70 font-bold">DEPARTMENT</TableHead>
            <TableHead className="text-foreground/70 font-bold">PERIOD</TableHead>
            <TableHead className="text-foreground/70 font-bold">STATUS</TableHead>
            <TableHead className="text-foreground/70 font-bold">LAST UPDATED</TableHead>
            <TableHead className="text-foreground/70 w-20 text-center font-bold"></TableHead>
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
                    <EmptyTitle>No Plan Items</EmptyTitle>
                    <EmptyDescription>
                      If you haven&apos;t created any audit plan items yet. Get started by creating
                      your first audit item.
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
                  if (item?.generated_audit_plan_id) {
                    router.push(
                      `/dashboard/audit/items/engagement/${item.generated_audit_plan_id}`
                    );
                  }
                }}>
                <TableCell>
                  {item.universe_items && item.universe_items.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.universe_items.map((universeItem) => (
                        <div>
                          <TooltipProvider key={universeItem.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="border-border bg-muted/50 flex cursor-help items-center gap-1 rounded border px-2 py-1">
                                  <KRIColorBadge color={universeItem.kri_color} />
                                  <span className="max-w-[120px] truncate text-xs font-medium">
                                    {universeItem.kri_name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="bg-card border-border max-w-sm border p-4 shadow">
                                <UniverseItemTooltip item={universeItem} />
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No universe items</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    className="space-y-1 text-sm"
                    href={
                      item.generated_audit_plan_id
                        ? `/dashboard/audit/items/engagement/${item.generated_audit_plan_id}`
                        : "#"
                    }>
                    <span className="text-foreground cursor-pointer font-medium">
                      {item.responsible_person_name || "-"}
                    </span>
                    <p className="text-muted-foreground text-xs">
                      {item.is_generated ? "✓ Plan Generated" : "○ No Plan Generated"}
                    </p>
                    {item.is_overdue && (
                      <p className="text-xs font-medium text-red-600">⚠ Overdue</p>
                    )}
                  </Link>
                </TableCell>
                <TableCell>{item.department_name}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help">
                            {item.engagement_date
                              ? format(new Date(item.engagement_date), "MMM d")
                              : "-"}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {item.engagement_date
                              ? `Start: ${format(new Date(item.engagement_date), "PPPP")}`
                              : "No start date"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-muted-foreground cursor-help">
                            {item.engagement_end_date
                              ? format(new Date(item.engagement_end_date), "MMM d")
                              : "-"}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {item.engagement_end_date
                              ? `End: ${format(new Date(item.engagement_end_date), "PPPP")}`
                              : "No end date"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={annualPlan.status} />
                </TableCell>
                <TableCell>
                  <p className="cursor-help">
                    {item.updated_at ? formatDistanceToNow(new Date(item.updated_at)) : "-"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {annualPlan.status === "DRAFT" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({
                              id: item.id,
                              department_id: item.department_id || "",
                              universe_item_ids: item.universe_item_ids || [],
                              engagement_date: item.engagement_date || "",
                              engagement_end_date: item.engagement_end_date || "",
                              responsible_person: item.responsible_person || ""
                            });
                            setOpenModal(true);
                          }}
                          className="h-8 gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
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
                    {annualPlan.status === "APPROVED" && !item.is_generated ? (
                      // THIS GENERATES AN ENGAGEMENT PLAN
                      <>
                        <GenerateAuditPlanModal item={item} planId={planId} />
                      </>
                    ) : (
                      <Badge className="p-2" variant={"success"}>
                        Plan Generated
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete Audit Item"
        description="Are you sure you want to delete this audit item? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

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

  const saveMutation = useCreateOrUpdateAnnualAuditPlanItem(planId, selectedItemId);

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();

    saveMutation.mutate(formData, {
      onSuccess: () => {
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      },
      onError: (error: any) => {
        setError({ status: true, message: error.message || "An unexpected error occurred" });
      }
    });
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
      label: `${item.kri_name} [ ${item.kri_color} ]`
    }));
  }, [universeItemsData]);

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
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-xl!">
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
            tooltipMap={useMemo(() => {
              const map: Record<string, React.ReactNode> = {};
              universeItemsData.forEach((item: any) => {
                // Build tooltip content dynamically based on available data
                const tooltipContent = [];

                // Always show the name/label
                if (item.kri_name) {
                  tooltipContent.push(
                    <div key="name">
                      <p className="text-foreground font-semibold">{item.kri_name}</p>
                    </div>
                  );
                }

                // Show status if color is available
                if (item.kri_color) {
                  tooltipContent.push(
                    <div key="status" className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium text-white ${
                          item.kri_color === "Red"
                            ? "bg-red-500"
                            : item.kri_color === "Amber"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}>
                        {item.kri_color}
                      </span>
                    </div>
                  );
                }

                // Show score if available
                if (item.kri_average_score !== undefined && item.kri_average_score !== null) {
                  tooltipContent.push(
                    <div key="score">
                      <p className="text-muted-foreground">
                        Score: <span className="font-semibold">{item.kri_average_score}</span>
                      </p>
                    </div>
                  );
                }

                // Show measurement type if available
                if (item.kri_measurement_type) {
                  tooltipContent.push(
                    <div key="type">
                      <p className="text-muted-foreground">
                        Type: <span className="font-semibold">{item.kri_measurement_type}</span>
                      </p>
                    </div>
                  );
                }

                // Show department if available
                if (item.department_name) {
                  tooltipContent.push(
                    <div key="department">
                      <p className="text-muted-foreground">
                        Department: <span className="font-semibold">{item.department_name}</span>
                      </p>
                    </div>
                  );
                }

                // Show auditable area if available
                if (item.auditable_area_name) {
                  tooltipContent.push(
                    <div key="area">
                      <p className="text-muted-foreground">
                        Area: <span className="font-semibold">{item.auditable_area_name}</span>
                      </p>
                    </div>
                  );
                }

                // Show process activity if available
                if (item.process_activity_name) {
                  tooltipContent.push(
                    <div key="activity">
                      <p className="text-muted-foreground">
                        Activity:{" "}
                        <span className="font-semibold">{item.process_activity_name}</span>
                      </p>
                    </div>
                  );
                }

                // Show strategic pillar if available
                if (item.strategic_pillar_name) {
                  tooltipContent.push(
                    <div key="pillar">
                      <p className="text-muted-foreground">
                        Pillar: <span className="font-semibold">{item.strategic_pillar_name}</span>
                      </p>
                    </div>
                  );
                }

                // Show indicative target if available
                if (item.indicative_target_name) {
                  tooltipContent.push(
                    <div key="target">
                      <p className="text-muted-foreground">
                        Target: <span className="font-semibold">{item.indicative_target_name}</span>
                      </p>
                    </div>
                  );
                }

                // Only create tooltip if there's content to show
                if (tooltipContent.length > 0) {
                  map[item.id] = <div className="space-y-2 text-xs">{tooltipContent}</div>;
                }
              });
              return map;
            }, [universeItemsData])}
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
  budget_id: string;
  budget_item_ids: string[];
  working_paper_template_id: string;
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
  budget_id: "",
  budget_item_ids: [],
  working_paper_template_id: ""
};

interface GenerateAuditPlanModalProps {
  item: AnnualPlanItemWithDetails;
  planId: string;
}

type FieldErrors = Partial<Record<keyof GenerateAuditPlanFormData, string>>;

export function GenerateAuditPlanModal({ item, planId }: GenerateAuditPlanModalProps) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GenerateAuditPlanFormData>(INIT_GENERATE_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const queryClient = useQueryClient();

  const TOTAL_STEPS = 2;

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

  // Fetch budgets for the department
  const { data: budgetsResponse, isLoading: loadingBudgets } = useBudgets({
    is_active: true,
    department_id: item.department_id
  });

  const budgetsData = Array.isArray(budgetsResponse?.data)
    ? budgetsResponse.data
    : Array.isArray(budgetsResponse)
      ? budgetsResponse
      : [];

  // Fetch budget lines based on selected budget
  const { data: budgetLinesResponse, isLoading: loadingBudgetLines } = useBudgetLines(
    formData.budget_id
  );
  const budgetLinesData = Array.isArray(budgetLinesResponse?.data?.data)
    ? budgetLinesResponse.data.data
    : Array.isArray(budgetLinesResponse?.data)
      ? budgetLinesResponse?.data
      : Array.isArray(budgetLinesResponse)
        ? budgetLinesResponse
        : [];

  const generateMutation = useGenerateAuditPlanFromItem();

  const handleTemplateChange = useCallback((template: any) => {
    setFormData((prev) => ({ ...prev, working_paper_template_id: template.id }));
  }, []);

  const handleOpenModal = () => {
    setFormData({
      ...INIT_GENERATE_FORM_DATA,
      title: `${new Date().getFullYear()} - Engagement Plan`,
      audit_area: item.audit_area || "",
      audit_scope: item.audit_scope || "",
      audit_criteria: item.audit_criteria || "",
      audit_objective: item.audit_objective || "",
      management_standard: item.management_standard || FRAMEWORK_TYPES[0]?.id || ""
    });
    setFieldErrors({});
    setCurrentStep(1);
    setOpenModal(true);
  };

  const validateStep1 = (): boolean => {
    const errors: FieldErrors = {};
    let hasErrors = false;

    if (!formData.title?.trim()) {
      errors.title = "Audit plan title is required";
      hasErrors = true;
    }

    if (!formData.ref_no?.trim()) {
      errors.ref_no = "Reference number is required";
      hasErrors = true;
    }

    if (!formData.management_standard) {
      errors.management_standard = "Management standard is required";
      hasErrors = true;
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
      hasErrors = true;
    }

    if (!formData.audit_area?.trim()) {
      errors.audit_area = "Audit area is required";
      hasErrors = true;
    }

    if (!formData.audit_scope?.trim()) {
      errors.audit_scope = "Audit scope is required";
      hasErrors = true;
    }

    if (!formData.audit_criteria?.trim()) {
      errors.audit_criteria = "Audit criteria is required";
      hasErrors = true;
    }

    if (!formData.audit_objective?.trim()) {
      errors.audit_objective = "Audit objective is required";
      hasErrors = true;
    }

    if (!formData.audit_plan_date) {
      errors.audit_plan_date = "Audit plan date is required";
      hasErrors = true;
    }

    if (!formData.end_date) {
      errors.end_date = "Audit end date is required";
      hasErrors = true;
    }

    if (
      formData.audit_plan_date &&
      formData.end_date &&
      formData.audit_plan_date > formData.end_date
    ) {
      errors.audit_plan_date = "Start date must be before end date";
      hasErrors = true;
    }

    if (!formData.client_representative) {
      errors.client_representative = "Client representative is required";
      hasErrors = true;
    }

    if (!formData.audit_team_members || formData.audit_team_members.length === 0) {
      errors.audit_team_members = "At least one team member is required";
      hasErrors = true;
    }

    if (!formData.budget_id) {
      errors.budget_id = "Budget is required";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      ref_no: formData.ref_no,
      audit_plan_date: formData.audit_plan_date
        ? formData.audit_plan_date.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      end_date: formData.end_date?.toISOString().split("T")[0] || "",
      audit_area: formData.audit_area,
      audit_scope: formData.audit_scope,
      audit_criteria: formData.audit_criteria,
      audit_objective: formData.audit_objective,
      management_standard: formData.management_standard,
      audit_team_members: formData.audit_team_members || [],
      client_representative: formData.client_representative,
      budget_item_ids: formData.budget_item_ids || [],
      working_paper_template_id: formData.working_paper_template_id
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
          router.push("/dashboard/audit/plans");
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

  const budgetsOptions = useMemo(() => {
    return budgetsData.map((budget: any) => ({
      value: budget.id,
      label: `${budget.title} - ${budget.currency} ${budget.total_amount.toLocaleString("en-GB")} [${budget.status}]`
    }));
  }, [budgetsData]);

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
        <DialogContent className="max-h-[85vh] max-w-lg! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Audit Plan from Annual Item</DialogTitle>
            <DialogDescription className="text-sm">
              Generate an engagement audit plan from the approved annual audit plan
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm">
            <h4 className="text-foreground text-sm font-semibold">
              Step {currentStep} of {TOTAL_STEPS}:{" "}
              {currentStep === 1 ? "Engagement Plan Details" : "Workpaper Template"}
            </h4>
            <span className="text-muted-foreground text-xs">
              {currentStep === 1
                ? "Create an engagement audit plan from the approved annual audit plan item"
                : " elect a workpaper template to generate the engagement audit plan"}
            </span>
          </div>

          {/* Stepper */}
          <div className="mb-6 flex gap-1">
            {[1, 2].map((step) => {
              const isCompleted = currentStep > step;
              const isActive = currentStep === step;

              return (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    isCompleted || isActive ? "bg-primary" : "bg-muted"
                  }`}
                />
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Audit Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Title and Ref No */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    id="title"
                    label="Audit Plan Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Annual Audit Plan 2025"
                    required
                    isInvalid={!!fieldErrors.title}
                    errorText={fieldErrors.title}
                  />
                  <Input
                    id="ref_no"
                    label="Reference Number"
                    value={formData.ref_no}
                    onChange={(e) => setFormData({ ...formData, ref_no: e.target.value })}
                    placeholder="e.g., AP-2025-001"
                    required
                    isInvalid={!!fieldErrors.ref_no}
                    errorText={fieldErrors.ref_no}
                  />
                </div>

                {/* Management Standard */}
                <SelectField
                  id="management_standard"
                  label="Management Standard"
                  className="w-full"
                  value={formData.management_standard}
                  onValueChange={(value) =>
                    setFormData({ ...formData, management_standard: value })
                  }
                  options={FRAMEWORK_TYPES}
                  placeholder="e.g., ISO 27001"
                  required
                  isInvalid={!!fieldErrors.management_standard}
                  errorText={fieldErrors.management_standard}
                />

                {/* Description */}
                <Textarea
                  id="description"
                  label="Description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive audit plan..."
                  rows={2}
                  isInvalid={!!fieldErrors.description}
                  errorText={fieldErrors.description}
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
                  isInvalid={!!fieldErrors.audit_area}
                  errorText={fieldErrors.audit_area}
                />

                <Textarea
                  id="audit_scope"
                  label="Audit Scope"
                  value={formData.audit_scope}
                  onChange={(e) => setFormData({ ...formData, audit_scope: e.target.value })}
                  placeholder="All information security controls across the organization..."
                  rows={3}
                  required
                  isInvalid={!!fieldErrors.audit_scope}
                  errorText={fieldErrors.audit_scope}
                />

                <Input
                  id="audit_criteria"
                  label="Audit Criteria"
                  value={formData.audit_criteria}
                  onChange={(e) => setFormData({ ...formData, audit_criteria: e.target.value })}
                  placeholder="e.g., ISO 27001:2022 requirements"
                  required
                  isInvalid={!!fieldErrors.audit_criteria}
                  errorText={fieldErrors.audit_criteria}
                />

                <Textarea
                  id="audit_objective"
                  label="Audit Objective"
                  value={formData.audit_objective}
                  onChange={(e) => setFormData({ ...formData, audit_objective: e.target.value })}
                  placeholder="Assess compliance with ISO 27001:2022..."
                  rows={4}
                  required
                  isInvalid={!!fieldErrors.audit_objective}
                  errorText={fieldErrors.audit_objective}
                />

                {/* Dates */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DatePicker
                    label="Audit Plan Date"
                    value={(formData.audit_plan_date ?? undefined) as any}
                    onValueChange={(date) =>
                      setFormData({ ...formData, audit_plan_date: date || null })
                    }
                    isInvalid={!!fieldErrors.audit_plan_date}
                    errorText={fieldErrors.audit_plan_date}
                  />
                  <DatePicker
                    label="Audit End Date"
                    value={(formData.end_date ?? undefined) as any}
                    onValueChange={(date) => setFormData({ ...formData, end_date: date || null })}
                    required
                    isInvalid={!!fieldErrors.end_date}
                    errorText={fieldErrors.end_date}
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
                  isInvalid={!!fieldErrors.client_representative}
                  errorText={fieldErrors.client_representative}
                />

                <div>
                  <MultiSelectModal
                    label="Audit Team Members"
                    placeholder="Choose team members"
                    value={formData.audit_team_members}
                    onValueChange={(values: string[]) =>
                      setFormData({ ...formData, audit_team_members: values })
                    }
                    options={teamMembersOptions}
                    isLoading={loadingTeamMembers}
                    isInvalid={!!fieldErrors.audit_team_members}
                  />
                  {fieldErrors.audit_team_members && (
                    <p className="text-destructive mt-1 text-xs">
                      {fieldErrors.audit_team_members}
                    </p>
                  )}
                </div>

                <SearchSelectField
                  label="Budget"
                  placeholder="Select budget"
                  value={formData.budget_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, budget_id: value, budget_item_ids: [] });
                  }}
                  options={budgetsOptions}
                  isLoading={loadingBudgets}
                  isInvalid={!!fieldErrors.budget_id}
                  errorText={fieldErrors.budget_id}
                />

                <MultiSelectModal
                  label="Budget Lines"
                  placeholder="Select budget lines"
                  value={formData.budget_item_ids}
                  onValueChange={(values: string[]) =>
                    setFormData({ ...formData, budget_item_ids: values })
                  }
                  options={budgetLinesOptions}
                  disabled={loadingBudgetLines || !formData.budget_id}
                  isLoading={loadingBudgetLines}
                />
              </div>
            )}

            {/* Step 2: Working Paper Template */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <TemplateSelectorSimple
                  value={formData.working_paper_template_id}
                  onChange={handleTemplateChange}
                  frameworkType={formData.management_standard}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setOpenModal(false);
                  setFormData(INIT_GENERATE_FORM_DATA);
                  setCurrentStep(1);
                }}>
                Cancel
              </Button>

              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={generateMutation.isPending}
                  isLoading={generateMutation.isPending}
                  loadingText="Generating...">
                  Generate Plan
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

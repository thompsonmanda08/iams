"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Trash2, View, Pencil, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { closeRisk, deleteRisk, RiskResponse } from "@/app/_actions/risk-module-actions";
import { MultiStepRiskForm } from "@/components/forms/multi-step-risk-form";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { AssignActionDialog } from "./assign-action-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/lib/types";

type Risk = {
  id: string;
  risk_matrix_id: string;
  organization_id: string;
  title: string;
  description: string;
  category_id: string;
  department_id: string;
  matrix_id: string;
  risk_register_id: string;
  macro_process_id: string;
  sub_process_id: string;
  strategic_objective_id: string;
  root_cause: string;
  recurrence: "ongoing" | "one-time";
  step: number;
  department_status: string;
  inherent_likelihood: number;
  inherent_impact: number;
  risk_magnitude: string;
  inherent_score: number;
  inherent_rating: string;
  residual_likelihood: number;
  residual_impact: number;
  residual_score: number;
  residual_rating: string;
  existing_controls: string;
  control_effectiveness: number;
  treatment_plan: string;
  risk_response: RiskResponse;
  risk_owner_id: string;
  risk_appetite_status: "WITHIN" | "ABOVE";
  target_closing_date: string;
  revised_target_date: string;
  date_closed: string;
  status: string;
  overdue_days: number;
  review_date: string;
  mitigation_cost: number;
  latest_update: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  category: Category;
  department: Department;
  risk_owner: Owner;
};

type Category = {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  code: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};
type Owner = {
  id: string;
  first_name: string;
  last_name: string;
};

type Department = {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type RisksTableProps = {
  risks: Risk[];
  pagination: Pagination;
  registerId: string;
  currentSearch: string;
  currentCategory: string;
  currentStatus: string;
};

export default function RisksTable({
  risks,
  pagination,
  registerId,
  currentSearch,
  currentCategory,
  currentStatus
}: RisksTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | undefined>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riskToDelete, setRiskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [riskToClose, setRiskToClose] = useState<{ id: string; title: string } | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [assignActionDialogOpen, setAssignActionDialogOpen] = useState(false);
  const [riskForAssignment, setRiskForAssignment] = useState<Risk | undefined>();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams("search", value);
  };

  const handleCategoryChange = (value: string) => {
    updateSearchParams("category", value);
  };

  const handleStatusChange = (value: string) => {
    updateSearchParams("status", value);
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("limit", String(page_size));
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (risk: Risk) => {
    setRiskToDelete({ id: risk.id, title: risk.title });
    setDeleteDialogOpen(true);
  };
  const handleCloseClick = (risk: Risk) => {
    setRiskToClose({ id: risk.id, title: risk.title });
    setCloseDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!riskToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteRisk(riskToDelete.id);
      if (response.success) {
        toast.success(response.message || "Risk deleted successfully");
        setDeleteDialogOpen(false);
        setRiskToDelete(null);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete risk");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };
  const confirmClose = async () => {
    if (!riskToClose) return;

    setIsClosing(true);
    try {
      const response = await closeRisk(riskToClose.id);
      if (response.success) {
        toast.success(response.message || "Risk closed successfully");
        setCloseDialogOpen(false);
        setRiskToClose(null);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete risk");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsClosing(false);
    }
  };

  const getMagnitudeColor = (magnitude: string) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-amber-100 text-amber-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700"
    };
    return colors[magnitude as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-red-600 font-bold";
    if (score >= 10) return "text-orange-600 font-semibold";
    if (score >= 5) return "text-amber-600 font-medium";
    return "text-green-600";
  };

  const customPaginationData = {
    page: pagination?.page,
    page_size: pagination?.page_size,
    total_pages: pagination?.total_pages,
    total: pagination?.total,
    has_prev: pagination?.has_prev,
    has_next: pagination?.has_next
  };

  const getRiskOwnerName = (risk: Risk) => {
    if (!risk.risk_owner) return "Unassigned";
    return `${risk.risk_owner.first_name} ${risk.risk_owner.last_name}`.trim();
  };

  return (
    <div className="px-4">
      <Card className="container mx-auto mb-8 px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <Search
            placeholder="Search risks..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e)}
            disabled={isPending}
          />

          <Select value={currentCategory} onValueChange={handleCategoryChange} disabled={isPending}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Strategic">Strategic</SelectItem>
              <SelectItem value="IT Security">IT Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="bg-card container mx-auto rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Risk ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Inherent Score</TableHead>
              <TableHead>Inherent Rating</TableHead>
              <TableHead>Residual Score</TableHead>
              <TableHead>Residual Rating</TableHead>
              <TableHead>Magnitude</TableHead>
              <TableHead>Risk Appetite Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <p className="text-muted-foreground">No risks found</p>
                </TableCell>
              </TableRow>
            ) : (
              risks?.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium uppercase">{`${risk.category.code}-${risk.id.slice(0, 4)}`}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground font-medium">{risk.title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="break block max-w-[200px] text-sm whitespace-normal">
                      {risk.category.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          getRiskScoreColor(risk.inherent_score || 0)
                        )}>
                        {risk.inherent_score || 0}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({risk.inherent_impact || 0}×{risk.inherent_likelihood || 0})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={risk?.inherent_rating || "-"} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        getRiskScoreColor(risk.residual_score || 0)
                      )}>
                      {risk.residual_score || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={risk?.residual_rating || "-"} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "flex-none rounded-full px-2 py-1 text-xs font-medium capitalize",
                        getMagnitudeColor(risk?.risk_magnitude)
                      )}>
                      {risk.inherent_score || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={risk?.risk_appetite_status || "-"} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={risk?.status || "-"} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getRiskOwnerName(risk)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(`/dashboard/actions/risk/${risk.id}`);
                        }}
                        className="h-8 gap-1.5">
                        <View className="h-3.5 w-3.5" />
                        View Risk
                      </Button>
                      {risk.status === "DRAFT" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            handleEdit(risk);
                            e.stopPropagation();
                          }}
                          className="h-8 gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      ) : risk.status === "OPEN" ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            setRiskForAssignment(risk);
                            setAssignActionDialogOpen(true);
                            e.stopPropagation();
                          }}
                          className="h-8 gap-1.5">
                          <UserPlus className="h-3.5 w-3.5" />
                          Assign Action
                        </Button>
                      ) : null}
                      {risk.residual_rating === "Low" && risk.status !== "CLOSED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            handleCloseClick(risk);
                            e.stopPropagation();
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <X className="h-4 w-4" />
                          Close
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          handleDeleteClick(risk);
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

        {risks?.length > 0 && (
          <CustomPagination
            pagination={customPaginationData}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

      <MultiStepRiskForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        registerId={registerId}
        mode="create"
      />

      {selectedRisk && (
        <MultiStepRiskForm
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          registerId={registerId}
          mode="edit"
          riskData={selectedRisk}
        />
      )}
      <ConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Risk"
        description={`Are you sure you want to delete "${riskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        type="delete"
      />

      <ConfirmationModal
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        title="Close Risk"
        description={`Are you sure you want to close "${riskToClose?.title}"? This action cannot be undone.`}
        onConfirm={confirmClose}
        isLoading={isClosing}
        type="close"
      />

      {riskForAssignment && (
        <AssignActionDialog
          open={assignActionDialogOpen}
          onOpenChange={setAssignActionDialogOpen}
          risk={riskForAssignment}
          registerId={registerId}
          onActionAssigned={() => {
            // Refresh the page or update state as needed
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

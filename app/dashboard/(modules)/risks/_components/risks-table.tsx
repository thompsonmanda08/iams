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
import { Trash2, View, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteRisk } from "@/app/_actions/risk-module-actions";
import { MultiStepRiskForm } from "@/components/forms/multi-step-risk-form";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";
import { ConfirmationModal } from "@/components/confirmation-modal";

type Risk = {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: string;
  category_id: string;
  department_id: string;
  macro_process: string;
  sub_process: string;
  strategic_objective: string;
  root_cause: string;
  recurrence: "ongoing" | "one-time";
  inherentScore: number;
  inherentImpact: number;
  inherentLikelihood: number;
  residualScore: number;
  residualImpact: number;
  residualLikelihood: number;
  existing_controls: string;
  control_effectiveness: number;
  treatment_plan: string;
  risk_response: "REDUCE" | "ACCEPT" | "TRANSFER" | "AVOID";
  risk_owner_id: string;
  risk_appetite_status: "WITHIN" | "ABOVE";
  target_closing_date: string;
  mitigation_cost: number;
  riskMagnitude: string;
  status: string;
  owner: string;
  step?: number;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type RisksTableProps = {
  risks: Risk[];
  meta: Meta;
  registerId: string;
  currentSearch: string;
  currentCategory: string;
  currentStatus: string;
};

export default function RisksTable({
  risks,
  meta,
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

  const confirmDelete = async () => {
    if (!riskToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteRisk(riskToDelete.id);
      if (response.success) {
        toast.success("Risk deleted successfully");
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

  const getMagnitudeColor = (magnitude: string) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-amber-100 text-amber-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700"
    };
    return colors[magnitude as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-700",
      monitoring: "bg-purple-100 text-purple-700",
      closed: "bg-gray-100 text-gray-700",
      draft: "bg-slate-100 text-slate-700"
    };
    return colors[status.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-red-600 font-bold";
    if (score >= 10) return "text-orange-600 font-semibold";
    if (score >= 5) return "text-amber-600 font-medium";
    return "text-green-600";
  };

  const customPaginationData = {
    page: meta.page,
    page_size: meta.limit,
    total_pages: meta.totalPages,
    totalCount: meta.total,
    has_prev: meta.page > 1,
    has_next: meta.page < meta.totalPages
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

      <Card className="container mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Inherent Score</TableHead>
              <TableHead>Residual Score</TableHead>
              <TableHead>Magnitude</TableHead>
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
                    <span className="font-mono text-sm font-medium">{risk.riskId}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground font-medium">{risk.title}</p>
                      <p className="text-muted-foreground max-w-xs truncate text-sm">
                        {risk.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[200px] text-sm break-all whitespace-normal">
                      {risk.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          getRiskScoreColor(risk.inherentScore)
                        )}>
                        {risk.inherentScore}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({risk.inherentImpact}×{risk.inherentLikelihood})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          getRiskScoreColor(risk.residualScore)
                        )}>
                        {risk.residualScore}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({risk.residualImpact}×{risk.residualLikelihood})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium capitalize",
                        getMagnitudeColor(risk.riskMagnitude)
                      )}>
                      {risk.riskMagnitude}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium capitalize",
                        getStatusColor(risk.status)
                      )}>
                      {risk.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{risk.owner}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(`/dashboard/risks/actions/${risk.id}`);
                        }}
                        className="h-8 gap-1.5">
                        <View className="h-3.5 w-3.5" />
                        View Risk
                      </Button>
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
      </Card>

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
    </div>
  );
}

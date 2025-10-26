"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteRisk } from "@/app/_actions/risk-module-actions";
import { RiskFormDialog } from "@/components/forms/risk-form-dialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";

type Risk = {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: string;
  inherentScore: number;
  inherentImpact: number;
  inherentLikelihood: number;
  residualScore: number;
  residualImpact: number;
  residualLikelihood: number;
  riskMagnitude: string;
  status: string;
  owner: string;
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

  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riskToDelete, setRiskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 on filter change
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

  const handlePageChange = (newPage: number) => {
    updateSearchParams("page", String(newPage));
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setRiskDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRiskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!riskToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteRisk(riskToDelete);
      if (response.success) {
        toast.success("Risk deleted successfully");
        setDeleteDialogOpen(false);
        setRiskToDelete(null);
        router.refresh();
      } else {
        toast.error("Failed to delete risk");
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
      closed: "bg-gray-100 text-gray-700"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-red-600 font-bold";
    if (score >= 10) return "text-orange-600 font-semibold";
    if (score >= 5) return "text-amber-600 font-medium";
    return "text-green-600";
  };

  return (
    <>
      {/* Filters */}
      <Card className="container mx-auto mb-8 px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search risks..."
              defaultValue={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              disabled={isPending}
            />
          </div>
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="container mx-auto px-4">
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
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <p className="text-muted-foreground">No risks found</p>
                </TableCell>
              </TableRow>
            ) : (
              risks.map((risk) => (
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
                    <span className="text-sm">{risk.category}</span>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(risk)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(risk.id)}
                          className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {risks.length > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-muted-foreground text-sm">
              Showing {(meta.page - 1) * meta.limit + 1} to{" "}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} risks
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1}
                onClick={() => handlePageChange(meta.page - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RiskFormDialog
        open={riskDialogOpen}
        onOpenChange={setRiskDialogOpen}
        risk={selectedRisk}
        registerId={registerId}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Risk"
        description="Are you sure you want to delete this risk? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

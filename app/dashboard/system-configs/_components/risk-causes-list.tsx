"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Cable } from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteRiskCause, getRiskCauses } from "@/app/_actions/config-actions";
import { RiskCauseDialog } from "./risk-causes-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";

type RiskCause = {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type PaginationState = {
  page: number;
  page_size: number;
  total_pages: number;
  total: number;
  has_prev: boolean;
  has_next: boolean;
};

export function RiskCausesList() {
  const [causes, setCauses] = useState<RiskCause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    cause: RiskCause | null;
  }>({ open: false, cause: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    causeId: string | null;
    causeName: string | null;
  }>({ open: false, causeId: null, causeName: null });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total_pages: 0,
    total: 0,
    has_prev: false,
    has_next: false
  });

  useEffect(() => {
    fetchCauses();
  }, [pagination.page, pagination.page_size]);

  const fetchCauses = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskCauses({
        page: pagination.page,
        page_size: pagination.page_size
      });
      if (response.success && response.data?.data) {
        setCauses(response.data.data);
        // Update pagination from API response
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: response.data.pagination.page || prev.page,
            page_size: response.data.pagination.page_size || prev.page_size,
            total: response.data.pagination.total || 0,
            total_pages: response.data.pagination.total_pages || 0,
            has_prev: response.data.pagination.has_prev || false,
            has_next: response.data.pagination.has_next || false
          }));
        }
      } else {
        setCauses([]);
      }
    } catch (error) {
      console.error("Error fetching risk causes:", error);
      notify({ description: "Failed to load risk causes", type: "error" });
      setCauses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagination = (updates: { page?: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: updates.page || prev.page,
      page_size: updates.page_size || prev.page_size
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleDeleteClick = (cause: RiskCause) => {
    setDeleteDialog({
      open: true,
      causeId: cause.id,
      causeName: cause.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.causeId) return;

    try {
      const response = await deleteRiskCause(deleteDialog.causeId);
      if (response.success) {
        notify({ description: "Risk cause deleted successfully", type: "success" });
        await fetchCauses();
        setDeleteDialog({ open: false, causeId: null, causeName: null });
      } else {
        notify({ description: response.message || "Failed to delete risk cause", type: "error" });
      }
    } catch (error) {
      console.error("Error deleting risk cause:", error);
      notify({ description: "Failed to delete risk cause", type: "error" });
    }
  };

  const handleCreateClick = () => {
    setDialog({ open: true, cause: null });
  };

  const handleEditClick = (cause: RiskCause) => {
    setDialog({ open: true, cause });
  };

  // Get parent cause name
  const getParentCauseName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = causes.find((c) => c.id === parentId);
    return parent ? parent.name : "Unknown Parent";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">Risk Causes</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage risk causes for comprehensive risk management
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create a Risk Cause
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Cause Name</TableHead>
              <TableHead>Parent Cause</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!causes.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <AlertCircle className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No Risk Causes Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                      Get started by creating your first risk cause to identify and manage potential
                      risks.
                    </p>
                    <Button onClick={handleCreateClick} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Risk Cause
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              causes.map((cause) => {
                const parentName = getParentCauseName(cause.parent_id);

                return (
                  <TableRow key={cause.id}>
                    <TableCell>
                      <p className="text-foreground font-medium">{cause.name}</p>
                    </TableCell>
                    <TableCell>
                      {parentName ? (
                        <Badge variant="success" className="gap-1 text-xs">
                          <Cable className="h-3 w-3" />
                          {parentName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm text-gray-500">
                        {cause.description || "No description provided"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(cause.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(cause.updated_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(cause)}
                          className="h-8 gap-1.5">
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(cause)}
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
        {causes.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

      <RiskCauseDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, cause: null })}
        cause={dialog?.cause as any}
        onSuccess={fetchCauses}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, causeId: null, causeName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Risk Cause"
        description={`Are you sure you want to delete "${deleteDialog.causeName}"? This action cannot be undone.`}
        type="delete"
      />
    </Card>
  );
}

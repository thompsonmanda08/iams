"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2,BookOpen, Settings } from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateReportGuideDialog } from "./create-report-guide-dialog";
import { EditReportGuideDialog } from "./edit-report-guide-dialog";
import { deleteReportGuide, getReportGuides } from "@/app/_actions/config-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type ReportGuide = {
  id: string;
  name: string;
  description: string;
  report_type: "RISK_REPORT" | "AUDIT_REPORT";
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

export function ReportGuides() {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const [guides, setGuides] = useState<ReportGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    guide: ReportGuide | null;
  }>({ open: false, guide: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    guideId: string | null;
    guideName: string | null;
  }>({ open: false, guideId: null, guideName: null });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total_pages: 0,
    total: 0,
    has_prev: false,
    has_next: false
  });

  useEffect(() => {
    fetchGuides();
  }, [pagination.page, pagination.page_size]);

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const response = await getReportGuides(pagination.page, pagination.page_size);

      if (response.success && response.data?.data) {
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setGuides(data);

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
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to load report guides", type: "error" });
      setGuides([]);
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

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "RISK_REPORT":
        return "Risk Report";
      case "AUDIT_REPORT":
        return "Audit Report";
      default:
        return type;
    }
  };

  const handleDeleteClick = (guide: ReportGuide) => {
    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_delete")) return;
    setDeleteDialog({
      open: true,
      guideId: guide.id,
      guideName: guide.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.guideId) return;

    try {
      const response = await deleteReportGuide(deleteDialog.guideId);
      if (response.success) {
        notify({ description: "Report guide deleted successfully", type: "success" });
        await fetchGuides();
        setDeleteDialog({ open: false, guideId: null, guideName: null });
      } else {
        notify({ description: response.message || "Failed to delete report guide", type: "error" });
      }
    } catch (error) {
      notify({ description: "Failed to delete report guide", type: "error" });
    }
  };

  const handleEditClick = (guide: ReportGuide) => {
    setEditDialog({ open: true, guide });
  };

  const handleNavigate = (guideId: string) => {
    router.push(`/dashboard/system-configs/report-guides-settings/${guideId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
         <div className="border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">Report Guides</h2>
          <p className="text-muted-foreground text-sm">
            Manage and configure report guides for risk and audit reports
          </p>
        </div>
        {pagination.total < 2 && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Report Guide
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!guides.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <BookOpen className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No report guides configured
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center text-sm">
                      Get started by creating your first report guide to standardize report
                      generation.
                    </p>
                    {pagination.total < 2 && (
                      <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Guide
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{guide.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {guide.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getReportTypeLabel(guide.report_type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(guide.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(guide.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigate(guide.id)}
                        className="h-8 gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(guide)}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(guide)}
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

        {guides.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </div>

      <CreateReportGuideDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchGuides}
      />

      {editDialog.guide && (
        <EditReportGuideDialog
          open={editDialog.open}
          onOpenChange={(open: boolean) => setEditDialog({ open, guide: null })}
          guide={editDialog.guide}
          onSuccess={fetchGuides}
        />
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, guideId: null, guideName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Report Guide"
        description={`Are you sure you want to delete "${deleteDialog.guideName}"? This action cannot be undone.`}
        type="delete"
      />
    </Card>
  );
}

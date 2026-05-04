"use client";

import { useState } from "react";
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
import { Eye, Edit, Trash2, FileText, Download, View } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CustomPagination } from "@/components/ui/pagination";
import type { Pagination } from "@/lib/types";
import type { ReportListItem, ReportStatus, ReportType } from "@/lib/types/report-types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { CreateReportDialog } from "./create-report-dialog";
import { useReportMutations } from "@/hooks/use-report-queries";
import { capitalize, notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface ReportsTableProps {
  reports: ReportListItem[];
  pagination?: Pagination;
  isLoading?: boolean;
}

const reportTypeLabels: Record<ReportType, string> = {
  general_audit: "General Audit",
  compliance_audit: "Compliance Audit",
  risk: "Risk Assessment",
  followup: "Follow-up"
};

const statusColors = {
  DRAFT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
} as Record<ReportStatus, string>;

export function ReportsTable({ reports = [], pagination, isLoading }: ReportsTableProps) {
  const router = useRouter();

  // Ensure reports is always an array even when fetching fails
  const safeReports = Array.isArray(reports) ? reports : [];
  const { checkPermission, hasPermission } = usePermissions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportListItem | null>(null);

  // Use the reusable mutation hook
  const { deleteReport: deleteReportMutation, isDeleting } = useReportMutations();

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || pagination?.page_size || 10;
    router.push(`?page=${pageConfig.page}&page_size=${pageSize}`);
  };

  const handleDeleteClick = (report: ReportListItem) => {
    if (!checkPermission(MODULE_CODES.AUDIT_REPORTS, "can_delete")) return;
    if (report.status !== "DRAFT") {
      notify({ description: "Only draft reports can be deleted.", type: "error" });
      return;
    }
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!reportToDelete) return;

    deleteReportMutation(reportToDelete.id, {
      onSuccess: () => {
        // Only close modal and reset on success (toast handled by mutation hook)
        setDeleteDialogOpen(false);
        setReportToDelete(null);
        router.refresh();
      }
    });
  };

  const handleEditReport = (report: ReportListItem) => `/dashboard/reports/${report.id}`;

  const handleReportEntityView = (report: ReportListItem) => {
    // If report has entity_id and is an audit_plan, navigate to audit plan report tab
    if (report.entity_id && report.entity_type === "audit_plan") {
      return `/dashboard/audit/plans/engagement/${report.entity_id}?tab=report`;
    }
    // Otherwise, navigate to standalone report editor
    return handleEditReport(report);
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

  if (safeReports.length === 0) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <FileText className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">No Reports Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Reports are created from audit engagements. Go to an audit plan and use the Report tab
            to create your first report.
          </p>

          <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">1. CREATE AN ENTITY PLAN</div>
              <div className="text-muted-foreground">Set up your entity</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">2. EXECUTE </div>
              <div className="text-muted-foreground">By recording details</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">3. GENERATE REPORT</div>
              <div className="text-muted-foreground">Use the Report tabs</div>
            </div>
          </div>

          <CreateReportDialog showTrigger />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-foreground/70 font-bold">REPORT TITLE</TableHead>
              <TableHead className="text-foreground/70 font-bold">TYPE</TableHead>
              <TableHead className="text-foreground/70 font-bold">CREATED BY</TableHead>
              <TableHead className="text-foreground/70 font-bold">UPDATED BY</TableHead>
              <TableHead className="text-foreground/70 font-bold">LAST UPDATED</TableHead>
              <TableHead className="text-foreground/70 font-bold">STATUS</TableHead>
              <TableHead className="text-foreground/70 w-20 text-center font-bold">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      href={handleReportEntityView(report)}
                      className="hover:text-primary/80 text-base font-medium text-blue-500 hover:underline">
                      {report.title}
                    </Link>
                    <p className="text-muted-foreground text-xs italic">
                      Type:{" "}
                      <span className="font-medium capitalize">
                        {capitalize(report?.entity_type?.replaceAll("_", " "))}
                      </span>
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {reportTypeLabels[report.report_type] || report.report_type}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{report.created_by?.name || "-"}</p>
                    <p className="text-muted-foreground text-xs">{report.created_by?.role || ""}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{report.updated_by?.name || "-"}</p>
                    <p className="text-muted-foreground text-xs">{report.updated_by?.role || ""}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <p>
                      {report.updated_at ? format(new Date(report.updated_at), "MMM d, yyyy") : "-"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {report.updated_at ? format(new Date(report.updated_at), "h:mm a") : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}>
                    {report.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={handleReportEntityView(report)}
                            className="flex items-center gap-2">
                            <View className="h-4 w-4" />
                            View Details & Report
                          </Link>
                        </DropdownMenuItem>

                        {report.status === "DRAFT" && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href={handleEditReport(report)}
                                className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit/Update Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(report)}
                              className="text-destructive focus:text-destructive font-medium">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              Delete Report
                            </DropdownMenuItem>
                          </>
                        )}

                        {report.status === "PUBLISHED" && (
                          <>
                            <DropdownMenuItem className="flex items-center gap-2 font-medium">
                              <Download className="h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (pagination.total || 0) > (pagination.page_size || 10) && (
        <CustomPagination
          pagination={pagination}
          updatePagination={handlePaginationChange}
          showDetails={true}
          allowSetPageSize={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Report"
        description={`Are you sure you want to delete "${reportToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}

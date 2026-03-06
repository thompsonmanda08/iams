"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertCircle, Loader2, FileText, Plus } from "lucide-react";
import type { Workpaper } from "@/lib/types/audit-types";
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
import { cn, notify } from "@/lib/utils";
import { deleteWorkpaper } from "@/app/_actions/audit-module-actions";

import { CustomPagination } from "../ui/pagination";
import { Pagination } from "@/lib/types";

interface WorkpapersTableProps {
  workpapers: Workpaper[];
  isLoading?: boolean;
  onCreateClick?: () => void;
  pagination: Pagination;
}

const testResultConfig = {
  conformity: {
    label: "Conformity",
    className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
  },
  "partial-conformity": {
    label: "Partial Conformity",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
  },
  "non-conformity": {
    label: "Non-Conformity",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
  }
};

export function WorkpapersTable({
  workpapers,
  isLoading,
  onCreateClick,
  pagination
}: WorkpapersTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workpaperToDelete, setWorkpaperToDelete] = useState<Workpaper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (workpaper: Workpaper) => {
    setWorkpaperToDelete(workpaper);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workpaperToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteWorkpaper(workpaperToDelete.id);

      if (result.success) {
        notify({
          title: "Success",
          description: "Workpaper deleted successfully",
          type: "success"
        });
        setDeleteDialogOpen(false);
        setWorkpaperToDelete(null);
        router.refresh();
      } else {
        notify({
          title: "Error",
          description: result.message || "Failed to delete workpaper",
          type: "error"
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`);
  };
  const customPaginationData = {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    totalCount: pagination.total,
    has_prev: pagination.has_prev,
    has_next: pagination.has_next
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

  if (workpapers.length === 0) {
    return (
      <div className="bg-card flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="max-w-md space-y-4 p-8 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-4">
              <FileText className="text-primary h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No workpapers yet</h3>
            <p className="text-muted-foreground text-sm">
              Get started by creating your first workpaper. Working papers help document audit
              testing procedures and evidence collection.
            </p>
          </div>
          {onCreateClick && (
            <Button onClick={onCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Workpaper
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clause</TableHead>
            <TableHead>Audit</TableHead>
            <TableHead>Objectives</TableHead>
            <TableHead>Test Result</TableHead>
            <TableHead>Findings</TableHead>
            <TableHead>Prepared By</TableHead>
            <TableHead>Reviewed By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Options</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workpapers.map((workpaper) => {
            const testResult =
              testResultConfig[workpaper.testResult] || testResultConfig.conformity;

            return (
              <TableRow key={workpaper.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{workpaper.clause}</p>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {workpaper.clauseTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/audit/plans/engagement/${workpaper.auditId}`}
                    className="hover:text-primary line-clamp-1 text-sm hover:underline">
                    {workpaper.auditTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="line-clamp-2 max-w-md text-sm">{workpaper.objectives}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(testResult.className)}>
                    {testResult.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {workpaper.findingsCount && workpaper.findingsCount > 0 ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {workpaper.findingsCount} Finding{workpaper.findingsCount > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{workpaper.preparedBy}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {workpaper.reviewedBy || (
                      <span className="text-muted-foreground">Not reviewed</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {/* {format(new Date(workpaper.preparedDate), "MMM d, yyyy")} */}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {/* TODO: Enable when workpaper detail route is created at /dashboard/(modules)/audit/workpapers/[id]/page.tsx */}
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/audit/workpapers/${workpaper.id}`)}
                      className="h-8 gap-1.5">
                      <View className="h-3.5 w-3.5" />
                      View
                    </Button> */}
                    {/* TODO: Enable when workpaper edit route is created at /dashboard/(modules)/audit/workpapers/[id]/edit/page.tsx */}
                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/audit/workpapers/${workpaper.id}/edit`)
                      }
                      className="h-8 gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button> */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(workpaper)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {workpapers.length > 0 && (
        <CustomPagination
          pagination={customPaginationData}
          updatePagination={updatePagination}
          allowSetPageSize={true}
          showDetails={true}
          className="border-t"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workpaper</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete workpaper for clause &quot;{workpaperToDelete?.clause}
              &quot;? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

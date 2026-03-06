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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2, FileText, AlertCircle, Loader2 } from "lucide-react";
import type { Finding } from "@/lib/types/audit-types";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { deleteFinding } from "@/app/_actions/audit-module-actions";


interface FindingsTableProps {
  findings: Finding[];
  isLoading?: boolean;
  onCreateClick?: () => void;
}

const severityConfig = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200"
  },
  high: {
    label: "High",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200"
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200"
  },
  low: {
    label: "Low",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200"
  }
};

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
};

export function FindingsTable({ findings, isLoading, onCreateClick }: FindingsTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [findingToDelete, setFindingToDelete] = useState<Finding | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (finding: Finding) => {
    setFindingToDelete(finding);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!findingToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteFinding(findingToDelete.id);

      if (result.success) {
        notify({
          title: "Success",
          description: "Finding deleted successfully",
          type: "success"
        });
        setDeleteDialogOpen(false);
        setFindingToDelete(null);
        router.refresh();
      } else {
        notify({
          title: "Error",
          description: result.message || "Failed to delete finding",
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="bg-card flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="max-w-md space-y-4 p-8 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-4">
              <AlertCircle className="text-primary h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No findings yet</h3>
            <p className="text-muted-foreground text-sm">
              Findings will appear here when non-conformities or observations are identified during
              the audit process.
            </p>
          </div>
          {onCreateClick && (
            <Button onClick={onCreateClick} className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Create Finding
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
            <TableHead>Reference</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Clause</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.map((finding) => {
            const severity = severityConfig[finding.severity] || severityConfig.low;
            const status = statusConfig[finding.status] || statusConfig.open;

            return (
              <TableRow key={finding.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/audit/findings/${finding.id}`}
                    className="hover:text-primary font-mono text-sm hover:underline">
                    {finding.referenceCode}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="max-w-md space-y-1">
                    <p className="line-clamp-1 font-medium">{finding.description}</p>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {finding.auditTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{finding.clause}</p>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {finding.clauseTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {finding.workpaperId ? (
                    <Link
                      href={`/dashboard/audit/workpapers/${finding.workpaperId}`}
                      className="hover:text-primary inline-flex items-center gap-1.5 text-sm hover:underline">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-mono text-xs">
                        {finding.workpaperReference || finding.workpaperId}
                      </span>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {finding.sourceType === "manual" ? "Manual Entry" : "External"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(severity.className)}>
                    {severity.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(status.className)}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{finding.assignedTo || "Unassigned"}</span>
                </TableCell>
                <TableCell>
                  {finding.dueDate ? (
                    <span className="text-sm">
                      {format(new Date(finding.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">No due date</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/audit/findings/${finding.id}`}
                          className="flex cursor-pointer items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => router.push(`/dashboard/audit/findings/${finding.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer gap-2"
                        onClick={() => handleDeleteClick(finding)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Finding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete finding &quot;{findingToDelete?.referenceCode}&quot;?
              This action cannot be undone and will remove all associated data.
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

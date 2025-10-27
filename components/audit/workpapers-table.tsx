"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2, AlertCircle, Loader2, FileText, Plus } from "lucide-react";
import type { Workpaper } from "@/lib/types/audit-types";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { deleteWorkpaper } from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";

interface WorkpapersTableProps {
  workpapers: Workpaper[];
  isLoading?: boolean;
  onCreateClick?: () => void;
}

const testResultConfig = {
  conformity: {
    label: "Conformity",
    className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  "partial-conformity": {
    label: "Partial Conformity",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  "non-conformity": {
    label: "Non-Conformity",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

export function WorkpapersTable({ workpapers, isLoading, onCreateClick }: WorkpapersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
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
        toast({
          title: "Success",
          description: "Workpaper deleted successfully",
        });
        setDeleteDialogOpen(false);
        setWorkpaperToDelete(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete workpaper",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (workpapers.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-card">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No workpapers yet</h3>
            <p className="text-sm text-muted-foreground">
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
    <div className="rounded-lg border bg-card">
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
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workpapers.map((workpaper) => {
            const testResult = testResultConfig[workpaper.testResult] || testResultConfig.conformity;

            return (
              <TableRow key={workpaper.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{workpaper.clause}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {workpaper.clauseTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/audit/plans/${workpaper.auditId}`}
                    className="text-sm hover:text-primary hover:underline line-clamp-1"
                  >
                    {workpaper.auditTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="text-sm line-clamp-2 max-w-md">{workpaper.objectives}</p>
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
                      {workpaper.findingsCount} Finding{workpaper.findingsCount > 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
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
                    {format(new Date(workpaper.preparedDate), "MMM d, yyyy")}
                  </span>
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
                          href={`/dashboard/audit/workpapers/${workpaper.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/audit/workpapers/${workpaper.id}/edit`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive cursor-pointer"
                        onClick={() => handleDeleteClick(workpaper)}
                      >
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
            <AlertDialogTitle>Delete Workpaper</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete workpaper for clause &quot;{workpaperToDelete?.clause}&quot;?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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

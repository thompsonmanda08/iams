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
import { AuditStatusBadge } from "./audit-status-badge";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
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
import { Progress } from "@/components/ui/progress";
import { deleteAuditPlan } from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";

interface AuditPlansTableProps {
  plans: AuditPlan[];
  isLoading?: boolean;
}

export function AuditPlansTable({ plans, isLoading }: AuditPlansTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<AuditPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (plan: AuditPlan) => {
    // Only allow deletion for Draft plans
    if (plan.status.toLowerCase() !== "draft") {
      toast({
        title: "Cannot Delete",
        description: "Only draft audit plans can be deleted.",
        variant: "destructive"
      });
      return;
    }
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteAuditPlan(planToDelete.id);

      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan deleted successfully"
        });
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete audit plan",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
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

  if (plans.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">No audit plans found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first audit plan to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Audit Title</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Team Leader</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>
                <div className="space-y-1">
                  <Link
                    href={`/dashboard/audit/plans/${plan.id}`}
                    className="hover:text-primary font-medium hover:underline">
                    {plan.title}
                  </Link>
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {plan.scope ? plan.scope.join(", ") : "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{plan.standard || " - "}</span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{plan.teamLeader}</p>
                  <p className="text-muted-foreground text-xs">
                    {plan.teamMembers?.length || 0} member
                    {plan.teamMembers?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <p>{format(new Date(plan.startDate), "MMM d, yyyy")}</p>
                  <p className="text-muted-foreground">
                    {format(new Date(plan.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="w-32 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{plan.progress}%</span>
                    {plan.conformityRate && (
                      <span className="text-green-600">{plan.conformityRate}% conform</span>
                    )}
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>
              </TableCell>
              <TableCell>
                <AuditStatusBadge status={plan.status} />
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
                        href={`/dashboard/audit/plans/${plan.id}`}
                        className="flex cursor-pointer items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    {plan.status === "draft" && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => router.push(`/dashboard/audit/plans/${plan.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer gap-2"
                          onClick={() => handleDeleteClick(plan)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audit Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{planToDelete?.title}&quot;? This action cannot
              be undone.
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

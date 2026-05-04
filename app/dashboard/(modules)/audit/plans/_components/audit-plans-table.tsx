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
import { AuditPlanStatusBadge } from "../../../../../../components/audit/audit-plan-status-badge";
import { Eye, Edit, Trash2, Loader2, Plus, ClipboardListIcon, View } from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import { format } from "date-fns";
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
import { Progress } from "@/components/ui/progress";
import { deleteAuditPlan } from "@/app/_actions/audit-module-actions";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { usePermissions } from "@/hooks/use-permissions";
import { notify } from "@/lib/utils";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface AuditPlansTableProps {
  plans: AuditPlan[];
  pagination?: Pagination;
  isLoading?: boolean;
}

export function AuditPlansTable({ plans, pagination, isLoading }: AuditPlansTableProps) {
  const router = useRouter();
  const { checkPermission, hasPermission } = usePermissions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<AuditPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || pagination?.page_size || 10;
    router.push(`?page=${pageConfig.page}&page_size=${pageSize}`);
  };

  const handleDeleteClick = (plan: AuditPlan) => {
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_delete")) return;
    // Only allow deletion for DRAFT plans
    if (plan.status !== "DRAFT") {
      notify({
        title: "Cannot Delete",
        description: "Only draft audit plans can be deleted.",
        type: "error"
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
        notify({
          title: "Success",
          description: "Audit plan deleted successfully",
          type: "success"
        });
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        router.refresh();
      } else {
        notify({
          title: "Error",
          description: result.message || "Failed to delete audit plan",
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

  if (plans.length === 0) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-8">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <ClipboardListIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">No Audit Plans</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Create your first audit plan to get started
          </p>

          <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">CONFIGURE TEMPLATES</div>
              <div className="text-muted-foreground">Clauses & Procedures Required</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">CREATE PLAN</div>
              <div className="text-muted-foreground">Engagement Audit Plan</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">EXECUTE</div>
              <div className="text-muted-foreground">Collect Findings & Evidence</div>
            </div>
          </div>

          <Button size="lg" className="gap-2" asChild>
            <Link href="/dashboard/audit/plans/engagement/new">
              <Plus className="h-4 w-4" />
              Create Audit Plan
            </Link>
          </Button>
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
              <TableHead className="text-foreground/70 font-bold">AUDIT TITLE</TableHead>
              <TableHead className="text-foreground/70 font-bold">
                STANDARD/FRAMEWORK TYPE
              </TableHead>
              <TableHead className="text-foreground/70 font-bold">TEAM LEADER</TableHead>
              <TableHead className="text-foreground/70 font-bold">PERIOD</TableHead>
              <TableHead className="text-foreground/70 font-bold">PROGRESS</TableHead>
              <TableHead className="text-foreground/70 font-bold">STATUS</TableHead>
              <TableHead className="text-foreground/70 w-20 text-center font-bold">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Card className="bg-canvas/50 border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center px-8 py-8">
                      <div className="relative mb-4">
                        <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
                        <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                          <ClipboardListIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
                        </div>
                      </div>

                      <h3 className="text-foreground mb-2 text-2xl font-semibold">
                        No Audit items
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-md text-center">
                        Create your first audit item to get started
                      </p>

                      <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
                        <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                          <div className="text-primary mb-1 font-mono">CONFIGURE TEMPLATES</div>
                          <div className="text-muted-foreground">Clauses & Procedures Required</div>
                        </div>
                        <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                          <div className="text-primary mb-1 font-mono">CREATE PLAN</div>
                          <div className="text-muted-foreground">Engagement Audit item</div>
                        </div>
                        <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                          <div className="text-primary mb-1 font-mono">EXECUTE</div>
                          <div className="text-muted-foreground">Collect Findings & Evidence</div>
                        </div>
                      </div>

                      <Button size="lg" className="gap-2" asChild>
                        <Link href="/dashboard/audit/items/engagement/new">
                          <Plus className="h-4 w-4" />
                          Create Audit item
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  onClick={() => {
                    router.push(`/dashboard/audit/plans/engagement/${plan.id}`);
                  }}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/audit/plans/engagement/${plan.id}`}
                        className="hover:text-primary/80 text-lg font-medium text-blue-500 hover:underline">
                        {plan.title}
                      </Link>
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {plan.audit_scope || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{plan.management_standard || " - "}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{plan.team_leader?.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {plan.audit_team_members?.length || 0} Team member
                        {plan.audit_team_members?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <p>
                        {plan.start_date ? format(new Date(plan.start_date), "MMM d, yyyy") : "-"}
                      </p>
                      <p className="text-muted-foreground">
                        {plan.end_date ? format(new Date(plan.end_date), "MMM d, yyyy") : "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {(plan as any).progress_percentage || 0}%
                        </span>
                      </div>
                      <Progress value={(plan as any).progress_percentage || 0} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1.5" asChild>
                        <Link href={`/dashboard/audit/plans/engagement/${plan.id}`}>
                          <View className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                      {plan.status === "DRAFT" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_edit")) return;
                              router.push(`/dashboard/audit/plans/engagement/${plan.id}/edit`);
                            }}
                            className="h-8 gap-1.5">
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(plan);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <CustomPagination
          pagination={pagination}
          updatePagination={handlePaginationChange}
          showDetails={true}
          allowSetPageSize={true}
        />
      )}

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
    </>
  );
}

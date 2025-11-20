"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  AlertCircle,
  MessageSquare,
  Trash2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { AuditPlanTasksPanel } from "./audit-plan-tasks-panel";
import type { AuditPlan } from "@/lib/types/audit-types";
import type { Task } from "@/lib/types/task";
import { submitAuditPlanForApproval, deleteAuditPlan } from "@/app/_actions/audit-module-actions";

interface AuditPlanApprovalsPanelProps {
  auditPlan: AuditPlan;
  tasks?: Task[];
  onStatusChange?: () => void;
}

type ApprovalRole = "hiar" | "ceo" | "audit_chair";

export function AuditPlanApprovalsPanel({
  auditPlan,
  tasks = [],
  onStatusChange
}: AuditPlanApprovalsPanelProps) {
  const queryClient = useQueryClient();
  const [submittingForApproval, setSubmittingForApproval] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeApprovalRole, setActiveApprovalRole] = useState<ApprovalRole | null>(null);

  const canSubmitForApproval = auditPlan.status?.toUpperCase() === "DRAFT";
  const isInReview = auditPlan.status?.toUpperCase() === "IN_REVIEW";
  const isApproved = auditPlan.status?.toUpperCase() === "APPROVED";
  const isRejected = auditPlan.status?.toUpperCase() === "REJECTED";

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      setSubmittingForApproval(true);
      const result = await submitAuditPlanForApproval(auditPlan.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLAN_DETAILS] });
      notify({
        title: "Success",
        description: "Audit plan submitted for approval",
        type: "success"
      });
      setSubmittingForApproval(false);
      onStatusChange?.();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit audit plan for approval",
        type: "error"
      });
      setSubmittingForApproval(false);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteAuditPlan(auditPlan.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      notify({
        title: "Success",
        description: "Audit plan deleted successfully",
        type: "success"
      });
      setDeleteDialogOpen(false);
      onStatusChange?.();

      window.location.href = "/dashboard/audit/plans";
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete audit plan",
        type: "error"
      });
    }
  });

  const getApprovalStatus = (approvedBy: any) => {
    if (approvedBy) {
      return "Approved";
    }
    return "Pending";
  };

  const getApprovalIcon = (approvedBy: any) => {
    if (approvedBy) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="mt-4 w-full">
      <AuditPlanTasksPanel auditPlanId={auditPlan.id} tasks={tasks} />
    </div>
  );
}

/*
    <Tabs defaultValue="tasks" className="mt-4 w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <AuditPlanTasksPanel auditPlanId={auditPlan.id} tasks={tasks} />
        </TabsContent>

        <TabsContent value="workflow" className="mt-6 space-y-4">
          {canSubmitForApproval && !submittingForApproval && (
            <>
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <CardContent className="flex items-start gap-3 pt-6">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Ready for Approval
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      This audit plan is in draft status. Click "Submit for Approval" to send it for
                      review.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="bg-muted mb-4 rounded-full p-4">
                    <Clock className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">No Approvals Yet</h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    This audit plan is in draft status. Submit it for approval to start the approval
                    workflow with HIAR, CEO, and Audit Board Chair.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {isInReview && (
            <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
              <CardContent className="flex items-start gap-3 pt-6">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    Awaiting Approval
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    This audit plan is awaiting approvals from the necessary stakeholders.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isRejected && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <CardContent className="flex items-start gap-3 pt-6">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">Rejected</p>
                  <p className="text-muted-foreground mt-2 text-xs font-medium">Reason:</p>
                  <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                    {auditPlan.rejection_reason || "No reason provided"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {canSubmitForApproval && (
            <div className="flex gap-2">
              <Button
                onClick={() => setSubmitConfirmationOpen(true)}
                disabled={submitMutation.isPending}
                isLoading={submitMutation.isPending}
                loadingText="Submitting..."
                className="gap-2">
                <Send className="h-4 w-4" />
                Submit for Approval
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
                className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Plan
              </Button>
            </div>
          )}

          {(isInReview || isApproved) && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>Track approval status and provide feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    activeApprovalRole === "hiar"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setActiveApprovalRole(activeApprovalRole === "hiar" ? null : "hiar")
                  }>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {getApprovalIcon(auditPlan.hiar_approved_by)}
                          <span className="font-semibold">HIAR Approval</span>
                          <Badge variant={auditPlan.hiar_approved_by ? "default" : "secondary"}>
                            {getApprovalStatus(
                              auditPlan.hiar_approved_by && auditPlan.hiar_approved_at
                            )}
                          </Badge>
                        </div>

                        {auditPlan.hiar_approved_by && (
                          <div className="space-y-1 text-xs">
                            <p className="text-muted-foreground">
                              Approved by:{" "}
                              <span className="font-medium">{auditPlan.hiar_approved_by.name}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Email:{" "}
                              <span className="font-medium">
                                {auditPlan.hiar_approved_by.email}
                              </span>
                            </p>
                            {auditPlan.hiar_approved_at && (
                              <p className="text-muted-foreground">
                                {format(
                                  new Date(auditPlan.hiar_approved_at),
                                  "MMM d, yyyy - hh:mm a"
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {auditPlan.hiar_comments && (
                          <div className="bg-muted mt-3 rounded p-3 text-xs">
                            <div className="mb-1 flex items-center gap-2">
                              <MessageSquare className="h-3 w-3" />
                              <span className="font-medium">Comments</span>
                            </div>
                            <p className="text-muted-foreground">{auditPlan.hiar_comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    activeApprovalRole === "ceo"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setActiveApprovalRole(activeApprovalRole === "ceo" ? null : "ceo")
                  }>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {getApprovalIcon(auditPlan.ceo_approved_by)}
                          <span className="font-semibold">CEO Approval</span>
                          <Badge variant={auditPlan.ceo_approved_by ? "default" : "secondary"}>
                            {getApprovalStatus(
                              auditPlan.ceo_approved_by && auditPlan.ceo_approved_at
                            )}
                          </Badge>
                        </div>

                        {auditPlan.ceo_approved_by && (
                          <div className="space-y-1 text-xs">
                            <p className="text-muted-foreground">
                              Approved by:{" "}
                              <span className="font-medium">{auditPlan.ceo_approved_by.name}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Email:{" "}
                              <span className="font-medium">{auditPlan.ceo_approved_by.email}</span>
                            </p>
                            {auditPlan.ceo_approved_at && (
                              <p className="text-muted-foreground">
                                {format(
                                  new Date(auditPlan.ceo_approved_at),
                                  "MMM d, yyyy - hh:mm a"
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {auditPlan.ceo_comments && (
                          <div className="bg-muted mt-3 rounded p-3 text-xs">
                            <div className="mb-1 flex items-center gap-2">
                              <MessageSquare className="h-3 w-3" />
                              <span className="font-medium">Comments</span>
                            </div>
                            <p className="text-muted-foreground">{auditPlan.ceo_comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    activeApprovalRole === "audit_chair"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setActiveApprovalRole(
                      activeApprovalRole === "audit_chair" ? null : "audit_chair"
                    )
                  }>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {getApprovalIcon(auditPlan.audit_chair_approved_by)}
                          <span className="font-semibold">Audit Chair Approval</span>
                          <Badge
                            variant={auditPlan.audit_chair_approved_by ? "default" : "secondary"}>
                            {getApprovalStatus(
                              auditPlan.audit_chair_approved_by && auditPlan.audit_chair_approved_at
                            )}
                          </Badge>
                        </div>

                        {auditPlan.audit_chair_approved_by && (
                          <div className="space-y-1 text-xs">
                            <p className="text-muted-foreground">
                              Approved by:{" "}
                              <span className="font-medium">
                                {auditPlan.audit_chair_approved_by.name}
                              </span>
                            </p>
                            <p className="text-muted-foreground">
                              Email:{" "}
                              <span className="font-medium">
                                {auditPlan.audit_chair_approved_by.email}
                              </span>
                            </p>
                            {auditPlan.audit_chair_approved_at && (
                              <p className="text-muted-foreground">
                                {format(
                                  new Date(auditPlan.audit_chair_approved_at),
                                  "MMM d, yyyy - hh:mm a"
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {auditPlan.audit_chair_comments && (
                          <div className="bg-muted mt-3 rounded p-3 text-xs">
                            <div className="mb-1 flex items-center gap-2">
                              <MessageSquare className="h-3 w-3" />
                              <span className="font-medium">Comments</span>
                            </div>
                            <p className="text-muted-foreground">
                              {auditPlan.audit_chair_comments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <DialogTitle className="tracking-tight">Delete Audit Plan</DialogTitle>
                </div>
                <DialogDescription className="text-muted-foreground text-xs font-medium sm:text-sm">
                  Are you sure you want to delete this audit plan? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 space-x-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  isLoading={deleteMutation.isPending}
                  loadingText="Deleting...">
                  <Trash2 className="h-4 w-4" />
                  Delete Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ConfirmationModal
            open={submitConfirmationOpen}
            onOpenChange={setSubmitConfirmationOpen}
            onConfirm={() => {
              submitMutation.mutate();
              setSubmitConfirmationOpen(false);
            }}
            title="Submit for Approval?"
            description="Are you sure you want to submit this audit plan for approval? This will send it to HIAR for review."
            confirmText="Submit"
            type="default"
            isLoading={submitMutation.isPending}
          />
        </TabsContent>
      </Tabs>


*/

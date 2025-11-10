"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, XCircle, Send, AlertCircle, MessageSquare, Trash2 } from "lucide-react";
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
import type { AuditPlan } from "@/lib/types/audit-types";
import {
  submitAuditPlanForApproval,
  approveAuditPlanAsHIAR,
  approveAuditPlanAsCEO,
  approveAuditPlanAsAuditChair,
  rejectAuditPlan,
  deleteAuditPlan
} from "@/app/_actions/audit-module-actions";

interface AuditPlanApprovalsPanelProps {
  auditPlan: AuditPlan;
  onStatusChange?: () => void;
}

type ApprovalRole = "hiar" | "ceo" | "audit_chair";

export function AuditPlanApprovalsPanel({
  auditPlan,
  onStatusChange
}: AuditPlanApprovalsPanelProps) {
  const queryClient = useQueryClient();
  const [submittingForApproval, setSubmittingForApproval] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeApprovalRole, setActiveApprovalRole] = useState<ApprovalRole | null>(null);
  const [approvalComments, setApprovalComments] = useState<Record<ApprovalRole, string>>({
    hiar: "",
    ceo: "",
    audit_chair: ""
  });

  const canSubmitForApproval = auditPlan.status?.toUpperCase() === "DRAFT";
  const isInReview = auditPlan.status?.toUpperCase() === "SUBMITTED";
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

  // HIAR approval mutation
  const hiaarApprovalMutation = useMutation({
    mutationFn: async () => {
      const result = await approveAuditPlanAsHIAR(auditPlan.id, approvalComments.hiar);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLAN_DETAILS] });
      notify({
        title: "Success",
        description: "Audit plan approved by HIAR",
        type: "success"
      });
      setActiveApprovalRole(null);
      setApprovalComments((prev) => ({ ...prev, hiar: "" }));
      onStatusChange?.();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to approve audit plan",
        type: "error"
      });
    }
  });

  // CEO approval mutation
  const ceoApprovalMutation = useMutation({
    mutationFn: async () => {
      const result = await approveAuditPlanAsCEO(auditPlan.id, approvalComments.ceo);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLAN_DETAILS] });
      notify({
        title: "Success",
        description: "Audit plan approved by CEO",
        type: "success"
      });
      setActiveApprovalRole(null);
      setApprovalComments((prev) => ({ ...prev, ceo: "" }));
      onStatusChange?.();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to approve audit plan",
        type: "error"
      });
    }
  });

  // Audit Chair approval mutation
  const auditChairApprovalMutation = useMutation({
    mutationFn: async () => {
      const result = await approveAuditPlanAsAuditChair(auditPlan.id, approvalComments.audit_chair);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLAN_DETAILS] });
      notify({
        title: "Success",
        description: "Audit plan approved by Audit Chair",
        type: "success"
      });
      setActiveApprovalRole(null);
      setApprovalComments((prev) => ({ ...prev, audit_chair: "" }));
      onStatusChange?.();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to approve audit plan",
        type: "error"
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const result = await rejectAuditPlan(auditPlan.id, rejectionReason);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLAN_DETAILS] });
      notify({
        title: "Success",
        description: "Audit plan rejected",
        type: "success"
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      onStatusChange?.();
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to reject audit plan",
        type: "error"
      });
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

  const handleApproval = async (role: ApprovalRole) => {
    if (role === "hiar") {
      hiaarApprovalMutation.mutate();
    } else if (role === "ceo") {
      ceoApprovalMutation.mutate();
    } else if (role === "audit_chair") {
      auditChairApprovalMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Alert - Ready for Approval or Awaiting Approval during submission */}
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

          {/* Empty State for Draft Status */}
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="bg-muted mb-4 rounded-full p-4">
                <Clock className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No Approvals Yet</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                This audit plan is in draft status. Submit it for approval to start the approval
                workflow with HIAR, CEO, and Audit Chair.
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

      {/* Submit for Approval Button */}
      {canSubmitForApproval && (
        <div className="flex gap-2">
          <Button
            onClick={() => submitMutation.mutate()}
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

      {/* Approval Workflow */}
      {(isInReview || isApproved) && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Track approval status and provide feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* HIAR Approval */}
            <Card
              className={`cursor-pointer transition-all ${
                activeApprovalRole === "hiar"
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setActiveApprovalRole(activeApprovalRole === "hiar" ? null : "hiar")}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getApprovalIcon(auditPlan.hiar_approved_by)}
                      <span className="font-semibold">HIAR Approval</span>
                      <Badge variant={auditPlan.hiar_approved_by ? "default" : "secondary"}>
                        {getApprovalStatus(auditPlan.hiar_approved_by)}
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
                          <span className="font-medium">{auditPlan.hiar_approved_by.email}</span>
                        </p>
                        {auditPlan.hiar_approved_at && (
                          <p className="text-muted-foreground">
                            {format(new Date(auditPlan.hiar_approved_at), "MMM d, yyyy - hh:mm a")}
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

                {/* Approval Form */}
                {activeApprovalRole === "hiar" && !auditPlan.hiar_approved_by && isInReview && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div>
                      <Label htmlFor="hiar-comments" className="text-sm">
                        Comments (Optional)
                      </Label>
                      <Textarea
                        id="hiar-comments"
                        placeholder="Add approval comments..."
                        value={approvalComments.hiar}
                        onChange={(e) =>
                          setApprovalComments((prev) => ({
                            ...prev,
                            hiar: e.target.value
                          }))
                        }
                        rows={3}
                        className="mt-2 text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => handleApproval("hiar")}
                      disabled={hiaarApprovalMutation.isPending}
                      isLoading={hiaarApprovalMutation.isPending}
                      loadingText="Approving..."
                      className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CEO Approval */}
            <Card
              className={`cursor-pointer transition-all ${
                activeApprovalRole === "ceo"
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setActiveApprovalRole(activeApprovalRole === "ceo" ? null : "ceo")}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getApprovalIcon(auditPlan.ceo_approved_by)}
                      <span className="font-semibold">CEO Approval</span>
                      <Badge variant={auditPlan.ceo_approved_by ? "default" : "secondary"}>
                        {getApprovalStatus(auditPlan.ceo_approved_by)}
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
                            {format(new Date(auditPlan.ceo_approved_at), "MMM d, yyyy - hh:mm a")}
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

                {/* Approval Form */}
                {activeApprovalRole === "ceo" && !auditPlan.ceo_approved_by && isInReview && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div>
                      <Label htmlFor="ceo-comments" className="text-sm">
                        Comments (Optional)
                      </Label>
                      <Textarea
                        id="ceo-comments"
                        placeholder="Add approval comments..."
                        value={approvalComments.ceo}
                        onChange={(e) =>
                          setApprovalComments((prev) => ({
                            ...prev,
                            ceo: e.target.value
                          }))
                        }
                        rows={3}
                        className="mt-2 text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => handleApproval("ceo")}
                      disabled={ceoApprovalMutation.isPending}
                      isLoading={ceoApprovalMutation.isPending}
                      loadingText="Approving..."
                      className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Chair Approval */}
            <Card
              className={`cursor-pointer transition-all ${
                activeApprovalRole === "audit_chair"
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() =>
                setActiveApprovalRole(activeApprovalRole === "audit_chair" ? null : "audit_chair")
              }>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getApprovalIcon(auditPlan.audit_chair_approved_by)}
                      <span className="font-semibold">Audit Chair Approval</span>
                      <Badge variant={auditPlan.audit_chair_approved_by ? "default" : "secondary"}>
                        {getApprovalStatus(auditPlan.audit_chair_approved_by)}
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
                        <p className="text-muted-foreground">{auditPlan.audit_chair_comments}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Form */}
                {activeApprovalRole === "audit_chair" &&
                  !auditPlan.audit_chair_approved_by &&
                  isInReview && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div>
                        <Label htmlFor="audit-chair-comments" className="text-sm">
                          Comments (Optional)
                        </Label>
                        <Textarea
                          id="audit-chair-comments"
                          placeholder="Add approval comments..."
                          value={approvalComments.audit_chair}
                          onChange={(e) =>
                            setApprovalComments((prev) => ({
                              ...prev,
                              audit_chair: e.target.value
                            }))
                          }
                          rows={3}
                          className="mt-2 text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => handleApproval("audit_chair")}
                        disabled={auditChairApprovalMutation.isPending}
                        isLoading={auditChairApprovalMutation.isPending}
                        loadingText="Approving..."
                        className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Reject Button */}
            {isInReview && (
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={rejectMutation.isPending}
                className="w-full gap-2">
                <XCircle className="h-4 w-4" />
                Reject Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <DialogTitle className="tracking-tight">Reject Audit Plan</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs font-medium sm:text-sm">
              Are you sure you want to reject this audit plan? This action will require the plan to
              be resubmitted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason" className="text-sm">
                Rejection Reason
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2 text-sm"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 space-x-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (rejectionReason.trim()) {
                  rejectMutation.mutate();
                } else {
                  notify({
                    title: "Error",
                    description: "Please provide a rejection reason",
                    type: "error"
                  });
                }
              }}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              isLoading={rejectMutation.isPending}
              loadingText="Rejecting...">
              <XCircle className="h-4 w-4" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}

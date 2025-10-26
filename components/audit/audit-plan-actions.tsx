"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  submitAuditPlanForApproval,
  hiarApproveAuditPlan,
  ceoApproveAuditPlan,
  auditChairApproveAuditPlan,
  rejectAuditPlan,
  activateAuditPlan,
  completeAuditPlan,
} from "@/app/_actions/audit-module-actions";
import {
  Send,
  CheckCircle,
  XCircle,
  PlayCircle,
  CheckCheck,
  Loader2,
} from "lucide-react";

interface AuditPlanActionsProps {
  auditPlanId: string;
  status: string;
  userRole?: "HIAR" | "CEO" | "AUDIT_CHAIR" | "AUDITOR"; // You can extend this based on your auth
}

export function AuditPlanActions({ auditPlanId, status, userRole = "AUDITOR" }: AuditPlanActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmitForApproval = async () => {
    setIsLoading(true);
    try {
      const result = await submitAuditPlanForApproval(auditPlanId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan submitted for HIAR approval",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit audit plan",
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
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      let result;

      if (status === "Submitted" && userRole === "HIAR") {
        result = await hiarApproveAuditPlan(auditPlanId, comments);
      } else if (status === "HIAR_Approved" && userRole === "CEO") {
        result = await ceoApproveAuditPlan(auditPlanId, comments);
      } else if (status === "CEO_Approved" && userRole === "AUDIT_CHAIR") {
        result = await auditChairApproveAuditPlan(auditPlanId, comments);
      } else {
        toast({
          title: "Error",
          description: "You don't have permission to approve at this stage",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan approved successfully",
        });
        setApproveDialogOpen(false);
        setComments("");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve audit plan",
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
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await rejectAuditPlan(auditPlanId, rejectionReason);
      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan rejected",
        });
        setRejectDialogOpen(false);
        setRejectionReason("");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject audit plan",
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
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const result = await activateAuditPlan(auditPlanId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan activated successfully",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to activate audit plan",
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
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const result = await completeAuditPlan(auditPlanId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan marked as completed",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to complete audit plan",
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
      setIsLoading(false);
    }
  };

  // Render different actions based on status
  return (
    <div className="flex items-center gap-2">
      {/* Submit for Approval - Draft status */}
      {status === "Draft" && (
        <Button onClick={handleSubmitForApproval} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Submit for Approval
        </Button>
      )}

      {/* Approval Actions - Submitted, HIAR_Approved, CEO_Approved */}
      {(status === "Submitted" || status === "HIAR_Approved" || status === "CEO_Approved") && (
        <>
          <Button onClick={() => setApproveDialogOpen(true)} disabled={isLoading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </>
      )}

      {/* Activate - AuditChair_Approved */}
      {status === "AuditChair_Approved" && (
        <Button onClick={handleActivate} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 h-4 w-4" />
          )}
          Activate Audit Plan
        </Button>
      )}

      {/* Complete - Active */}
      {status === "Active" && (
        <Button onClick={handleComplete} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-4 w-4" />
          )}
          Complete Audit
        </Button>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Audit Plan</DialogTitle>
            <DialogDescription>
              Add optional comments for this approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments or notes..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Audit Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this audit plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

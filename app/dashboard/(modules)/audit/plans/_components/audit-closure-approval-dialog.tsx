"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useApproveAuditClosureMutation } from "@/hooks/use-audit-closure-mutations";

interface AuditClosureApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditPlanId: string;
  approverRole: "MANAGER" | "CEO";
  closureNotes?: string;
}

export function AuditClosureApprovalDialog({
  open,
  onOpenChange,
  auditPlanId,
  approverRole,
  closureNotes
}: AuditClosureApprovalDialogProps) {
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const approveMutation = useApproveAuditClosureMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (approvalStatus === "REJECTED" && !approvalNotes.trim()) {
      newErrors.approvalNotes = "Rejection reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "approvalNotes") {
      setApprovalNotes(value);
    }

    // Clear field error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    approveMutation.mutate(
      {
        auditPlanId,
        approvalStatus,
        approvalNotes: approvalNotes || undefined,
        approverRole
      },
      {
        onSuccess: () => {
          setApprovalStatus("APPROVED");
          setApprovalNotes("");
          setErrors({});
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-md">
        <DialogHeader>
          <DialogTitle>Audit Closure {approvalRole === "MANAGER" ? "Manager" : "Executive"} Approval</DialogTitle>
          <DialogDescription>
            Review and approve or reject the audit closure request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Closure Notes Summary */}
          {closureNotes && (
            <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Audit Team's Closure Notes:</p>
                  <p className="text-xs text-foreground/90">{closureNotes}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Approval Status Selector */}
          <div className="space-y-2">
            <Label>Decision</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setApprovalStatus("APPROVED")}>
                <input
                  type="radio"
                  id="approve"
                  name="status"
                  value="APPROVED"
                  checked={approvalStatus === "APPROVED"}
                  onChange={(e) => setApprovalStatus(e.target.value as "APPROVED" | "REJECTED")}
                  className="h-4 w-4"
                />
                <label htmlFor="approve" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Approve Closure</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Audit closure is authorized and compliant
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setApprovalStatus("REJECTED")}>
                <input
                  type="radio"
                  id="reject"
                  name="status"
                  value="REJECTED"
                  checked={approvalStatus === "REJECTED"}
                  onChange={(e) => setApprovalStatus(e.target.value as "APPROVED" | "REJECTED")}
                  className="h-4 w-4"
                />
                <label htmlFor="reject" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-sm">Reject Closure</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Request additional actions or information
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Approval Notes */}
          <div className="space-y-2">
            <Label htmlFor="approval_notes">
              {approvalStatus === "REJECTED" ? (
                <>
                  Reason for Rejection <span className="text-red-500">*</span>
                </>
              ) : (
                "Comments (Optional)"
              )}
            </Label>
            <Textarea
              id="approval_notes"
              placeholder={
                approvalStatus === "REJECTED"
                  ? "Explain why the closure cannot be approved..."
                  : "Add any comments or observations..."
              }
              value={approvalNotes}
              onChange={(e) => handleInputChange("approvalNotes", e.target.value)}
              rows={3}
              className={errors.approvalNotes ? "border-red-500" : ""}
            />
            {errors.approvalNotes && (
              <p className="text-sm text-red-500">{errors.approvalNotes}</p>
            )}
          </div>

          {/* Approval Type Info */}
          <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {approverRole === "MANAGER"
                ? "As a Manager, your approval confirms the audit meets organizational standards and compliance requirements."
                : "As an Executive, your approval finalizes the audit closure and will mark the audit as COMPLETED in the system."}
            </AlertDescription>
          </Alert>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={approveMutation.isPending}
              variant={approvalStatus === "REJECTED" ? "destructive" : "default"}
            >
              {approveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {approvalStatus === "REJECTED" ? "Reject Closure" : "Approve Closure"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

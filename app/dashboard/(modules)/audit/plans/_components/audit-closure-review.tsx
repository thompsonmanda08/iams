"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
  Users,
  ClipboardList,
  Lock
} from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import {
  useAuditClosureValidation,
  useRequestAuditClosureMutation
} from "@/hooks/use-audit-closure-mutations";
import { useSession } from "@/store/session-store";
import type { ClosureChecklistResult } from "@/app/_actions/audit-closure-actions";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";

interface AuditClosureReviewProps {
  auditPlan: AuditPlan;
  onClosureRequested?: () => void;
}

export function AuditClosureReview({ auditPlan, onClosureRequested }: AuditClosureReviewProps) {
  const { session } = useSession();
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [closureNotes, setClosureNotes] = useState("");
  const [teamLeadSignOff, setTeamLeadSignOff] = useState(false);

  // Check if current user is the audit team lead
  const isTeamLead =
    session?.user?.id === auditPlan?.audit_team_leader ||
    session?.user?.email === auditPlan?.audit_team_leader;

  // Load closure validation using query hook
  const { data: closureData, isLoading } = useAuditClosureValidation(
    auditPlan.status === "APPROVED" || auditPlan.status === "COMPLETED" ? auditPlan.id : ""
  );

  // Request closure mutation
  const { mutate: requestClosure, isPending: isSubmitting } = useRequestAuditClosureMutation();

  const handleValidateAndConfirm = () => {
    if (!isTeamLead) {
      notify({
        title: "Authorization Error",
        description: "Only the audit team lead can request closure",
        type: "error"
      });
      return;
    }

    if (!closureNotes.trim()) {
      notify({
        title: "Validation Error",
        description: "Please provide closure notes",
        type: "error"
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmationDialog(true);
  };

  const handleRequestClosure = () => {
    // Team Lead requesting closure implicitly signs off
    requestClosure(
      {
        auditPlanId: auditPlan.id,
        closureNotes,
        teamLeadSignOff: true
      },
      {
        onSuccess: () => {
          setShowClosureDialog(false);
          setShowConfirmationDialog(false);
          setClosureNotes("");
          setTeamLeadSignOff(false);
          onClosureRequested?.();
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!closureData) {
    return null;
  }

  const canRequestClosure = closureData.readyForClosure;
  const completedCount = closureData.checklists.filter((c) => c.completed).length;
  const totalCount = closureData.checklists.length;

  return (
    <div className="space-y-6">
      {/* Closure Status Header */}
      <Card
        className={cn("border-2", canRequestClosure ? "border-green-200" : "border-yellow-200")}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {canRequestClosure ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Ready for Closure
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Closure Requirements Pending
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {canRequestClosure
                  ? "All closure requirements are met. You can request audit closure."
                  : `${closureData.closureBlockers.length} requirement${closureData.closureBlockers.length !== 1 ? "s" : ""} pending`}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="mb-1 text-2xl font-bold">
                {completedCount}/{totalCount}
              </div>
              <p className="text-muted-foreground text-xs">Requirements Met</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Closure Blockers Alert */}
      {!canRequestClosure && closureData.closureBlockers.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cannot Request Closure:</strong>
            <ul className="mt-2 list-inside space-y-1">
              {closureData.closureBlockers.map((blocker, idx) => (
                <li key={idx} className="text-sm">
                  • {blocker}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Closure Checklists */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Workpapers Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-5 w-5" />
              Workpapers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {closureData.checklists
              .filter((c) => c.category === "workpaper")
              .map((checklist) => (
                <div key={checklist.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      checklist.completed ? "bg-green-100" : "bg-slate-100"
                    )}>
                    {checklist.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{checklist.name}</p>
                    <p className="text-muted-foreground text-xs">{checklist.description}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Findings Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {closureData.checklists
              .filter((c) => c.category === "findings")
              .map((checklist) => (
                <div key={checklist.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      checklist.completed ? "bg-green-100" : "bg-slate-100"
                    )}>
                    {checklist.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{checklist.name}</p>
                    <p className="text-muted-foreground text-xs">{checklist.description}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Actions Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {closureData.checklists
              .filter((c) => c.category === "actions")
              .map((checklist) => (
                <div key={checklist.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      checklist.completed ? "bg-green-100" : "bg-slate-100"
                    )}>
                    {checklist.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{checklist.name}</p>
                    <p className="text-muted-foreground text-xs">{checklist.description}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Approvals Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {closureData.checklists
              .filter((c) => c.category === "approvals" || c.category === "documentation")
              .map((checklist) => (
                <div key={checklist.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      checklist.completed ? "bg-green-100" : "bg-slate-100"
                    )}>
                    {checklist.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{checklist.name}</p>
                    <p className="text-muted-foreground text-xs">{checklist.description}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="bg-slate-50 dark:bg-slate-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Closure Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Workpapers</p>
              <p className="text-2xl font-bold">
                {closureData.summary.completedWorkpapers}/{closureData.summary.totalWorkpapers}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Findings</p>
              <p className="text-2xl font-bold">
                {closureData.summary.resolvedFindings}/{closureData.summary.totalFindings}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Actions</p>
              <p className="text-2xl font-bold">
                {closureData.summary.approvedActions}/{closureData.summary.totalActions}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold">{closureData.summary.openApprovals}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Closure Button */}
      <div className="space-y-2">
        <Button
          onClick={() => {
            if (!isTeamLead) {
              notify({
                title: "Authorization Error",
                description: "Only the audit team lead can request closure",
                type: "error"
              });
              return;
            }
            setShowClosureDialog(true);
          }}
          disabled={!canRequestClosure || !isTeamLead}
          className="w-full gap-2"
          size="lg">
          {!isTeamLead ? (
            <>
              <Lock className="h-5 w-5" />
              Only Team Lead Can Request Closure
            </>
          ) : (
            <>
              <FileCheck className="h-5 w-5" />
              Request Audit Closure
            </>
          )}
        </Button>
        {!isTeamLead && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only the audit team lead (
              {auditPlan?.team_leader?.name ||
               auditPlan?.audit_team_leader_user?.name ||
               auditPlan?.audit_team_leader})
              can request closure.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Closure Dialog */}
      <Dialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Audit Closure</DialogTitle>
            <DialogDescription>
              Submit this audit for closure review and authorization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Closure Notes */}
            <div className="space-y-2">
              <Label htmlFor="closure_notes">
                Closure Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="closure_notes"
                placeholder="Summarize the audit execution, key findings, and remediation actions..."
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                rows={4}
              />
              <p className="text-muted-foreground text-xs">
                Provide a brief summary of the audit and closure recommendations
              </p>
            </div>

            {/* Team Lead Sign-Off Notice */}
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Team Lead Sign-Off
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  By requesting closure, you certify that this audit has been completed in
                  accordance with audit standards and all findings have been appropriately
                  documented and addressed.
                </p>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClosureDialog(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleValidateAndConfirm}
                disabled={isSubmitting || !closureNotes.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Closure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closure Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
        onConfirm={handleRequestClosure}
        title="Confirm Audit Closure Request"
        description="Are you sure you want to request closure for this audit? Once submitted, this request will be sent to management for approval."
        confirmText="Confirm & Submit"
        type="default"
        isLoading={isSubmitting}
      />
    </div>
  );
}

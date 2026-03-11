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
  useRequestAuditClosureMutation,
  useSubmitAuditeeSignOffMutation
} from "@/hooks/use-audit-closure-mutations";
import { useSession } from "@/store/session-store";
import type { ClosureChecklistResult } from "@/app/_actions/audit-closure-actions";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";

interface AuditClosureReviewProps {
  auditPlan: AuditPlan;
  frameworkType?: string;
  onClosureRequested?: () => void;
}

export function AuditClosureReview({ auditPlan, frameworkType, onClosureRequested }: AuditClosureReviewProps) {
  const { session } = useSession();
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSignOffDialog, setShowSignOffDialog] = useState(false);
  const [signOffComments, setSignOffComments] = useState("");
  const [closureNotes, setClosureNotes] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);

  // Single source of truth: frameworkType prop (from page.tsx) takes precedence.
  // Falls back to auditPlan fields for backwards compatibility.
  const isGeneralFramework = [
    frameworkType,
    auditPlan.framework_type,
    auditPlan.management_standard
  ].some((f) => String(f ?? "").toUpperCase() === "GENERAL");

  // Check if current user is the audit team lead
  const isTeamLead =
    session?.user?.id === auditPlan?.audit_team_leader ||
    session?.user?.email === auditPlan?.audit_team_leader;

  // Load closure validation using query hook
  const { data: closureData, isLoading } = useAuditClosureValidation(
    ["APPROVED", "COMPLETED", "CLOSURE_REVIEW", "CLOSED"].includes(auditPlan.status ?? "")
      ? auditPlan.id
      : ""
  );

  // Request closure mutation
  const { mutate: requestClosure, isPending: isSubmitting } = useRequestAuditClosureMutation();

  // Auditee sign-off mutation
  const { mutate: submitSignOff, isPending: isSignOffSubmitting } =
    useSubmitAuditeeSignOffMutation();

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

    handleRequestClosure();
  };

  const handleRequestClosure = () => {
    setRequestError(null);
    // Team Lead requesting closure implicitly signs off
    requestClosure(
      {
        auditPlanId: auditPlan.id,
        closureNotes,
        teamLeadSignOff: true
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            // Only close dialogs on success
            setShowClosureDialog(false);
            setShowConfirmationDialog(false);
            setClosureNotes("");
            setRequestError(null);
            onClosureRequested?.();
          } else {
            // Keep dialog open and show error alert
            setRequestError(response.message || "Failed to request audit closure");
            setShowConfirmationDialog(false);
          }
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
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <Lock className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">Closure Not Available Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Audit closure becomes available once the audit plan has been approved. Complete the
            workpapers and submit for approval to unlock this section.
          </p>

          <div className="mb-4 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">1. COMPLETE WORKPAPERS</div>
              <div className="text-muted-foreground">Finish all audit work</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">2. SUBMIT FOR APPROVAL</div>
              <div className="text-muted-foreground">Get plan approved</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">3. REQUEST CLOSURE</div>
              <div className="text-muted-foreground">Close the audit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
            {isGeneralFramework && (
              <p className="text-muted-foreground mt-2 text-xs">
                For general audits, workpaper completion requires both metadata (Work Done +
                Conclusion) to be filled and all evidence rows resolved.
              </p>
            )}
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
              .map((checklist) => {
                if (checklist.id === "auditee-sign-off") {
                  return (
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
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{checklist.name}</p>
                          <button
                            onClick={() => {
                              setSignOffComments(auditPlan.sign_off_comments ?? "");
                              setShowSignOffDialog(true);
                            }}
                            className="text-primary hover:text-primary/80 text-xs underline underline-offset-2">
                            {auditPlan.sign_off_comments?.trim()
                              ? "Update Sign-Off"
                              : "Provide Sign-Off"}
                          </button>
                        </div>
                        {auditPlan.sign_off_comments?.trim() ? (
                          <p className="mt-1 rounded bg-green-50 px-2 py-1 text-xs text-green-800 dark:bg-green-950/30 dark:text-green-200">
                            {auditPlan.sign_off_comments}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-xs">{checklist.description}</p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
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
                );
              })}
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
      {auditPlan?.status != "CLOSURE_REVIEW" && (
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
              setShowConfirmationDialog(true);
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
                  auditPlan?.audit_team_leader}
                ) can request closure.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Closure Dialog */}
      <Dialog
        open={showClosureDialog}
        onOpenChange={(open) => {
          setShowClosureDialog(open);
          if (open) {
            setRequestError(null);
          }
        }}>
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

            {/* Auditee Sign-Off Status */}
            {auditPlan.sign_off_comments?.trim() ? (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Auditee has signed off
                  </p>
                  <p className="mt-1 text-xs text-green-800 dark:text-green-200">
                    {auditPlan.sign_off_comments}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Auditee Sign-Off Pending
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Auditee sign-off is optional for now. The auditee will complete this by
                    reviewing findings on the Execution tab.
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {requestError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{requestError}</AlertDescription>
              </Alert>
            )}

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

      {/* Auditee Sign-Off Dialog */}
      <Dialog
        open={showSignOffDialog}
        onOpenChange={(open) => {
          setShowSignOffDialog(open);
          if (!open) setSignOffComments("");
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Auditee Sign-Off</DialogTitle>
            <DialogDescription>
              Provide sign-off comments confirming your review of the audit findings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sign_off_comments">
                Sign-Off Comments <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="sign_off_comments"
                placeholder="Confirm that you have reviewed all findings and provide any observations..."
                value={signOffComments}
                onChange={(e) => setSignOffComments(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSignOffDialog(false)}
                disabled={isSignOffSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  submitSignOff(
                    { auditPlanId: auditPlan.id, signOffComments },
                    {
                      onSuccess: (res) => {
                        if (res.success) {
                          setShowSignOffDialog(false);
                          setSignOffComments("");
                        }
                      }
                    }
                  );
                }}
                disabled={isSignOffSubmitting || !signOffComments.trim()}>
                {isSignOffSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Sign-Off
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closure Confirmation Modal — shown first on button click */}
      <ConfirmationModal
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
        onConfirm={() => {
          setShowConfirmationDialog(false);
          setShowClosureDialog(true);
        }}
        title="Request Audit Closure"
        description="You are about to submit this audit for closure. This will send a closure request to management for approval. Do you want to proceed?"
        confirmText="Yes, Proceed"
        type="default"
      />
    </div>
  );
}

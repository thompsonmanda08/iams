"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  useRequestAuditClosureMutation,
  useSubmitAuditeeSignOffMutation,
  useRequestSignOffNotificationMutation,
  useFindingActionsQuery
} from "@/hooks/use-audit-closure-mutations";
import { useSession } from "@/store/session-store";
import { computeClosureChecklist } from "@/lib/utils/audit-closure-checklist";
import type { ClosureChecklist } from "@/app/_actions/audit-closure-actions";
import { cn, notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

const CLOSURE_ENABLED_STATUSES = ["APPROVED", "COMPLETED", "CLOSURE_REVIEW", "CLOSED"];

interface AuditClosureReviewProps {
  auditPlan: AuditPlan;
  frameworkType?: string;
  /** Workpaper for the audit plan (already fetched by the parent page) */
  workpaper?: any;
  /** Resolved findings array — generalFindings for GENERAL, findings for compliance */
  findings?: any[];
  /** Workflow tasks already fetched by the parent page */
  userTasks?: any[];
  onClosureRequested?: () => void;
  /** Called after auditee sign-off succeeds so the parent can update its local auditPlan state */
  onAuditPlanUpdate?: (updates: Partial<AuditPlan>) => void;
}

// ---------------------------------------------------------------------------
// Shared checklist row — used by all four category cards
// ---------------------------------------------------------------------------
function ChecklistItem({
  checklist,
  actions,
  description
}: {
  checklist: ClosureChecklist;
  /** Optional button/link rendered to the right of the name */
  actions?: React.ReactNode;
  /** Override description with custom ReactNode (e.g. coloured sign-off preview) */
  description?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
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
        <div className={cn("flex items-center gap-2", actions && "justify-between")}>
          <p className="text-sm font-medium">{checklist.name}</p>
          {actions}
        </div>
        <div className="text-muted-foreground mt-0.5 text-xs">
          {description ?? checklist.description}
        </div>
      </div>
    </div>
  );
}

export function AuditClosureReview({
  auditPlan,
  frameworkType,
  workpaper = null,
  findings = [],
  userTasks = [],
  onClosureRequested,
  onAuditPlanUpdate
}: AuditClosureReviewProps) {
  const { session, user: currentUser } = useSession();
  // useSession.user is the full /auth/setup payload (with `.user` nested);
  // session is the JWT cookie payload (may have user_id and a flat user object).
  const currentUserId =
    session?.user?.id ??
    session?.user_id ??
    (currentUser as any)?.user?.id ??
    (currentUser as any)?.id;
  const currentUserEmail = (
    session?.user?.email ??
    (currentUser as any)?.user?.email ??
    (currentUser as any)?.email ??
    ""
  ).toLowerCase();
  const { checkPermission, hasPermission } = usePermissions();
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSignOffDialog, setShowSignOffDialog] = useState(false);
  const [showViewSignOffDialog, setShowViewSignOffDialog] = useState(false);
  const [showRequestSignOffConfirm, setShowRequestSignOffConfirm] = useState(false);
  const [signOffComments, setSignOffComments] = useState("");
  const [closureNotes, setClosureNotes] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);

  const isGeneralFramework = [
    frameworkType,
    auditPlan.framework_type,
    auditPlan.management_standard
  ].some((f) => String(f ?? "").toUpperCase() === "GENERAL");

  const teamLeaderId = auditPlan?.audit_team_leader;
  const teamLeaderEmail = (
    auditPlan?.audit_team_leader_user?.email ??
    auditPlan?.team_leader?.email ??
    ""
  ).toLowerCase();
  const isTeamLead =
    (!!currentUserId && !!teamLeaderId && currentUserId === teamLeaderId) ||
    (!!currentUserEmail && !!teamLeaderEmail && currentUserEmail === teamLeaderEmail) ||
    // Backend may stuff email into the audit_team_leader field directly
    (!!currentUserEmail && currentUserEmail === String(teamLeaderId ?? "").toLowerCase());

  const isClosureEnabled = CLOSURE_ENABLED_STATUSES.includes(auditPlan.status ?? "");

  // Only fetch finding actions when closure is enabled — only remaining network call
  const safeFindings = Array.isArray(findings) ? findings : [];
  const findingIds = isClosureEnabled ? safeFindings.map((f: any) => f.id).filter(Boolean) : [];
  const { data: findingActions = [], isLoading: isLoadingActions } =
    useFindingActionsQuery(findingIds);

  // Compute checklist entirely client-side from already-available data
  const closureData = useMemo(() => {
    if (!isClosureEnabled) return null;
    return computeClosureChecklist({
      auditPlan,
      workpaper,
      findings: safeFindings,
      actions: findingActions,
      userTasks: Array.isArray(userTasks) ? userTasks : [],
      isGeneralFramework
    });
  }, [
    auditPlan,
    workpaper,
    findings,
    findingActions,
    userTasks,
    isGeneralFramework,
    isClosureEnabled
  ]);

  const { mutate: requestClosure, isPending: isSubmitting } = useRequestAuditClosureMutation();
  const { mutate: submitSignOff, isPending: isSignOffSubmitting } =
    useSubmitAuditeeSignOffMutation();
  const { mutate: requestSignOffNotification, isPending: isRequestingSignOff } =
    useRequestSignOffNotificationMutation();

  const handleValidateAndConfirm = () => {
    if (!isTeamLead) {
      notify({
        title: "Authorization Error",
        description: "Only the audit team lead can request closure",
        type: "error"
      });
      return;
    }
    // Hard block: closure endpoint must never be called without management sign-off
    if (!auditPlan.management_comments?.trim()) {
      setShowClosureDialog(false);
      notify({
        title: "Sign-Off Required",
        description:
          "Audit closure requires management sign-off comments. Use 'Request Sign-Off' to notify the Auditee Department Head.",
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
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_approve")) return;
    setRequestError(null);
    requestClosure(
      { auditPlanId: auditPlan.id, closureNotes, teamLeadSignOff: true },
      {
        onSuccess: (response) => {
          if (response.success) {
            setShowClosureDialog(false);
            setShowConfirmationDialog(false);
            setClosureNotes("");
            setRequestError(null);
            onClosureRequested?.();
          } else {
            setRequestError(response.message || "Failed to request audit closure");
            setShowConfirmationDialog(false);
          }
        }
      }
    );
  };

  if (isLoadingActions && isClosureEnabled && findingIds.length > 0) {
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
            {[
              { step: "1. COMPLETE WORKPAPERS", sub: "Finish all audit work" },
              { step: "2. SUBMIT FOR APPROVAL", sub: "Get plan approved" },
              { step: "3. REQUEST CLOSURE", sub: "Close the audit" }
            ].map(({ step, sub }) => (
              <div key={step} className="bg-canvas border-border rounded-lg border p-4 text-center">
                <div className="text-primary mb-1 font-mono">{step}</div>
                <div className="text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const canRequestClosure = closureData.readyForClosure;
  const completedCount = closureData.checklists.filter((c) => c.completed).length;
  const totalCount = closureData.checklists.length;
  const signedOff = auditPlan.management_comments?.trim();

  return (
    <div className="space-y-6">
      {/* Closure Status Header */}
      <Card
        className={cn(
          "border-2",
          canRequestClosure
            ? "border-green-200 bg-green-400/5"
            : "border-yellow-200 bg-yellow-400/5"
        )}>
        <CardHeader className="">
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
        {/* Workpapers */}
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
              .map((c) => (
                <ChecklistItem key={c.id} checklist={c} />
              ))}
            {isGeneralFramework && (
              <p className="text-muted-foreground mt-2 text-xs">
                For general audits, workpaper completion requires both metadata (Work Done +
                Conclusion) to be filled and all evidence rows resolved.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Findings */}
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
              .map((c) => (
                <ChecklistItem key={c.id} checklist={c} />
              ))}
          </CardContent>
        </Card>

        {/* Actions */}
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
              .map((c) => {
                if (c.id !== "auditee-sign-off") return <ChecklistItem key={c.id} checklist={c} />;

                return (
                  <ChecklistItem
                    key={c.id}
                    checklist={c}
                    actions={
                      signedOff ? (
                        <button
                          onClick={() => setShowViewSignOffDialog(true)}
                          className="text-primary hover:text-primary/80 text-xs underline underline-offset-2">
                          View Sign-Off
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSignOffComments("");
                              setShowSignOffDialog(true);
                            }}
                            className="text-primary hover:text-primary/80 text-xs underline underline-offset-2">
                            Provide Sign-Off
                          </button>
                          <button
                            onClick={() => setShowRequestSignOffConfirm(true)}
                            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2">
                            Request Sign-Off
                          </button>
                        </div>
                      )
                    }
                    description={
                      signedOff ? (
                        <p className="mt-1 rounded bg-green-50 px-2 py-1 text-green-800 dark:bg-green-950/30 dark:text-green-200">
                          {auditPlan.management_comments}
                        </p>
                      ) : undefined
                    }
                  />
                );
              })}
          </CardContent>
        </Card>

        {/* Approvals */}
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
              .map((c) => (
                <ChecklistItem key={c.id} checklist={c} />
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
            {[
              {
                label: "Workpapers",
                value: `${closureData.summary.completedWorkpapers}/${closureData.summary.totalWorkpapers}`
              },
              {
                label: "Findings",
                value: `${closureData.summary.resolvedFindings}/${closureData.summary.totalFindings}`
              },
              {
                label: "Actions",
                value: `${closureData.summary.approvedActions}/${closureData.summary.totalActions}`
              },
              { label: "Pending Approvals", value: closureData.summary.openApprovals }
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Closure Button */}
      {auditPlan?.status !== "CLOSURE_REVIEW" && (
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
              if (!signedOff) {
                requestSignOffNotification(auditPlan.id, {
                  onSuccess: (res) => {
                    if (res.success) {
                      notify({
                        title: "Sign-Off Required",
                        description:
                          "A sign-off request has been sent to the Auditee Department Head. Closure will only be possible once management sign-off comments are provided.",
                        type: "info"
                      });
                    }
                  }
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

      {/* ── Dialogs ── */}

      {/* Request Closure Dialog */}
      <Dialog
        open={showClosureDialog}
        onOpenChange={(open) => {
          setShowClosureDialog(open);
          if (open) setRequestError(null);
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Audit Closure</DialogTitle>
            <DialogDescription>
              Submit this audit for closure review and authorization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            {signedOff ? (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Auditee has signed off
                  </p>
                  <p className="mt-1 text-xs text-green-800 dark:text-green-200">
                    {auditPlan.management_comments}
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
                    Auditee sign-off is optional for now. The auditee department head can provide
                    sign-off comments from the Actions card on this tab.
                  </p>
                </div>
              </div>
            )}

            {requestError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{requestError}</AlertDescription>
              </Alert>
            )}

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

      {/* Provide Sign-Off Dialog */}
      <Dialog
        open={showSignOffDialog}
        onOpenChange={(open) => {
          setShowSignOffDialog(open);
          if (!open) setSignOffComments("");
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Auditee Sign-Off</DialogTitle>
            <DialogDescription>
              Submit management comments confirming your review of the audit findings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="management_comments">
                Sign-Off Comments <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="management_comments"
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
                    { auditPlanId: auditPlan.id, managementComments: signOffComments },
                    {
                      onSuccess: (res) => {
                        if (res.success) {
                          setShowSignOffDialog(false);
                          onAuditPlanUpdate?.({ management_comments: signOffComments });
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

      {/* View Sign-Off (readonly) Dialog */}
      <Dialog open={showViewSignOffDialog} onOpenChange={setShowViewSignOffDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Auditee Sign-Off Comments</DialogTitle>
            <DialogDescription>
              Sign-off comments provided by the auditee department head
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 rounded-md border p-4 text-sm whitespace-pre-wrap">
            {auditPlan.management_comments}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowViewSignOffDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Sign-Off Confirmation */}
      <ConfirmationModal
        open={showRequestSignOffConfirm}
        onOpenChange={setShowRequestSignOffConfirm}
        title="Request Auditee Sign-Off"
        description="The Auditee Department Head will be notified via email to log in and provide sign-off comments on this audit plan. Do you want to proceed?"
        confirmText="Send Notification"
        type="default"
        isLoading={isRequestingSignOff}
        onConfirm={() => {
          requestSignOffNotification(auditPlan.id, {
            onSuccess: (res) => {
              if (res.success) {
                setShowRequestSignOffConfirm(false);
                notify({
                  title: "Notification Sent",
                  description: "The Auditee Department Head has been notified via email",
                  type: "success"
                });
              }
            }
          });
        }}
      />

      {/* Closure Confirmation */}
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

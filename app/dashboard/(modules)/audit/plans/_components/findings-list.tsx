"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock, FileText, Link as LinkIcon, Plus } from "lucide-react";
import { FindingActionsMenu } from "./finding-actions-menu";
import { useFindingEvidence } from "@/hooks/use-evidence-queries";
import { useFindingActionsByFinding } from "@/hooks/use-finding-actions-queries";
import { AssignFindingActionDialog } from "./assign-finding-action-dialog";
import { FindingDetailsDialog } from "./finding-details-dialog";
import { RequiresApprovalState } from "./requires-approval-state";
import type { AuditPlan } from "@/lib/types/audit-types";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

interface FindingsListProps {
  findings: any[];
  onRefresh: () => void;
  onEditFinding: (finding: any) => void;
  auditPlanStatus?: string;
  auditPlan?: AuditPlan;
  onSubmitForApproval?: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const SEVERITY_RAIL: Record<string, string> = {
  LOW: "bg-blue-500/70 dark:bg-blue-400/70",
  MEDIUM: "bg-amber-500/80 dark:bg-amber-400/80",
  HIGH: "bg-orange-500/80 dark:bg-orange-400/80",
  CRITICAL: "bg-red-500/90 dark:bg-red-400/90"
};

const COMPLIANCE_TONE: Record<string, string> = {
  compliant:
    "border-emerald-300/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "non-compliant":
    "border-rose-300/70 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  partial:
    "border-amber-300/70 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
};

const STATUS_ICONS: Record<string, any> = {
  OPEN: <AlertCircle className="h-4 w-4 text-red-500" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  RESOLVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  CLOSED: <CheckCircle2 className="h-4 w-4 text-gray-500" />
};

function complianceTone(status?: string | null) {
  const key = String(status ?? "").toLowerCase();
  return COMPLIANCE_TONE[key] ?? "border-border bg-muted/40 text-muted-foreground";
}

// Individual finding card component with evidence
function FindingCard({ finding, onEditFinding, onRefresh, auditPlanStatus }: any) {
  const { checkPermission, hasPermission } = usePermissions();
  const [assignActionDialogOpen, setAssignActionDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { data: evidenceData } = useFindingEvidence(finding.id);
  const { data: actions } = useFindingActionsByFinding(finding.id);
  const evidenceList = evidenceData?.evidence || [];
  const actionsCount = actions?.length || 0;
  const isFindingApproved = ["APPROVED", "CLOSED"].includes(finding.status);
  const totalEvidence = evidenceData?.total_count || 0;
  const evidenceStats = {
    total: totalEvidence,
    verified: isFindingApproved ? totalEvidence : (evidenceData?.verified_count || 0),
    unverified: isFindingApproved ? 0 : (evidenceData?.unverified_count || 0)
  };

  // Check if finding is editable (only in specific statuses)
  const isEditable = ["OPEN", "IN_PROGRESS", "DRAFT"].includes(finding.status);

  // Compliant findings need no remediation — block action assignment
  const isCompliant = finding.compliance_status?.toLowerCase() === "compliant";

  // Check if can assign actions (only when audit is COMPLETED, APPROVED, or REJECTED, and finding is not compliant)
  const canAssignAction =
    !isCompliant && ["COMPLETED", "APPROVED", "REJECTED", "CLOSED"].includes(finding.status);

  // Strip leading "Conforms - " / "Conforms -" boilerplate from clause descriptions
  // so the actual non-conformity language reads first.
  const cleanClauseDescription = (raw?: string | null) =>
    String(raw ?? "")
      .trim()
      .replace(/^conforms\s*-\s*/i, "");

  const clauseDescription = cleanClauseDescription(
    finding.clause_description || finding.category?.description
  );
  const categoryGroup =
    finding.category?.display_name || finding.category_name || finding.clauseTitle;
  const severityRail = SEVERITY_RAIL[finding.severity] ?? "bg-muted";
  const compliancePct =
    typeof finding.compliance_percentage === "number" ? finding.compliance_percentage : null;

  return (
    <>
    <Card
      className="group relative cursor-pointer gap-2 overflow-hidden pl-1 transition-shadow hover:shadow-md"
      onClick={() => setDetailsDialogOpen(true)}>
      {/* Severity rail */}
      <div
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1.5 ${severityRail}`}
      />
      <CardHeader className="pl-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Eyebrow: category group + finding number */}
            <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em]">
              {finding.framework && (
                <span className="text-foreground/80">{finding.framework}</span>
              )}
              {categoryGroup && (
                <>
                  <span aria-hidden>·</span>
                  <span className="truncate">{categoryGroup}</span>
                </>
              )}
              {finding.finding_number && (
                <>
                  <span aria-hidden>·</span>
                  <span className="border-border bg-muted/40 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-wider">
                    #{finding.finding_number}
                  </span>
                </>
              )}
            </div>

            {/* Primary line: clause number + clause description as the title */}
            <div className="flex items-baseline gap-3">
              {finding.clause_number && (
                <span className="text-primary font-mono text-2xl font-bold leading-none tabular-nums">
                  {finding.clause_number}
                </span>
              )}
              <CardTitle className="text-base font-semibold leading-snug">
                {clauseDescription || categoryGroup || "Unnamed Finding"}
              </CardTitle>
            </div>

            {/* Chip row: severity / status / compliance / actions count */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {STATUS_ICONS[finding.status] && (
                <span className="inline-flex items-center">
                  {STATUS_ICONS[finding.status]}
                </span>
              )}
              {finding.severity && (
                <Badge className={`${SEVERITY_COLORS[finding.severity] || ""}`}>
                  {finding.severity}
                </Badge>
              )}
              {finding.status && (
                <Badge variant="outline" className="font-medium">
                  {finding.status}
                </Badge>
              )}
              {finding.compliance_status && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${complianceTone(
                    finding.compliance_status
                  )}`}>
                  {finding.compliance_status}
                  {compliancePct !== null && compliancePct > 0 && (
                    <span className="opacity-70">· {compliancePct}%</span>
                  )}
                </span>
              )}
              {actionsCount > 0 && (
                <Badge variant="secondary">
                  {actionsCount} Action{actionsCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {canAssignAction && (
              <PermissionButton
                moduleCode={MODULE_CODES.AUDIT_WPS}
                action="can_assign"
                size="sm"
                variant="outline"
                onClick={() => setAssignActionDialogOpen(true)}
                className="gap-2">
                <Plus className="mr-2 h-4 w-4" />
                Assign Action
              </PermissionButton>
            )}
            {isEditable && (
              <FindingActionsMenu
                findingId={finding.id}
                currentStatus={finding.status || "OPEN"}
                onEdit={() => onEditFinding(finding)}
                onRefresh={onRefresh}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pl-4 text-sm">
        {/* Main Finding Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          {(
            [
              { label: "Conclusion", value: finding.conclusion, clamp: "line-clamp-2" },
              { label: "Workings & Test Results", value: finding.workings_and_test_results, clamp: "line-clamp-3 text-sm" },
              { label: "Recommendation", value: finding.recommendation, clamp: "line-clamp-3" }
            ] as const
          )
            .filter(({ value }) => !!value)
            .map(({ label, value, clamp }) => (
              <div key={label}>
                <p className="text-primary mb-1 text-sm font-semibold">{label}</p>
                <p className={clamp}>{value}</p>
              </div>
            ))}

          {(finding.responsible_person || finding.due_date) && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              {finding.responsible_person && (
                <div>
                  <p className="text-primary mb-1 text-sm font-semibold">Responsible Person</p>
                  <p>{finding.responsible_person_name}</p>
                </div>
              )}
              {finding.due_date && (
                <div className="ml-auto">
                  <p className="text-primary mb-1 text-right text-sm font-semibold">Due Date</p>
                  <Badge variant="outline">{new Date(finding.due_date).toLocaleDateString()}</Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evidence Summary Section */}
        {evidenceStats.total > 0 && (
          <div className="border-t pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Evidence & Support</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {evidenceStats.total} Evidence
                </Badge>
                {evidenceStats.verified > 0 && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {evidenceStats.verified} Verified
                  </Badge>
                )}
                {evidenceStats.unverified > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {evidenceStats.unverified} Unverified
                  </Badge>
                )}
              </div>
            </div>

            {/* Evidence Items Preview */}
            {evidenceList.length > 0 && (
              <div className="space-y-2">
                {evidenceList.slice(0, 3).map((evidence: any) => (
                  <div
                    key={evidence.id}
                    className="flex items-start gap-2 rounded-sm border border-dashed px-2 py-1.5">
                    <FileText className="text-muted-foreground mt-0.5 h-3 w-3 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">{evidence.title}</p>
                      <p className="text-muted-foreground text-xs">{evidence.evidence_type}</p>
                    </div>
                    {evidence.file_link && (
                      <LinkIcon className="text-muted-foreground h-3 w-3 shrink-0" />
                    )}
                  </div>
                ))}
                {evidenceList.length > 3 && (
                  <p className="text-muted-foreground text-xs">
                    +{evidenceList.length - 3} more evidence items
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

    </Card>

      {/* Assign Action Dialog */}
      <AssignFindingActionDialog
        open={assignActionDialogOpen}
        onOpenChange={setAssignActionDialogOpen}
        finding={finding}
        auditPlanStatus={auditPlanStatus || ""}
      />

      {/* Finding Details Dialog */}
      <FindingDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        finding={finding}
      />
    </>
  );
}

export function FindingsList({
  findings,
  onRefresh,
  onEditFinding,
  auditPlanStatus,
  auditPlan,
  onSubmitForApproval
}: FindingsListProps) {
  // Check if plan is approved
  const isPlanApproved = ["APPROVED", "COMPLETED", "CLOSURE_REVIEW", "CLOSED"].includes(auditPlanStatus?.toUpperCase() || "");

  // Show "Requires Approval" component if plan is not approved
  if (!isPlanApproved && auditPlan && onSubmitForApproval) {
    return (
      <RequiresApprovalState auditPlan={auditPlan} onSubmitForApproval={onSubmitForApproval} />
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground pt-6 text-center">
          <p>No findings recorded for this audit plan yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <FindingCard
          key={finding.id || index}
          finding={finding}
          onEditFinding={onEditFinding}
          onRefresh={onRefresh}
          auditPlanStatus={auditPlanStatus}
        />
      ))}
    </div>
  );
}

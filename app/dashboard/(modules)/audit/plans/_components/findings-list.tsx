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
import { RequiresApprovalState } from "./requires-approval-state";
import type { AuditPlan } from "@/lib/types/audit-types";

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

const STATUS_ICONS: Record<string, any> = {
  OPEN: <AlertCircle className="h-4 w-4 text-red-500" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  RESOLVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  CLOSED: <CheckCircle2 className="h-4 w-4 text-gray-500" />
};

// Individual finding card component with evidence
function FindingCard({ finding, onEditFinding, onRefresh, auditPlanStatus }: any) {
  const [assignActionDialogOpen, setAssignActionDialogOpen] = useState(false);
  const { data: evidenceData } = useFindingEvidence(finding.id);
  const { data: actions } = useFindingActionsByFinding(finding.id);
  const evidenceList = evidenceData?.evidence || [];
  const actionsCount = actions?.length || 0;
  const evidenceStats = {
    total: evidenceData?.total_count || 0,
    verified: evidenceData?.verified_count || 0,
    unverified: evidenceData?.unverified_count || 0
  };

  // Check if finding is editable (only in specific statuses)
  const isEditable = ["OPEN", "IN_PROGRESS", "DRAFT"].includes(finding.status);

  // Check if can assign actions (only when audit is COMPLETED, APPROVED, or REJECTED)
  const canAssignAction = ["COMPLETED", "APPROVED", "REJECTED", "CLOSED"].includes(finding.status);

  return (
    <Card className="gap-2 transition-shadow hover:shadow-md">
      <CardHeader className="">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {STATUS_ICONS[finding.status] && <div>{STATUS_ICONS[finding.status]}</div>}
              <CardTitle className="text-base">
                {finding.category?.display_name ||
                  finding.category_name ||
                  finding.clauseTitle ||
                  "Unnamed Finding"}
              </CardTitle>
              {finding.severity && (
                <Badge className={`${SEVERITY_COLORS[finding.severity] || ""}`}>
                  {finding.severity}
                </Badge>
              )}
              {finding.status && <Badge variant="outline">{finding.status}</Badge>}
              {actionsCount > 0 && (
                <Badge variant="secondary">
                  {actionsCount} Action{actionsCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              {finding.finding_number && (
                <CardDescription className="max-w-lg text-xs">
                  {finding.category?.description} - Finding #{finding.finding_number}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {canAssignAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssignActionDialogOpen(true)}
                className="gap-2">
                <Plus className="mr-2 h-4 w-4" />
                Assign Action
              </Button>
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

      <CardContent className="space-y-4 text-sm">
        {/* Main Finding Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          {finding.conclusion && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Conclusion</p>
              <p className="line-clamp-2">{finding.conclusion}</p>
            </div>
          )}

          {finding.workings_and_test_results && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Workings & Test Results</p>
              <p className="line-clamp-3 text-sm">{finding.workings_and_test_results}</p>
            </div>
          )}

          {finding.recommendation && (
            <div>
              <p className="text-primary mb-1 text-sm font-semibold">Recommendation</p>
              <p className="line-clamp-3">{finding.recommendation}</p>
            </div>
          )}

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

      {/* Assign Action Dialog */}
      <AssignFindingActionDialog
        open={assignActionDialogOpen}
        onOpenChange={setAssignActionDialogOpen}
        finding={finding}
        auditPlanStatus={auditPlanStatus || ""}
      />
    </Card>
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
  const isPlanApproved = ["APPROVED", "COMPLETED"].includes(auditPlanStatus?.toUpperCase() || "");

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

/**
 * Entity Summary Card Component
 *
 * Renders entity-specific summary information in a card layout.
 * Handles different entity types with appropriate field displays.
 *
 * @module entity-summary-card
 */

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { EntityType, EntityPreviewData } from "@/lib/types/entity-preview-types";
import {
  formatCurrency,
  formatRiskScore,
  getStatusLabel,
  truncateText,
  getSeverityColor
} from "@/lib/utils/entity-preview-utils";
import { getFindingEvidence } from "@/app/_actions/audit-module-actions";
import { format } from "date-fns";

interface EntitySummaryCardProps {
  entityType: EntityType;
  entityData: EntityPreviewData;
}

/**
 * Reusable field display component
 */
function SummaryField({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground font-medium uppercase">
        {label}
      </Label>
      <p className="mt-1 font-medium text-sm">
        {value || <span className="text-muted-foreground">N/A</span>}
      </p>
    </div>
  );
}

/**
 * Risk score badge component
 */
function RiskScoreBadge({ score }: { score: number | undefined }) {
  if (score === undefined || score === null) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const config = formatRiskScore(score);

  const badgeVariant =
    config.label === "High" ? "destructive" : config.label === "Medium" ? "secondary" : "default";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={badgeVariant}>{config.label}</Badge>
      <span className={`font-semibold text-sm ${config.color}`}>{score}</span>
    </div>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return <Badge variant="outline">{getStatusLabel(status)}</Badge>;
}

/**
 * Severity badge component (for findings)
 */
function SeverityBadge({ severity }: { severity: string | undefined }) {
  if (!severity) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const colorClass = getSeverityColor(severity);

  return <Badge className={colorClass}>{severity}</Badge>;
}

/**
 * Risk entity summary content
 */
function RiskSummaryContent({ data }: { data: EntityPreviewData }) {
  return (
    <>
      <SummaryField label="Title" value={data.title} />
      <SummaryField label="Category" value={data.category} />
      <SummaryField label="Risk Owner" value={data.risk_owner || data.owner} />
      <SummaryField label="Status" value={<StatusBadge status={data.status} />} />
      {data.treatment_status && (
        <SummaryField label="Treatment Status" value={data.treatment_status} />
      )}

      {/* Risk Scores */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <SummaryField
          label="Inherent Risk"
          value={<RiskScoreBadge score={data.inherentScore} />}
        />
        <SummaryField
          label="Residual Risk"
          value={<RiskScoreBadge score={data.residualScore} />}
        />
      </div>

      {/* Description */}
      {data.description && (
        <SummaryField label="Description" value={truncateText(data.description, 200)} />
      )}
    </>
  );
}

/**
 * Audit plan entity summary content
 */
function AuditPlanSummaryContent({ data }: { data: EntityPreviewData }) {
  return (
    <>
      <SummaryField label="Title" value={data.title} />
      <SummaryField label="Reference Number" value={data.ref_no} />
      <SummaryField label="Year" value={data.year} />
      <SummaryField label="Audit Area" value={data.audit_area} />
      <SummaryField label="Framework/Standard" value={data.management_standard} />
      <SummaryField label="Status" value={<StatusBadge status={data.status} />} />

      {/* Audit Scope */}
      {data.audit_scope && (
        <SummaryField label="Audit Scope" value={truncateText(data.audit_scope, 200)} />
      )}

      {/* Audit Objective */}
      {data.audit_objective && (
        <SummaryField label="Audit Objective" value={truncateText(data.audit_objective, 200)} />
      )}

      {/* Team Leader */}
      {data.team_leader?.name && (
        <SummaryField label="Team Leader" value={data.team_leader.name} />
      )}

      {/* Planned Dates */}
      {(data.start_date || data.end_date) && (
        <SummaryField
          label="Planned Period"
          value={
            data.start_date && data.end_date
              ? `${format(new Date(data.start_date), "MMM d, yyyy")} - ${format(new Date(data.end_date), "MMM d, yyyy")}`
              : data.start_date
              ? format(new Date(data.start_date), "MMM d, yyyy")
              : data.end_date
              ? format(new Date(data.end_date), "MMM d, yyyy")
              : "N/A"
          }
        />
      )}
    </>
  );
}

/**
 * Budget entity summary content
 */
function BudgetSummaryContent({ data }: { data: EntityPreviewData }) {
  const percentageSpent =
    data.spent_amount && data.total_amount ? (data.spent_amount / data.total_amount) * 100 : 0;

  return (
    <>
      <SummaryField label="Title" value={data.title} />
      <SummaryField label="Year" value={data.year} />
      <SummaryField label="Currency" value={data.currency} />
      <SummaryField label="Status" value={<StatusBadge status={data.status} />} />

      {/* Budget Amount Box */}
      <div className="border rounded-lg p-3 bg-card space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Budget</p>
          <p className="text-lg font-bold">
            {formatCurrency(data.total_amount, data.currency)}
          </p>
        </div>

        {data.spent_amount !== undefined && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">{formatCurrency(data.spent_amount, data.currency)}</span>
            </div>

            {/* Utilization Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {percentageSpent.toFixed(1)}% utilized
            </p>
          </>
        )}
      </div>

      {/* Department */}
      {data.department_name && (
        <SummaryField label="Department" value={data.department_name} />
      )}
    </>
  );
}

/**
 * Finding entity summary content
 * Shows finding-level summary with evidence for approvals
 */
function FindingSummaryContent({ data }: { data: EntityPreviewData }) {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvidence() {
      if (!data?.id) return;
      setIsLoadingEvidence(true);
      setEvidenceError(null);

      try {
        const response = await getFindingEvidence(data.id);
        if (response.success && response.data?.data) {
          setEvidence(response.data.data);
        } else if (!response.success) {
          setEvidenceError("Failed to load evidence");
        }
      } catch (error) {
        setEvidenceError("Error loading evidence");
      } finally {
        setIsLoadingEvidence(false);
      }
    }

    fetchEvidence();
  }, [data?.id]);

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <>
      <div className="space-y-3">
        {/* Category information */}
        <SummaryField label="Category" value={data.category_name} />

        {/* Finding context */}
        <SummaryField label="Finding Number" value={data.finding_number} />

        {/* Severity and Status */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryField label="Severity" value={<SeverityBadge severity={data.severity} />} />
          <SummaryField label="Status" value={<StatusBadge status={data.status} />} />
        </div>

        {/* Details about the finding */}
        <SummaryField
          label="Recommendation"
          value={truncateText(data.recommendation, 200)}
        />

        {/* Management response if available */}
        {data.management_response && (
          <SummaryField
            label="Management Response"
            value={truncateText(data.management_response, 200)}
          />
        )}

        {/* Framework information if available */}
        {data.framework && (
          <SummaryField
            label="Framework"
            value={`${data.framework}${data.clause_number ? ` - ${data.clause_number}` : ""}`}
          />
        )}

        {/* Conformity status if available */}
        {data.conformity_status && (
          <SummaryField label="Conformity Status" value={data.conformity_status} />
        )}

        {/* Evidence Section */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground font-medium uppercase mb-2">
            Submitted Evidence
          </p>

          {isLoadingEvidence ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading evidence...</span>
            </div>
          ) : evidenceError ? (
            <p className="text-sm text-red-500 py-2">{evidenceError}</p>
          ) : evidence.length > 0 ? (
            <div className="space-y-2">
              {evidence.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.evidence_file_name || item.title || "Evidence Document"}
                      </p>
                      {item.evidence_summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.evidence_summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {item.evidence_type && <span>{item.evidence_type}</span>}
                        {item.evidence_file_size && (
                          <span>• {formatFileSize(item.evidence_file_size)}</span>
                        )}
                      </div>
                    </div>
                    {item.evidence_file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 w-8 p-0"
                        asChild
                      >
                        <a
                          href={item.evidence_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download evidence"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No evidence submitted</p>
          )}
        </div>

        {/* Note about viewing all findings */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Approval Note</p>
          <p>
            Review the submitted evidence above. Click "View Full Details" to see complete finding
            details and context before approving.
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Generic/fallback summary content for unknown entity types
 */
function GenericSummaryContent({ data }: { data: EntityPreviewData }) {
  const displayFields = [
    { label: "ID", value: data.id },
    { label: "Title", value: data.title || data.name },
    { label: "Description", value: truncateText(data.description, 200) },
    { label: "Status", value: <StatusBadge status={data.status} /> }
  ];

  return (
    <>
      {displayFields.map(
        (field) =>
          field.value && (
            <SummaryField key={field.label} label={field.label} value={field.value} />
          )
      )}
    </>
  );
}

/**
 * Entity Summary Card Component
 *
 * Displays entity details in a formatted card layout.
 * Renders different content based on entity type.
 */
export function EntitySummaryCard({ entityType, entityData }: EntitySummaryCardProps) {
  const renderContent = () => {
    switch (entityType) {
      case "RISK":
        return <RiskSummaryContent data={entityData} />;
      case "AUDIT_PLAN":
        return <AuditPlanSummaryContent data={entityData} />;
      case "BUDGET":
        return <BudgetSummaryContent data={entityData} />;
      case "FINDING":
        return <FindingSummaryContent data={entityData} />;
      default:
        return <GenericSummaryContent data={entityData} />;
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      {renderContent()}
    </div>
  );
}

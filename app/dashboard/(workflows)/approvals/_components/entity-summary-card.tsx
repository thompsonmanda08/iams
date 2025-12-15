/**
 * Entity Summary Card Component
 *
 * Renders entity-specific summary information in a card layout.
 * Handles different entity types with appropriate field displays.
 *
 * @module entity-summary-card
 */

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { EntityType, EntityPreviewData } from "@/lib/types/entity-preview-types";
import {
  formatCurrency,
  formatRiskScore,
  getStatusLabel,
  truncateText,
  getSeverityColor
} from "@/lib/utils/entity-preview-utils";

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
      <SummaryField label="Description" value={truncateText(data.description, 200)} />
      <SummaryField label="Category" value={data.category} />
      <SummaryField label="Status" value={<StatusBadge status={data.status} />} />
      <SummaryField label="Owner" value={data.risk_owner || data.owner} />
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
      <SummaryField label="Status" value={<StatusBadge status={data.status} />} />
      <SummaryField label="Description" value={truncateText(data.description, 200)} />
    </>
  );
}

/**
 * Budget entity summary content
 */
function BudgetSummaryContent({ data }: { data: EntityPreviewData }) {
  return (
    <>
      <SummaryField label="Title" value={data.title} />
      <SummaryField
        label="Total Amount"
        value={formatCurrency(data.total_amount, data.currency)}
      />
      <SummaryField label="Year" value={data.year} />
      <SummaryField label="Currency" value={data.currency} />
      <SummaryField label="Status" value={<StatusBadge status={data.status} />} />
    </>
  );
}

/**
 * Finding entity summary content
 * Shows category-level summary for finding approvals
 */
function FindingSummaryContent({ data }: { data: EntityPreviewData }) {
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

        {/* Note about viewing all findings in category */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
          <p className="font-medium mb-1">Approval Note</p>
          <p>
            Click "View Full Details" to see all findings in this category and review supporting
            evidence before approving.
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

"use client";

import { useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportBuilder, type ReportEntity } from "@/components/reports/report-builder";
import { useReportStore } from "@/store/report-store";
import { useReportByEntityId, useReportMutations } from "@/hooks/use-report-queries";
import { normalizeManagementStandard } from "@/components/reports/report-templates";
import { mergeReportWithTemplate } from "@/lib/config/report-template-merger";
import type { ReportRecord } from "@/lib/types/report-types";
import Loader from "@/components/ui/loader";
import { usePermissions } from "@/hooks/use-permissions";

interface AuditPlanReportTabProps {
  auditPlan: {
    id: string;
    title: string;
    audit_scope?: string;
    status: string;
    ref_no?: string;
    management_standard?: string;
  };
}

export function AuditPlanReportTab({ auditPlan }: AuditPlanReportTabProps) {
  const { checkPermission } = usePermissions();
  const { setEntityId, setEntityType, setReport, report } = useReportStore();

  // Fetch report by entity_id using the reusable hook
  const { data: reportData, isLoading } = useReportByEntityId(auditPlan.id, "audit_plan");

  // Use reusable mutations hook
  const { createReport, isCreating } = useReportMutations();

  // Set entity ID and type in store when component mounts
  useEffect(() => {
    if (auditPlan.id) {
      setEntityId(auditPlan.id);
      setEntityType("audit_plan");
    }
  }, [auditPlan.id, setEntityId, setEntityType]);

  // Sync fetched report content to store and intelligently merge with template
  useEffect(() => {
    if (reportData) {
      const record = reportData as ReportRecord;

      // Use the smart template merger utility
      // This preserves user edits while filling gaps with template sections
      const mergedReport = mergeReportWithTemplate(
        record.report_content,
        auditPlan.management_standard,
        {
          id: record.id,
          title: record.title,
          created_at: record.created_at,
          updated_at: record.updated_at,
          status: record.status
        }
      );

      // Ensure the report_id and status are set correctly from the database
      // This guarantees the store always has the correct database values
      mergedReport.report_id = record.id;
      mergedReport.status = record.status;

      console.log("Setting merged report in store:", mergedReport);
      setReport(mergedReport);
    }
  }, [reportData, auditPlan.management_standard, setReport]);

  console.log("Audit Plan Report:", report, reportData);

  // Handle create report
  const handleCreateReport = () => {
    if (!checkPermission("AUDIT_REPORTS", "can_create")) return;
    const managementStandard = normalizeManagementStandard(auditPlan.management_standard);

    // Determine report type based on management standard
    // Compliance frameworks use compliance_audit type
    const isComplianceFramework =
      managementStandard === "ISO 27001" || ["COSO", "COBIT", "NISIT"].includes(managementStandard);

    const reportType: "general_audit" | "compliance_audit" | "risk" | "followup" =
      isComplianceFramework ? "compliance_audit" : "general_audit";

    createReport({
      title: `${auditPlan.title} - Audit Report`,
      reportType,
      managementStandard,
      entityId: auditPlan.id,
      entityType: "audit_plan"
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader loadingText="Loading report..." classNames={{ spinner: "w-16 h-16" }} />
      </div>
    );
  }

  // No report exists - show empty state with create button
  if (!reportData) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <FileText className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">No Report Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            Create a report for this audit plan to document your findings, observations, and
            recommendations.
          </p>

          <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">1. CREATE REPORT</div>
              <div className="text-muted-foreground">Initialize the report</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">2. ADD SECTIONS</div>
              <div className="text-muted-foreground">Customize content</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">3. PUBLISH</div>
              <div className="text-muted-foreground">Export and share</div>
            </div>
          </div>

          <Button size="lg" className="gap-2" onClick={handleCreateReport} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Create Audit Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Build entity object for ReportBuilder
  const entity: ReportEntity = {
    id: auditPlan.id,
    title: auditPlan.title,
    description: auditPlan.audit_scope,
    status: auditPlan.status,
    ref_no: auditPlan.ref_no,
    management_standard: auditPlan.management_standard
  };

  // Report exists - show ReportBuilder with read-only type
  return <ReportBuilder entity={entity} entityType="audit_plan" readOnlyType />;
}

import { FileBarChart, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getAllDataSources, getReport } from "@/app/_actions/reports-actions";
import { getAuditPlan } from "@/app/_actions/audit-module-actions";
import { getRiskRegister } from "@/app/_actions/risk-module-actions";
import { ReportDetailsClient } from "../_components/report-details-client";
import { CreateReportDialog } from "../_components/create-report-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

export default async function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the report
  const reportResponse = await getReport(id);

  if (!reportResponse.success || !reportResponse.data) {
    return (
      <Card className="bg-canvas/50 mt-24 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <FileText className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">No Report Found</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            An error occured while fetching the report or it does not exist. Please ensure you have
            created a report first.
          </p>

          <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">1. CREATE AN ENTITY PLAN</div>
              <div className="text-muted-foreground">Set up your entity</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">2. EXECUTE </div>
              <div className="text-muted-foreground">By recording details</div>
            </div>
            <div className="bg-canvas border-border rounded-lg border p-4 text-center">
              <div className="text-primary mb-1 font-mono">3. GENERATE REPORT</div>
              <div className="text-muted-foreground">Use the Report tabs</div>
            </div>
          </div>

          <CreateReportDialog showTrigger />
        </CardContent>
      </Card>
    );
  }

  const report = reportResponse.data?.data;

  console.log("Report fetched:", report);

  // Get entity type from report and fetch entity details
  let entity: any = null;
  const entityType = report.entity_type || "audit_plan";

  if (report.entity_id && report.entity_type) {
    if (report.entity_type === "audit_plan") {
      const entityResponse = await getAuditPlan(report.entity_id);
      if (entityResponse.success && entityResponse.data) {
        entity = {
          id: entityResponse.data.id,
          title: entityResponse.data.title,
          description: entityResponse.data.audit_scope,
          status: entityResponse.data.status,
          ref_no: entityResponse.data.ref_no,
          management_standard: entityResponse.data.management_standard
        };
      }
    } else if (report.entity_type === "risk_register") {
      const entityResponse = await getRiskRegister(report.entity_id);
      if (entityResponse.success && entityResponse.data.risk_register) {
        entity = {
          id: entityResponse.data?.risk_register.id,
          title:
            entityResponse.data?.risk_register.name || entityResponse.data?.risk_register.title,
          description: entityResponse.data?.risk_register.description,
          status: entityResponse.data?.risk_register.status
          // Don't set management_standard - let the template merger use report_type as fallback
        };
      }
    }
  }

  // Fallback entity if none found
  if (!entity) {
    entity = {
      id: report.entity_id || report.report_id || id,
      title: report.title,
      description: "",
      status: report.status || "DRAFT"
    };
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header - Consistent with reports/page.tsx */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/reports">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <PageHeader
                title={report.title}
                description={`Edit and manage your ${entityType === "risk_register" ? "risk" : "audit"} report`}
                classNames={{
                  container: "flex items-center gap-4",
                  title: "text-3xl font-bold text-foreground"
                }}
                customIcon={
                  <div className="relative">
                    <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                    <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                      <FileBarChart className="h-7 w-7 text-white" />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Report Builder */}
      <div className="container mx-auto px-4 py-6">
        <ReportDetailsClient
          reportId={id}
          initialReport={{
            ...(report.report_content || {}),
            report_type: report.report_type,
            title: report.title
          }}
          reportStatus={report.status}
          entity={entity}
          entityType={entityType}
        />
      </div>
    </div>
  );
}

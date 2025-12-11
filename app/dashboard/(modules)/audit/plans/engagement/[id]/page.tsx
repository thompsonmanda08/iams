import { notFound } from "next/navigation";
import { getAuditPlan, getWorkpaperByAuditPlanId } from "@/app/_actions/audit-module-actions";
import { getWorkflowInstances } from "@/app/_actions/task-actions";
import { AuditPlan } from "@/lib/types/audit-types";
import PageHeader from "@/components/page-header";
import { ClipboardListIcon, ListCheck } from "lucide-react";
import BackButton from "@/components/back-button";
import { AuditPlanWorkpaperView } from "../../_components/audit-plan-workpaper-view";

interface AuditDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const urlParams = await params;
  const auditPlanId = String(urlParams.id);

  const auditResponse = await getAuditPlan(auditPlanId);

  if (!auditResponse.success || !auditResponse.data) {
    notFound();
  }

  const auditPlan = (auditResponse.data || {}) as AuditPlan;

  // Fetch workpaper which includes categories and findings
  const workpapersResponse = await getWorkpaperByAuditPlanId(auditPlanId);

  const workpaper = workpapersResponse?.success ? workpapersResponse.data : [];

  // Extract findings from workpaper response (they're already included)
  const allFindings = workpaper?.findings || [];

  // Fetch tasks for this audit plan
  const tasksResponse = await getWorkflowInstances({
    entity_id: auditPlanId
  });

  const tasks = tasksResponse.success ? tasksResponse.data : [];

  // console.log("Audit Plan:", auditPlan);
  // console.log("Workpaper:", workpaper);
  // console.log("Findings:", allFindings);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex justify-between px-4 py-6">
          <PageHeader
            title="Audit Plan Details"
            description="Manage your audit plan and keep track and follow up on findings for each audit item"
            classNames={{
              container: "flex items-center gap-4",
              title: "text-3xl font-bold text-foreground"
            }}
            customIcon={
              <div className="relative">
                <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                  <ClipboardListIcon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            }
          />
          <BackButton title="Back to Audit Plans" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AuditPlanWorkpaperView
          auditPlan={auditPlan}
          workpaperCategories={workpaper?.categories}
          findings={allFindings}
          tasks={tasks}
        />
      </div>
    </div>
  );
}

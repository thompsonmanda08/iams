import { notFound } from "next/navigation";
import { getAuditPlan, getWorkpaperByAuditPlanId } from "@/app/_actions/audit-module-actions";
import { getTasks } from "@/app/_actions/task-actions";
import { AuditPlan } from "@/lib/types/audit-types";
import { AuditPlanWorkpaperView } from "../_components/audit-plan-workpaper-view";
import PageHeader from "@/components/page-header";

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
  const tasksResponse = await getTasks({
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
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Audit Plan Details"
            description="Manage your audit plan and keep track and follow up on findings for each audit item"
            showBackButton
          />
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

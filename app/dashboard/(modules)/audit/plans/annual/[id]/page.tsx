import { notFound } from "next/navigation";
import { getAnnualAuditPlan, getAnnualAuditPlanItems } from "@/app/_actions/audit-module-actions";
import { AuditPlan } from "@/lib/types/audit-types";
import PageHeader from "@/components/page-header";
import { ClipboardListIcon } from "lucide-react";
import BackButton from "@/components/back-button";
import AuditDetailClient from "../../_components/annual-plan-details";
import { StatusBadge } from "@/components/status-badge";

interface AuditDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const urlParams = await params;
  const planId = String(urlParams.id);

  const auditResponse = await getAnnualAuditPlan({ register_id: planId });

  if (!auditResponse.success || !auditResponse.data) {
    notFound();
  }

  const auditPlan = (auditResponse.data || {}) as AuditPlan;
  let planItems = auditPlan?.items || [];

  if (auditResponse.success) {
    const response = await getAnnualAuditPlanItems(planId, { page: 1, page_size: 10 });
    planItems = response?.data?.data || response?.data || [];
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex justify-between px-4 py-6">
          <PageHeader
            title={`Annual Audit Plan Details`}
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
          <div className="ml-auto flex items-center justify-end gap-4">
            <StatusBadge size="md" status={auditPlan.status} className="mb-1" />
            <BackButton title="Back to Audit Plans" />
          </div>
        </div>
      </div>

      {/* Audit Plan Header */}
      <div className="container mx-auto space-y-6 px-4 py-6">
        <AuditDetailClient auditPlan={auditPlan} planItems={planItems} />
      </div>
    </div>
  );
}

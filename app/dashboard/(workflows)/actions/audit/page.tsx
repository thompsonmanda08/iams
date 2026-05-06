import { getAuditFollowupLogs, getFindingActions } from "@/app/_actions/finding-actions";
import PageHeader from "@/components/page-header";
import BackButton from "@/components/back-button";
import { CheckCircle2 } from "lucide-react";
import { FindingActionsPageLayout } from "./_components/finding-actions-page-layout";
import { Pagination } from "@/lib/types";

export default async function FindingActionsPage({
  params,
  searchParams
}: {
  params?: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
    page_size?: string;
    audit_page?: string;
    audit_page_size?: string;
  }>;
}) {
  const urlSearchParams = await searchParams;

  const page = urlSearchParams?.page ? Number(urlSearchParams.page) : 1;
  const page_size = urlSearchParams?.page_size ? Number(urlSearchParams.page_size) : 10;
  const audit_page = urlSearchParams?.audit_page ? Number(urlSearchParams.audit_page) : 1;
  const audit_page_size = urlSearchParams?.audit_page_size
    ? Number(urlSearchParams.audit_page_size)
    : 10;

  // Fetch all finding actions server-side (for My Actions tab)
  const [actionsResponse, auditLogResponse] = await Promise.all([
    getFindingActions({ page, page_size }),
    getAuditFollowupLogs({ page: audit_page, page_size: audit_page_size })
  ]);

  const findingActions = actionsResponse.data?.data || [];
  const pagination: Pagination = actionsResponse.data?.pagination || {};

  const auditLogActions = auditLogResponse.data?.data || [];
  const auditLogPagination: Pagination = auditLogResponse.data?.pagination || {};

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex justify-between px-4 py-6">
          <PageHeader
            title="Finding Actions"
            description="Manage remediation actions assigned to audit findings"
            classNames={{
              container: "flex items-center gap-4",
              title: "text-3xl font-bold text-foreground"
            }}
            customIcon={
              <div className="relative">
                <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                  <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            }
          />
          <BackButton title="Back to Audit Plans" href="/dashboard/audit/plans" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <FindingActionsPageLayout
          page={page}
          pageSize={page_size}
          auditPage={audit_page}
          auditPageSize={audit_page_size}
          initialActions={findingActions}
          pagination={pagination}
          auditLogActions={auditLogActions}
          auditLogPagination={auditLogPagination}
        />
      </div>
    </div>
  );
}

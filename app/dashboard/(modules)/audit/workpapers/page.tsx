import { Suspense } from "react";
import { WorkpapersPageClient } from "@/components/audit/workpapers-page-client";
import { getWorkpapers, getAuditPlans } from "@/app/_actions/audit-module-actions";

export default async function WorkpapersPage() {
  const workpapersResponse = await getWorkpapers();
  const workpapers = workpapersResponse.success ? workpapersResponse.data?.data?.data : [];

  const auditsResponse = await getAuditPlans();
  const audits = auditsResponse.success ? auditsResponse.data?.data?.data : [];
  const pagination = auditsResponse.data?.data?.pagination ?? {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  return (
    <Suspense fallback={<TableLoading />}>
      <WorkpapersPageClient
        workpapers={workpapers || []}
        audits={audits || []}
        pagination={pagination}
      />
    </Suspense>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

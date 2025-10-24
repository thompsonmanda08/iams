import { Suspense } from "react";
import { WorkpapersPageClient } from "@/components/audit/workpapers-page-client";
import { getWorkpapers, getAuditPlans } from "@/app/_actions/audit-module-actions";

export default async function WorkpapersPage() {
  const workpapersResponse = await getWorkpapers();
  const workpapers = workpapersResponse.success ? workpapersResponse.data : [];

  const auditsResponse = await getAuditPlans();
  const audits = auditsResponse.success ? auditsResponse.data : [];

  return (
    <Suspense fallback={<TableLoading />}>
      <WorkpapersPageClient workpapers={workpapers || []} audits={audits || []} />
    </Suspense>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

import { Plus } from "lucide-react";
import Companies from "./companies";
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// import { getOrganizations } from "@/app/_actions/backoffice-actions";

function CompaniesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <Skeleton className="mb-4 h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

async function CompaniesPage() {
  // TODO: Replace with real API call when backend endpoint is ready
  // Endpoint: GET /api/v1/backoffice/organizations
  // Uncomment below when backend is ready:
  // const response = await getOrganizations();
  // const companies = response.success && response.data?.items ? response.data.items : [];

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Dashboard Overview"
              description="A summary of key metrics and statistics for your dashboard."
              icon="Building2"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CompaniesSkeleton />}>
          <Companies />
        </Suspense>
      </div>
    </div>
  );
}

export default CompaniesPage;

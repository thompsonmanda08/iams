import CompanyMapping from "./mapping";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";
import { Building2 } from "lucide-react";

function MappingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="mb-4 h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

async function CompanyMappingPage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Company Location Mapping"
              description="All Institutions and Organizations onboarded in the IAMS system"
              customIcon={
                <div className="relative">
                  <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <Building2 className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />
            {/* <MultiStepCompanyForm showTrigger={true} company={null} /> */}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<MappingSkeleton />}>
          <CompanyMapping />
        </Suspense>
      </div>
    </div>
  );
}

export default CompanyMappingPage;

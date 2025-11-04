import CompanyMapping from "./mapping";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";
// import { getOrganizations, getCountries } from "@/app/_actions/backoffice-actions";
// import { getProvinces, getTowns } from "@/app/_actions/config-actions";

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
  // TODO: Replace with real API calls when backend endpoints are ready
  // Endpoints needed:
  // - GET /api/v1/backoffice/organizations (getOrganizations)
  // - GET /api/v1/backoffice/countries (getCountries)
  // - GET /api/v1/backoffice/provinces (already exists: getProvinces)
  // - GET /api/v1/backoffice/towns (already exists: getTowns)
  // - GET /api/v1/backoffice/company-locations?company_id=X (getCompanyLocations)
  // - POST /api/v1/backoffice/company-locations (createCompanyLocation)
  // - DELETE /api/v1/backoffice/company-locations/:id (deleteCompanyLocation)
  //
  // Uncomment below when backend is ready:
  // const [companiesRes, countriesRes, provincesRes, townsRes] = await Promise.all([
  //   getOrganizations(),
  //   getCountries(),
  //   getProvinces(),
  //   getTowns({ page: 1, page_size: 1000 })
  // ]);
  //
  // const companies = companiesRes.success ? companiesRes.data?.items || [] : [];
  // const countries = countriesRes.success ? countriesRes.data?.items || [] : [];
  // const provinces = provincesRes.success ? provincesRes.data?.data || [] : [];
  // const towns = townsRes.success ? townsRes.data?.data || [] : [];
  //
  // return <CompanyMapping companies={companies} countries={countries} provinces={provinces} towns={towns} />;

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Company Location Mapping"
              description="All Institutions and Organizations onboarded in the IAMS system"
              icon="Building2"
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

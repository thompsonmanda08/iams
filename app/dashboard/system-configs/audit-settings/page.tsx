import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBranches, getProvinces, getTowns } from "@/app/_actions/config-actions";
import { ProvincesTab } from "../_components/provinces-tab";
import { TownsTab } from "../_components/towns-tab";
import { BranchesTab } from "../_components/branches-tab";
import { Pagination } from "@/lib/types";
import { Suspense } from "react";
import { getAuditPlans, getWorkpapers } from "@/app/_actions/audit-module-actions";
import { WorkpapersPageClient } from "@/components/audit/workpapers-page-client";
import AuditableAreaConfig from "../_components/auditable-areas-tab";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function BranchesConfigPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;
  const page = urlParams.page ? Number(urlParams.page) : 1;
  const page_size = urlParams.page_size ? Number(urlParams.page_size) : 10;

  const [branchesResponse, provincesResponse, townsResponse] = await Promise.all([
    getBranches({ page, page_size }),
    getProvinces(),
    getTowns({ page, page_size })
  ]);

  const workpapersResponse = await getWorkpapers();
  const workpapers = workpapersResponse.success ? workpapersResponse.data?.data?.data : [];

  const auditsResponse = await getAuditPlans();
  const audits = auditsResponse.success ? auditsResponse.data?.data?.data : [];

  const branches = branchesResponse.success ? branchesResponse.data?.data : [];
  const provinces = provincesResponse.success ? provincesResponse.data?.data?.data : [];
  const towns = townsResponse.success ? townsResponse.data?.data?.data : [];
  const townsPagination = townsResponse.success ? townsResponse.data?.data?.pagination : null;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Audit Configurations Setup</h1>
          <p className="text-muted-foreground mt-1">
            Manage your audit templates, pillars, auditable areas, strategies, and workpapers
          </p>
        </div>
      </div>

      <div className="">
        <Tabs defaultValue="areas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="areas">Auditable Areas</TabsTrigger>
            <TabsTrigger value="towns">Towns</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>

          {/* Towns Tab */}
          <TabsContent value="areas">
            <Suspense fallback={<TableLoading />}>
              <AuditableAreaConfig areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>

          {/* <TabsContent value="templates">
            <Suspense fallback={<TableLoading />}>
              <WorkpapersPageClient workpapers={workpapers || []} audits={audits || []} />
            </Suspense>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
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

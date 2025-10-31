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
import IndicativeTargetsTab from "../_components/indicative-targets-tab";
import StrategicPillarsTab from "../_components/strategic-pillars-tab";
import StrategicInitiativeTab from "../_components/strategic-initiative-tab";
import FindingsCategoryTab from "../_components/findings-categories-tab";
import ProcessActivityTab from "../_components/process-activity-tab";
import WorkpaperTemplatesTab from "./_components/workpaper-templates-tab";
import PageHeader from "@/components/page-header";
import { BookCheckIcon } from "lucide-react";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function AuditSettingsPage({ searchParams }: PageProps) {
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
  const towns = townsResponse.success ? townsResponse.data?.data || [] : [];
  const townsPagination = townsResponse.success ? townsResponse.data?.data?.pagination : null;

  return (
    <div className="">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Configurations"
              description="Manage your audit templates, pillars, auditable areas, strategies, and workpapers"
              Icon={BookCheckIcon}
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Budget
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-4 p-4">
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Workpaper Templates</TabsTrigger>
            <TabsTrigger value="areas">Auditable Areas</TabsTrigger>
            <TabsTrigger value="targets">Indicative Targets </TabsTrigger>
            <TabsTrigger value="pillars">Strategic Pillars</TabsTrigger>
            <TabsTrigger value="initiative">Strategic Initiative</TabsTrigger>
            <TabsTrigger value="findings">Findings Categories</TabsTrigger>
            <TabsTrigger value="process">Process/Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <Suspense fallback={<TableLoading />}>
              <WorkpaperTemplatesTab templates={workpapers || []} />
            </Suspense>
          </TabsContent>

          {/* Auditable Areas Tab */}
          <TabsContent value="areas">
            <Suspense fallback={<TableLoading />}>
              <AuditableAreaConfig areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>

          {/* Indicative Targets Tab */}
          <TabsContent value="targets">
            <Suspense fallback={<TableLoading />}>
              <IndicativeTargetsTab areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>

          {/* Strategic Pillars Tab */}
          <TabsContent value="pillars">
            <Suspense fallback={<TableLoading />}>
              <StrategicPillarsTab areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>

          {/* Strategic Initiative Tab */}
          <TabsContent value="initiative">
            <Suspense fallback={<TableLoading />}>
              <StrategicInitiativeTab areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>

          {/* Findings Categories Tab */}
          <TabsContent value="findings">
            <Suspense fallback={<TableLoading />}>
              <FindingsCategoryTab areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>

          {/* Process Activity Tab */}
          <TabsContent value="process">
            <Suspense fallback={<TableLoading />}>
              <ProcessActivityTab areas={towns} pagination={townsPagination} />
            </Suspense>
          </TabsContent>
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

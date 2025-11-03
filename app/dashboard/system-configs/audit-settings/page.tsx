import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBranches, getDepartments, getProvinces, getTowns } from "@/app/_actions/config-actions";
import { Pagination } from "@/lib/types";
import { Suspense } from "react";
import { getWorkingPaperTemplates } from "@/app/_actions/audit-module-actions";
import {
  getStrategicPillars,
  getStrategicInitiatives,
  getFindingsCategories,
  getProcessActivities,
  getIndicativeTargets,
  getAuditableAreas
} from "@/app/_actions/audit-settings-actions";
import AuditableAreaConfig from "./_components/auditable-areas-tab";
import IndicativeTargetsTab from "./_components/indicative-targets-tab";
import StrategicPillarsTab from "./_components/strategic-pillars-tab";
import StrategicInitiativeTab from "./_components/strategic-initiative-tab";
import FindingsCategoryTab from "./_components/findings-category-tab";
import ProcessActivityTab from "./_components/process-activity-tab";
import WorkpaperTemplatesTab from "./_components/workpaper-templates-tab";
import PageHeader from "@/components/page-header";
import {
  FileText,
  MapPin,
  Target,
  Building2,
  Lightbulb,
  AlertCircle,
  Workflow
} from "lucide-react";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function AuditSettingsPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;
  const page = urlParams.page ? Number(urlParams.page) : 1;
  const page_size = urlParams.page_size ? Number(urlParams.page_size) : 10;

  const [
    templatesResponse,
    // auditableAreasResponse,
    // indicativeTargetsResponse,
    // pillarsResponse,
    // initiativesResponse,
    townsResponse,
    departmentsResponse
    // categoriesResponse,
    // processActivitiesResponse,
  ] = await Promise.all([
    getWorkingPaperTemplates(),
    // getAuditableAreas(),
    // getIndicativeTargets(),
    // getStrategicPillars(),
    // getStrategicInitiatives(),
    getTowns({ page, page_size }),
    getDepartments()
    // getBranches({ page, page_size }),
    // getProvinces(),
    // getFindingsCategories(),
    // getProcessActivities(),
  ]);

  const templates = templatesResponse.success ? templatesResponse.data?.data?.data || [] : [];

  const departments = departmentsResponse.success ? departmentsResponse.data?.data || [] : [];

  // const areas = auditableAreasResponse.success ? auditableAreasResponse.data?.data || [] : [];

  const towns = townsResponse.success ? townsResponse.data?.data || [] : [];
  const townsPagination = townsResponse.success ? townsResponse.data?.data?.pagination : null;

  // Audit settings data
  // const pillars = pillarsResponse.success ? pillarsResponse.data?.data : [];

  // const initiatives = initiativesResponse.success ? initiativesResponse.data?.data?.data : [];

  // const categories = categoriesResponse.success ? categoriesResponse.data?.data : [];

  // const processActivities = processActivitiesResponse.success
  //   ? processActivitiesResponse.data?.data
  //   : [];

  // const indicativeTargets = indicativeTargetsResponse.success
  //   ? indicativeTargetsResponse.data?.data
  //   : [];

  // console.log("WP templates:", initiatives);

  return (
    <div className="">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Configurations"
              description="Manage your audit templates, pillars, auditable areas, strategies, and workpapers"
              icon="ClipboardCheck"
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
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full gap-1 lg:gap-3">
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="h-4 w-4" />
                Workpaper Templates
              </TabsTrigger>
              <TabsTrigger value="areas" className="gap-2">
                <MapPin className="h-4 w-4" />
                Auditable Areas
              </TabsTrigger>
              <TabsTrigger value="targets" className="gap-2">
                <Target className="h-4 w-4" />
                Indicative Targets
              </TabsTrigger>
              <TabsTrigger value="pillars" className="gap-2">
                <Building2 className="h-4 w-4" />
                Strategic Pillars
              </TabsTrigger>
              <TabsTrigger value="initiative" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Strategic Initiative
              </TabsTrigger>
              {/* <TabsTrigger value="findings" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Findings Categories
              </TabsTrigger>
              <TabsTrigger value="process" className="gap-2">
                <Workflow className="h-4 w-4" />
                Process/Activity
              </TabsTrigger> */}
            </TabsList>
          </div>

          <TabsContent value="templates">
            <Suspense fallback={<TableLoading />}>
              <WorkpaperTemplatesTab templates={templates || []} />
            </Suspense>
          </TabsContent>

          {/* Auditable Areas Tab */}
          {/* <TabsContent value="areas">
            <Suspense fallback={<TableLoading />}>
              <AuditableAreaConfig
                areas={areas}
                departments={departments}
                pagination={townsPagination}
              />
            </Suspense>
          </TabsContent> */}

          {/* Indicative Targets Tab */}
          {/* <TabsContent value="targets">
            <Suspense fallback={<TableLoading />}>
              <IndicativeTargetsTab targets={indicativeTargets} departments={departments} />
            </Suspense>
          </TabsContent> */}

          {/* Strategic Pillars Tab */}
          {/* <TabsContent value="pillars">
            <Suspense fallback={<TableLoading />}>
              <StrategicPillarsTab pillars={pillars} />
            </Suspense>
          </TabsContent> */}

          {/* Strategic Initiative Tab */}
          {/* <TabsContent value="initiative">
            <Suspense fallback={<TableLoading />}>
              <StrategicInitiativeTab initiatives={initiatives} />
            </Suspense>
          </TabsContent> */}

          {/* Findings Categories Tab */}
          {/* <TabsContent value="findings">
            <Suspense fallback={<TableLoading />}>
              <FindingsCategoryTab categories={categories} />
            </Suspense>
          </TabsContent> */}

          {/* Process Activity Tab */}
          {/* <TabsContent value="process">
            <Suspense fallback={<TableLoading />}>
              <ProcessActivityTab processes={processActivities} />
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBranches,
  getProvinces,
  getProvincesWithTowns,
  getTowns
} from "@/app/_actions/config-actions";
import { ProvincesTab } from "../_components/provinces-tab";
import { TownsTab } from "../_components/towns-tab";
import { BranchesTab } from "../_components/branches-tab";
import { Pagination } from "@/lib/types";
import { get } from "http";
import PageHeader from "@/components/page-header";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function BranchesConfigPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;
  const page = urlParams.page ? Number(urlParams.page) : 1;
  const page_size = urlParams.page_size ? Number(urlParams.page_size) : 10;
  const activeTab = urlParams.tab || "branches";

  const [branchesResponse, townsResponse, provincesResponse] = await Promise.all([
    getBranches({ page, page_size }),
    getTowns({ page, page_size }),
    getProvincesWithTowns()
  ]);

  const branchesData = branchesResponse.success ? branchesResponse.data : null;
  const provinces = provincesResponse.success ? provincesResponse.data : [];
  const towns = townsResponse.success ? townsResponse.data?.data : [];

  const branches = branchesData?.data || [];
  const branchesPagination = branchesData?.pagination || {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  console.log("provinces", provinces);
  return (
    <div>
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Branches Setup"
              description="Manage your branches, across the country"
              icon="Building2"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto space-y-6 p-6">
        <BranchesTab
          initialBranches={branches}
          provinces={provinces}
          towns={towns}
          pagination={branchesPagination}
        />

        {/* <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="provinces">Provinces</TabsTrigger>
          <TabsTrigger value="towns">Towns</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>

        <TabsContent value="provinces">
          <ProvincesTab initialProvinces={provinces} pagination={provincesPagination} />
        </TabsContent>

        <TabsContent value="towns">
          <TownsTab initialTowns={towns} provinces={provinces} pagination={townsPagination} />
        </TabsContent>

        <TabsContent value="branches">
          <BranchesTab
            initialBranches={branches}
            provinces={provinces}
            towns={towns}
            pagination={branchesPagination}
          />
        </TabsContent>
      </Tabs> */}
      </div>
    </div>
  );
}

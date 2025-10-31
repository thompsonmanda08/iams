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
  const provinces = provincesResponse.success ? provincesResponse.data?.data : [];
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

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Branches Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your branches, across the country</p>
        </div>
      </div>

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
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBranches, getProvinces, getTowns } from "@/app/_actions/config-actions";
import { Pagination } from "@/lib/types";
import { ProvincesTab } from "@/app/dashboard/system-configs/_components/provinces-tab";
import { TownsTab } from "./_components/countries-tab";
import { BranchesTab } from "./_components/branches-tab";
import { MapPin } from "lucide-react";
import PageHeader from "@/components/page-header";

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

  const branches = branchesResponse.success ? branchesResponse.data?.data : [];
  const branchesPagination = branchesResponse.success
    ? branchesResponse.data?.data?.pagination
    : null;

  const provinces = provincesResponse.success ? provincesResponse.data?.data?.data : [];
  const provincesPagination = townsResponse.success
    ? provincesResponse.data?.data?.pagination
    : null;

  const towns = townsResponse.success ? townsResponse.data?.data?.data : [];
  const townsPagination = townsResponse.success ? townsResponse.data?.data?.pagination : null;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}

      <PageHeader
        title="Locations Setup"
        description="Manage your branches, provinces, and towns across the country."
        Icon={MapPin}
      />

      <div className="">
        <Tabs defaultValue="branches" className="space-y-6">
          <TabsList>
            <TabsTrigger value="provinces">Provinces</TabsTrigger>
            <TabsTrigger value="towns">Towns</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>

          {/* Provinces Tab */}
          <TabsContent value="provinces">
            <ProvincesTab initialProvinces={provinces} pagination={provincesPagination} />
          </TabsContent>

          {/* Towns Tab */}
          <TabsContent value="towns">
            <TownsTab initialTowns={towns} provinces={provinces} pagination={townsPagination} />
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <BranchesTab initialBranches={branches} provinces={provinces} towns={towns} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBranches, getProvinces, getTowns } from "@/app/_actions/config-actions";
import { ProvincesTab } from "../_components/provinces-tab";
import { TownsTab } from "../_components/towns-tab";
import { BranchesTab } from "../_components/branches-tab";

export default async function BranchesConfigPage() {
  // Fetch all data server-side
  const [branchesResponse, provincesResponse, townsResponse] = await Promise.all([
    getBranches(),
    getProvinces(),
    getTowns()
  ]);

  const branches = branchesResponse.success ? branchesResponse.data : [];
  const provinces = provincesResponse.success ? provincesResponse.data : [];
  const towns = townsResponse.success ? townsResponse.data : [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Locations Setup</h1>
          <p className="text-muted-foreground mt-1">
            Manage your branches, provinces, and towns across the country
          </p>
        </div>
      </div>

      <div className="">
        <Tabs defaultValue="branches" className="space-y-6">
          <TabsList>
            <TabsTrigger value="provinces">Provinces</TabsTrigger>
            <TabsTrigger value="towns">Towns</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>

          {/* Provinces Tab */}
          <TabsContent value="provinces">
            <ProvincesTab initialProvinces={provinces} />
          </TabsContent>

          {/* Towns Tab */}
          <TabsContent value="towns">
            <TownsTab initialTowns={towns} provinces={provinces} />
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskCategoriesConfig } from "../_components/risk-categories-config";
import { RiskMatrixConfigList } from "../_components/risk-matrix-config-list";
import { RiskResponsesList } from "../_components/risk-responses-list";

export default async function RiskConfigurationsPage() {
  return (
    <div className="bg-background min-h-screen p-6">
      <div className="container mx-auto py-6">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Risk Configurations</h1>
          <p className="text-muted-foreground text-sm">
            Manage risk assessment parameters and settings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto">
        <Tabs defaultValue="matrix" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="response">Response Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <RiskMatrixConfigList />
          </TabsContent>

          <TabsContent value="categories">
            <RiskCategoriesConfig />
          </TabsContent>

          <TabsContent value="response">
            <RiskResponsesList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

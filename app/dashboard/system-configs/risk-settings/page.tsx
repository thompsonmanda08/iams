import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskCategoriesConfig } from "../_components/risk-categories-config";
import { RiskMatrixConfigList } from "../_components/risk-matrix-config-list";
import { RiskResponsesList } from "../_components/risk-responses-list";
import PageHeader from "@/components/page-header";
import { ShieldAlert } from "lucide-react";

export default async function RiskConfigurationsPage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Risk Configurations"
              description="
            Manage risk assessment parameters and settings"
              Icon={ShieldAlert}
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Action
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
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

import { Grid3x3, FolderTree, Shield, GitBranch, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskCategoriesConfig } from "../_components/risk-categories-config";
import { RiskMatrixConfigList } from "../_components/risk-matrix-config-list";
import { RiskResponsesList } from "../_components/risk-responses-list";
import PageHeader from "@/components/page-header";
import { BusinessProcessList } from "../_components/business-process-list";
import { RiskCausesList } from "../_components/risk-causes-list";

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
              icon="ShieldAlert"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="matrix" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="matrix" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              Risk Matrix
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="response" className="gap-2">
              <Shield className="h-4 w-4" />
              Response Strategies
            </TabsTrigger>
            <TabsTrigger value="processes" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Business Processes
            </TabsTrigger>
            <TabsTrigger value="causes" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Risk Causes
            </TabsTrigger>
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

          <TabsContent value="processes">
            <BusinessProcessList />
          </TabsContent>

          <TabsContent value="causes">
            <RiskCausesList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RiskMatrixConfig } from "../_components/risk-matrix-config";
import { RiskCategoriesConfig } from "../_components/risk-categories-config";
import { RiskResponseConfig } from "../_components/risk-response-config";
import { RiskAppetiteConfig } from "../_components/risk-appetite-config";
import { KRIConfig } from "../_components/kri-config";
import { RiskRegisterConfig } from "../_components/risk-register-config";
import { ShieldAlert } from "lucide-react";
import PageHeader from "@/components/page-header";

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
          <TabsList>
            <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="response">Response Strategies</TabsTrigger>
            <TabsTrigger value="appetite">Risk Appetite</TabsTrigger>
            <TabsTrigger value="kri">KRIs</TabsTrigger>
            <TabsTrigger value="register">Register Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <RiskMatrixConfig />
          </TabsContent>

          <TabsContent value="categories">
            <RiskCategoriesConfig />
          </TabsContent>

          <TabsContent value="response">
            <RiskResponseConfig />
          </TabsContent>

          <TabsContent value="appetite">
            <RiskAppetiteConfig />
          </TabsContent>

          <TabsContent value="kri">
            <KRIConfig />
          </TabsContent>

          <TabsContent value="register">
            <RiskRegisterConfig />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

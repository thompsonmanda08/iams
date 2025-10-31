import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RiskMatrixConfig } from "../_components/risk-matrix-config";
import { RiskCategoriesConfig } from "../_components/risk-categories-config";
import { RiskResponseConfig } from "../_components/risk-response-config";
import { RiskAppetiteConfig } from "../_components/risk-appetite-config";
import { KRIConfig } from "../_components/kri-config";
import { RiskRegisterConfig } from "../_components/risk-register-config";

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
          <TabsList>
            <TabsTrigger value="matrix">
              Risk Matrix
            </TabsTrigger>
            <TabsTrigger value="categories" >
              Categories
            </TabsTrigger>
            <TabsTrigger value="response" >
              Response Strategies
            </TabsTrigger>
            <TabsTrigger value="appetite">
              Risk Appetite
            </TabsTrigger>
            <TabsTrigger value="kri">
              KRIs
            </TabsTrigger>
            <TabsTrigger value="register">
              Register Settings
            </TabsTrigger>
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

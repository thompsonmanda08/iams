"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RiskMatrixConfig } from "../_components/risk-matrix-config";
import { RiskCategoriesConfig } from "../_components/risk-categories-config";
import { RiskResponseConfig } from "../_components/risk-response-config";
import { RiskAppetiteConfig } from "../_components/risk-appetite-config";
import { KRIConfig } from "../_components/kri-config";
import { RiskRegisterConfig } from "../_components/risk-register-config";

export default function RiskConfigurationsPage() {
  const [activeTab, setActiveTab] = useState("matrix");

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted inline-flex h-auto w-full justify-start gap-1 rounded-lg p-1">
            <TabsTrigger value="matrix" className="rounded-md px-4 py-2 text-sm">
              Risk Matrix
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-md px-4 py-2 text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="response" className="rounded-md px-4 py-2 text-sm">
              Response Strategies
            </TabsTrigger>
            <TabsTrigger value="appetite" className="rounded-md px-4 py-2 text-sm">
              Risk Appetite
            </TabsTrigger>
            <TabsTrigger value="kri" className="rounded-md px-4 py-2 text-sm">
              KRIs
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-md px-4 py-2 text-sm">
              Register Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="space-y-6">
            <RiskMatrixConfig />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <RiskCategoriesConfig />
          </TabsContent>

          <TabsContent value="response" className="space-y-6">
            <RiskResponseConfig />
          </TabsContent>

          <TabsContent value="appetite" className="space-y-6">
            <RiskAppetiteConfig />
          </TabsContent>

          <TabsContent value="kri" className="space-y-6">
            <KRIConfig />
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            <RiskRegisterConfig />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

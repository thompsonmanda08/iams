"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBranches, getProvinces, getTowns } from "@/app/_actions/config-actions";

import { AuditableArea, Pagination } from "@/lib/types";
import { Suspense } from "react";
import { getAuditPlans, getWorkpapers } from "@/app/_actions/audit-module-actions";
import WorkpaperTemplatesTab from "./workpaper-templates-tab";
import AuditableAreaConfig from "./auditable-areas-tab";

type TabsComponentProps = {
  auditableAreas: AuditableArea[];

  pagination: Promise<Pagination & { [key: string]: string }>;
};

export default async function AuditSettingsTabs({
  auditableAreas = [],
  targets = [],
  pillars = [],
  initiatives = [],
  findingsCategories = [],
  processActivities = []
  ,templates
  pagination
}: TabsComponentProps) {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Workpaper Templates</TabsTrigger>
          <TabsTrigger value="areas">Auditable Areas</TabsTrigger>
          <TabsTrigger value="targets">Indicative Targets </TabsTrigger>
          <TabsTrigger value="pillars">Strategic Pillars</TabsTrigger>
          <TabsTrigger value="initiative">Strategic Initiative</TabsTrigger>
          <TabsTrigger value="findings">Findings Categories</TabsTrigger>
          <TabsTrigger value="process">Process/Activity</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="templates">
            <WorkpaperTemplatesTab templates={templates || []} />
        </TabsContent> */}

        {/* Auditable Areas Tab */}
        {/* <TabsContent value="areas">
        <AuditableAreaConfig areas={auditableAreas} pagination={pagination} />
        </TabsContent> */}

        {/* Indicative Targets Tab */}
        {/* <TabsContent value="targets">
                      <IndicativeTargetsTab areas={towns} pagination={pagination} />
        </TabsContent> */}

        {/* Strategic Pillars Tab */}
        {/* <TabsContent value="pillars">
          <StrategicPillarsTab areas={towns} pagination={pagination} />
        </TabsContent> */}

        {/* Strategic Initiative Tab */}
        {/* <TabsContent value="initiative">
          <StrategicInitiativeTab areas={towns} pagination={pagination} />
        </TabsContent> */}

        {/* Findings Categories Tab */}
        {/* <TabsContent value="findings">
        <FindingsCategoryTab areas={towns} pagination={pagination} />
        </TabsContent> */}

        {/* Process Activity Tab */}
        {/* <TabsContent value="process">
            <ProcessActivityTab areas={processActivities} pagination={pagination} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

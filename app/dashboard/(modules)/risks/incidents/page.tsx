"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyIncidents } from "./_components/my-incidents";
import { EffectsReport } from "./_components/effects-report";
import { NewIncident } from "./_components/new-incident";
import PageHeader from "@/components/page-header";
import { RefreshCwOff } from "lucide-react";

export default function IncidentsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Incidents"
              description="Respond to, prioritize, and collaborate on real-time application and infrastructure issues"
              Icon={RefreshCwOff}
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="my-incidents" className="w-full space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="my-incidents">My Incidents</TabsTrigger>
            <TabsTrigger value="new-incident">New Incident</TabsTrigger>
            <TabsTrigger value="effects-report">Effects Report</TabsTrigger>
          </TabsList>

          <TabsContent value="my-incidents">
            <MyIncidents />
          </TabsContent>

          <TabsContent value="new-incident">
            <NewIncident />
          </TabsContent>

          <TabsContent value="effects-report">
            <EffectsReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

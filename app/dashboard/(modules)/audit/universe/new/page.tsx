"use client";
import { useState } from "react";
import BackButton from "@/components/back-button";
import AuditUniverseForm from "../_components/audit-universe-form";
import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUniverses } from "@/app/_actions/audit-module-actions";
import { useQuery } from "@tanstack/react-query";
import { Globe, List } from "lucide-react";

const NewAuditUniversePage = () => {
  const [activeTab, setActiveTab] = useState("universe");

  // Fetch universes for the Universe Item dropdown
  const { data: universes = [] } = useQuery({
    queryKey: ["universes"],
    queryFn: async () => {
      const universesResponse = await getUniverses();
      return universesResponse?.data?.data || universesResponse?.data || [];
    }
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Create New Universe"
              description="Set up a new audit universe with universe items"
              icon="Globe"
            />
            <BackButton title="Back to Universes" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto space-y-6 px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="universe" className="gap-2">
              <Globe className="h-4 w-4" />
              New Universe
            </TabsTrigger>
            <TabsTrigger value="item" className="gap-2">
              <List className="h-4 w-4" />
              Universe Item
            </TabsTrigger>
          </TabsList>
          <TabsContent value="universe">
            <AuditUniverseForm
              mode="universe"
              onSwitchToItemTab={() => setActiveTab("item")}
            />
          </TabsContent>
          <TabsContent value="item">
            <AuditUniverseForm
              mode="item"
              universes={universes}
              onSwitchToUniverseTab={() => setActiveTab("universe")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewAuditUniversePage;

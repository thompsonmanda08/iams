"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, List } from "lucide-react";
import AuditUniverseForm from "./audit-universe-form";

interface UniverseEditContentProps {
  universeId: string;
  initialData: any;
  initialUniverseItems: any[];
}

export default function UniverseEditContent({
  universeId,
  initialData,
  initialUniverseItems
}: UniverseEditContentProps) {
  const [activeTab, setActiveTab] = useState("universe");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="universe" className="gap-2">
          <Globe className="h-4 w-4" />
          Universe Details
        </TabsTrigger>
        <TabsTrigger value="item" className="gap-2">
          <List className="h-4 w-4" />
          Universe Items
        </TabsTrigger>
      </TabsList>
      <TabsContent value="universe">
        <AuditUniverseForm
          initialData={initialData}
          universeId={universeId}
          mode="universe"
          onSwitchToItemTab={() => setActiveTab("item")}
        />
      </TabsContent>
      <TabsContent value="item">
        <AuditUniverseForm
          mode="item"
          universeId={universeId}
          initialData={{
            audit_universe_id: universeId
          }}
          initialUniverseItems={initialUniverseItems}
        />
      </TabsContent>
    </Tabs>
  );
}

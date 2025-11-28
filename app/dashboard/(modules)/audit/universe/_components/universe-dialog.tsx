"use client";

import { useState } from "react";
import { Plus, Pencil, Globe, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditUniverseForm from "./audit-universe-form";
import { useQuery } from "@tanstack/react-query";
import { getUniverses, getUniverseItems } from "@/app/_actions/audit-module-actions";

interface UniverseDialogProps {
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: any;
  universeId?: string;
  initialUniverseItems?: any[];
}

export default function UniverseDialog({
  showTrigger = true,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  initialData,
  universeId,
  initialUniverseItems = []
}: UniverseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("universe");

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const isEditing = !!initialData && !!universeId;

  // Fetch universes for the Universe Item dropdown (only when item tab is active and in create mode)
  const { data: universes = [] } = useQuery({
    queryKey: ["universes"],
    queryFn: async () => {
      const universesResponse = await getUniverses();
      return universesResponse?.data?.data || universesResponse?.data || [];
    },
    enabled: !isEditing && activeTab === "item"
  });

  // Fetch universe items when in edit mode
  const { data: universeItems = [] } = useQuery({
    queryKey: ["universeItems", universeId],
    queryFn: async () => {
      if (!universeId) return [];
      const itemsResponse = await getUniverseItems({ audit_universe_id: universeId });
      return itemsResponse?.data?.data?.data || itemsResponse?.data?.data || [];
    },
    enabled: !!universeId && activeTab === "item"
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset tab when dialog closes
    if (!newOpen) {
      setActiveTab("universe");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          {isEditing ? (
            <Button size="sm" variant="outline" className="h-8 gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Universe
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh]! w-[70vw] max-w-[70vw]! overflow-y-auto">
        {/* <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Universe" : "Create New Universe"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the details for "${initialData?.universe_name}". You can also manage universe items here.`
              : "Create a new audit universe and add universe items in the tabs below."}
          </DialogDescription>
        </DialogHeader> */}
        <div className="grid h-full pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="h-12 w-full">
              <TabsTrigger value="universe" className="gap-2">
                <Globe className="h-4 w-4" />
                {isEditing ? "Universe Details" : "New Universe"}
              </TabsTrigger>
              <TabsTrigger value="item" className="gap-2">
                <List className="h-4 w-4" />
                {isEditing ? "Universe Items" : "Universe Item"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="universe">
              <AuditUniverseForm
                mode="universe"
                initialData={initialData}
                universeId={universeId}
                onCancel={() => setOpen(false)}
                onSwitchToItemTab={() => setActiveTab("item")}
              />
            </TabsContent>

            <TabsContent value="item">
              <AuditUniverseForm
                mode="item"
                universeId={universeId}
                universes={universes}
                initialUniverseItems={isEditing ? universeItems : initialUniverseItems}
                initialData={
                  isEditing ? { ...initialData, audit_universe_id: universeId } : undefined
                }
                onSwitchToUniverseTab={() => setActiveTab("universe")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

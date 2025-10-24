"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { CreateFindingModal } from "@/components/audit/create-finding-modal";
import type { Workpaper } from "@/lib/types/audit-types";
import { WorkpapersTable } from "./workpapers-table";

interface WorkpapersTabProps {
  workpapers: Workpaper[];
}

export function AuditWorkpapersTab({ workpapers }: WorkpapersTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Workpapers</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Track and manage non-conformities and observations
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Attach Workpaper
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground my-2 text-sm">
          {workpapers.length} workpaper{workpapers.length !== 1 ? "s" : ""} attached
          {workpapers.filter((w: Workpaper) => w.findingsCount && w.findingsCount > 0).length >
            0 && (
            <span className="ml-2">
              • {workpapers.filter((w: Workpaper) => w.findingsCount && w.findingsCount > 0).length}{" "}
              with findings
            </span>
          )}
        </p>
        <WorkpapersTable workpapers={workpapers} />
      </div>

      {/* Create Finding Modal */}
      <CreateFindingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        auditPlanId="1"
      />
    </div>
  );
}

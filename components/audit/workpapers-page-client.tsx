"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { WorkpapersTable } from "./workpapers-table";
import { WorkpaperTemplateDialog } from "./workpaper-template-dialog";
import type { Workpaper, AuditPlan, CustomTemplate } from "@/lib/types/audit-types";

interface WorkpapersPageClientProps {
  workpapers: Workpaper[];
  audits: AuditPlan[];
}

// Mock custom templates - replace with actual data fetch
const mockCustomTemplates: CustomTemplate[] = [
  {
    id: "custom-1",
    name: "IT Security Assessment",
    description: "Comprehensive IT security controls testing template",
    type: "custom",
    createdBy: "John Doe",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
    isPublic: true,
    includeEvidenceGrid: false,
    sections: [
      {
        id: "sec-1",
        title: "Scope & Objectives",
        description: "Define assessment scope",
        order: 0,
        fields: [
          {
            id: "field-1",
            label: "Assessment Scope",
            type: "textarea",
            required: true,
            placeholder: "Describe the scope...",
            order: 0
          },
          {
            id: "field-2",
            label: "Risk Level",
            type: "select",
            required: true,
            options: ["Low", "Medium", "High", "Critical"],
            order: 1
          }
        ]
      }
    ],
    usageCount: 15
  }
];

export function WorkpapersPageClient({ workpapers, audits }: WorkpapersPageClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Workpapers</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Document audit testing procedures and evidence
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2" onClick={handleOpenCreateDialog}>
                <Plus className="h-4 w-4" />
                Create Workpaper
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Results Summary */}
          {workpapers && workpapers.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {workpapers.length} workpaper{workpapers.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <WorkpapersTable workpapers={workpapers || []} />
        </div>
      </div>

      {/* Create Workpaper Template Selection Dialog */}
      <WorkpaperTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        audits={audits}
        customTemplates={mockCustomTemplates}
      />
    </div>
  );
}

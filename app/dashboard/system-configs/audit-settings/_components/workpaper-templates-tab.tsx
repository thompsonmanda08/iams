"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Pagination } from "@/lib/types";
import type { CustomTemplate } from "@/lib/types/audit-types";
import { WorkpaperTemplateDialog } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-template-dialog";
import { WorkpaperTemplatesTable } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-templates-table";

interface WorkingPaperTemplate {
  id: string;
  name: string;
  standard: string;
  description?: string;
  is_active?: boolean;
}

interface WorkpapersPageClientProps {
  templates?: WorkingPaperTemplate[];
}

// Mock custom templates - replace with actual data fetch
const mockCustomTemplates: CustomTemplate[] = [
  // {
  //   id: "custom-1",
  //   name: "IT Security Assessment",
  //   description: "Comprehensive IT security controls testing template",
  //   type: "custom",
  //   createdBy: "John Doe",
  //   createdAt: new Date("2025-01-10"),
  //   updatedAt: new Date("2025-01-10"),
  //   isPublic: true,
  //   includeEvidenceGrid: false,
  //   sections: [
  //     {
  //       id: "sec-1",
  //       title: "Scope & Objectives",
  //       description: "Define assessment scope",
  //       order: 0,
  //       fields: [
  //         {
  //           id: "field-1",
  //           label: "Assessment Scope",
  //           type: "textarea",
  //           required: true,
  //           placeholder: "Describe the scope...",
  //           order: 0
  //         },
  //         {
  //           id: "field-2",
  //           label: "Risk Level",
  //           type: "select",
  //           required: true,
  //           options: ["Low", "Medium", "High", "Critical"],
  //           order: 1
  //         }
  //       ]
  //     }
  //   ],
  //   usageCount: 15
  // }
];

export default function WorkpaperTemplatesTab({
  templates,
  pagination
}: {
  templates: WorkingPaperTemplate[];
  pagination?: Pagination;
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          {templates.length !== 0 && <h3 className="text-lg font-semibold">Workpaper Templates</h3>}
          <Button className="ml-auto gap-2" onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Workpaper Template
          </Button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Results Summary */}
            {templates && templates.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Showing {templates.length} workpaper{templates.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Table */}
            <WorkpaperTemplatesTable
              templates={templates || []}
              onCreateClick={handleOpenCreateDialog}
            />
          </div>
        </div>

        {/* Create Workpaper Template Selection Dialog */}
        <WorkpaperTemplateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          // audits={audits}
          customTemplates={mockCustomTemplates}
        />
      </div>
    </>
  );
}

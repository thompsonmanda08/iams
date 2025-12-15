"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Pagination } from "@/lib/types";
import type { CustomTemplate } from "@/lib/types/audit-types";
import { WorkpaperTemplateDialog } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-template-dialog";
import { WorkpaperTemplatesTable } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-templates-table";
import { Card } from "@/components/ui/card";
import { CustomPagination } from "@/components/ui/pagination";

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

export default function WorkpaperTemplatesTab({
  templates,
  pagination
}: {
  templates: WorkingPaperTemplate[];
  pagination?: Pagination;
}) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || pagination?.page_size || 10;
    router.push(`?templates_page=${pageConfig.page}&templates_page_size=${pageSize}`);
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Workpaper Templates</h4>
            <p className="text-muted-foreground text-sm">
              Showing {templates.length} workpaper{templates.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button className="ml-auto gap-2" onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Workpaper Template
          </Button>
        </div>

        {/* Main Content */}
        <WorkpaperTemplatesTable
          templates={templates || []}
          onCreateClick={handleOpenCreateDialog}
        />

        {/* Pagination */}
        {pagination && (
          <CustomPagination
            pagination={pagination}
            updatePagination={handlePaginationChange}
            showDetails={true}
            allowSetPageSize={true}
          />
        )}

        {/* Create Workpaper Template Selection Dialog */}
        <WorkpaperTemplateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          // audits={audits}
          customTemplates={[]}
        />
      </Card>
    </>
  );
}

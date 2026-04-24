"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Pagination } from "@/lib/types";
import { WorkpaperTemplatesTable } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-templates-table";
import { Card } from "@/components/ui/card";
import { CustomPagination } from "@/components/ui/pagination";
import { useWorkpaperTemplates } from "@/hooks/use-audit-query-data";
import { AUDIT_QUERY_KEYS } from "@/hooks/use-audit-query-data";
import { usePermissions } from "@/hooks/use-permissions";
import { CreateWorkpaperTemplateDialog } from "./create-workpaper-dialog";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface WorkingPaperTemplate {
  id: string;
  name: string;
  standard: string;
  description?: string;
  is_active?: boolean;
}

export default function WorkpaperTemplatesTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { checkPermission } = usePermissions();

  const { data: response, isFetching } = useWorkpaperTemplates({ page, page_size: pageSize });
  const rawTemplates = (response?.data?.data as (WorkingPaperTemplate & { created_at?: string })[]) || [];
  const templates = [...rawTemplates].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );
  const paginationData = response?.data?.pagination as Pagination;

  const handleOpenCreateDialog = () => {
    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_create")) return;
    setIsCreateDialogOpen(true);
  };

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    setPage(pageConfig.page);
    if (pageConfig.page_size) {
      setPageSize(pageConfig.page_size);
    }
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
        {isFetching && templates.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            Loading workpaper templates...
          </div>
        ) : (
          <WorkpaperTemplatesTable
            templates={templates || []}
            onCreateClick={handleOpenCreateDialog}
          />
        )}

        {/* Pagination */}
        {paginationData && (
          <CustomPagination
            pagination={paginationData}
            updatePagination={handlePaginationChange}
            showDetails={true}
            allowSetPageSize={true}
          />
        )}

        {/* Create Workpaper Template Selection Dialog */}
        <CreateWorkpaperTemplateDialog
          openModal={isCreateDialogOpen}
          setOpenModal={setIsCreateDialogOpen}
        />
      </Card>
    </>
  );
}

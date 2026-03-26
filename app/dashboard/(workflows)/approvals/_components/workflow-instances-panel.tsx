"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CustomPagination } from "@/components/ui/pagination";
import { WorkflowInstancesTable } from "./workflow-instances-table";
import { ApprovalHistorySlide } from "./approval-history-slide";
import { useWorkflowInstances } from "@/hooks/use-workflow-tasks";
import type { Task } from "@/lib/types/task";
import type { Pagination } from "@/lib/types";
import { getApprovalsLog } from "@/app/_actions/task-actions";

interface ApprovalRecord {
  id: string;
  instance_id: string;
  approved_by: string;
  approved_by_name: string;
  role_name: string;
  action: "APPROVED" | "REJECTED";
  remarks: string;
  created_at: string;
}

interface WorkflowInstancesPanelProps {
  initialInstances?: Task[];
}

/**
 * WorkflowInstancesPanel
 *
 * Container component for displaying and managing workflow instances
 * Shows all active/pending workflow instances in a table with pagination
 * Provides approval history drawer when instance is selected
 * Handles pagination and data fetching for both instances list and approval history
 *
 * Naming: Clear indication this is for WORKFLOW INSTANCES
 */
export function WorkflowInstancesPanel({
  initialInstances = []
}: WorkflowInstancesPanelProps) {
  // Instances list pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Drawer state for instance details
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Task | null>(null);
  const [selectedInstanceApprovals, setSelectedInstanceApprovals] = useState<ApprovalRecord[]>([]);
  const [selectedInstanceApprovalsPage, setSelectedInstanceApprovalsPage] = useState(1);
  const [selectedInstanceApprovalsPagination, setSelectedInstanceApprovalsPagination] =
    useState<Pagination>({
      page: 1,
      page_size: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false
    });
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Always fetch page 1 — backend returns all items; pagination is client-side
  const { data: instancesResponse, isLoading, error } = useWorkflowInstances({
    page: 1
  });

  // Prefer React Query data when available, fall back to SSR initial data
  const rawInstances = instancesResponse?.data ?? instancesResponse;
  const allInstances = Array.isArray(rawInstances) ? rawInstances : initialInstances;

  const totalCount = allInstances?.length || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Client-side slice for current page (backend may return full list)
  const instances = (allInstances || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate pagination info
  const pagination: Pagination = {
    page: currentPage,
    page_size: pageSize,
    total_pages: totalPages,
    has_next: currentPage < totalPages,
    has_prev: currentPage > 1,
    totalCount,
    ...(instancesResponse?.data?.pagination || instancesResponse?.pagination || {})
  };

  const handlePageChange = (params: { page: number; page_size?: number }) => {
    setCurrentPage(params.page);
    if (params.page_size) {
      setPageSize(params.page_size);
    }
  };

  const handleInstanceSelect = async (instance: Task) => {
    setSelectedInstance(instance);
    setIsDrawerOpen(true);
    setSelectedInstanceApprovalsPage(1);
    setIsDrawerLoading(true);

    // Fetch approvals for the selected instance
    const response = await getApprovalsLog(instance.instance.id, {
      page: "1",
      page_size: "10"
    });

    if (response.success && response.data) {
      setSelectedInstanceApprovals(response.data.data || []);
      setSelectedInstanceApprovalsPagination(response.data.pagination || {
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      });
    }
    setIsDrawerLoading(false);
  };

  const handleDrawerPageChange = async (page: number, pageSize?: number) => {
    if (!selectedInstance) return;

    setIsDrawerLoading(true);

    const newPageSize = pageSize || 10;
    const response = await getApprovalsLog(selectedInstance.instance.id, {
      page: String(page),
      page_size: String(newPageSize)
    });

    if (response.success && response.data) {
      setSelectedInstanceApprovals(response.data.data || []);
      setSelectedInstanceApprovalsPagination(response.data.pagination || selectedInstanceApprovalsPagination);
      setSelectedInstanceApprovalsPage(page);
    }
    setIsDrawerLoading(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Workflow Instances</h3>
              <p className="text-muted-foreground text-sm">
                All active and pending workflow instances awaiting approval
              </p>
            </div>
            {totalCount > 0 && (
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  Total: <span className="font-semibold text-foreground">{totalCount}</span>
                </p>
              </div>
            )}
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Failed to load workflow instances. Please try again later.
              </p>
            </div>
          )}

          {/* INSTANCES TABLE */}
          <WorkflowInstancesTable
            instances={instances || []}
            onInstanceSelect={handleInstanceSelect}
            isLoading={isLoading}
          />

          {/* PAGINATION */}
          {totalCount > 0 && (
            <div className="border-t">
              <CustomPagination
                pagination={pagination}
                updatePagination={handlePageChange}
                allowSetPageSize={true}
                showDetails={true}
              />
            </div>
          )}
        </div>
      </Card>

      {/* APPROVAL HISTORY DRAWER */}
      <ApprovalHistorySlide
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        task={selectedInstance}
        approvals={selectedInstanceApprovals}
        pagination={selectedInstanceApprovalsPagination}
        isLoading={isDrawerLoading}
        onPageChange={handleDrawerPageChange}
      />
    </>
  );
}

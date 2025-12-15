"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WorkflowInstancesTable } from "./workflow-instances-table";
import { ApprovalHistorySlide } from "./approval-history-slide";
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
  instances: Task[];
  isLoading?: boolean;
}

/**
 * WorkflowInstancesPanel
 *
 * Container component for displaying and managing workflow instances
 * Shows all active/pending workflow instances in a table
 * Provides approval history drawer when instance is selected
 * Handles pagination and data fetching for approval history
 *
 * Naming: Clear indication this is for WORKFLOW INSTANCES
 */
export function WorkflowInstancesPanel({
  instances,
  isLoading
}: WorkflowInstancesPanelProps) {
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

    const newPageSize = pageSize || selectedInstanceApprovalsPage;
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workflow Instances</h3>
              <p className="text-muted-foreground text-sm">
                All active and pending workflow instances awaiting approval
              </p>
            </div>
            {instances.length > 0 && (
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  Total: <span className="font-semibold text-foreground">{instances.length}</span>
                </p>
              </div>
            )}
          </div>

          {/* INSTANCES TABLE */}
          <WorkflowInstancesTable
            instances={instances}
            onInstanceSelect={handleInstanceSelect}
            isLoading={isLoading}
          />
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

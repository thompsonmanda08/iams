"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CustomPagination } from "@/components/ui/pagination";
import { WorkflowTasksTable } from "./workflow-tasks-table";
import { useUserAssignedWorkflowTasks } from "@/hooks/use-workflow-tasks";
import type { Pagination } from "@/lib/types";

interface WorkflowTask {
  id: string;
  instance_id: string;
  organization_id?: string;
  required_role_id?: string;
  required_role_name?: string;
  assigned_to_user_id: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED";
  created_at: string;
  updated_at: string;
  instance: {
    id?: string;
    workflow_id?: string;
    organization_id?: string;
    entity_type: string;
    entity_id?: string;
    status: string;
    is_finalized?: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
  };
  entity: {
    entity_id?: string;
    entity_name?: string;
    entity_type?: string;
    id?: string;
    status?: string;
    title?: string;
  };
}

interface WorkflowTasksPanelProps {
  initialTasks?: WorkflowTask[];
}

/**
 * WorkflowTasksPanel
 *
 * Container component for displaying and managing user-assigned workflow tasks
 * Shows only tasks assigned to the current user
 * Handles pagination and data fetching using React Query hooks
 *
 * Naming: Clear indication this is for USER-ASSIGNED WORKFLOW TASKS
 * NOT to be confused with WorkflowInstancesPanel
 */
export function WorkflowTasksPanel({ initialTasks = [] }: WorkflowTasksPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);

  // Use initial server-side fetched tasks, with React Query for pagination and updates
  const {
    data: tasksResponse,
    isLoading,
    error
  } = useUserAssignedWorkflowTasks({
    page: currentPage,
    page_size: pageSize
  });

  // Prefer React Query data when available, fall back to SSR initial data
  const tasks = tasksResponse
    ? tasksResponse?.data || tasksResponse
    : initialTasks;

  // Calculate pagination info
  const pagination: Pagination = {
    page: currentPage,
    page_size: pageSize,
    total_pages: Math.ceil((tasks?.length || 0) / pageSize),
    has_next: currentPage < Math.ceil((tasks?.length || 0) / pageSize),
    has_prev: currentPage > 1,
    totalCount: tasks?.length || 0,
    ...(tasksResponse?.data?.pagination || tasksResponse?.pagination || {})
  };

  const handleTaskSelect = (task: WorkflowTask) => {
    setSelectedTask(task);
  };

  const handlePageChange = (params: { page: number; page_size?: number }) => {
    setCurrentPage(params.page);
    if (params.page_size) {
      setPageSize(params.page_size);
    }
  };

  // Count tasks by status
  const taskStats = {
    pending: (tasks || []).filter((t: WorkflowTask) => t.status === "PENDING").length,
    completed: (tasks || []).filter((t: WorkflowTask) => t.status === "COMPLETED").length,
    rejected: (tasks || []).filter((t: WorkflowTask) => t.status === "REJECTED").length,
    reassigned: (tasks || []).filter((t: WorkflowTask) => t.status === "REASSIGNED").length
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Your Workflow Tasks</h3>
            <p className="text-muted-foreground text-sm">
              Tasks assigned to you that require action or review
            </p>
          </div>

          {/* TASK STATISTICS */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-muted/30 rounded-lg border p-3 text-center">
              <p className="text-muted-foreground text-xs font-medium">PENDING</p>
              <p className="mt-1 text-2xl font-bold">{taskStats?.pending}</p>
            </div>
            <div className="bg-muted/30 rounded-lg border p-3 text-center">
              <p className="text-muted-foreground text-xs font-medium">COMPLETED</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{taskStats?.completed}</p>
            </div>
            <div className="bg-muted/30 rounded-lg border p-3 text-center">
              <p className="text-muted-foreground text-xs font-medium">REJECTED</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{taskStats?.rejected}</p>
            </div>
            <div className="bg-muted/30 rounded-lg border p-3 text-center">
              <p className="text-muted-foreground text-xs font-medium">REASSIGNED</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{taskStats?.reassigned}</p>
            </div>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Failed to load workflow tasks. Please try again later.
            </p>
          </div>
        )}

        {/* TASKS TABLE */}
        <WorkflowTasksTable
          tasks={tasks || []}
          onTaskSelect={handleTaskSelect}
          isLoading={isLoading}
        />

        {/* PAGINATION */}
        {tasks && tasks.length > 0 && (
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
  );
}

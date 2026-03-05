"use client";

import { useState } from "react";
import { WorkflowTasksTable } from "@/app/dashboard/(workflows)/approvals/_components/workflow-tasks-table";
import { CustomPagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheckBig } from "lucide-react";
import { useUserAssignedWorkflowTasks } from "@/hooks/use-workflow-tasks";

interface AuditPlanTasksPanelProps {
  auditPlanId: string;
  userTasks?: any[];
}

export function AuditPlanTasksPanel({
  auditPlanId,
  userTasks: initialUserTasks = []
}: AuditPlanTasksPanelProps) {
  const [userTasksPage, setUserTasksPage] = useState(1);
  const [userTasksPageSize, setUserTasksPageSize] = useState(15);

  // Always fetch page 1 — backend returns all items; pagination is client-side
  const {
    data: userTasksResponse,
    isLoading: userTasksLoading
  } = useUserAssignedWorkflowTasks({
    page: 1,
    entity_id: auditPlanId
  });

  // Prefer React Query data, fall back to SSR props
  const allUserTasks = userTasksResponse
    ? userTasksResponse?.data || userTasksResponse
    : initialUserTasks;

  const userTasksTotalCount = allUserTasks?.length || 0;
  const userTasksTotalPages = Math.ceil(userTasksTotalCount / userTasksPageSize);

  // Client-side slice for current page
  const userTasks = (allUserTasks || []).slice(
    (userTasksPage - 1) * userTasksPageSize,
    userTasksPage * userTasksPageSize
  );

  const userTasksPagination = {
    page: userTasksPage,
    page_size: userTasksPageSize,
    total_pages: userTasksTotalPages,
    has_next: userTasksPage < userTasksTotalPages,
    has_prev: userTasksPage > 1,
    totalCount: userTasksTotalCount,
    ...(userTasksResponse?.pagination || {})
  };

  if (!userTasksLoading && userTasksTotalCount === 0) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <CircleCheckBig className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-foreground mb-2 text-2xl font-semibold">No Approvals Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md text-center">
            There are no workflow tasks for this audit plan yet. Approval tasks will appear here
            once the plan is submitted for review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <WorkflowTasksTable
        tasks={userTasks}
        onTaskSelect={() => {}}
        isLoading={userTasksLoading}
      />
      {userTasksTotalCount > 0 && (
        <div className="border-t">
          <CustomPagination
            pagination={userTasksPagination}
            updatePagination={({ page, page_size }) => {
              setUserTasksPage(page);
              if (page_size) setUserTasksPageSize(page_size);
            }}
            allowSetPageSize
            showDetails
          />
        </div>
      )}
    </Card>
  );
}

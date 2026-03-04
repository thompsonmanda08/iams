"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksTable } from "@/app/dashboard/(workflows)/approvals/_components/tasks-table";
import { WorkflowTasksTable } from "@/app/dashboard/(workflows)/approvals/_components/workflow-tasks-table";
import { ApprovalHistorySlide } from "@/app/dashboard/(workflows)/approvals/_components/approval-history-slide";
import { CustomPagination } from "@/components/ui/pagination";
import type { Task } from "@/lib/types/task";
import type { Pagination } from "@/lib/types";
import { getApprovalsLog } from "@/app/_actions/task-actions";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CircleCheckBig, List } from "lucide-react";
import {
  useWorkflowInstances,
  useUserAssignedWorkflowTasks
} from "@/hooks/use-workflow-tasks";

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

interface AuditPlanTasksPanelProps {
  auditPlanId: string;
  tasks: Task[];
  userTasks?: any[];
}

export function AuditPlanTasksPanel({
  auditPlanId,
  tasks: initialTasks,
  userTasks: initialUserTasks = []
}: AuditPlanTasksPanelProps) {
  const [, startTransition] = useTransition();

  // Pagination state — workflow instances
  const [instancesPage, setInstancesPage] = useState(1);
  const [instancesPageSize, setInstancesPageSize] = useState(15);

  // Pagination state — user tasks
  const [userTasksPage, setUserTasksPage] = useState(1);
  const [userTasksPageSize, setUserTasksPageSize] = useState(15);

  // Drawer state for approval history
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskApprovals, setSelectedTaskApprovals] = useState<ApprovalRecord[]>([]);
  const [, setSelectedTaskApprovalsPage] = useState(1);
  const [selectedTaskApprovalsPagination, setSelectedTaskApprovalsPagination] =
    useState<Pagination>({
      page: 1,
      page_size: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false
    });
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // React Query: workflow instances filtered by this audit plan
  // Always fetch page 1 — backend returns all items; pagination is client-side
  const {
    data: instancesResponse,
    isLoading: instancesLoading
  } = useWorkflowInstances({
    page: 1,
    entity_id: auditPlanId
  });

  // React Query: user-assigned tasks filtered by this audit plan
  // Always fetch page 1 — backend returns all items; pagination is client-side
  const {
    data: userTasksResponse,
    isLoading: userTasksLoading
  } = useUserAssignedWorkflowTasks({
    page: 1,
    entity_id: auditPlanId
  });

  // Prefer React Query data, fall back to SSR props
  const allInstances: Task[] = instancesResponse
    ? instancesResponse?.data || instancesResponse
    : initialTasks;

  const allUserTasks = userTasksResponse
    ? userTasksResponse?.data || userTasksResponse
    : initialUserTasks;

  const instancesTotalCount = allInstances?.length || 0;
  const instancesTotalPages = Math.ceil(instancesTotalCount / instancesPageSize);
  const userTasksTotalCount = allUserTasks?.length || 0;
  const userTasksTotalPages = Math.ceil(userTasksTotalCount / userTasksPageSize);

  // Client-side slice for current page (backend may return full list)
  const instances = (allInstances || []).slice(
    (instancesPage - 1) * instancesPageSize,
    instancesPage * instancesPageSize
  );
  const userTasks = (allUserTasks || []).slice(
    (userTasksPage - 1) * userTasksPageSize,
    userTasksPage * userTasksPageSize
  );

  // Pagination metadata
  const instancesPagination: Pagination = {
    page: instancesPage,
    page_size: instancesPageSize,
    total_pages: instancesTotalPages,
    has_next: instancesPage < instancesTotalPages,
    has_prev: instancesPage > 1,
    totalCount: instancesTotalCount,
    ...(instancesResponse?.pagination || {})
  };

  const userTasksPagination: Pagination = {
    page: userTasksPage,
    page_size: userTasksPageSize,
    total_pages: userTasksTotalPages,
    has_next: userTasksPage < userTasksTotalPages,
    has_prev: userTasksPage > 1,
    totalCount: userTasksTotalCount,
    ...(userTasksResponse?.pagination || {})
  };

  const handleTaskSelect = async (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
    setSelectedTaskApprovalsPage(1);
    setIsDrawerLoading(true);

    const response = await getApprovalsLog(task.instance.id, { page: "1", page_size: "10" });

    if (response.success && response.data) {
      setSelectedTaskApprovals(response.data.data || []);
      setSelectedTaskApprovalsPagination(
        response.data.pagination || {
          page: 1,
          page_size: 10,
          total_pages: 0,
          has_next: false,
          has_prev: false
        }
      );
    }
    setIsDrawerLoading(false);
  };

  const handleDrawerPageChange = (page: number, pageSize?: number) => {
    if (!selectedTask) return;

    startTransition(async () => {
      setIsDrawerLoading(true);

      const response = await getApprovalsLog(selectedTask.instance.id, {
        page: String(page),
        page_size: String(pageSize || 10)
      });

      if (response.success && response.data) {
        setSelectedTaskApprovals(response.data.data || []);
        setSelectedTaskApprovalsPagination(
          response.data.pagination || selectedTaskApprovalsPagination
        );
        setSelectedTaskApprovalsPage(page);
      }
      setIsDrawerLoading(false);
    });
  };

  const hasAnyData =
    instancesTotalCount > 0 ||
    userTasksTotalCount > 0 ||
    instancesLoading ||
    userTasksLoading;

  if (!hasAnyData) {
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
    <>
      <Tabs defaultValue="your-tasks" className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-2">
          <TabsTrigger value="your-tasks" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your Tasks</span>
            {userTasksTotalCount > 0 && (
              <span className="bg-primary/10 text-primary ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
                {userTasksTotalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflow-instances" className="gap-2">
            <List className="h-4 w-4" />
            <span>Workflow Instances</span>
            {instancesTotalCount > 0 && (
              <span className="bg-primary/10 text-primary ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
                {instancesTotalCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Your Tasks Tab */}
        <TabsContent value="your-tasks" className="space-y-4">
          {!userTasksLoading && userTasksTotalCount === 0 ? (
            <Card className="bg-canvas/50 border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center px-8 py-12">
                <CheckCircle2 className="text-muted-foreground mb-3 h-10 w-10" strokeWidth={1.5} />
                <p className="text-muted-foreground text-sm">
                  No tasks assigned to you for this audit plan.
                </p>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </TabsContent>

        {/* Workflow Instances Tab */}
        <TabsContent value="workflow-instances" className="space-y-4">
          {!instancesLoading && instancesTotalCount === 0 ? (
            <Card className="bg-canvas/50 border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center px-8 py-12">
                <List className="text-muted-foreground mb-3 h-10 w-10" strokeWidth={1.5} />
                <p className="text-muted-foreground text-sm">
                  No workflow instances for this audit plan.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <TasksTable tasks={instances} onTaskSelect={handleTaskSelect} />
              {instancesTotalCount > 0 && (
                <div className="border-t">
                  <CustomPagination
                    pagination={instancesPagination}
                    updatePagination={({ page, page_size }) => {
                      setInstancesPage(page);
                      if (page_size) setInstancesPageSize(page_size);
                    }}
                    allowSetPageSize
                    showDetails
                  />
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval History Drawer */}
      <ApprovalHistorySlide
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        task={selectedTask}
        approvals={selectedTaskApprovals}
        pagination={selectedTaskApprovalsPagination}
        isLoading={isDrawerLoading}
        onPageChange={handleDrawerPageChange}
      />
    </>
  );
}

import { Button } from "@/components/ui/button";
import { Workflow } from "lucide-react";
import PageHeader from "@/components/page-header";
import { getWorkflowInstances, getUserAssignedWorkflowTasks } from "@/app/_actions/task-actions";
import { CheckCircle2, List } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowTasksPanel } from "./_components/workflow-tasks-panel";
import { WorkflowInstancesPanel } from "./_components/workflow-instances-panel";

export default async function TasksPage() {
  // Fetch workflow instances (SSR)
  const instancesResponse = await getWorkflowInstances({ page: "1", page_size: "20" });
  const instances = instancesResponse.success
    ? instancesResponse?.data?.data || instancesResponse.data
    : [];
  const instancesPagination: any = instancesResponse?.data?.pagination || {};

  // Fetch user-assigned workflow tasks (SSR)
  const tasksResponse = await getUserAssignedWorkflowTasks();
  const tasks = tasksResponse.success ? tasksResponse.data?.data || tasksResponse.data : [];
  const tasksPagination: any = tasksResponse?.data?.pagination || {};

  console.log({ tasks });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Task Management"
              description="Manage workflow instances and review your assigned tasks"
              icon="Workflow"
            />
            <div className="flex gap-2">
              {/* TODO: Only for users with the correct permissions [role.permissions.can_create || role.permissions.can_update] */}
              <Button asChild className="gap-2">
                <Link href="/dashboard/system-configs/audit-settings/workflow">
                  <Workflow className="h-4 w-4" />
                  Manage Workflow
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Two-Tab Layout: Workflow Instances & Your Tasks */}
          <div className="space-y-6">
            {/* INFO BANNER - Explain the difference between tabs */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 pt-0.5 text-green-600 dark:text-green-400" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-900 dark:text-green-400">Your Tasks</p>
                    <p className="mt-1 text-green-800 dark:text-green-300">
                      Tasks specifically assigned to you that require your action or review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                <div className="flex gap-3">
                  <List className="h-5 w-5 shrink-0 pt-0.5 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-400">
                      Workflow Instances
                    </p>
                    <p className="mt-1 text-blue-800 dark:text-blue-300">
                      All workflow instances in the system awaiting approval or action. Available to
                      all authorized users.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid h-12 w-full grid-cols-2">
                <TabsTrigger value="tasks" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Your Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="instances" className="gap-2">
                  <List className="h-4 w-4" />
                  <span>Workflow Instances</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: WORKFLOW TASKS (User-Assigned) */}
              <TabsContent value="tasks" className="space-y-4">
                <WorkflowTasksPanel initialTasks={tasks} />
              </TabsContent>

              {/* TAB 2: WORKFLOW INSTANCES */}
              <TabsContent value="instances" className="space-y-4">
                <WorkflowInstancesPanel initialInstances={instances} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

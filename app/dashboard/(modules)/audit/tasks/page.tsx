import { Button } from "@/components/ui/button";
import { Download, Filter, Workflow } from "lucide-react";
import { TaskStats } from "./_components/task-stats";
import PageHeader from "@/components/page-header";
import { getTasks, getTaskStats } from "@/app/_actions/task-actions";
import { TasksTable } from "./_components/tasks-table";
import Link from "next/link";

export default async function TasksPage() {
  // Fetch tasks and stats from the API
  const tasksResponse = await getTasks();
  // const statsResponse = await getTaskStats();

  const tasks = tasksResponse.success ? tasksResponse.data : [];
  // const stats = statsResponse.success
  //   ? statsResponse.data
  //   : {
  //       pending: 0,
  //       in_progress: 0,
  //       completed: 0,
  //       rejected: 0
  //     };

  // console.log("TasksPage rendered with tasks:", tasks);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Workflow Tasks"
              description="  Manage and execute workflow tasks assigned to users (Simulation Mode)"
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
          {/* Task Statistics */}
          {/* <TaskStats initialStats={stats} /> */}

          {/* Table */}
          <>
            {tasks.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
            <TasksTable tasks={tasks} />
          </>
        </div>
      </div>
    </div>
  );
}

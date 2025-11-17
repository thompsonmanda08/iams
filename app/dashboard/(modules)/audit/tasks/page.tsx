import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { TaskStats } from "./_components/task-stats";
import PageHeader from "@/components/page-header";
import { getTasks, getTaskStats } from "@/app/_actions/task-actions";
import { TasksTable } from "./_components/tasks-table";

export default async function TasksPage() {
  // Fetch tasks and stats from the API
  const tasksResponse = await getTasks();
  const statsResponse = await getTaskStats();

  const tasks = tasksResponse.success ? tasksResponse.data : [];
  const stats = statsResponse.success
    ? statsResponse.data
    : {
        pending: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0
      };

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
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Task Statistics */}
          <TaskStats initialStats={stats} />

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

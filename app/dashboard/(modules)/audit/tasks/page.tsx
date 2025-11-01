import { Button } from "@/components/ui/button";
import { Download, Filter, Workflow } from "lucide-react";
import { TasksTableClient } from "./_components/tasks-table-client";
import { TaskStats } from "./_components/task-stats";
import PageHeader from "@/components/page-header";

export default function TasksPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Workflow Tasks"
              description="  Manage and execute workflow tasks assigned to users (Simulation Mode)"
              Icon={Workflow}
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
          <TaskStats />

          {/* Table */}
          <TasksTableClient />
        </div>
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

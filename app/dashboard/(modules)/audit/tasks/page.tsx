import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { TasksTableClient } from "./_components/tasks-table-client";
import { TaskStats } from "./_components/task-stats";

export default function TasksPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workflow Tasks</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage and execute workflow tasks assigned to users (Simulation Mode)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2">
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

"use client";

import { useTaskStore } from "@/lib/stores/task-store";
import { TasksTable } from "./tasks-table";

export function TasksTableClient() {
  const { tasks } = useTaskStore();

  return (
    <>
      {tasks.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm">
            Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
      <TasksTable tasks={tasks} />
    </>
  );
}

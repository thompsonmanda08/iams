"use client";

import { TasksTable } from "./tasks-table";

interface TasksTableClientProps {
  initialTasks: any[];
}

export function TasksTableClient({ initialTasks }: TasksTableClientProps) {
  const tasks = initialTasks || [];

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

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowInstancesPanel } from "./workflow-instances-panel";
import { WorkflowTasksPanel } from "./workflow-tasks-panel";
import type { Task } from "@/lib/types/task";
import { AlertCircle, CheckCircle2, List } from "lucide-react";

interface TasksPageLayoutProps {
  initialInstances: Task[];
  initialTasks?: any[];
}

/**
 * TasksPageLayout
 *
 * Main layout component for the tasks/workflow management page
 * Provides two distinct tabs:
 * 1. Workflow Instances - All workflow instances (instances needing approval)
 * 2. Your Tasks - User-assigned tasks (tasks assigned to current user)
 *
 * Naming Convention:
 * - "Workflow Instances" = All instances system-wide
 * - "Your Tasks" = Only tasks assigned to the current user
 *
 * This clear naming prevents confusion between the two types of data
 */
export function TasksPageLayout({ initialInstances, initialTasks = [] }: TasksPageLayoutProps) {
  const [activeTab, setActiveTab] = useState("instances");

  return (
    <div className="space-y-6">
      {/* INFO BANNER - Explain the difference between tabs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
          <div className="flex gap-3">
            <List className="text-blue-600 dark:text-blue-400 h-5 w-5 shrink-0 pt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-400">Workflow Instances</p>
              <p className="mt-1 text-blue-800 dark:text-blue-300">
                All workflow instances in the system awaiting approval or action. Available to all authorized users.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
          <div className="flex gap-3">
            <CheckCircle2 className="text-green-600 dark:text-green-400 h-5 w-5 shrink-0 pt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-green-900 dark:text-green-400">Your Tasks</p>
              <p className="mt-1 text-green-800 dark:text-green-300">
                Tasks specifically assigned to you that require your action or review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instances" className="gap-2">
            <List className="h-4 w-4" />
            <span>Workflow Instances</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your Tasks</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: WORKFLOW INSTANCES */}
        <TabsContent value="instances" className="space-y-4">
          <WorkflowInstancesPanel instances={initialInstances} />
        </TabsContent>

        {/* TAB 2: WORKFLOW TASKS (User-Assigned) */}
        <TabsContent value="tasks" className="space-y-4">
          <WorkflowTasksPanel initialTasks={initialTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

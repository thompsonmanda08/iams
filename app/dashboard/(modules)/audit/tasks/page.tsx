import { Button } from "@/components/ui/button";
import { Workflow } from "lucide-react";
import PageHeader from "@/components/page-header";
import { getTasks } from "@/app/_actions/task-actions";
import { TasksPageLayout } from "./_components/tasks-page-layout";
import Link from "next/link";

export default async function TasksPage() {
  // Fetch workflow instances (SSR)
  const instancesResponse = await getTasks();
  const instances = instancesResponse.success ? instancesResponse.data : [];

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
          <TasksPageLayout initialInstances={instances} />
        </div>
      </div>
    </div>
  );
}

import { getWorkflowDetails } from "@/app/_actions/workflow-actions";
import { getRoles } from "@/app/_actions/config-actions";
import { WorkflowAdministration } from "../_components/workflow-administration";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ workflow_id: string; [key: string]: string }>;
};

export default async function WorkflowAdminPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;
  const workflowId = urlParams.workflow_id;

  if (!workflowId) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workflow selected. Please select a workflow from the workflow configuration page.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/dashboard/system-configs/workflow">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflows
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch workflow details, roles, and instances in parallel
  const [
    workflowResponse,
    rolesResponse
    //  instancesResponse
  ] = await Promise.all([
    getWorkflowDetails(workflowId),
    getRoles({ isActive: true, limit: 1000 })
    // listWorkflowInstances({ workflow_id: workflowId, page_size: 100 })
  ]);

  if (!workflowResponse.success || !workflowResponse.data) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load workflow details. {workflowResponse.message}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/dashboard/system-configs/workflow">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflows
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const workflow = workflowResponse.data?.data;
  const roles = rolesResponse?.data?.data || [];
  // const instances = instancesResponse?.data?.data || [];
  const instances = [];

  // Format roles for the workflow administration component
  const availableRoles =
    rolesResponse.success && roles
      ? roles?.map((role: any) => ({
          id: role.id,
          name: role.name
        }))
      : [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/system-configs/workflow">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Button>
        </Link>
      </div>

      {/* Administration Panel */}
      <WorkflowAdministration
        workflow={workflow}
        availableRoles={availableRoles}
        instances={instances}
      />

      {/* Warning if no roles available */}
      {availableRoles.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active roles found in the system. Role assignment features will be limited. Please
            create roles in the system configuration first.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

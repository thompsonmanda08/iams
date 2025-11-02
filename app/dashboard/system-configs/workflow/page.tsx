import { listWorkflows } from "@/app/_actions/workflow-actions";
import { Pagination } from "@/lib/types";
import WorkflowClient from "./_components";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function WorkflowConfigPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;

  // Fetch workflows from the API
  const workflowsResponse = await listWorkflows();
  const workflows = workflowsResponse.success ? workflowsResponse.data : [];

  // console.log("WOKRFLOWS", workflows);

  return (
    <div>
      <WorkflowClient initialWorkflows={workflows} />
    </div>
  );
}

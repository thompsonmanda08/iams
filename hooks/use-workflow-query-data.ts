"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

import {
  createWorkflow,
  getWorkflowApprovals,
  listWorkflows
} from "@/app/_actions/workflow-actions";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";

/**
 * Hook to fetch list of workflows with optional filters
 */
export const useWorkflows = (initialWorkflows: any[]) =>
  useQuery({
    queryKey: [QUERY_KEYS.WORKFLOWS],
    queryFn: async () => {
      const response = await listWorkflows();
      const workflows = response.success ? response.data : [];
      return workflows;
    },
    initialData: initialWorkflows,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

/**
 * Hook to fetch pending approvals for a workflow instance
 */
export const useWorkflowApprovals = (instanceId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.WORKFLOW_APPROVALS, instanceId],
    queryFn: () => getWorkflowApprovals(instanceId),
    enabled: !!instanceId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000 // Refetch every 15 seconds
  });

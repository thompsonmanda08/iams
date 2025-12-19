"use server";

import { revalidatePath } from "next/cache";
import { notify } from "@/lib/utils";
import type { AuditPlan } from "@/lib/types/audit-types";
import authenticatedApiClient, {
  successResponse,
  handleError,
  handleBadRequest
} from "./api-config";
import { APIResponse } from "@/lib/types";

// ============================================================================
// AUDIT CLOSURE CHECKLIST VALIDATION
// ============================================================================

export interface ClosureChecklist {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: "workpaper" | "findings" | "actions" | "approvals" | "documentation";
}

export interface ClosureChecklistResult {
  auditPlanId: string;
  allChecklistsComplete: boolean;
  requiredChecklistsComplete: boolean;
  checklists: ClosureChecklist[];
  summary: {
    totalWorkpapers: number;
    completedWorkpapers: number;
    totalFindings: number;
    resolvedFindings: number;
    totalActions: number;
    approvedActions: number;
    openApprovals: number;
  };
  readyForClosure: boolean;
  closureBlockers: string[];
}

/**
 * Validate audit closure readiness
 * Checks workpapers, findings, actions, and approvals
 */
export async function validateAuditClosure(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    // Fetch audit plan details
    const auditResponse = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/audit-plans/${auditPlanId}`
    });

    if (!auditResponse.data) {
      return handleBadRequest("Audit plan not found");
    }

    const auditPlan = auditResponse.data as AuditPlan;

    // Fetch workpaper and tasks in parallel
    const [workpaperRes, tasksRes] = await Promise.all([
      authenticatedApiClient({
        method: "GET",
        url: `/api/v1/audit-plans/${auditPlanId}/working-paper`
      }).catch(() => ({ data: null })),
      authenticatedApiClient({
        method: "GET",
        url: `/api/v1/simple-workflows/instances?entity_id=${auditPlanId}`
      }).catch(() => ({ data: [] }))
    ]);

    // Extract data from responses
    const workpaper = workpaperRes?.data?.data || workpaperRes?.data;
    const workpapers = workpaper ? [workpaper] : [];
    const findings = Array.isArray(workpaper?.findings) ? workpaper.findings : [];

    // Fetch actions for all findings in parallel
    const actionRequests = findings.map((finding: any) =>
      authenticatedApiClient({
        method: "GET",
        url: `/api/v1/findings/${finding.id}/actions`
      }).catch(() => ({ data: { data: [] } }))
    );

    const actionResponses = actionRequests.length > 0 ? await Promise.all(actionRequests) : [];

    // Flatten all actions from all findings
    let actions: any[] = [];
    actionResponses.forEach((response: any) => {
      const actionData = response?.data?.data || response?.data || [];
      if (Array.isArray(actionData)) {
        actions.push(...actionData);
      }
    });

    let tasks: any[] = [];
    if (Array.isArray(tasksRes?.data?.data)) {
      tasks = tasksRes.data.data;
    } else if (Array.isArray(tasksRes?.data)) {
      tasks = tasksRes.data;
    }

    // Calculate closure statistics
    const completedWorkpapers = workpapers.filter(
      (wp: any) => wp.status === "COMPLETED" || wp.status === "CLOSED"
    ).length;

    const resolvedFindings = findings.filter(
      (f: any) => f.status === "COMPLETED" || f.status === "CLOSED"
    ).length;

    const approvedActions = actions.filter(
      (a: any) => a.status === "APPROVED" || a.status === "COMPLETED"
    ).length;

    const openApprovals = tasks.filter(
      (t: any) => t.status === "PENDING" || t.status === "IN_REVIEW"
    ).length;

    // Build closure checklist
    const checklists: ClosureChecklist[] = [
      {
        id: "all-workpapers",
        name: "All Workpapers Linked",
        description: `${completedWorkpapers} of ${workpapers.length} workpapers completed`,
        completed: workpapers.length === 0 || completedWorkpapers === workpapers.length,
        required: true,
        category: "workpaper"
      },
      {
        id: "all-findings-addressed",
        name: "All Findings Addressed",
        description: `${resolvedFindings} of ${findings.length} findings resolved or closed`,
        completed: findings.length === 0 || resolvedFindings === findings.length,
        required: true,
        category: "findings"
      },
      {
        id: "critical-findings",
        name: "No Critical Findings Open",
        description: "All critical findings must be resolved before closure",
        completed: !findings.some(
          (f: any) =>
            (f.severity?.toUpperCase() === "CRITICAL" || f.status?.toUpperCase() === "HIGH") &&
            f.status !== "COMPLETED" &&
            f.status !== "CLOSED"
        ),
        required: true,
        category: "findings"
      },
      {
        id: "actions-status",
        name: "Finding Actions Completed",
        description: `${approvedActions} of ${actions.length} actions approved or completed`,
        completed: actions.length === 0 || approvedActions >= Math.ceil(actions.length * 0.8),
        required: false,
        category: "actions"
      },
      {
        id: "all-approvals-done",
        name: "All Approvals Completed",
        description: `${openApprovals} pending approval(s)`,
        completed: openApprovals === 0,
        required: true,
        category: "approvals"
      },
      {
        id: "team-sign-off",
        name: "Team Lead Sign-Off",
        description: "Audit team lead has reviewed and approved closure",
        completed: false, // This will be set when user explicitly signs off
        required: true,
        category: "approvals"
      },
      {
        id: "closure-documentation",
        name: "Closure Documentation",
        description: "Audit closure report and summary prepared",
        completed: false, // This will be checked before submission
        required: true,
        category: "documentation"
      }
    ];

    // Determine closure blockers
    const closureBlockers: string[] = [];
    checklists.forEach((checklist) => {
      if (checklist.required && !checklist.completed) {
        closureBlockers.push(checklist.name);
      }
    });

    const allChecklistsComplete = checklists.every((c) => c.completed);
    const requiredChecklistsComplete = checklists
      .filter((c) => c.required)
      .every((c) => c.completed);
    const readyForClosure = closureBlockers.length === 0;

    const result: ClosureChecklistResult = {
      auditPlanId,
      allChecklistsComplete,
      requiredChecklistsComplete,
      checklists,
      summary: {
        totalWorkpapers: workpapers.length,
        completedWorkpapers,
        totalFindings: findings.length,
        resolvedFindings,
        totalActions: actions.length,
        approvedActions,
        openApprovals
      },
      readyForClosure,
      closureBlockers
    };

    return successResponse(result, "Closure validation completed");
  } catch (error: any) {
    return handleError(error, "GET | VALIDATE AUDIT CLOSURE", `/api/v1/audit-plans/${auditPlanId}`);
  }
}

// ============================================================================
// AUDIT CLOSURE WORKFLOW
// ============================================================================

export interface ClosureRequestPayload {
  auditPlanId: string;
  closureNotes: string;
  teamLeadSignOff: boolean;
  closureReportUrl?: string;
}

export interface ClosureApprovalPayload {
  auditPlanId: string;
  approvalStatus: "APPROVED" | "REJECTED";
  approvalNotes?: string;
  approverRole: "MANAGER" | "CEO";
}

/**
 * Request audit closure
 * Creates workflow for closure approvals (Manager -> CEO)
 */
export async function requestAuditClosure(payload: ClosureRequestPayload): Promise<APIResponse> {
  const { auditPlanId, closureNotes, teamLeadSignOff } = payload;

  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  if (!teamLeadSignOff) {
    return handleBadRequest("Team lead sign-off is required");
  }

  if (!closureNotes?.trim()) {
    return handleBadRequest("Closure notes are required");
  }

  try {
    // Validate closure first
    const validationResult = await validateAuditClosure(auditPlanId);

    if (!validationResult.success || !validationResult.data?.readyForClosure) {
      const blockers = validationResult.data?.closureBlockers || [];
      return {
        success: false,
        data: null,
        message: `Cannot request closure: ${blockers.join(", ")}`
      };
    }

    // Create closure workflow instance
    const workflowPayload = {
      workflow_type: "AUDIT_CLOSURE",
      entity_type: "AUDIT_PLAN",
      entity_id: auditPlanId,
      workflow_data: {
        closure_notes: closureNotes,
        team_lead_sign_off: teamLeadSignOff,
        closure_request_date: new Date().toISOString(),
        closure_report_url: payload.closureReportUrl
      }
    };

    const workflowResponse = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/simple-workflows/instances",
      data: workflowPayload
    });

    if (!workflowResponse.data) {
      return handleBadRequest("Failed to create closure workflow");
    }

    revalidatePath("/dashboard/workflows/approvals");
    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    notify({
      title: "Closure Requested",
      description: "Audit closure has been requested and sent for approval",
      type: "success"
    });

    return successResponse(workflowResponse.data, "Audit closure requested successfully");
  } catch (error: any) {
    return handleError(error, "POST | REQUEST AUDIT CLOSURE", `/api/v1/simple-workflows/instances`);
  }
}

/**
 * Approve audit closure (Manager or CEO level)
 */
export async function approveAuditClosure(payload: ClosureApprovalPayload): Promise<APIResponse> {
  const { auditPlanId, approvalStatus, approvalNotes, approverRole } = payload;

  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  if (!approverRole) {
    return handleBadRequest("Approver role is required");
  }

  try {
    // Fetch workflow instance for this audit
    const workflowResponse = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/simple-workflows/instances?entity_id=${auditPlanId}&workflow_type=AUDIT_CLOSURE`
    });

    const workflows = (workflowResponse?.data || []) as any[];
    const closureWorkflow = workflows.find(
      (w: any) => w.workflow_type === "AUDIT_CLOSURE" && w.status === "PENDING"
    );

    if (!closureWorkflow) {
      return handleBadRequest("No pending closure workflow found");
    }

    const workflowInstanceId = closureWorkflow.id;
    const endpoint =
      approvalStatus === "APPROVED"
        ? `/api/v1/simple-workflows/instances/${workflowInstanceId}/approve`
        : `/api/v1/simple-workflows/instances/${workflowInstanceId}/reject`;

    const approvalResponse = await authenticatedApiClient({
      method: "POST",
      url: endpoint,
      data: {
        remarks: approvalNotes || `Closure ${approvalStatus.toLowerCase()} by ${approverRole}`,
        approver_role: approverRole
      }
    });

    if (approvalStatus === "APPROVED") {
      await authenticatedApiClient({
        method: "POST",
        url: `/api/v1/audit-plans/${auditPlanId}/complete`
      });
    }

    revalidatePath("/dashboard/workflows/approvals");
    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    notify({
      title: `Closure ${approvalStatus}`,
      description: `Audit closure has been ${approvalStatus.toLowerCase()}`,
      type: "success"
    });

    return successResponse(
      approvalResponse.data,
      `Audit closure ${approvalStatus.toLowerCase()} successfully`
    );
  } catch (error: any) {
    return handleError(
      error,
      `POST | ${approvalStatus} AUDIT CLOSURE`,
      `/api/v1/simple-workflows/instances/{workflowInstanceId}/${approvalStatus.toLowerCase()}`
    );
  }
}

/**
 * Get audit closure status
 */
export async function getAuditClosureStatus(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const workflowResponse = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/simple-workflows/instances?entity_id=${auditPlanId}&workflow_type=AUDIT_CLOSURE`
    });

    const workflows = (workflowResponse?.data || []) as any[];
    const closureWorkflow = workflows.find((w: any) => w.workflow_type === "AUDIT_CLOSURE");

    return successResponse(closureWorkflow || null, "Closure status retrieved successfully");
  } catch (error: any) {
    return handleError(error, "GET | AUDIT CLOSURE STATUS", `/api/v1/simple-workflows/instances`);
  }
}

/**
 * Cancel audit closure request (can only be done before any approvals)
 */
export async function cancelAuditClosureRequest(auditPlanId: string): Promise<APIResponse> {
  if (!auditPlanId) {
    return handleBadRequest("Audit plan ID is required");
  }

  try {
    const workflowResponse = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/simple-workflows/instances?entity_id=${auditPlanId}&workflow_type=AUDIT_CLOSURE`
    });

    const workflows = (workflowResponse?.data || []) as any[];
    const closureWorkflow = workflows.find(
      (w: any) => w.workflow_type === "AUDIT_CLOSURE" && w.status === "PENDING"
    );

    if (!closureWorkflow) {
      return handleBadRequest("No pending closure workflow to cancel");
    }

    // Cancel/reject the workflow
    await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/simple-workflows/instances/${closureWorkflow.id}/reject`,
      data: {
        remarks: "Closure request cancelled by audit team"
      }
    });

    revalidatePath("/dashboard/workflows/approvals");
    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    notify({
      title: "Closure Cancelled",
      description: "Audit closure request has been cancelled",
      type: "success"
    });

    return successResponse(null, "Closure request cancelled successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CANCEL AUDIT CLOSURE",
      `/api/v1/simple-workflows/instances/{workflowInstanceId}/reject`
    );
  }
}

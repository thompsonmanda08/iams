"use server";

import { revalidatePath } from "next/cache";
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

    // Extract workpaper data
    const workpaper = workpaperRes?.data?.data || workpaperRes?.data;
    const workpapers = workpaper ? [workpaper] : [];

    // Extract findings - check both nested format and direct array format
    let findings: any[] = [];
    if (Array.isArray(workpaper?.findings)) {
      findings = workpaper.findings;
    } else if (Array.isArray(workpaper?.categories)) {
      // If findings are nested in categories, flatten them
      findings = workpaper.categories.flatMap((cat: any) =>
        Array.isArray(cat.findings) ? cat.findings : []
      );
    }

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
    // A workpaper is considered completed if all its related findings are completed
    const completedWorkpapers = workpapers.filter((wp: any) => {
      // Check if workpaper has explicit status
      if (wp.status === "COMPLETED" || wp.status === "CLOSED") {
        return true;
      }

      // Get all findings for this workpaper (from either direct array or categories)
      let wpFindings: any[] = [];
      if (Array.isArray(wp.findings)) {
        wpFindings = wp.findings;
      } else if (Array.isArray(wp.categories)) {
        // Flatten findings from categories
        wpFindings = wp.categories.flatMap((cat: any) =>
          Array.isArray(cat.findings) ? cat.findings : []
        );
      }

      // Workpaper is completed if it has findings AND all findings are completed (not OPEN)
      return (
        wpFindings.length > 0 &&
        wpFindings.every(
          (finding: any) =>
            finding.status !== "OPEN" &&
            finding.status !== "" &&
            finding.status !== null &&
            finding.status !== undefined
        )
      );
    }).length;

    const resolvedFindings = findings.filter(
      (f: any) =>
        f.status === "APPROVED" ||
        f.status === "COMPLETED" ||
        f.status === "RESOLVED" ||
        f.status === "CLOSED"
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
            (f.severity?.toUpperCase() === "CRITICAL" || f.severity?.toUpperCase() === "HIGH") &&
            f.status !== "APPROVED" &&
            f.status !== "RESOLVED" &&
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
        completed: auditPlan.status === "COMPLETED" || auditPlan.status === "CLOSED", // Only complete after closure request is approved
        required: false, // Not a blocker - will be completed after request submission
        category: "approvals"
      },
      {
        id: "closure-documentation",
        name: "Closure Documentation",
        description: "Audit closure report and summary prepared",
        completed: auditPlan.status === "CLOSED" || auditPlan.status === "COMPLETED", // Only complete when audit is closed
        required: false, // Can be prepared after closure request
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

  const url = `/api/v1/audit-plans/${auditPlanId}/close`;

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

    // Request closure via the correct endpoint
    const closureResponse = await authenticatedApiClient({
      method: "POST",
      url,
      data: {
        closure_notes: closureNotes
      }
    });

    if (!closureResponse.data) {
      return handleBadRequest("Failed to request audit closure");
    }

    revalidatePath("/dashboard/workflows/approvals");
    revalidatePath("/dashboard/audit/plans");
    revalidatePath(`/dashboard/audit/plans/engagement/${auditPlanId}`);

    return successResponse(closureResponse.data, "Audit closure requested successfully");
  } catch (error: any) {
    return handleError(error, "POST | REQUEST AUDIT CLOSURE", url);
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

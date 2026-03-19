import type { AuditPlan } from "@/lib/types/audit-types";
import type { ClosureChecklist, ClosureChecklistResult } from "@/app/_actions/audit-closure-actions";

interface ComputeClosureChecklistParams {
  auditPlan: AuditPlan;
  workpaper: any | null;
  findings: any[];
  actions: any[];
  userTasks: any[];
  isGeneralFramework: boolean;
}

/**
 * Computes the closure checklist entirely client-side from already-available data.
 * Mirrors the logic in validateAuditClosure (server action) but avoids redundant
 * re-fetches of data the page already has (audit plan, workpaper, findings, userTasks).
 * Only finding actions are fetched separately via useFindingActionsQuery.
 */
export function computeClosureChecklist({
  auditPlan,
  workpaper,
  findings,
  actions,
  userTasks,
  isGeneralFramework
}: ComputeClosureChecklistParams): ClosureChecklistResult {
  // Defensive normalization — callers may pass null/undefined or a non-array value
  const safeFindings = Array.isArray(findings) ? findings : [];
  const safeActions = Array.isArray(actions) ? actions : [];
  const safeUserTasks = Array.isArray(userTasks) ? userTasks : [];

  // Reassign to keep the rest of the function unchanged
  findings = safeFindings;
  actions = safeActions;
  userTasks = safeUserTasks;

  const workpapers = workpaper ? [workpaper] : [];

  const completedWorkpapers = workpapers.filter((wp: any) => {
    if (wp.status === "COMPLETED" || wp.status === "CLOSED") return true;

    if (isGeneralFramework) {
      const metaFilled =
        !!wp.metadata?.work_done?.trim() && !!wp.metadata?.conclusion?.trim();
      const allResolved =
        findings.length === 0 ||
        findings.every(
          (f: any) =>
            f.status !== "OPEN" && f.status !== "" && f.status !== null && f.status !== undefined
        );
      return metaFilled && allResolved;
    }

    // Compliance: workpaper complete when all its findings are not OPEN
    let wpFindings: any[] = [];
    if (Array.isArray(wp.findings)) {
      wpFindings = wp.findings;
    } else if (Array.isArray(wp.categories)) {
      wpFindings = wp.categories.flatMap((cat: any) =>
        Array.isArray(cat.findings) ? cat.findings : []
      );
    }

    return (
      wpFindings.length > 0 &&
      wpFindings.every(
        (f: any) =>
          f.status !== "OPEN" &&
          f.status !== "" &&
          f.status !== null &&
          f.status !== undefined
      )
    );
  }).length;

  const resolvedFindings = findings.filter((f: any) =>
    ["APPROVED", "COMPLETED", "RESOLVED", "CLOSED"].includes(f.status)
  ).length;

  const approvedActions = actions.filter(
    (a: any) => a.status === "APPROVED" || a.status === "COMPLETED"
  ).length;

  const openApprovals = userTasks.filter(
    (t: any) => t.status === "PENDING" || t.status === "IN_REVIEW"
  ).length;

  const checklists: ClosureChecklist[] = [
    {
      id: "all-workpapers",
      name: "All Workpapers Linked",
      description: isGeneralFramework
        ? `${completedWorkpapers} of ${workpapers.length} workpapers complete (metadata filled and all evidence rows resolved)`
        : `${completedWorkpapers} of ${workpapers.length} workpapers completed`,
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
          !["APPROVED", "RESOLVED", "COMPLETED", "CLOSED"].includes(f.status)
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
      id: "auditee-sign-off",
      name: "Auditee Sign-Off",
      description: "Auditee has reviewed findings and submitted sign-off comments",
      completed: !!auditPlan.management_comments?.trim(),
      required: true,
      category: "actions"
    },
    {
      id: "closure-documentation",
      name: "Closure Documentation",
      description: "Audit closure report and summary prepared",
      completed: auditPlan.status === "CLOSED" || auditPlan.status === "COMPLETED",
      required: false,
      category: "documentation"
    }
  ];

  const closureBlockers = checklists
    .filter((c) => c.required && !c.completed)
    .map((c) => c.name);

  return {
    auditPlanId: auditPlan.id,
    allChecklistsComplete: checklists.every((c) => c.completed),
    requiredChecklistsComplete: checklists.filter((c) => c.required).every((c) => c.completed),
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
    readyForClosure: closureBlockers.length === 0,
    closureBlockers
  };
}

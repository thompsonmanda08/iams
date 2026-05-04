"use client";

import { useState, useMemo, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { listGeneralFindings } from "@/app/_actions/general-findings-actions";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Send,
  CircleAlertIcon,
  FileArchive,
  Trash2,
  PencilLineIcon
} from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import { FindingsList } from "./findings-list";
import { cn, notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import {
  useSubmitAuditPlanMutation,
  useDeleteAuditPlanMutation
} from "@/hooks/use-audit-mutations";
import { useAuditMemo } from "@/hooks/use-audit-queries";
import { AuditClosureReview } from "./audit-closure-review";
import { AuditPlanTasksPanel } from "./audit-plan-tasks-panel";
import { ComplianceAuditWorkpaperTab } from "./compliance-workpaper-tab";
import { GeneralAuditWorkpaperTab } from "./general-audit-workpaper-tab";
import { AuditPlanReportTab } from "./audit-plan-report-tab";
import { usePermissions } from "@/hooks/use-permissions";
import { AuditPlanDetailsTab } from "./plan-details-tab";
import { GeneralFindingsList } from "./general-findings-list";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

interface AuditPlanWorkpaperViewProps {
  auditPlan: AuditPlan;
  workpaperCategories: any[];
  findings: any[];
  userTasks?: any[];
  auditPlanStatus?: string;
  workpaper?: any;
  frameworkType?: string;
}

// Helper function to check if a finding is completed
// A finding is considered completed if its status is not OPEN
const isCompletedFinding = (finding: any): boolean => {
  return finding.status !== "OPEN";
};

export function AuditPlanWorkpaperView({
  auditPlan,
  workpaperCategories,
  findings,
  userTasks = [],
  auditPlanStatus,
  workpaper,
  frameworkType
}: AuditPlanWorkpaperViewProps) {
  const queryClient = useQueryClient();
  const { checkPermission, hasPermission } = usePermissions();

  // Single source of truth: frameworkType prop (from page.tsx) takes precedence.
  // Falls back to auditPlan fields for backwards compatibility.
  const isGeneralFramework = [
    frameworkType,
    auditPlan.framework_type,
    auditPlan.management_standard,
    workpaper?.framework_type
  ].some((f) => String(f ?? "").toUpperCase() === "GENERAL");

  // For GENERAL workpapers — subscribe to the same query key used by GeneralFindingsList
  // so the completion badge stays live without extra API calls (cache is shared).
  const { data: generalFindings } = useQuery({
    queryKey: [QUERY_KEYS.GENERAL_FINDINGS, workpaper?.id],
    queryFn: async () => {
      const result = await listGeneralFindings(workpaper!.id);
      if (!result.success) throw new Error(result.message);
      const arr = Array.isArray(result.data?.findings)
        ? result.data.findings
        : Array.isArray(result.data)
          ? result.data
          : [];
      return arr as any[];
    },
    initialData: workpaper?.general_findings ?? [],
    staleTime: 0,
    enabled: isGeneralFramework && !!workpaper?.id
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("plan-details");
  const [findingsRefreshKey, setFindingsRefreshKey] = useState(0);
  const [editingFinding, setEditingFinding] = useState<any>(null);
  const [auditPlanData, setAuditPlanData] = useState(auditPlan);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);

  const { data: memoData } = useAuditMemo(auditPlan.id);

  const { mutate: submitPlan, isPending: isSubmitting } = useSubmitAuditPlanMutation({
    onSuccess: () => {
      // Update local state to reflect the submission
      setAuditPlanData((prev) => ({ ...prev, status: "SUBMITTED" }));
    }
  });
  const { mutate: deletePlan, isPending: isDeleting } = useDeleteAuditPlanMutation({
    onSuccess: () => {
      setDeleteDialogOpen(false);
    }
  });

  const handleEditFinding = (finding: any) => {
    // Use the category object from the finding if available, otherwise find matching category
    let categoryId: string | null = null;

    if (finding.category && finding.category.id) {
      categoryId = finding.category.id;
    } else {
      const matchingCategory = workpaperCategories?.find(
        (cat) => cat.clause === finding.clause || cat.name === finding.category_name
      );
      if (matchingCategory) {
        categoryId = matchingCategory.id;
      }
    }

    if (categoryId) {
      // Switch to workpaper tab
      setActiveTab("workpaper");
      // Select the category
      setSelectedCategoryId(categoryId);
      // Store the editing finding
      setEditingFinding(finding);

      // Scroll to the finding form after a brief delay to allow state updates
      setTimeout(() => {
        const formElement = document.querySelector("[data-finding-form]");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Build dynamic category list from findings first
  const categoriesFromFindings = useMemo(() => {
    if (!findings || findings.length === 0) return [];

    // Get unique categories from findings using the category object attached to each finding
    const categoryMap = new Map<string, any>();

    findings.forEach((finding: any) => {
      // Use the category object directly from the finding if available
      if (finding.category && finding.category.id && !categoryMap.has(finding.category.id)) {
        categoryMap.set(finding.category.id, finding.category);
      }
      // Fallback: try to match from workpaperCategories if category object is missing
      else if (!finding.category) {
        const matchingCategory = workpaperCategories?.find(
          (cat: any) => cat.name === finding.category_name || cat.clause === finding.clause
        );
        if (matchingCategory && !categoryMap.has(matchingCategory.id)) {
          categoryMap.set(matchingCategory.id, matchingCategory);
        }
      }
    });

    // Return sorted by original order in workpaperCategories (sort_order)
    return Array.from(categoryMap.values()).sort(
      (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
    );
  }, [findings, workpaperCategories]);

  // Set initial selected category to first one from findings
  useEffect(() => {
    if (selectedCategoryId === null && categoriesFromFindings?.length > 0) {
      setSelectedCategoryId(categoriesFromFindings[0].id);
    }
  }, [categoriesFromFindings, selectedCategoryId]);

  const completionStats = useMemo(() => {
    if (isGeneralFramework) {
      const total = generalFindings?.length || 0;
      const completed = generalFindings?.filter((f: any) => f.status === "APPROVED").length || 0;
      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }

    const total = categoriesFromFindings?.length || 0;
    const completed =
      categoriesFromFindings?.filter((cat: any) => {
        const catFindings =
          findings?.filter((f: any) => {
            return f.category?.id === cat.id;
          }) || [];
        return catFindings.length > 0 && catFindings.every(isCompletedFinding);
      }).length || 0;

    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [isGeneralFramework, generalFindings, categoriesFromFindings, findings]);

  const auditTeamLeaderId = auditPlan?.audit_team_leader;
  const teamMembersCount = auditPlan?.audit_team_members?.length || 0;

  return (
    <div className="space-y-6">
      {/* Audit Plan Header */}
      <Card className="border-0 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-foreground text-3xl font-bold">{auditPlan.title}</div>
                <StatusBadge status={auditPlan.status} />
              </div>
              <h1 className="text-foreground text-lg font-semibold">
                REF NO.: {auditPlan?.ref_no}
              </h1>
              <p className="text-muted-foreground">{auditPlan.description}</p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-2">
                {auditPlanData.status.toUpperCase() === "DRAFT" && (
                  <>
                    <PermissionButton moduleCode={MODULE_CODES.AUDIT_PLANS} action="can_approve"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
  if (!memoData) {
                          notify({
                            title: "Engagement Memo Required",
                            description:
                              "An engagement memo must be created before submitting this audit plan for approval.",
                            type: "error"
                          });
                          return;
                        }
                        setSubmitConfirmationOpen(true);
}}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Submitting...">
                      <Send className="h-6 w-6" />
                      Submit for Approval
                    </PermissionButton>
                    <Button asChild variant="secondary" size="sm" className="gap-2">
                      <Link
                        href={`/dashboard/audit/plans/engagement/${auditPlan.id}/edit`}
                        onClick={(e) => {
                          if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_edit")) {
                            e.preventDefault();
                          }
                        }}>
                        <PencilLineIcon className="h-6 w-6" />
                        Edit Plan
                      </Link>
                    </Button>
                    <PermissionButton moduleCode={MODULE_CODES.AUDIT_PLANS} action="can_delete"
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
  setDeleteDialogOpen(true);
}}
                      disabled={isDeleting}>
                      <Trash2 className="h-6 w-6" />
                      Delete Plan
                    </PermissionButton>
                  </>
                )}
              </div>

              {/* Created and Updated Info */}
              <div className="text-muted-foreground flex gap-6 text-xs">
                {auditPlan.created_at && (
                  <div className="text-right">
                    <p className="text-foreground mb-1.5 font-medium">Created</p>
                    <p>{format(new Date(auditPlan.created_at), "MMM d, yyyy")}</p>
                    {auditPlan.created_by && (
                      <>
                        <p className="text-xs">by {auditPlan.created_by_user?.name}</p>
                        <p className="text-xs"> {auditPlan.created_by_user?.role}</p>
                      </>
                    )}
                  </div>
                )}
                {auditPlan.updated_at && (
                  <div className="text-right">
                    <p className="text-foreground mb-1.5 font-medium">Updated</p>
                    <p>{format(new Date(auditPlan.updated_at), "MMM d, yyyy")}</p>
                    {auditPlan.updated_by && (
                      <>
                        <p className="text-xs">by {auditPlan.updated_by_user?.name}</p>
                        <p className="text-xs"> {auditPlan.updated_by_user?.role}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 flex-wrap gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-muted-foreground text-sm">Timeline</p>
                <p className="text-sm font-semibold">
                  {auditPlan?.start_date && auditPlan?.end_date
                    ? `${format(new Date(auditPlan.start_date), "MMM d")} - ${format(new Date(auditPlan.end_date), "MMM d, yyyy")}`
                    : "No timeline set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-muted-foreground text-sm">Standard</p>
                <p className="text-sm font-semibold">{auditPlan.management_standard}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold">{auditTeamLeaderId ? "1 Team Lead" : "-"}</p>
                <p className="text-muted-foreground text-xs">{teamMembersCount} Team member(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-muted-foreground text-sm">Ref No</p>
                <p className="text-sm font-semibold">{auditPlan.ref_no}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-14 w-max gap-1 md:grid md:w-full md:grid-cols-5">
            <TabsTrigger
              value="plan-details"
              className="w-full min-w-max text-nowrap whitespace-nowrap">
              <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span className="hidden sm:inline">Plan Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="workpaper"
              className="w-full min-w-max text-nowrap whitespace-nowrap">
              <FileArchive className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span className="inline">Workpaper</span>
              <Badge
                variant={activeTab === "workpaper" ? "default" : "info"}
                className={cn("flex items-center justify-center rounded p-1 text-xs font-medium", {
                  "bg-muted-foreground/20 opacity-50": activeTab !== "workpaper"
                })}>
                {completionStats.completed}/{completionStats.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="findings"
              className="w-full min-w-max text-nowrap whitespace-nowrap">
              <CircleAlertIcon className="h-5 w-5 text-orange-500" />
              <span className="hidden sm:inline">Audit Execution</span>
              <span className="sm:hidden">Findings</span>
            </TabsTrigger>
            <TabsTrigger value="closure" className="w-full min-w-max text-nowrap whitespace-nowrap">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Closure
            </TabsTrigger>
            <TabsTrigger value="report" className="w-full min-w-max text-nowrap whitespace-nowrap">
              <FileText className="h-5 w-5 text-purple-600" />
              Report
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Plan Details Tab */}
        <TabsContent value="plan-details" className="space-y-4">
          <AuditPlanDetailsTab auditPlan={auditPlan} />
        </TabsContent>

        {/* Workpaper Tab */}
        <TabsContent value="workpaper" className="space-y-4">
          {isGeneralFramework ? (
            <GeneralAuditWorkpaperTab auditPlan={auditPlan} workpaper={workpaper} />
          ) : (
            <ComplianceAuditWorkpaperTab
              auditPlan={auditPlan}
              findings={findings}
              workpaperCategories={workpaperCategories}
              categoriesFromFindings={categoriesFromFindings}
              completionStats={completionStats}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              editingFinding={editingFinding}
              setEditingFinding={setEditingFinding}
              onSubmitForApproval={() => setSubmitConfirmationOpen(true)}
              isSubmitting={isSubmitting}
            />
          )}
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Audit Findings Summary</h2>
            <p className="text-muted-foreground text-sm">
              {isGeneralFramework
                ? workpaper?.general_findings?.length || 0
                : findings?.length || 0}{" "}
              findings recorded
            </p>
          </div>
          {isGeneralFramework ? (
            <>
              <GeneralFindingsList
                findings={workpaper?.general_findings ?? []}
                config={workpaper?.config?.[0]}
                auditPlanStatus={auditPlanStatus || auditPlan.status}
                auditPlan={auditPlan}
                workingPaperId={workpaper?.id}
              />
              {/* Workpaper metadata — readonly summary */}
              {workpaper?.metadata && (
                <div className="bg-muted/30 grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                  {[
                    { label: "Objective", value: workpaper.metadata.objective },
                    { label: "Work Done", value: workpaper.metadata.work_done },
                    { label: "Conclusion", value: workpaper.metadata.conclusion }
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-primary mb-1 text-xs font-semibold tracking-wide uppercase">
                        {label}
                      </p>
                      {value ? (
                        <p className="text-sm">{value}</p>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">Not provided</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <FindingsList
              key={findingsRefreshKey}
              findings={findings || []}
              onRefresh={() => setFindingsRefreshKey((prev) => prev + 1)}
              onEditFinding={handleEditFinding}
              auditPlanStatus={auditPlanStatus || auditPlan.status}
              auditPlan={auditPlan}
              onSubmitForApproval={() => setSubmitConfirmationOpen(true)}
            />
          )}
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <AuditPlanTasksPanel auditPlanId={auditPlan.id} userTasks={userTasks} />
        </TabsContent>

        {/* Closure Tab */}
        <TabsContent value="closure" className="space-y-4">
          <AuditClosureReview
            auditPlan={auditPlanData}
            frameworkType={frameworkType}
            workpaper={workpaper}
            findings={isGeneralFramework ? (generalFindings ?? []) : (findings ?? [])}
            userTasks={userTasks}
            onClosureRequested={() => {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
            }}
            onAuditPlanUpdate={(updates) => setAuditPlanData((prev) => ({ ...prev, ...updates }))}
          />
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          <AuditPlanReportTab auditPlan={auditPlan} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deletePlan(auditPlan.id)}
        title="Delete Audit Plan"
        description="Are you sure you want to delete this audit plan? This action cannot be undone."
        confirmText="Delete"
        type="delete"
        isLoading={isDeleting}
      />

      {/* Submit for Approval Confirmation Modal */}
      <ConfirmationModal
        open={submitConfirmationOpen}
        onOpenChange={setSubmitConfirmationOpen}
        onConfirm={() => {
          submitPlan(auditPlan.id);
          setSubmitConfirmationOpen(false);
        }}
        title="Submit for Approval?"
        description="Are you sure you want to submit this audit plan for approval? This will send it to HIAR for review."
        confirmText="Submit"
        type="default"
        isLoading={isSubmitting}
      />
    </div>
  );
}

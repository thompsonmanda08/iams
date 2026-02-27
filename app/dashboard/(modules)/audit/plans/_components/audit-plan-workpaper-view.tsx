"use client";

import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  CircleCheckBig,
  FileArchive,
  Trash2,
  PencilLineIcon
} from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import type { Task } from "@/lib/types/task";
import { FindingsList } from "./findings-list";
import { cn } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import {
  useSubmitAuditPlanMutation,
  useDeleteAuditPlanMutation
} from "@/hooks/use-audit-mutations";
import { AuditClosureReview } from "./audit-closure-review";
import { AuditPlanTasksPanel } from "./audit-plan-tasks-panel";
import { ComplianceAuditWorkpaperTab } from "./compliance-workpaper-tab";
import { AuditPlanReportTab } from "./audit-plan-report-tab";
import { usePermissions } from "@/hooks/use-permissions";
import { AuditPlanDetailsTab } from "./plan-details-tab";

interface AuditPlanWorkpaperViewProps {
  auditPlan: AuditPlan;
  workpaperCategories: any[];
  findings: any[];
  tasks?: Task[];
  isLoading?: boolean;
  auditPlanStatus?: string;
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
  tasks = [],
  auditPlanStatus
}: AuditPlanWorkpaperViewProps) {
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("plan-details");
  const [findingsRefreshKey, setFindingsRefreshKey] = useState(0);
  const [editingFinding, setEditingFinding] = useState<any>(null);
  const [auditPlanData, setAuditPlanData] = useState(auditPlan);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);

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
    const total = categoriesFromFindings?.length || 0;
    const completed =
      categoriesFromFindings?.filter((cat: any) => {
        const catFindings =
          findings?.filter((f: any) => {
            // Match by category ID - this is the primary and most reliable match
            return f.category?.id === cat.id;
          }) || [];
        // A category is completed if it has at least one finding AND all findings are completed
        return catFindings.length > 0 && catFindings.every(isCompletedFinding);
      }).length || 0;

    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [categoriesFromFindings, findings]);

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
                {/* {auditPlanData.status.toUpperCase() === "COMPLETED" && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-6 w-6" />
                    Export
                  </Button>
                )} */}
                {auditPlanData.status.toUpperCase() === "DRAFT" && (
                  <>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        if (!checkPermission("AUDIT_PLANS", "can_approve")) return;
                        setSubmitConfirmationOpen(true);
                      }}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Submitting...">
                      <Send className="h-6 w-6" />
                      Submit for Approval
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="gap-2">
                      <Link
                        href={`/dashboard/audit/plans/engagement/${auditPlan.id}/edit`}
                        onClick={(e) => {
                          if (!checkPermission("AUDIT_PLANS", "can_edit")) {
                            e.preventDefault();
                          }
                        }}>
                        <PencilLineIcon className="h-6 w-6" />
                        Edit Plan
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        if (!checkPermission("AUDIT_PLANS", "can_delete")) return;
                        setDeleteDialogOpen(true);
                      }}
                      disabled={isDeleting}>
                      <Trash2 className="h-6 w-6" />
                      Delete Plan
                    </Button>
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
        <div
          className="overflow-x-auto"
          // className="-mx-4 overflow-x-auto px-4 lg:overflow-visible md:mx-0 md:px-0"
        >
          <TabsList className="inline-flex h-14 w-max gap-1 md:grid md:w-full md:grid-cols-6">
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
            <TabsTrigger
              value="approvals"
              className="w-full min-w-max text-nowrap whitespace-nowrap">
              <CircleCheckBig className="h-5 w-5 text-green-600" />
              <span className="inline">Approvals</span>
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
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Audit Findings Summary</h2>
            <p className="text-muted-foreground text-sm">
              {findings?.length || 0} findings recorded
            </p>
          </div>
          <FindingsList
            key={findingsRefreshKey}
            findings={findings || []}
            onRefresh={() => setFindingsRefreshKey((prev) => prev + 1)}
            onEditFinding={handleEditFinding}
            auditPlanStatus={auditPlanStatus || auditPlan.status}
            auditPlan={auditPlan}
            onSubmitForApproval={() => setSubmitConfirmationOpen(true)}
          />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <AuditPlanTasksPanel auditPlanId={auditPlan.id} tasks={tasks} />
        </TabsContent>

        {/* Closure Tab */}
        <TabsContent value="closure" className="space-y-4">
          <AuditClosureReview
            auditPlan={auditPlanData}
            onClosureRequested={() => {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
              setAuditPlanData((prev) => ({ ...prev }));
            }}
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

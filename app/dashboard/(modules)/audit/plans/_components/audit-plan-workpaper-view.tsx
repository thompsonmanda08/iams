"use client";

import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Send,
  CircleAlertIcon,
  CircleCheckBig,
  FileArchive,
  Trash2,
  ClipboardXIcon,
  Plus
} from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import type { Task } from "@/lib/types/task";
import { WorkpaperCategoryPanel } from "./workpaper-category-panel";
import { FindingForm } from "./finding-form";
import { FrameworkFindingForm } from "./framework-finding-form";
import { FindingsList } from "./findings-list";
import { AuditPlanApprovalsPanel } from "./audit-plan-approvals-panel";
import { cn, notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { submitAuditPlanForApproval, deleteAuditPlan } from "@/app/_actions/audit-module-actions";
import { StatusBadge } from "@/components/status-badge";
import { getFrameworkSidebarFields } from "@/lib/utils/finding-form-utils";
import Link from "next/link";
import { useDeleteAuditPlan, useSubmitAuditPlanForApproval } from "@/hooks/use-audit-query-data";

interface AuditPlanWorkpaperViewProps {
  auditPlan: AuditPlan;
  workpaperCategories: any[];
  findings: any[];
  tasks?: Task[];
  isLoading?: boolean;
}

// Helper function to check if a finding is completed
// A finding is considered completed if it has conformity status AND all required fields filled
const isCompletedFinding = (finding: any): boolean => {
  return !!(
    finding.is_conformity !== null &&
    finding.is_conformity !== undefined &&
    finding.conclusion &&
    finding.recommendation &&
    finding.severity &&
    finding.responsible_person
  );
};

export function AuditPlanWorkpaperView({
  auditPlan,
  workpaperCategories,
  findings,
  tasks = []
}: AuditPlanWorkpaperViewProps) {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("plan-details");
  const [findingsRefreshKey, setFindingsRefreshKey] = useState(0);
  const [editingFinding, setEditingFinding] = useState<any>(null);
  const [auditPlanData, setAuditPlanData] = useState(auditPlan);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);

  // Submit for approval mutation
  // const submitMutation = useMutation({
  //   mutationFn: async () => {
  //     const result = await submitAuditPlanForApproval(auditPlan.id);
  //     return result;
  //   },
  //   onSuccess: (response) => {
  //     if (response.success) {
  //       queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
  //       notify({
  //         title: "Success",
  //         description: "Audit plan submitted for approval",
  //         type: "success"
  //       });
  //       // Update local state - set status to SUBMITTED
  //       setAuditPlanData((prev) => ({ ...prev, status: "SUBMITTED" }));
  //     } else {
  //       notify({
  //         title: "Error",
  //         description: response.message || "Failed to submit audit plan for approval",
  //         type: "error"
  //       });
  //     }
  //   },
  //   onError: (error: any) => {
  //     notify({
  //       title: "Error",
  //       description: error.message || "Failed to submit audit plan for approval",
  //       type: "error"
  //     });
  //   }
  // });

  // Delete audit plan mutation
  // const deleteMutation = useMutation({
  //   mutationFn: async () => {
  //     const result = await deleteAuditPlan(auditPlan.id);
  //     return result;
  //   },
  //   onSuccess: (response) => {
  //     if (response.success) {
  //       queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
  //       notify({
  //         title: "Success",
  //         description: "Audit plan deleted successfully",
  //         type: "success"
  //       });
  //       setDeleteDialogOpen(false);
  //       window.location.href = "/dashboard/audit/plans";
  //       // Optionally navigate away or trigger parent callback
  //     }
  //   },
  //   onError: (error: any) => {
  //     notify({
  //       title: "Error",
  //       description: error.message || "Failed to delete audit plan",
  //       type: "error"
  //     });
  //   }
  // });

  const submitMutation = useSubmitAuditPlanForApproval({ auditPlan, setAuditPlanData });
  const deleteMutation = useDeleteAuditPlan({ planId: auditPlan.id, setDeleteDialogOpen });

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

  const selectedCategory = useMemo(() => {
    return categoriesFromFindings?.find((cat) => cat.id === selectedCategoryId);
  }, [categoriesFromFindings, selectedCategoryId]);

  const categoryFindings = useMemo(() => {
    if (!selectedCategory) return [];

    // Filter findings by the selected category ID
    // selectedCategory comes from categoriesFromFindings which extracts finding.category objects
    // So we need to match findings that have the same category ID
    const filteredFindings =
      findings?.filter((f) => {
        // The most reliable match is by category.id since that's what we're using as the key
        return f.category?.id === selectedCategory.id;
      }) || [];

    // If we're editing a finding, prioritize it in the findings list
    if (editingFinding) {
      // Check if editing finding belongs to this category
      const isEditingInThisCategory = filteredFindings.some((f) => f.id === editingFinding.id);

      if (isEditingInThisCategory) {
        // Return array with editing finding last so it's the "last" finding for prefilling
        const otherFindings = filteredFindings.filter((f) => f.id !== editingFinding.id);
        return [...otherFindings, editingFinding];
      }
    }

    return filteredFindings;
  }, [findings, selectedCategory, editingFinding]);

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

  console.log({ categoryFindings });

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
                {auditPlanData.status.toUpperCase() === "COMPLETED" && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                )}
                {auditPlanData.status.toUpperCase() === "DRAFT" && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                      Delete Plan
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => setSubmitConfirmationOpen(true)}
                      disabled={submitMutation.isPending}
                      isLoading={submitMutation.isPending}
                      loadingText="Submitting...">
                      <Send className="h-4 w-4" />
                      Submit for Approval
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
        <TabsList className="grid h-12 w-full grid-cols-4">
          <TabsTrigger value="plan-details">
            <FileText className="mr-2 h-5 w-5" />
            Plan Details
          </TabsTrigger>
          <TabsTrigger value="workpaper">
            <FileArchive className="mr-2 h-5 w-5" />
            Workpaper
            <Badge
              variant={activeTab === "workpaper" ? "default" : "info"}
              className={cn("flex items-center justify-center rounded p-1 text-xs font-medium", {
                "bg-muted-foreground/20 opacity-50": activeTab !== "workpaper"
              })}>
              {completionStats.completed}/{completionStats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="findings">
            <CircleAlertIcon className="mr-2 h-5 w-5 text-orange-400" />
            Audit Execution
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <CircleCheckBig className="mr-2 h-5 w-5 text-green-500" />
            Audit Approvals
          </TabsTrigger>
        </TabsList>

        {/* Plan Details Tab */}
        <TabsContent value="plan-details" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {auditPlan.audit_scope || "No scope defined"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Objective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {auditPlan.audit_objective || "No objective defined"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {auditPlan.audit_criteria || "No criteria defined"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Area</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {auditPlan.audit_area || "No area defined"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Items */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Items</CardTitle>
              <CardDescription>
                {auditPlan?.budget_items?.length || 0} budget line(s) allocated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditPlan?.budget_items && auditPlan.budget_items.length > 0 ? (
                <div className="space-y-3">
                  {auditPlan.budget_items.map((item: any) => {
                    const spent = item.spent_amount || 0;
                    const allocated = item.allocated_amount || 0;
                    const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

                    return (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground text-xs">{item.category}</p>
                            {item.description && (
                              <p className="text-muted-foreground text-xs">{item.description}</p>
                            )}
                          </div>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Budget Utilization</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Allocated</p>
                            <p className="font-medium">
                              {allocated.toLocaleString()} {item.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Spent</p>
                            <p className="font-medium">
                              {spent.toLocaleString()} {item.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Remaining</p>
                            <p className="font-medium">
                              {(allocated - spent).toLocaleString()} {item.currency}
                            </p>
                          </div>
                        </div>

                        {item.start_date && item.end_date && (
                          <div className="mt-3 border-t pt-3 text-xs">
                            <p className="text-muted-foreground">
                              {format(new Date(item.start_date), "MMM d, yyyy")} -{" "}
                              {format(new Date(item.end_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No budget items allocated</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Audit Team */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Team</CardTitle>
                <CardDescription>Team leader and involved members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Leader */}
                {auditPlan?.team_leader && (
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">Team Leader</p>
                        <p className="text-foreground font-medium">{auditPlan.team_leader.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {auditPlan.team_leader.email}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {auditPlan.team_leader.role}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {auditPlan?.team_members && auditPlan.team_members.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">
                      Team Members ({auditPlan.team_members.length})
                    </p>
                    {auditPlan.team_members.map((member: any, index: number) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-foreground font-medium">{member.name}</p>
                            <p className="text-muted-foreground text-xs">{member.email}</p>
                          </div>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No team members assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Audit Universe Items */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Universe Items</CardTitle>
                <CardDescription>
                  {auditPlan?.audit_universe_items?.length || 0} item(s) selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditPlan?.audit_universe_items && auditPlan.audit_universe_items.length > 0 ? (
                  <div className="space-y-3">
                    {auditPlan.audit_universe_items.map((item: any) => (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground text-xs">ID: {item.id}</p>
                          </div>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Audit Frequency</p>
                            <p className="font-medium">{item.audit_frequency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Department</p>
                            {item?.department_name ? (
                              <p className="font-medium">{item.department_name}</p>
                            ) : (
                              <p className="font-medium">{item.department_id.slice(0, 8)}...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No audit universe items selected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workpaper Tab */}
        <TabsContent value="workpaper" className="h-">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Sidebar - Categories */}
            <div className="flex h-full max-h-[calc(100vh-16rem)] flex-col lg:col-span-2">
              <Card className="flex h-full flex-col">
                <CardHeader className="shrink-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5" />
                    Progress
                  </CardTitle>
                  <CardDescription>
                    {completionStats.completed} of {completionStats.total} categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4 overflow-hidden">
                  <div className="shrink-0 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Completion</span>
                      <span>{completionStats.percentage}%</span>
                    </div>
                    <Progress value={completionStats.percentage} className="h-2" />
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {categoriesFromFindings?.length > 0 ? (
                      categoriesFromFindings.map((category: any) => {
                        const catFindings =
                          findings?.filter((f: any) => {
                            // Match by category ID - this is the primary and most reliable match
                            return f.category?.id === category.id;
                          }) || [];
                        // A category is completed if it has findings AND all findings are completed
                        const isCompleted =
                          catFindings.length > 0 && catFindings.every(isCompletedFinding);
                        const isSelected = selectedCategoryId === category.id;

                        const handleCategoryClick = () => {
                          setSelectedCategoryId(category.id);
                          // Clear editing finding when switching categories
                          // The form will automatically show the first finding of this category
                          setEditingFinding(null);
                        };

                        return (
                          <button
                            key={category.id}
                            onClick={handleCategoryClick}
                            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground [&_p]:text-primary-foreground [&_span]:text-primary-foreground"
                                : "hover:bg-muted text-foreground"
                            }`}>
                            <div className="flex items-start gap-2">
                              {isCompleted ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                              ) : catFindings.length > 0 ? (
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              ) : (
                                <div className="border-muted-foreground mt-0.5 h-4 w-4 shrink-0 rounded-full border" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">
                                  {category.display_name}
                                </p>
                                <p
                                  className={`line-clamp-2 text-xs ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                  {category.description}
                                </p>

                                {/* Show framework-specific fields if finding exists */}
                                {catFindings.length > 0 &&
                                  (() => {
                                    // Derive framework type from category metadata
                                    let frameworkType = "ISO27001";
                                    if (category.metadata) {
                                      const metadataKeys = Object.keys(category.metadata);
                                      if (metadataKeys.length > 0) {
                                        frameworkType = metadataKeys[0];
                                      }
                                    }

                                    const frameworkFields = getFrameworkSidebarFields(
                                      catFindings[0],
                                      frameworkType as any
                                    );
                                    return frameworkFields.length > 0 ? (
                                      <div className="mt-1 space-y-0.5 text-xs">
                                        {frameworkFields.map((field, idx) => (
                                          <div key={idx} className="flex items-start gap-1">
                                            <span
                                              className={`min-w-fit font-medium ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                              {field.label}:
                                            </span>
                                            <span
                                              className={`line-clamp-1 break-all ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                                              {field.value}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null;
                                  })()}

                                {/* Show conformity status if finding exists */}
                                {catFindings.length > 0 &&
                                  catFindings[0].is_conformity !== null && (
                                    <div className="mt-1 flex items-center gap-1">
                                      {catFindings[0].is_conformity ? (
                                        <>
                                          <span
                                            className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-green-500"}`}
                                          />
                                          <span
                                            className={`text-xs ${isSelected ? "text-primary-foreground" : "text-green-600"}`}>
                                            Conformity
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <span
                                            className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-red-500"}`}
                                          />
                                          <span
                                            className={`text-xs ${isSelected ? "text-primary-foreground" : "text-red-600"}`}>
                                            Non-Conformity
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-muted-foreground py-4 text-center text-xs">
                        <p>No findings recorded yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Workspace */}
            <div className="space-y-4 lg:col-span-4">
              {selectedCategory ? (
                <>
                  {/* Category Details */}
                  <WorkpaperCategoryPanel category={selectedCategory} auditPlan={auditPlan} />

                  {/* Findings List for Category */}
                  {categoryFindings.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Findings ({categoryFindings.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {categoryFindings.map((finding, index) => {
                            // Derive framework type from category metadata
                            let frameworkType = "ISO27001";
                            if (selectedCategory?.metadata) {
                              const metadataKeys = Object.keys(selectedCategory.metadata);
                              if (metadataKeys.length > 0) {
                                frameworkType = metadataKeys[0];
                              }
                            }

                            // Get framework-specific sidebar fields
                            const frameworkFields = getFrameworkSidebarFields(
                              finding,
                              frameworkType as any
                            );

                            return (
                              <div
                                key={finding.id || index}
                                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium">
                                        Finding #{finding.finding_number}
                                      </p>

                                      {/* Framework-Specific Fields */}
                                      {frameworkFields.length > 0 && (
                                        <div className="mt-1 space-y-0.5 text-xs">
                                          {frameworkFields.slice(0, 2).map((field, idx) => (
                                            <div key={idx} className="flex items-start gap-1">
                                              <span className="text-muted-foreground font-medium">
                                                {field.label}:
                                              </span>
                                              <span className="text-foreground line-clamp-1 break-all">
                                                {field.value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Compliance Status Badge */}
                                      {finding.compliance_status && (
                                        <div className="mt-1 flex items-center gap-1">
                                          <span className="text-muted-foreground text-xs">
                                            Status:
                                          </span>
                                          <Badge
                                            variant={
                                              finding.compliance_status?.toLowerCase() ==
                                              "compliant"
                                                ? "success"
                                                : finding.compliance_status?.toLowerCase() ==
                                                    "non-compliant"
                                                  ? "destructive"
                                                  : "warning"
                                            }
                                            className="text-xs">
                                            {finding.compliance_status}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>

                                    {/* Conformity Badge */}
                                    {
                                      <Badge
                                        variant={
                                          finding.compliance_status?.toLowerCase() == "compliant"
                                            ? "success"
                                            : "destructive"
                                        }
                                        className="ml-auto shrink-0 text-xs">
                                        {finding.compliance_status?.toLowerCase() == "compliant"
                                          ? "✓ Conformity"
                                          : "✗ Non-Conformity"}
                                      </Badge>
                                    }
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  onClick={() => setEditingFinding(finding)}
                                  className="ml-3 shrink-0">
                                  Edit
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // NO FINDINGS YET
                    <Card className="bg-canvas/50 border-2 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center px-8 py-8">
                        <div className="relative mb-4">
                          <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
                          <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                            <ClipboardXIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
                          </div>
                        </div>

                        <h3 className="text-foreground mb-2 text-2xl font-semibold">
                          No Findings added
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-md text-center">
                          No findings for this category yet
                        </p>

                        <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
                          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                            <div className="text-primary mb-1 font-mono">CONFIGURE TEMPLATES</div>
                            <div className="text-muted-foreground">
                              Clauses & Procedures Required
                            </div>
                          </div>
                          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                            <div className="text-primary mb-1 font-mono">CREATE PLAN</div>
                            <div className="text-muted-foreground">Engagement Audit Plan</div>
                          </div>
                          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                            <div className="text-primary mb-1 font-mono">EXECUTE</div>
                            <div className="text-muted-foreground">Collect Findings & Evidence</div>
                          </div>
                        </div>

                        <Button size="lg" className="gap-2" asChild>
                          <Link href="/dashboard/audit/plans/new">
                            <Plus className="h-4 w-4" />
                            Create Audit Plan
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Add New Finding Button */}
                  {/* {categoryFindings.length > 0 && (
                    <Button
                      onClick={() => setEditingFinding(null)}
                      className="w-full"
                      variant="outline">
                      + Add New Finding
                    </Button>
                  )} */}
                </>
              ) : (
                // NO CATEGORY SELECTED YET
                <Card className="bg-canvas/50 border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center px-8 py-8">
                    <div className="relative mb-4">
                      <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
                      <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                        <ClipboardXIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3 className="text-foreground mb-2 text-2xl font-semibold">
                      No Category Selected
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md text-center">
                      You need to choose a category to submit findings.
                    </p>

                    <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
                      <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                        <div className="text-primary mb-1 font-mono">SELECT CATEGORY</div>
                        <div className="text-muted-foreground">Clauses & Procedures</div>
                      </div>
                      <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                        <div className="text-primary mb-1 font-mono">UPDATE FINDINGS</div>
                        <div className="text-muted-foreground">Collect Findings & Evidence</div>
                      </div>
                      <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                        <div className="text-primary mb-1 font-mono">SUBMIT FOR APPROVAL</div>
                        <div className="text-muted-foreground">Send to Team lead for Approval</div>
                      </div>
                    </div>

                    {/* <Button onClick={handleCategoryClick}  size="lg" className="gap-2" asChild>
                      <Link href="/dashboard/audit/plans/new">
                        <Plus className="h-4 w-4" />
                        Create Audit Plan
                      </Link>
                    </Button> */}
                  </CardContent>
                </Card>
              )}

              {/* Finding Edit Modal Dialog */}
              <Dialog
                open={editingFinding !== null}
                onOpenChange={(open) => !open && setEditingFinding(null)}>
                <DialogContent className="max-h-[90vh] max-w-2xl! overflow-y-auto pb-0">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFinding
                        ? `Edit Finding ${editingFinding.finding_number || ""}`
                        : "Add New Finding"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingFinding
                        ? `Update conformity status and details for this finding`
                        : `Create a new finding for ${selectedCategory?.display_name || "this category"}`}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedCategory && (
                    <FrameworkFindingForm
                      category={selectedCategory}
                      auditPlan={auditPlan}
                      finding={editingFinding}
                      onEditComplete={() => setEditingFinding(null)}
                      isModal={true}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
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
          />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <AuditPlanApprovalsPanel
            auditPlan={auditPlanData}
            tasks={tasks}
            onStatusChange={() => {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
              setAuditPlanData((prev) => ({ ...prev }));
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <DialogTitle className="tracking-tight">Delete Audit Plan</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs font-medium sm:text-sm">
              Are you sure you want to delete this audit plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit for Approval Confirmation Modal */}
      <ConfirmationModal
        open={submitConfirmationOpen}
        onOpenChange={setSubmitConfirmationOpen}
        onConfirm={() => {
          submitMutation.mutate();
          setSubmitConfirmationOpen(false);
        }}
        title="Submit for Approval?"
        description="Are you sure you want to submit this audit plan for approval? This will send it to HIAR for review."
        confirmText="Submit"
        type="default"
        isLoading={submitMutation.isPending}
      />
    </div>
  );
}

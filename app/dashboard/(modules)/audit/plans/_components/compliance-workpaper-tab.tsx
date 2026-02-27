"use client";

import { useMemo } from "react";
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
import { CheckCircle2, ClipboardXIcon, Plus, PencilLineIcon } from "lucide-react";
import Link from "next/link";
import type { AuditPlan } from "@/lib/types/audit-types";
import { WorkpaperCategoryPanel } from "./workpaper-category-panel";
import { FrameworkFindingForm } from "./framework-finding-form";
import { RequiresApprovalState } from "./requires-approval-state";
import { StatusBadge } from "@/components/status-badge";
import { getFrameworkSidebarFields } from "@/lib/utils/finding-form-utils";
import { usePermissions } from "@/hooks/use-permissions";

const isCompletedFinding = (finding: any): boolean => finding.status !== "OPEN";

interface ComplianceAuditWorkpaperTabProps {
  auditPlan: AuditPlan;
  findings: any[];
  workpaperCategories: any[];
  categoriesFromFindings: any[];
  completionStats: { completed: number; total: number; percentage: number };
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  editingFinding: any;
  setEditingFinding: (finding: any) => void;
  onSubmitForApproval: () => void;
  isSubmitting: boolean;
}

export function ComplianceAuditWorkpaperTab({
  auditPlan,
  findings,
  workpaperCategories,
  categoriesFromFindings,
  completionStats,
  selectedCategoryId,
  setSelectedCategoryId,
  editingFinding,
  setEditingFinding,
  onSubmitForApproval,
  isSubmitting
}: ComplianceAuditWorkpaperTabProps) {
  const { checkPermission } = usePermissions();

  const selectedCategory = useMemo(
    () => categoriesFromFindings?.find((cat) => cat.id === selectedCategoryId),
    [categoriesFromFindings, selectedCategoryId]
  );

  const categoryFindings = useMemo(() => {
    if (!selectedCategory) return [];

    const filteredFindings =
      findings?.filter((f) => f.category?.id === selectedCategory.id) || [];

    if (editingFinding) {
      const isEditingInThisCategory = filteredFindings.some((f) => f.id === editingFinding.id);
      if (isEditingInThisCategory) {
        const otherFindings = filteredFindings.filter((f) => f.id !== editingFinding.id);
        return [...otherFindings, editingFinding];
      }
    }

    return filteredFindings;
  }, [findings, selectedCategory, editingFinding]);

  return (
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
                    findings?.filter((f: any) => f.category?.id === category.id) || [];
                  const isCompleted =
                    catFindings.length > 0 && catFindings.every(isCompletedFinding);
                  const isSelected = selectedCategoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setEditingFinding(null);
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground [&_p]:text-primary-foreground [&_span]:text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}>
                      <div className="flex items-start gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                        ) : catFindings.length > 0 ? (
                          <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-amber-600" />
                        ) : (
                          <div className="border-muted-foreground mt-0.5 h-6 w-6 shrink-0 rounded-full border" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{category.display_name}</p>
                          <p
                            className={`line-clamp-2 text-xs ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {category.description}
                          </p>

                          {catFindings.length > 0 &&
                            (() => {
                              let frameworkType = "ISO27001";
                              if (category.metadata) {
                                const metadataKeys = Object.keys(category.metadata);
                                if (metadataKeys.length > 0) frameworkType = metadataKeys[0];
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

            {/* Check if plan is approved before showing findings */}
            {auditPlan.status.toUpperCase() === "APPROVED" ||
            auditPlan.status.toUpperCase() === "COMPLETED" ? (
              <>
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
                          let frameworkType = "ISO27001";
                          if (selectedCategory?.metadata) {
                            const metadataKeys = Object.keys(selectedCategory.metadata);
                            if (metadataKeys.length > 0) frameworkType = metadataKeys[0];
                          }
                          const frameworkFields = getFrameworkSidebarFields(
                            finding,
                            frameworkType as any
                          );

                          return (
                            <div
                              key={finding.id || index}
                              className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border p-4 transition-colors">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium">
                                      Finding #{finding.finding_number}
                                    </p>

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

                                    {finding.compliance_status && (
                                      <div className="mt-1 flex items-center gap-1">
                                        <span className="text-muted-foreground text-xs">
                                          Status:
                                        </span>
                                        <Badge
                                          variant={
                                            finding.compliance_status?.toLowerCase() === "compliant"
                                              ? "success"
                                              : finding.compliance_status?.toLowerCase() ===
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
                                  <Badge
                                    variant={
                                      finding.compliance_status?.toLowerCase() === "compliant"
                                        ? "success"
                                        : "destructive"
                                    }
                                    className="ml-auto shrink-0 text-xs">
                                    {finding.compliance_status?.toLowerCase() === "compliant"
                                      ? "✓ Conformity"
                                      : "✗ Non-Conformity"}
                                  </Badge>
                                </div>
                              </div>

                              {finding.status === "IN_REVIEW" ||
                              finding.status === "SUBMITTED" ? (
                                <StatusBadge status={finding.status} />
                              ) : finding.status === "CLOSED" || finding.status === "APPROVED" ? (
                                <Badge className="ml-3 shrink-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  ✓ Completed
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (!checkPermission("AUDIT_WPS", "can_edit")) return;
                                    setEditingFinding(finding);
                                  }}
                                  className="shrink-0">
                                  <PencilLineIcon className="h-6 w-6" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
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
                          <div className="text-muted-foreground">Clauses & Procedures Required</div>
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
                        <Link href="/dashboard/audit/plans/engagement/new">
                          <Plus className="h-6 w-6" />
                          Create Audit Plan
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <RequiresApprovalState
                auditPlan={auditPlan}
                onSubmitForApproval={onSubmitForApproval}
                isSubmitting={isSubmitting}
              />
            )}
          </>
        ) : (
          <Card className="bg-canvas/50 border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-8 py-8">
              <div className="relative mb-4">
                <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
                <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                  <ClipboardXIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-foreground mb-2 text-2xl font-semibold">No Category Selected</h3>
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
  );
}

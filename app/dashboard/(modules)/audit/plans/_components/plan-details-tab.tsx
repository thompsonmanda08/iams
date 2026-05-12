"use client";

import { useRef } from "react";
import { formatDate } from "@/lib/utils/date-format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PermissionDropdownMenuItem } from "@/components/ui/permission-dropdown-menu-item";
import {
  FileText,
  CheckCircle2,
  Users,
  Target,
  Grid3X3,
  Briefcase,
  Wallet,
  Trash2,
  Plus,
  PencilLineIcon,
  Download,
  Copy,
  FileEditIcon,
  FileCode
} from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import { CreateOrUpdateMemo, type CreateOrUpdateMemoRef } from "./create-a-memo";
import { useAuditMemo } from "@/hooks/use-audit-queries";
import Loader from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

const KRIColorBadge = ({ color }: { color: "Red" | "Amber" | "Green" | string }) => {
  const colorClasses: Record<string, string> = {
    Red: "bg-red-500",
    Amber: "bg-amber-500",
    Green: "bg-green-500"
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium text-white ${colorClasses[color] || "bg-gray-500"}`}>
      {color}
    </span>
  );
};

const UniverseItemTooltip = ({ item }: { item: any }) => (
  <div className="max-w-xs space-y-2 text-xs">
    <div>
      <p className="text-foreground text-sm font-semibold">{item.kri_name || item.name}</p>
    </div>
    {item.kri_color && (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Status:</span>
        <KRIColorBadge color={item.kri_color} />
      </div>
    )}
    {item.kri_average_score && (
      <div>
        <p className="text-muted-foreground">
          Score: <span className="font-semibold">{item.kri_average_score}</span>
        </p>
      </div>
    )}
    {item.kri_measurement_type && (
      <div>
        <p className="text-muted-foreground">
          Type: <span className="font-semibold">{item.kri_measurement_type}</span>
        </p>
      </div>
    )}
    {item.department_name && (
      <div>
        <p className="text-muted-foreground">
          Department: <span className="font-semibold">{item.department_name}</span>
        </p>
      </div>
    )}
    {item.auditable_area_name && (
      <div>
        <p className="text-muted-foreground">
          Area: <span className="font-semibold">{item.auditable_area_name}</span>
        </p>
      </div>
    )}
    {item.process_activity_name && (
      <div>
        <p className="text-muted-foreground">
          Activity: <span className="font-semibold">{item.process_activity_name}</span>
        </p>
      </div>
    )}
    {item.strategic_pillar_name && (
      <div>
        <p className="text-muted-foreground">
          Pillar: <span className="font-semibold">{item.strategic_pillar_name}</span>
        </p>
      </div>
    )}
    {item.indicative_target_name && (
      <div>
        <p className="text-muted-foreground">
          Target: <span className="font-semibold">{item.indicative_target_name}</span>
        </p>
      </div>
    )}
    {item.audit_frequency && (
      <div>
        <p className="text-muted-foreground">
          Frequency: <span className="font-semibold">{item.audit_frequency}</span>
        </p>
      </div>
    )}
  </div>
);

interface AuditPlanDetailsTabProps {
  auditPlan: AuditPlan;
}

export function AuditPlanDetailsTab({ auditPlan }: AuditPlanDetailsTabProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const memoRef = useRef<CreateOrUpdateMemoRef>(null);

  const { data: memo, isLoading, isFetching, isRefetching } = useAuditMemo(auditPlan.id);
  const isLoadingMemo = isLoading || isFetching || isRefetching;

  return (
    <div className="space-y-4">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Column 1: Audit Details Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-blue-600" />
                Audit Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {auditPlan.audit_scope || "No scope defined"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Audit Objective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {auditPlan.audit_objective || "No objective defined"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Grid3X3 className="h-5 w-5 text-purple-600" />
                Audit Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {auditPlan.audit_criteria || "No criteria defined"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-5 w-5 text-amber-600" />
                Audit Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {auditPlan.audit_area || "No area defined"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Memo, Team, Universe Items */}
        <div className="grid grid-cols-1 gap-4">
          {/* Audit Notification Memo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600" />
                    Audit Notification Memo
                  </CardTitle>
                  <CardDescription>
                    Create and send a memo to notify the client about this audit
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {memo ? (
                <div className="border-border/50 hover:bg-primary/5 space-y-3 rounded-lg border p-4">
                  <div
                    className="-m-2 cursor-pointer rounded p-2 transition-colors"
                    onClick={() => memoRef.current?.openView()}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{memo.subject || "Untitled Memo"}</p>
                        <p className="text-muted-foreground text-xs">
                          {auditPlan.status === "IN_REVIEW" || auditPlan.status === "APPROVED"
                            ? `Sent on ${formatDate(memo.sent_at || auditPlan.updated_at)}`
                            : "Draft - Not sent yet"}
                        </p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {auditPlan.status === "DRAFT" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_edit")) return;
                                    memoRef.current?.openEdit();
                                  }}
                                  className="gap-2">
                                  <PencilLineIcon className="h-6 w-6" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Memo</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {auditPlan.status === "DRAFT" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_delete")) return;
                                    memoRef.current?.openDelete();
                                  }}
                                  className="gap-2">
                                  <Trash2 className="h-6 w-6" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Memo</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="gap-2"
                              onClick={(e) => e.stopPropagation()}>
                              <Download className="h-6 w-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionDropdownMenuItem
                              moduleCode={MODULE_CODES.AUDIT_PLANS}
                              action="can_export"
                              onClick={() => memoRef.current?.handleCopyHtml()}>
                              <Copy className="h-6 w-6" />
                              Copy HTML
                            </PermissionDropdownMenuItem>
                            <DropdownMenuSeparator />
                            <PermissionDropdownMenuItem
                              moduleCode={MODULE_CODES.AUDIT_PLANS}
                              action="can_export"
                              onClick={() => memoRef.current?.handleDownloadHtml()}>
                              <FileCode className="h-6 w-6" />
                              Download HTML
                            </PermissionDropdownMenuItem>
                            <PermissionDropdownMenuItem
                              moduleCode={MODULE_CODES.AUDIT_PLANS}
                              action="can_export"
                              onClick={() => memoRef.current?.handleDownloadPdf()}>
                              <FileText className="h-6 w-6" />
                              Download PDF
                            </PermissionDropdownMenuItem>
                            <PermissionDropdownMenuItem
                              moduleCode={MODULE_CODES.AUDIT_PLANS}
                              action="can_export"
                              onClick={() => memoRef.current?.handleDownloadDocx()}>
                              <FileEditIcon className="h-6 w-6" />
                              Download Word
                            </PermissionDropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <StatusBadge size="md" status={auditPlan.status} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : isLoadingMemo ? (
                <div
                  className="border-border/50 space-y-3 rounded-lg border p-4"
                  role="status"
                  aria-label="Loading memo"
                  aria-busy="true"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-3 w-2/5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  <span className="sr-only">Loading audit notification memo…</span>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  <p className="text-muted-foreground bg-muted/50 border-border/50 rounded-lg border p-4 text-sm">
                    No memo created yet. Create a new memo to get started.
                  </p>
                  <PermissionButton moduleCode={MODULE_CODES.AUDIT_PLANS} action="can_create"
                    size="sm"
                    onClick={() => {
  memoRef.current?.setOpenModal(true);
}}
                    className="w-full gap-2">
                    <Plus className="h-6 w-6" />
                    Create Memo
                  </PermissionButton>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hidden CreateOrUpdateMemo component - accessed via ref */}
          <CreateOrUpdateMemo
            ref={memoRef}
            auditPlanId={auditPlan.id}
            directEdit={true}
            auditPlanStatus={auditPlan.status}
          />

          {/* Audit Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Audit Team
              </CardTitle>
              <CardDescription>Team leader and involved members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditPlan?.team_leader && (
                <div className="mb-4 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">Team Leader</p>
                      <p className="text-foreground font-medium">{auditPlan.team_leader.name}</p>
                      <p className="text-muted-foreground text-xs">{auditPlan.team_leader.email}</p>
                    </div>
                    <Badge variant="info" className="w-fit text-xs">
                      {auditPlan.team_leader.role}
                    </Badge>
                  </div>
                </div>
              )}

              {auditPlan?.team_members && auditPlan.team_members.length > 0 ? (
                <div>
                  <p className="mb-3 text-sm font-semibold">
                    Team Members ({auditPlan.team_members.length})
                  </p>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                    {auditPlan.team_members.map((member: any, index: number) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex flex-col gap-2">
                          <div className="min-w-0">
                            <p className="text-foreground truncate font-medium">{member.name}</p>
                            <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                          </div>
                          <Badge variant="outline" className="w-fit text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No team members assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Audit Universe Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-cyan-600" />
                Audit Universe Items
              </CardTitle>
              <CardDescription>
                {auditPlan?.audit_universe_items?.length || 0} item(s) selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditPlan?.audit_universe_items && auditPlan.audit_universe_items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {auditPlan.audit_universe_items.map((item: any) => (
                    <div key={item.id}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="border-border bg-muted/50 flex cursor-help items-center gap-1 rounded border px-2 py-1">
                              {item.kri_color && <KRIColorBadge color={item.kri_color} />}
                              <span className="max-w-[280px] truncate text-xs font-medium">
                                {item.kri_name || item.name}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-card border-border max-w-sm border p-4 shadow">
                            <UniverseItemTooltip item={item} />
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No audit universe items selected</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Budget Items - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Budget Items
          </CardTitle>
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
                          {formatDate(item.start_date)} -{" "}
                          {formatDate(item.end_date)}
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
    </div>
  );
}

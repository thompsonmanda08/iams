"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { Task } from "@/lib/types/task";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NextLink from "next/link";
import { getEntityDetailRoute, normalizeEntityType } from "@/lib/utils/entity-preview-utils";
import { formatDateTime } from "@/lib/utils/date-format";

interface WorkflowInstancesTableProps {
  instances: Task[];
  onInstanceSelect?: (instance: Task) => void;
  isLoading?: boolean;
}

/**
 * WorkflowInstancesTable
 *
 * Displays a table of all workflow instances (pending/active workflows)
 * Shows entity information, current state, and available actions
 * Users can approve, reject, or reassign instances
 *
 * Naming: This table is specifically for WORKFLOW INSTANCES (all instances)
 * NOT for individual user-assigned tasks (see WorkflowTasksTable for that)
 */
export function WorkflowInstancesTable({
  instances,
  onInstanceSelect,
  isLoading
}: WorkflowInstancesTableProps) {
  const getEntityRoute = (instance: Task) => {
    const entityType = instance.instance?.entity_type || "";
    const entityId = instance.instance?.entity_id || instance.entity?.entity_id || "";
    const normalizedType = normalizeEntityType(entityType);
    return getEntityDetailRoute(normalizedType, entityId, {
      ...instance.entity,
      original_entity_type: entityType
    });
  };

  const renderEntityContext = (instance: Task) => {
    const entityType = instance.instance?.entity_type || "";

    if (entityType === "FINDINGS" || entityType === "FINDING") {
      if (instance.entity?.audit_plan_name) {
        const route = instance.entity?.audit_plan_id
          ? `/dashboard/audit/plans/engagement/${instance.entity.audit_plan_id}`
          : null;
        return route ? (
          <NextLink
            href={route}
            className="text-primary hover:underline text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {instance.entity.audit_plan_name}
          </NextLink>
        ) : (
          <span className="text-sm">{instance.entity.audit_plan_name}</span>
        );
      }
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    if (entityType === "BUDGET" || entityType === "ANNUAL_AUDIT_PLAN") {
      return instance.entity?.year ? (
        <span className="text-sm font-medium">{instance.entity.year}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    }

    if (entityType === "UNIVERSE" || entityType === "AUDIT_UNIVERSE") {
      const universeName = instance.entity?.universe_name || instance.entity?.entity_name;
      const universeId = instance.instance?.entity_id || instance.entity?.entity_id;
      if (universeName) {
        return universeId ? (
          <NextLink
            href={`/dashboard/audit/universe/${universeId}`}
            className="text-primary hover:underline text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {universeName}
          </NextLink>
        ) : (
          <span className="text-sm">{universeName}</span>
        );
      }
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    return <span className="text-muted-foreground text-sm">-</span>;
  };

  const getEntityTypeBadge = (entityType: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      RISK: {
        label: "Risk",
        className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      },
      AUDIT_PLAN: {
        label: "Audit Plan",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      },
      FINDING: {
        label: "Finding",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      },
      FINDINGS: {
        label: "Finding",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      },
      RECOMMENDATION: {
        label: "Recommendation",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      },
      BUDGET: {
        label: "Budget",
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      },
      CONTRACT: {
        label: "Contract",
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
      },
      UNIVERSE: {
        label: "Audit Universe",
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
      },
      AUDIT_UNIVERSE: {
        label: "Audit Universe",
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
      },
      AUDIT_CLOSURE: {
        label: "Audit Closure",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      },
      ANNUAL_AUDIT_PLAN: {
        label: "Annual Audit Plan",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      }
    };

    const config = typeConfig[entityType] || {
      label: entityType,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <div className="flex items-center justify-center">
          <div className="border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
          <span className="text-muted-foreground ml-4">Loading workflow instances...</span>
        </div>
      </div>
    );
  }

  if (!instances?.length) {
    return (
      <div className="border-border bg-muted/50 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No workflow instances</h3>
          <p className="text-muted-foreground mt-2 mb-4 text-sm">
            There are no active workflow instances at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  ENTITY NAME
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      The name of the document or record in this workflow
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  ENTITY TYPE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      The category or classification of this entity
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  CONTEXT
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Additional context about this entity (e.g., parent plan, year)
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  WORKFLOW STATE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Current stage in the workflow process
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  INSTANCE STATUS
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Current status of the entity in its lifecycle
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  DATE CREATED
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      When this workflow instance was created
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.map((instance) => (
              <TableRow
                key={instance.instance?.id ?? instance.entity?.entity_id}
                onClick={() => onInstanceSelect?.(instance)}
                className="hover:bg-muted/50 cursor-pointer transition-colors">
                {/* ENTITY NAME */}
                <TableCell>
                  {(() => {
                    const route = getEntityRoute(instance);
                    const name = instance.entity_name || instance.entity?.entity_name || instance.entity?.title || "Unknown";
                    return route ? (
                      <NextLink
                        href={route}
                        className="text-primary hover:underline text-base font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {name}
                      </NextLink>
                    ) : (
                      <p className="text-base font-semibold">{name}</p>
                    );
                  })()}
                </TableCell>
                {/* ENTITY TYPE */}
                <TableCell>{getEntityTypeBadge(instance.instance?.entity_type || "")}</TableCell>
                {/* CONTEXT */}
                <TableCell>{renderEntityContext(instance)}</TableCell>
                {/* WORKFLOW STATE */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline">{instance.instance?.status || "Unknown"}</Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Current position in workflow: {instance.instance?.status || "Unknown"}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                {/* INSTANCE STATUS */}
                <TableCell>
                  <StatusBadge status={String(instance.entity?.status || "IN_REVIEW")} />
                </TableCell>
                {/* CREATED DATE */}
                <TableCell>
                  {instance.instance?.created_at ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground cursor-help text-sm">
                          {formatDistanceToNow(new Date(instance.instance.created_at), {
                            addSuffix: true
                          })}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        Created on: {formatDateTime(instance.instance.created_at)}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, UserCog, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/types/task";
import { TaskReassignDialog } from "./task-reassign-dialog";
import { formatDistanceToNow } from "date-fns";
import { getStatusLabel } from "@/lib/statuses";
import { StatusBadge } from "@/components/status-badge";

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
  const [selectedInstance, setSelectedInstance] = useState<Task | null>(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);

  const handleInstanceReassign = (instance: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedInstance(instance);
    setReassignDialogOpen(true);
  };

  const getInstanceStatusBadge = (status: string) => {
    const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "outline",
      PENDING: "outline",
      IN_REVIEW: "default",
      REVIEW: "default",
      APPROVED: "default",
      REJECTED: "destructive",
      COMPLETED: "default",
      ON_HOLD: "secondary",
      OPEN: "default",
      CLOSED: "destructive",
      ARCHIVED: "outline"
    };

    const label = getStatusLabel(status);
    const variant = statusVariants[status] || "outline";

    return <Badge variant={variant}>{label}</Badge>;
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

  if (instances.length === 0) {
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
    <>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity Name/Title</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Workflow State</TableHead>
              <TableHead>Instance Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.map((instance) => (
              <TableRow
                key={instance.instance.id}
                onClick={() => onInstanceSelect?.(instance)}
                className="hover:bg-muted/50 cursor-pointer transition-colors">
                {/* ENTITY NAME */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{instance.entity_name}</span>
                    <span className="text-muted-foreground text-[9px]">
                      ID: {instance.instance.entity_id}
                    </span>
                  </div>
                </TableCell>
                {/* ENTITY TYPE */}
                <TableCell>{getEntityTypeBadge(instance.instance.entity_type)}</TableCell>

                {/* WORKFLOW STATE */}
                <TableCell>{getInstanceStatusBadge(instance.instance.status)}</TableCell>
                {/* INSTANCE STATUS */}
                <TableCell>
                  <StatusBadge status={String(instance.entity?.status || "IN_REVIEW")} />
                </TableCell>
                {/* CREATED DATE */}
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(instance.instance.created_at), {
                      addSuffix: true
                    })}
                  </span>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <span className="text-muted-foreground text-sm">Manage via Tasks tab</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedInstance && (
        <>
          <TaskReassignDialog
            task={selectedInstance}
            open={reassignDialogOpen}
            onOpenChange={setReassignDialogOpen}
          />
        </>
      )}
    </>
  );
}

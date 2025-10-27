"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name?: string;
  timestamp: string;
  details?: any;
  ip_address?: string;
}

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

const actionConfig: Record<string, { label: string; className: string }> = {
  created: {
    label: "Created",
    className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  updated: {
    label: "Updated",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  deleted: {
    label: "Deleted",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  submitted: {
    label: "Submitted",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  activated: {
    label: "Activated",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  completed: {
    label: "Completed",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
};

const entityTypeConfig: Record<string, { label: string; icon: any }> = {
  audit_plan: { label: "Audit Plan", icon: FileText },
  workpaper: { label: "Workpaper", icon: FileText },
  finding: { label: "Finding", icon: FileText },
  template: { label: "Template", icon: FileText },
};

export function AuditLogsTable({ logs, isLoading }: AuditLogsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed bg-card">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No activity yet</h3>
            <p className="text-sm text-muted-foreground">
              Audit activity will appear here as changes are made.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const action = actionConfig[log.action.toLowerCase()] || {
              label: log.action,
              className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
            };

            const entityType = entityTypeConfig[log.entity_type] || {
              label: log.entity_type,
              icon: FileText,
            };

            const EntityIcon = entityType.icon;

            return (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {format(new Date(log.timestamp), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "h:mm a")}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(action.className)}>
                    {action.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EntityIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{entityType.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{log.user_name || log.user_id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground max-w-md line-clamp-2">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

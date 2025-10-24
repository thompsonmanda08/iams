"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2, FileText } from "lucide-react";
import type { Finding } from "@/lib/types/audit-types";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FindingsTableProps {
  findings: Finding[];
  isLoading?: boolean;
}

const severityConfig = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
  },
  low: {
    label: "Low",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
  },
};

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
};

export function FindingsTable({ findings, isLoading }: FindingsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No findings found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first finding to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Clause</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.map((finding) => {
            const severity = severityConfig[finding.severity] || severityConfig.low;
            const status = statusConfig[finding.status] || statusConfig.open;

            return (
              <TableRow key={finding.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/audit/findings/${finding.id}`}
                    className="font-mono text-sm hover:text-primary hover:underline"
                  >
                    {finding.referenceCode}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 max-w-md">
                    <p className="font-medium line-clamp-1">{finding.description}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {finding.auditTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{finding.clause}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {finding.clauseTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {finding.workpaperId ? (
                    <Link
                      href={`/dashboard/audit/workpapers/${finding.workpaperId}`}
                      className="inline-flex items-center gap-1.5 text-sm hover:text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-mono text-xs">{finding.workpaperReference || finding.workpaperId}</span>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {finding.sourceType === 'manual' ? 'Manual Entry' : 'External'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(severity.className)}>
                    {severity.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(status.className)}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{finding.assignedTo || "Unassigned"}</span>
                </TableCell>
                <TableCell>
                  {finding.dueDate ? (
                    <span className="text-sm">
                      {format(new Date(finding.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No due date</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/audit/findings/${finding.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

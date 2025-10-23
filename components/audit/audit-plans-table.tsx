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
import { AuditStatusBadge } from "./audit-status-badge";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

interface AuditPlansTableProps {
  plans: AuditPlan[];
  isLoading?: boolean;
}

export function AuditPlansTable({ plans, isLoading }: AuditPlansTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No audit plans found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first audit plan to get started
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
            <TableHead>Audit Title</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Team Leader</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>
                <div className="space-y-1">
                  <Link
                    href={`/dashboard/audit/plans/${plan.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {plan.title}
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {plan.scope.join(", ")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{plan.standard}</span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{plan.teamLeader}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.teamMembers.length} member{plan.teamMembers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <p>{format(new Date(plan.startDate), "MMM d, yyyy")}</p>
                  <p className="text-muted-foreground">
                    {format(new Date(plan.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2 w-32">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{plan.progress}%</span>
                    {plan.conformityRate && (
                      <span className="text-green-600">{plan.conformityRate}% conform</span>
                    )}
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>
              </TableCell>
              <TableCell>
                <AuditStatusBadge status={plan.status} />
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
                      <Link href={`/dashboard/audit/plans/${plan.id}`} className="flex items-center gap-2 cursor-pointer">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

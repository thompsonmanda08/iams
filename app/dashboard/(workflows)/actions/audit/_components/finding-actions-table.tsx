"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Eye, AlertCircle, View } from "lucide-react";
import type { FindingAction } from "@/lib/types/audit-types";
import { FindingActionDetailsDialog } from "./finding-action-details-dialog";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

interface FindingActionsTableProps {
  actions: FindingAction[];
}

const STATUS_COLORS: Record<string, { badge: string; text: string }> = {
  PENDING: {
    badge: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    text: "Pending"
  },
  IN_PROGRESS: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    text: "In Progress"
  },
  UNDER_REVIEW: {
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    text: "Under Review"
  },
  APPROVED: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    text: "Approved"
  },
  COMPLETED: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    text: "Completed"
  },
  REJECTED: { badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "Rejected" }
};

export function FindingActionsTable({ actions }: FindingActionsTableProps) {
  const [selectedAction, setSelectedAction] = useState<FindingAction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (action: FindingAction) => {
    setSelectedAction(action);
    setDetailsOpen(true);
  };

  if (actions.length === 0) {
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-12">
          <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-foreground mb-2 text-lg font-semibold">No actions found</h3>
          <p className="text-muted-foreground text-center text-sm">
            No finding actions match your search criteria. Try adjusting your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50 text-muted-foreground uppercase">
              <TableRow>
                <TableHead>Finding</TableHead>
                <TableHead>Action Description</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action, index) => (
                <TableRow key={action.id + index} onClick={() => handleViewDetails(action)}>
                  {/* Finding */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {action.engagement_name || action.finding?.audit_plan_name || "Audit Plan"}
                      </p>
                      <p className="text-sm font-medium">
                        Clause No. {action.clause_number || action.finding?.clause_number || "N/A"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {action.clause_description
                          ? action.clause_description.substring(0, 60) + "..."
                          : action.finding?.category_name || "Unknown"}
                      </p>
                    </div>
                  </TableCell>

                  {/* Action Description */}
                  <TableCell>
                    <p className="line-clamp-2 max-w-xs text-sm">
                      {action.action_description || "-"}
                    </p>
                  </TableCell>

                  {/* Assigned To */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {action.assigned_to_name ||
                          action.assigned_to_user?.last_name ||
                          "Unassigned"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {action.assigned_to_user?.email || ""}
                      </p>
                    </div>
                  </TableCell>

                  {/* Reviewer */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {action.reviewer_name || action.reviewer_user?.last_name || "Unassigned"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {action.reviewer_user?.email || ""}
                      </p>
                    </div>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    <p className="text-sm">
                      {action.due_date ? format(new Date(action.due_date), "MMM d, yyyy") : "-"}
                    </p>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={action.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(action)}
                      className="gap-2">
                      <View className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>

      {/* Details Dialog */}
      {selectedAction && (
        <FindingActionDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          action={selectedAction}
        />
      )}
    </>
  );
}

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
import { Eye, AlertCircle, View, Send } from "lucide-react";
import type { FindingAction } from "@/lib/types/audit-types";
import { FindingActionDetailsDialog } from "./finding-action-details-dialog";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

interface FindingActionsTableProps {
  actions: FindingAction[];
  handleSendReminder?: (actionId: string) => void;
  isSendingReminder?: boolean;
}

export function FindingActionsTable({
  actions,
  handleSendReminder,
  isSendingReminder
}: FindingActionsTableProps) {
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
                  <TableCell className="gap-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(action)}
                        className="gap-2">
                        <View className="h-4 w-4" />
                        View
                      </Button>
                      {handleSendReminder && (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={isSendingReminder}
                          loadingText="Sending"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendReminder(action.id);
                          }}
                          className="gap-2">
                          <Send className="h-4 w-4" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
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

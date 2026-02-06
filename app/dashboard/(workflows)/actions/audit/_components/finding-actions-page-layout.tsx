"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { FindingAction } from "@/lib/types/audit-types";
import { FindingActionsTable } from "./finding-actions-table";
import Search from "@/components/ui/search-field";
import { SelectField } from "@/components/ui/select-field";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { ClipboardList, LogsIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { sendFollowupReminder } from "@/app/_actions/finding-actions";

interface FindingActionsPageLayoutProps {
  initialActions: FindingAction[];
  pagination: Pagination;
  auditLogActions: FindingAction[];
  auditLogPagination: Pagination;
}

type ActionStatus =
  | "ALL"
  | "PENDING"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

const ACTION_STATUSES: { value: ActionStatus; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" }
];

export function FindingActionsPageLayout({
  initialActions = [],
  pagination,
  auditLogActions = [],
  auditLogPagination
}: FindingActionsPageLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("my-actions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "ALL">("ALL");
  const [auditSearchTerm, setAuditSearchTerm] = useState("");

  const filteredActions = useMemo(() => {
    let filtered = initialActions;

    // Filter by search term (action description, finding name, assigned user)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.action_description?.toLowerCase().includes(lowerSearch) ||
          action.finding?.finding_number?.toLowerCase().includes(lowerSearch) ||
          action.finding?.category_name?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((action) => action.status === statusFilter);
    }

    return filtered;
  }, [initialActions, searchTerm, statusFilter]);

  const filteredAuditLogActions = useMemo(() => {
    let filtered = auditLogActions;

    // Filter by search term (action description, finding name, assigned user)
    if (auditSearchTerm.trim()) {
      const lowerSearch = auditSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.action_description?.toLowerCase().includes(lowerSearch) ||
          action.finding?.finding_number?.toLowerCase().includes(lowerSearch) ||
          action.finding?.category_name?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [auditLogActions, auditSearchTerm]);

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || pagination?.page_size || 10;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageConfig.page));
    params.set("page_size", String(pageSize));
    router.push(`?${params.toString()}`);
  };

  const handleAuditLogPaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || auditLogPagination?.page_size || 10;
    const params = new URLSearchParams(searchParams.toString());
    params.set("audit_page", String(pageConfig.page));
    params.set("audit_page_size", String(pageSize));
    router.push(`?${params.toString()}`);
  };

  const sendReminder = useMutation({
    mutationFn: (actionId: string) => sendFollowupReminder(actionId),
    onSuccess: (data) => {
      if (data.success) {
        notify({
          type: "success",
          description: "Reminder sent successfully"
        });
      } else {
        notify({
          type: "error",
          description: data.message || "Failed to send reminder"
        });
      }
    },
    onError: (error: Error) => {
      notify({
        type: "error",
        description:
          error instanceof Error ? error.message : "An error occurred while sending reminder"
      });
    }
  });

  const handleSendReminder = async (actionId: string) => {
    // Ensure evidence_summary is set

    await sendReminder.mutateAsync(actionId, {
      onSuccess: () => {
        // Optionally, you can refresh the data or give feedback to the user here
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-2">
          <TabsTrigger value="my-actions" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>My Actions</span>
          </TabsTrigger>
          <TabsTrigger value="audit-log" className="gap-2">
            <LogsIcon className="h-4 w-4" />
            <span>Audit Log</span>
          </TabsTrigger>
        </TabsList>

        {/* My Actions Tab */}
        <TabsContent value="my-actions" className="space-y-6">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm leading-none font-medium">My Actions</h4>
                <p className="text-muted-foreground text-sm">
                  Actions assigned to you or where you are the reviewer
                </p>
              </div>
              <div className="relative flex items-end gap-2">
                <Search
                  className="min-w-60"
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                />
                <SelectField
                  className="w-36"
                  label="Status"
                  placeholder="All Statuses"
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ActionStatus | "ALL")}
                  options={ACTION_STATUSES as any[]}
                />
              </div>
            </div>

            {filteredActions && filteredActions.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm font-medium">
                  {filteredActions.length} action{filteredActions.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <FindingActionsTable actions={filteredActions} />
          </Card>

          {/* Pagination */}
          <CustomPagination
            pagination={pagination}
            updatePagination={handlePaginationChange}
            showDetails={true}
            allowSetPageSize={true}
          />
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit-log" className="space-y-6">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm leading-none font-medium">Audit Log</h4>
                <p className="text-muted-foreground text-sm">Actions currently under review</p>
              </div>
              <div className="relative flex items-end gap-2">
                <Search
                  className="min-w-60"
                  value={searchTerm}
                  onChange={(value) => setAuditSearchTerm(value)}
                />
                <SelectField
                  className="w-36"
                  label="Status"
                  placeholder="All Statuses"
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ActionStatus | "ALL")}
                  options={ACTION_STATUSES as any[]}
                />
              </div>
            </div>

            {filteredAuditLogActions && filteredAuditLogActions.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm font-medium">
                  {filteredAuditLogActions.length} Action Log Item
                  {filteredAuditLogActions.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <FindingActionsTable
              handleSendReminder={handleSendReminder}
              isSendingReminder={sendReminder.isPending}
              actions={filteredAuditLogActions}
            />
          </Card>

          {/* Pagination */}
          <CustomPagination
            pagination={auditLogPagination}
            updatePagination={handleAuditLogPaginationChange}
            showDetails={true}
            allowSetPageSize={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useTableSearch } from "@/hooks/use-table-search";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { sendFollowupReminder } from "@/app/_actions/finding-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import {
  useAuditFollowupLogsList,
  useFindingActionsList
} from "@/hooks/use-finding-actions-queries";

interface FindingActionsPageLayoutProps {
  page: number;
  pageSize: number;
  auditPage: number;
  auditPageSize: number;
  status: string;
  initialActions: FindingAction[];
  pagination: Pagination;
  auditLogActions: FindingAction[];
  auditLogPagination: Pagination;
}

type ActionStatus = "ALL" | "PENDING" | "IN_PROGRESS" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED";

const ACTION_STATUSES: { value: ActionStatus; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" }
];

export function FindingActionsPageLayout({
  page,
  pageSize,
  auditPage,
  auditPageSize,
  status,
  initialActions = [],
  pagination,
  auditLogActions = [],
  auditLogPagination
}: FindingActionsPageLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { checkPermission, hasPermission } = usePermissions();

  const statusFilter = (status as ActionStatus) ?? "ALL";
  const statusParam = statusFilter !== "ALL" ? statusFilter : undefined;

  const { data: actionsData } = useFindingActionsList(
    { page, page_size: pageSize, status: statusParam },
    { actions: initialActions, pagination }
  );
  const { data: auditLogData } = useAuditFollowupLogsList(
    { page: auditPage, page_size: auditPageSize, status: statusParam },
    { actions: auditLogActions, pagination: auditLogPagination }
  );

  const myActions = actionsData?.actions ?? initialActions;
  const myActionsPagination = actionsData?.pagination ?? pagination;
  const followupActions = auditLogData?.actions ?? auditLogActions;
  const followupPagination = auditLogData?.pagination ?? auditLogPagination;

  const [activeTab, setActiveTab] = useState("my-actions");

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    params.set("audit_page", "1");
    router.push(`?${params.toString()}`);
  };

  const {
    searchValue: searchTerm,
    setSearchValue: setSearchTerm,
    debouncedSearch: debouncedSearchTerm
  } = useTableSearch({ debounceMs: 200 });

  const {
    searchValue: auditSearchTerm,
    setSearchValue: setAuditSearchTerm,
    debouncedSearch: debouncedAuditSearchTerm
  } = useTableSearch({ debounceMs: 200 });

  const filteredActions = useMemo(() => {
    let filtered = myActions;

    if (debouncedSearchTerm.trim()) {
      const lowerSearch = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.action_description?.toLowerCase().includes(lowerSearch) ||
          action.finding?.finding_number?.toLowerCase().includes(lowerSearch) ||
          action.finding?.category_name?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [myActions, debouncedSearchTerm]);

  const filteredAuditLogActions = useMemo(() => {
    let filtered = followupActions;

    if (debouncedAuditSearchTerm.trim()) {
      const lowerSearch = debouncedAuditSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.action_description?.toLowerCase().includes(lowerSearch) ||
          action.finding?.finding_number?.toLowerCase().includes(lowerSearch) ||
          action.finding?.category_name?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [followupActions, debouncedAuditSearchTerm]);

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const nextSize = pageConfig.page_size || myActionsPagination?.page_size || 10;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageConfig.page));
    params.set("page_size", String(nextSize));
    router.push(`?${params.toString()}`);
  };

  const handleAuditLogPaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const nextSize = pageConfig.page_size || followupPagination?.page_size || 10;
    const params = new URLSearchParams(searchParams.toString());
    params.set("audit_page", String(pageConfig.page));
    params.set("audit_page_size", String(nextSize));
    router.push(`?${params.toString()}`);
  };

  const sendReminder = useMutation({
    mutationFn: (actionId: string) => sendFollowupReminder(actionId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["finding-actions"] });
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
      console.log("LOGGGGG:", error);

      notify({
        type: "error",
        description:
          error instanceof Error ? error.message : "An error occurred while sending reminder"
      });
    }
  });

  const handleSendReminder = async (actionId: string) => {
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_assign")) return;

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
                  onValueChange={handleStatusChange}
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
            pagination={myActionsPagination}
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
                  value={auditSearchTerm}
                  onChange={(value) => setAuditSearchTerm(value)}
                />
                <SelectField
                  className="w-36"
                  label="Status"
                  placeholder="All Statuses"
                  value={statusFilter}
                  onValueChange={handleStatusChange}
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
            pagination={followupPagination}
            updatePagination={handleAuditLogPaginationChange}
            showDetails={true}
            allowSetPageSize={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

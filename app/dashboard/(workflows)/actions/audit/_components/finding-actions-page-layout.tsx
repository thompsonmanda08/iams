"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FindingAction } from "@/lib/types/audit-types";
import { FindingActionsTable } from "./finding-actions-table";
import Search from "@/components/ui/search-field";
import { SelectField } from "@/components/ui/select-field";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";

interface FindingActionsPageLayoutProps {
  initialActions: FindingAction[];
  pagination: Pagination;
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
  pagination
}: FindingActionsPageLayoutProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "ALL">("ALL");

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

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || pagination?.page_size || 10;
    router.push(`?page=${pageConfig.page}&page_size=${pageSize}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="gap-0">
        <CardHeader className=" ">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Filters</h4>
            <p className="text-muted-foreground text-sm">Search and filter finding actions</p>
          </div>
        </CardHeader>
        <CardContent className=" ">
          {/* Search Box */}
          <div className="relative flex items-end gap-2">
            <Search className="" value={searchTerm} onChange={(value) => setSearchTerm(value)} />
            <SelectField
              className="w-36"
              label="Status"
              placeholder="All Statuses"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ActionStatus | "ALL")}
              options={ACTION_STATUSES as any[]}
            />
          </div>
        </CardContent>
      </Card>

      {/* My Actions Tab */}
      <>
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm leading-none font-medium">My Actions</h4>
              <p className="text-muted-foreground text-sm">
                Actions assigned to you or where you are the reviewer
              </p>
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
      </>

      {/* Pagination */}
      <CustomPagination
        pagination={pagination}
        updatePagination={handlePaginationChange}
        showDetails={true}
        allowSetPageSize={true}
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { FindingAction } from "@/lib/types/audit-types";
import { FindingActionsTable } from "./finding-actions-table";
import Search from "@/components/ui/search-field";
import { SelectField } from "@/components/ui/select-field";
import { ClipboardList, ListTodo } from "lucide-react";

interface FindingActionsPageLayoutProps {
  initialActions: FindingAction[];
}

type ActionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

const ACTION_STATUSES: { value: ActionStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" }
];

export function FindingActionsPageLayout({ initialActions = [] }: FindingActionsPageLayoutProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<"my-actions" | "all-actions">("my-actions");

  // Get current user ID (would come from auth context in real app)
  // For now, we'll filter by assignee in "My Actions" tab
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("currentUserId") : null;

  const filteredActions = useMemo(() => {
    let filtered = initialActions;

    // Filter by tab (My Actions vs All Actions)
    if (activeTab === "my-actions" && currentUserId) {
      filtered = filtered.filter(
        (action) => action.assigned_to === currentUserId || action.reviewer_id === currentUserId
      );
    }

    // Filter by search term (action description, finding name, assigned user)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.action_description?.toLowerCase().includes(lowerSearch) ||
          action.finding?.finding_number?.toLowerCase().includes(lowerSearch) ||
          action.finding?.category_name?.toLowerCase().includes(lowerSearch) ||
          action.assigned_user?.name?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((action) => action.status === statusFilter);
    }

    return filtered;
  }, [initialActions, searchTerm, statusFilter, activeTab, currentUserId]);

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader className="">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter finding actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "my-actions" | "all-actions")}>
        <TabsList className="grid h-12 w-full grid-cols-2">
          <TabsTrigger value="my-actions">
            <ListTodo className="mr-2 h-7 w-7" />
            My Actions
          </TabsTrigger>
          <TabsTrigger value="all-actions">
            {" "}
            <ClipboardList className="mr-2 h-7 w-7" />
            All Actions
          </TabsTrigger>
        </TabsList>

        {/* My Actions Tab */}
        <TabsContent value="my-actions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My Actions</h2>
              <p className="text-muted-foreground text-sm">
                Actions assigned to you or where you are the reviewer
              </p>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {filteredActions.length} action{filteredActions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <FindingActionsTable actions={filteredActions} />
        </TabsContent>

        {/* All Actions Tab */}
        <TabsContent value="all-actions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">All Actions</h2>
              <p className="text-muted-foreground text-sm">
                View all finding actions in the system
              </p>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {filteredActions.length} action{filteredActions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <FindingActionsTable actions={filteredActions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

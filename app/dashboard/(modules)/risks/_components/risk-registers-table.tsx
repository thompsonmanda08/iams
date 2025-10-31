"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Notebook, Pencil, Trash2, View } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RiskRegister } from "@/lib/types/risk-types";
import { CustomPagination } from "@/components/ui/pagination";
import Search from "@/components/ui/search-field";

type RiskRegistersTableProps = {
  registers: RiskRegister[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
  };
  currentStatus: string;
  currentSearch: string;
};

export default function RiskRegistersTable({
  registers,
  pagination,
  currentStatus,
  currentSearch
}: RiskRegistersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 on filter change
    if (key !== "page") {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams("search", value);
  };

  const handleStatusChange = (value: string) => {
    updateSearchParams("status", value);
  };

  // Updated pagination handler for CustomPagination
  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      // Reset to page 1 when page size changes
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "bg-blue-100 text-blue-700",
      CLOSED: "bg-gray-100 text-gray-700"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getTimelineStatusColor = (timelineStatus: string) => {
    const colors = {
      ON_TRACK: "bg-green-100 text-green-700",
      AT_RISK: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700"
    };
    return colors[timelineStatus as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const customPaginationData = {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    totalCount: pagination.total,
    has_prev: pagination.has_prev,
    has_next: pagination.has_next
  };

  return (
    <>
      {/* Filters */}
      <Card className="container mx-auto mb-8 px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <Search
            placeholder="Search risk registers..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e)}
            disabled={isPending}
          />

          <Select
            value={currentStatus || "all"}
            onValueChange={handleStatusChange}
            disabled={isPending}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-muted-foreground">No risk registers found</p>
                </TableCell>
              </TableRow>
            ) : (
              registers.map((register) => (
                <TableRow key={register.id} className="cursor-pointer">
                  <TableCell>
                    <p className="text-foreground font-medium">{register.name}</p>
                    {register.description && (
                      <div className="mt-1 flex items-center gap-1">
                        <Notebook className="h-3 w-3 text-gray-400" />
                        <p className="line-clamp-1 text-xs text-gray-500">{register.description}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{register.branch.name}</p>
                      <p className="text-xs text-gray-500">{register.branch.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(register.start_date)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(register.due_date)}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium capitalize",
                        getStatusColor(register.status)
                      )}>
                      {register.status.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        getTimelineStatusColor(register.timeline_status)
                      )}>
                      {register.timeline_status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(register.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          router.push(`/dashboard/risks/risk-registers/${register.id}`);
                          e.stopPropagation();
                        }}
                        className="h-8 gap-1.5">
                        <View className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          // handleEdit(register.id)
                          e.stopPropagation();
                        }}
                        className="h-8 gap-1.5">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          // handleDelete(register.id)
                          e.stopPropagation();
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {registers.length > 0 && (
          <CustomPagination
            pagination={customPaginationData}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </Card>
    </>
  );
}

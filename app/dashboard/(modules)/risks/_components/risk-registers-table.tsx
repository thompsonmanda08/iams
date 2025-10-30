"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Notebook, Pencil, Search, Trash2, View } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RiskRegister } from "@/lib/types/risk-types";

type RiskRegistersTableProps = {
  registers: RiskRegister[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
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

  const handlePageChange = (newPage: number) => {
    updateSearchParams("page", String(newPage));
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

  const startIndex = (pagination.page - 1) * pagination.page_size + 1;
  const endIndex = Math.min(pagination.page * pagination.page_size, pagination.total);

  return (
    <>
      {/* Filters */}
      <Card className="container mx-auto mb-8 px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search risk registers..."
              defaultValue={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              disabled={isPending}
            />
          </div>
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
                        onClick={() =>
                          router.push(`/dashboard/risks/risk-registers/${register.id}`)
                        }
                        className="h-8 gap-1.5">
                        <View className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        // onClick={() => handleEdit(item.id)}
                        className="h-8 gap-1.5">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        // onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
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
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-muted-foreground text-sm">
              Showing {startIndex} to {endIndex} of {pagination.total} risk registers
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1 || isPending}
                onClick={() => handlePageChange(pagination.page - 1)}>
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.total_pages || isPending}
                onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

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
import { Notebook, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type RiskRegister = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: "Overdue" | "Open" | "Closed";
  branch: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

type RiskRegistersTableProps = {
  registers: RiskRegister[];
  currentPage: number;
  itemsPerPage: number;
  currentStatus: string;
  currentSearch: string;
};

export default function RiskRegistersTable({
  registers,
  currentPage,
  itemsPerPage,
  currentStatus,
  currentSearch
}: RiskRegistersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(registers?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, registers?.length);
  const paginatedRegisters = registers.slice(startIndex, endIndex);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 on filter change
    params.delete("page");

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
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  const getStatusColor = (status: RiskRegister["status"]) => {
    const colors = {
      Open: "bg-blue-100 text-blue-700",
      Overdue: "bg-purple-100 text-purple-700",
      Closed: "bg-gray-100 text-gray-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

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
          <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
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
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">OPTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRegisters?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <p className="text-muted-foreground">No risk registers found</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRegisters.map((register) => (
                <TableRow
                  key={register.id}
                  onClick={() => router.push(`/dashboard/risks/risk-registers/${register.id}`)}
                  className="cursor-pointer">
                  <TableCell>
                    <p className="text-foreground font-medium">{register.name}</p>
                    <div className="flex space-x-1">
                      <Notebook className="h-4 w-4" />
                      <p className="text-xs font-normal text-gray-500">{register.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.startDate}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.dueDate}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium capitalize",
                        getStatusColor(register.status)
                      )}>
                      {register.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.branch}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{register.createdAt}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{register.updatedAt}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.createdBy}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="cursor-pointer font-normal">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {paginatedRegisters?.length > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-muted-foreground text-sm">
              Showing {startIndex + 1} to {endIndex} of {registers?.length} risk registers
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

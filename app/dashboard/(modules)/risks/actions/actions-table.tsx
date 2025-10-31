"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, FileSpreadsheet, Printer, View, Pencil, FileLock2 } from "lucide-react";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";

interface Action {
  id: string;
  actionId: string;
  title: string;
  description: string;
  risk: {
    title: string;
    description: string;
  };
  action: string;
  type: string;
  dueDate: string;
  weight: string;
  updatesFrequency: string;
  progress: number;
  status: string;
}
interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}
interface ActionsTableProps {
  actions: Action[];
  pagination: Pagination;
}

export function ActionsTable({ actions, pagination }: ActionsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const [_, startTransition] = useTransition();

  console.log("ATCTIONS:", actions);

  const handleExport = (type: "copy" | "csv" | "excel" | "pdf" | "print") => {
    console.log(`Exporting as ${type}`);
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
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
    <Card>
      <CardHeader>
        <CardTitle>ACTIONS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("copy")}>
              <Copy className="mr-2 size-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <FileText className="mr-2 size-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
              <FileSpreadsheet className="mr-2 size-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <FileText className="mr-2 size-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("print")}>
              <Printer className="mr-2 size-4" />
              Print
            </Button>
          </div>
          <Search
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e)}
            className="max-w-xs"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">#</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Updates Frequency</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                actions?.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-mono text-xs">{action.id}</TableCell>
                    <TableCell className="align-top break-words whitespace-normal">
                      <div className="max-w-sm">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-muted-foreground text-xs">{action.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{action.action}</TableCell>
                    <TableCell>{action.type}</TableCell>
                    <TableCell>{action.dueDate}</TableCell>
                    <TableCell>{action.weight}</TableCell>
                    <TableCell>{action.updatesFrequency}</TableCell>
                    <TableCell>{action.progress}%</TableCell>
                    <TableCell>
                      <Badge variant={action.status === "Active" ? "default" : "secondary"}>
                        {action.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            router.push(`/dashboard/risks/actions/${action.actionId}`);
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
                            // handleEdit(item.id)
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
                            // handleDelete(item.id)
                            e.stopPropagation();
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <FileLock2 className="h-4 w-4" />
                          Close
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {actions.length > 0 && (
            <CustomPagination
              pagination={customPaginationData}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

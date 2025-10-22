"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, FileSpreadsheet, Printer } from "lucide-react";

interface Action {
  id: string;
  actionId: string;
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

interface ActionsTableProps {
  actions: Action[];
}

export function ActionsTable({ actions }: ActionsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredActions = actions.filter((action) =>
    Object.values(action).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredActions.length / Number.parseInt(entriesPerPage));
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage);
  const endIndex = startIndex + Number.parseInt(entriesPerPage);
  const paginatedActions = filteredActions.slice(startIndex, endIndex);

  const handleExport = (type: "copy" | "csv" | "excel" | "pdf" | "print") => {
    // Implement export functionality
    console.log(`Exporting as ${type}`);
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
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">#</TableHead>
                <TableHead>RISK</TableHead>
                <TableHead>ACTION</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>DUE DATE</TableHead>
                <TableHead>WEIGHT</TableHead>
                <TableHead>UPDATES FREQUENCY</TableHead>
                <TableHead>PROGRESS</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">OPTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                paginatedActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-mono text-xs">{action.id}</TableCell>
                    <TableCell className="align-top break-words whitespace-normal">
                      <div className="max-w-sm">
                        <div className="font-semibold">{action.risk.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {action.risk.description}
                        </div>
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
                      <Button size="sm" onClick={() => router.push(`/dashboard/home/risks/actions/${action.actionId}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredActions.length)} of{" "}
            {filteredActions.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

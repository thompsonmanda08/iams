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
import { Copy, FileText, FileSpreadsheet, Printer, Eye, AlertTriangle } from "lucide-react";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RiskOwner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  risk_owner: RiskOwner;
  status: string;
  department_status: string;
  inherent_likelihood: number;
  inherent_impact: number;
  residual_likelihood: number;
  residual_impact: number;
  risk_response: string;
  target_closing_date: string;
  treatment_plan: string;
  control_effectiveness: number;
  mitigation_cost: number;
  created_at: string;
  updated_at: string;
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
  actions: Risk[];
  pagination: Pagination;
}

export function ActionsTable({ actions, pagination }: ActionsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const [_, startTransition] = useTransition();

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

  // Calculate risk level based on inherent scores
  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { label: "Critical", color: "bg-red-500" };
    if (score >= 10) return { label: "High", color: "bg-orange-500" };
    if (score >= 5) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Low", color: "bg-green-500" };
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "secondary";
      case "IN_PROGRESS":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get response badge color
  const getResponseColor = (response: string) => {
    switch (response.toUpperCase()) {
      case "REDUCE":
        return "bg-blue-100 text-blue-800";
      case "ACCEPT":
        return "bg-green-100 text-green-800";
      case "TRANSFER":
        return "bg-purple-100 text-purple-800";
      case "AVOID":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Risk Actions</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and track risk treatment actions
            </p>
          </div>
        </div>
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
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e)}
            className="max-w-xs"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Risk</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="text-muted-foreground/50 h-8 w-8" />
                      <p className="text-muted-foreground">No risks available</p>
                      <p className="text-muted-foreground text-xs">Add risks to see them here</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                actions?.map((risk) => {
                  const riskLevel = getRiskLevel(risk.inherent_likelihood, risk.inherent_impact);

                  return (
                    <TableRow key={risk.id}>
                      <TableCell className="align-top">
                        <div className="max-w-sm space-y-1">
                          <div className="text-sm font-semibold">{risk.title}</div>
                          <div className="text-muted-foreground line-clamp-2 text-xs">
                            {risk.description}
                          </div>
                          {risk.treatment_plan && (
                            <div className="mt-1 text-xs text-blue-600">
                              Treatment: {risk.treatment_plan.slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <div
                            className="mt-1 h-2 w-2 flex-none rounded-full"
                            style={{ backgroundColor: risk.category.color }}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{risk.category.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {risk.category.code}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{risk.department.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {risk.department.code}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <div
                            className={cn("mt-1 h-2 w-2 flex-none rounded-full", riskLevel.color)}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{riskLevel.label}</div>
                            <div className="text-muted-foreground text-xs">
                              L:{risk.inherent_likelihood} × I:{risk.inherent_impact}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={cn("text-xs", getResponseColor(risk.risk_response))}>
                          {risk.risk_response}
                        </Badge>
                        {risk.control_effectiveness && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            Control: {risk.control_effectiveness}/5
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {risk.risk_owner.first_name} {risk.risk_owner.last_name}
                          </div>
                          <div className="text-muted-foreground max-w-[150px] truncate text-xs">
                            {risk.risk_owner.email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {risk.target_closing_date ? (
                            <>
                              <div className="font-medium">
                                {format(new Date(risk.target_closing_date), "MMM dd, yyyy")}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {new Date(risk.target_closing_date) < new Date() ? (
                                  <span className="text-red-600">Overdue</span>
                                ) : (
                                  "On track"
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not set</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusVariant(risk.status)}>{risk.status}</Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              router.push(`/dashboard/risks/actions/${risk.id}`);
                            }}
                            className="h-8 gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

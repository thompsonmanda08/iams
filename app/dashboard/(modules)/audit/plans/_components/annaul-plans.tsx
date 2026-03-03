"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ClipboardListIcon, Lightbulb, Plus, RefreshCcw, Send, View } from "lucide-react";
import { Pagination } from "@/lib/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { SearchSelectField } from "@/components/ui/search-select-field";
import {
  useAnnualAuditPlan,
  useCreateAnnualAuditPlan,
  useSubmitAnnualAuditPlanForApproval
} from "@/hooks/use-audit-query-data";
import Loader from "@/components/ui/loader";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";

const years = Array.from({ length: 20 }).map((_, index: number) => {
  return { id: String(2025 + index), name: String(2025 + index) };
});

type AnnualAuditPlan = {
  department_id?: string;
  audit_date?: string;
  items: any;
  [x: string]: any;
};

export default function AuditAnnualPlan({
  plans = [],
  pagination
}: {
  plans: AnnualAuditPlan[];
  pagination?: Pagination;
}) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [createPlanForm, setCreatePlanForm] = useState({ year: new Date().getFullYear() });

  const router = useRouter();

  // Hook to fetch plans by year - only enabled when user selects a specific year
  const { data: yearFilteredPlan, isLoading: isFetchingByYear } = useAnnualAuditPlan(
    selectedYear ? { year: parseInt(selectedYear) } : undefined
  );

  // Use filtered plans from API if year is selected, otherwise use SSR plans
  const displayedPlans =
    yearFilteredPlan && !isFetchingByYear ? [yearFilteredPlan] : Array.isArray(plans) ? plans : [];

  const handlePaginationChange = (pageConfig: { page: number; page_size?: number }) => {
    const pageSize = pageConfig.page_size || pagination?.page_size || 10;
    router.push(`?annual_page=${pageConfig.page}&annual_page_size=${pageSize}`);
  };

  const handleSubmitClick = (id: string) => {
    setSubmitId(id);
    setSubmitDialogOpen(true);
  };

  const submitMutation = useSubmitAnnualAuditPlanForApproval();
  const createMutation = useCreateAnnualAuditPlan();

  const createPlan = useCallback(async (year: number) => {
    if (year > year + 2) {
      notify({
        title: "Error",
        description: "Cannot create plan for future years",
        type: "error"
      });
      return;
    }

    const response = await createMutation.mutateAsync({ year });

    return response;
  }, []);

  const confirmSubmitForApproval = () => {
    if (!submitId) {
      notify({
        title: "Missing Parameter: Plan ID"
      });
      return;
    }
    submitMutation.mutate({
      registerId: String(submitId),
      comments
    });
  };

  // Close dialog only on successful submission
  if (submitMutation.isSuccess && submitDialogOpen) {
    setSubmitDialogOpen(false);
    setComments("");
    setSubmitId(null);
  }

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Annual Plan Items</h4>
            <p className="text-muted-foreground text-sm">
              Manage annual plans aligned with your organization&apos;s pillars
            </p>
          </div>
          <div className="flex items-end gap-2">
            <SearchSelectField
              placeholder="-- Select Year --"
              value={selectedYear}
              onValueChange={setSelectedYear}
              isLoading={isFetchingByYear}
              options={years}
            />
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setSelectedYear(String(new Date().getFullYear()));
              }}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setCreateDialogOpen(true);
              }}>
              <Plus className="h-4 w-4" />
              Create a Plan
            </Button>
          </div>
        </div>

        {isFetchingByYear ? (
          <Loader
            className="flex items-center justify-center"
            size={32}
            loadingText="Loading plans..."
          />
        ) : (
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TITLE</TableHead>
                  <TableHead>CREATED</TableHead>
                  <TableHead>UPDATED</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="w-24" align="center">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <>
                        <Card className="bg-canvas/50 border-2 border-dashed">
                          <CardContent className="flex flex-col items-center justify-center px-8 py-8">
                            <div className="relative mb-4">
                              <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
                              <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                                <ClipboardListIcon
                                  className="text-primary h-16 w-16"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </div>

                            <h3 className="text-foreground mb-2 text-2xl font-semibold">
                              Select a year
                            </h3>
                            <p className="text-muted-foreground mb-8 max-w-md text-center">
                              If you haven&apos;t created any annual plans yet. Get started by
                              creating your first annual audit plan.
                            </p>

                            <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
                              <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                                <div className="text-primary mb-1 font-mono">CREATE</div>
                                <div className="text-muted-foreground">Annual Audit Plan</div>
                              </div>
                              <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                                <div className="text-primary mb-1 font-mono">ADD</div>
                                <div className="text-muted-foreground">Engagement Plan Items</div>
                              </div>
                              <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                                <div className="text-primary mb-1 font-mono">GENERATE</div>
                                <div className="text-muted-foreground">Engagement Audit Plans</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* <SearchSelectField
                                placeholder="-- Select Year --"
                                value={selectedYear}
                                onValueChange={setSelectedYear}
                                isLoading={false}
                                options={years}
                              />
                              <Button
                                size="sm"
                                className="h-9"
                                onClick={() => {
                                  setSelectedYear("");
                                }}>
                                <RefreshCcw className="h-4 w-4" />
                                Reset
                              </Button> */}
                              <Button
                                size="sm"
                                className="h-9"
                                onClick={() => {
                                  setCreateDialogOpen(true);
                                }}>
                                <Plus className="h-4 w-4" />
                                Create a Plan
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedPlans.map((item: any) => {
                    return (
                      <TableRow
                        key={item.id}
                        onClick={(e) => {
                          router.push(`/dashboard/audit/plans/annual/${item.id}`);
                        }}
                        className="cursor-pointer">
                        <TableCell className="p-3 align-top">
                          <div className="flex min-w-0 items-start gap-2">
                            <Link
                              href={`/dashboard/audit/plans/annual/${item.id}`}
                              className="text-primary text-lg font-medium">
                              Annual Audit plan <strong>({item.year})</strong>
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">By: {item.created_by_name}</span>
                            <span className="font-mono text-sm">
                              {format(new Date(item.created_at), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">By: {item.updated_by_name}</span>
                            <span className="font-mono text-sm">
                              Date: {format(new Date(item.updated_at), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} className="font-mono text-sm" />
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      router.push(`/dashboard/audit/plans/annual/${item.id}`);
                                      e.stopPropagation();
                                    }}
                                    className="h-8 gap-1.5">
                                    <View className="h-3.5 w-3.5" />
                                    View
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Plan</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {item.status === "DRAFT" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary h-8 gap-1.5"
                                      onClick={(e) => {
                                        handleSubmitClick(String(item.id));
                                        e.stopPropagation();
                                      }}>
                                      <Send className="h-3.5 w-3.5" />
                                      Submit
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Submit for Approval</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination && (
        <CustomPagination
          pagination={pagination}
          updatePagination={handlePaginationChange}
          showDetails={true}
          allowSetPageSize={true}
        />
      )}

      {/* Create Approval Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} modal={false}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Annual Audit Plan?</DialogTitle>
            <DialogDescription>
              You'll be generating an annual audit plan for the year {createPlanForm.year}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SelectField
              label="Select a Year"
              placeholder="--Choose a year --"
              value={String(createPlanForm.year)}
              onValueChange={(year) => setCreatePlanForm({ year: Number(year) })}
              options={Array.from({ length: 2 }).map((_, index) => ({
                id: String(new Date().getFullYear() + index),
                name: String(new Date().getFullYear() + index)
              }))}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setCreateDialogOpen(false);
                setCreatePlanForm({ year: new Date().getFullYear() });
              }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                createPlan(createPlanForm.year);
              }}
              disabled={createMutation.isPending}
              isLoading={createMutation.isPending}
              loadingText="Generating...">
              Create Annual Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit for Approval Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Annual Plan for Approval?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this audit plan for approval? This will send it to
              HIAR or HOD for review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              label="Comments"
              placeholder="Provide comments here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setSubmitDialogOpen(false);
                setComments("");
                setSubmitId(null);
              }}>
              Cancel
            </Button>
            <Button
              onClick={confirmSubmitForApproval}
              disabled={submitMutation.isPending}
              isLoading={submitMutation.isPending}
              loadingText="Submitting...">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

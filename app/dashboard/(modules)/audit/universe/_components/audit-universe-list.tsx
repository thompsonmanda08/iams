"use client";
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Globe,
  Plus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  View,
  ClipboardListIcon,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { AuditUniverse, AuditUniverseStatus } from "@/lib/types/audit-types";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import Search from "@/components/ui/search-field";
import { SelectField } from "@/components/ui/select-field";
import { deleteUniverse, submitUniverseForApproval } from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";
import UniverseDialog from "./universe-dialog";
import { stat } from "fs/promises";
import { usePermissions } from "@/hooks/use-permissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data removed - using real backend data only

export default function AuditUniverseList({
  universes = [],
  universeItemsMap = {},
  pagination
}: {
  universes?: any[];
  universeItemsMap?: Record<string, any[]>;
  pagination?: Pagination;
}) {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState<{ id: string; name: string } | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUniverse, setEditingUniverse] = useState<any | null>(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [universeToSubmit, setUniverseToSubmit] = useState<{ id: string; name: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use only real data from backend, no mock data fallback
  const data = universes || [];

  const filteredData = data.filter((item: any) => {
    const universeName = item.universe_name || item.universeName || "";
    const searchLower = searchQuery.toLowerCase();

    return (
      universeName.toLowerCase().includes(searchLower) ||
      (item.functionalAreas &&
        item.functionalAreas.some((area: string) => area.toLowerCase().includes(searchLower))) ||
      (item.auditableAreas &&
        item.auditableAreas.some((area: string) => area.toLowerCase().includes(searchLower)))
    );
  });

  const currentData = filteredData;

  const handlePaginationUpdate = (updates: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates?.page !== undefined) {
      params.set("page", updates?.page.toString());
    }
    if (updates.page_size !== undefined) {
      params.set("page_size", updates?.page_size.toString());
    }

    router.push(`?${params.toString()}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (!checkPermission("AUDIT_PLANS", "can_delete")) return;
    setSelectedUniverse({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUniverse) return;

    setIsDeleting(true);
    const result = await deleteUniverse(selectedUniverse.id);

    if (result.success) {
      toast.success("Universe deleted successfully");
      router.refresh();
      setDeleteConfirmOpen(false);
    } else {
      toast.error(result.message || "Failed to delete universe");
    }
    setIsDeleting(false);
  };

  const handleEdit = (universe: any) => {
    if (!checkPermission("AUDIT_PLANS", "can_edit")) return;
    setEditingUniverse(universe);
    setEditDialogOpen(true);
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/audit/universe/${id}`);
  };

  const handleSubmitClick = (id: string, name: string) => {
    if (!checkPermission("AUDIT_PLANS", "can_approve")) return;
    setUniverseToSubmit({ id, name });
    setSubmitConfirmOpen(true);
  };

  const handleSubmitConfirm = async () => {
    if (!universeToSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await submitUniverseForApproval(universeToSubmit.id);
      if (result.success) {
        toast.success("Universe submitted for approval successfully");
        router.refresh();
        setSubmitConfirmOpen(false);
      } else {
        toast.error(result.message || "Failed to submit universe for approval");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the universe");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statsCards = [
    {
      id: "total",
      label: "Total Universes",
      value: data.length,
      icon: BarChart3,
      gradientFrom: "from-cyan-500/20",
      gradientTo: "to-blue-500/20",
      iconBgColor: "bg-cyan-500/20",
      iconColor: "text-cyan-400",
      trendIcon: ArrowUpRight,
      trendColor: "text-emerald-400",
      subtitle: "12% increase from last month"
    },
    {
      id: "approved",
      label: "Approved",
      value: data.filter((d) => d.status === "APPROVED").length,
      icon: Globe,
      gradientFrom: "from-emerald-500/20",
      gradientTo: "to-teal-500/20",
      iconBgColor: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      trendIcon: ArrowUpRight,
      trendColor: "text-emerald-400",
      subtitle: "+15% from last period"
    },
    {
      id: "inReview",
      label: "In Review",
      value: data.filter((d) => d.status === "IN_REVIEW").length,
      icon: Eye,
      gradientFrom: "from-blue-500/20",
      gradientTo: "to-cyan-500/20",
      iconBgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      trendIcon: ArrowDownRight,
      trendColor: "text-red-400",
      subtitle: "-5% from last period"
    },
    {
      id: "draft",
      label: "Draft",
      value: data.filter((d) => d.status === "DRAFT").length,
      icon: Calendar,
      gradientFrom: "from-slate-500/20",
      gradientTo: "to-gray-500/20",
      iconBgColor: "bg-slate-500/20",
      iconColor: "text-slate-400",
      trendIcon: ArrowUpRight,
      trendColor: "text-emerald-400",
      subtitle: "Active drafts awaiting review"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {statsCards.map((stat) => {
            const IconComponent = stat.icon;
            const TrendIcon = stat.trendIcon;
            return (
              <div key={stat.id} className="group relative">
                <div
                  className={`absolute inset-0 bg-linear-to-r ${stat.gradientFrom} ${stat.gradientTo} rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100`}></div>
                <Card className="hover:border-primary/30 relative p-7 backdrop-blur-sm transition-all duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                      <p className="text-foreground my-1 text-3xl font-bold">{stat.value}</p>
                      <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
                    </div>
                    <div className={`p-3 ${stat.iconBgColor} rounded-xl`}>
                      <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {data.length === 0 ? (
          <Empty className="animate-fade-in">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Globe />
              </EmptyMedia>
              <EmptyTitle>No Universes Yet</EmptyTitle>
              <EmptyDescription>
                Get started by creating your first audit universe. Universes help you organize and
                manage your audit scope.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/dashboard/audit/universe/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Universe
                </Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-cyan-500/10 to-blue-500/10 opacity-50 blur-2xl"></div>
            <Card className="animate-fade-in relative overflow-hidden">
              <div className="border-muted from-muted/5 border-b bg-linear-to-r to-transparent p-8">
                <div className="flex items-center justify-between gap-6">
                  <div className="max-w-md flex-1">
                    <Search
                      placeholder="Search audit universes..."
                      value={searchQuery}
                      onChange={setSearchQuery}
                      classNames={
                        {
                          // wrapper: "w-full",
                          // base: "bg-muted/30 border-muted rounded-xl",
                          // input: "text-foreground hover:bg-muted/40"
                        }
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="text-muted-foreground h-5 w-5" />
                    <SelectField
                      value="latest"
                      onValueChange={() => {}}
                      placeholder="Sort by"
                      options={[
                        { id: "latest", label: "Latest First" },
                        { id: "name", label: "By Name" },
                        { id: "status", label: "By Status" }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="border-muted overflow-x-auto rounded-md border">
                <Table className="">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-muted hover:bg-muted/40 border-b px-4">
                      <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                        UNIVERSE
                      </TableHead>
                      {/* <TableHead className="text-foreground/70 text-xs font-bold whitespace-nowrap uppercase">
                        Functional Areas
                      </TableHead>
                      <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                        Auditable Areas
                      </TableHead> */}
                      <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                        STATUS
                      </TableHead>
                      <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                        DATE CREATED
                      </TableHead>
                      <TableHead className="text-foreground/70 text-center text-sm font-bold whitespace-nowrap uppercase">
                        ACTIONS
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground py-12 text-center">
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
                                No Universes
                              </h3>
                              <p className="text-muted-foreground mb-8 max-w-md text-center">
                                No universes match your search. Try a different search term or
                                create a new one.
                              </p>

                              <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
                                <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                                  <div className="text-primary mb-1 font-mono">CREATE</div>
                                  <div className="text-muted-foreground">Audit Universe</div>
                                </div>
                                <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                                  <div className="text-primary mb-1 font-mono">ADD</div>
                                  <div className="text-muted-foreground">Universe Items</div>
                                </div>
                                <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                                  <div className="text-primary mb-1 font-mono">CREATE</div>
                                  <div className="text-muted-foreground">Annual Audit Plan</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link href="/dashboard/audit/universe/new">
                                  <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create New Universe
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentData.map((item: any) => {
                        const universeName =
                          item.universe_name || `Audit Universe ${new Date().getFullYear}`;
                        const functionalAreas = item.functionalAreas || [];
                        const auditableAreas = item.auditableAreas || [];
                        const status = item.status || "UNIVERSE_CREATION";
                        const dateCreated =
                          item.created_at || new Date().toISOString().split("T")[0];
                        const itemCount = universeItemsMap[item.id]?.length || 0;

                        return (
                          <TableRow
                            key={item.id}
                            onClick={(e) => {
                              handleView(item.id);
                              e.stopPropagation();
                            }}
                            className="hover:bg-muted/30 border-muted/50 cursor-pointer border-b transition-all duration-200">
                            <TableCell className="text-foreground font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`shadow-lg" rounded-xl bg-linear-to-br from-cyan-400 via-blue-500 to-blue-600 p-3`}>
                                  <ClipboardListIcon className={`h-6 w-6 text-white`} />
                                </div>
                                <div className="space-y-1 capitalize">
                                  <p className="text-sm font-semibold">{universeName}</p>
                                  {itemCount > 0 && (
                                    <p className="text-muted-foreground text-xs">
                                      {itemCount}{" "}
                                      {itemCount === 1 ? "Universe Item" : "Universe Items"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            {/* <TableCell className="min-w-[180px]">
                              <div className="flex flex-wrap gap-1.5">
                                {functionalAreas.length > 0 ? (
                                  functionalAreas.map((area: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-primary bg-primary/10 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                      {area}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">No areas</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[180px]">
                              <div className="flex flex-wrap gap-1.5">
                                {auditableAreas.length > 0 ? (
                                  auditableAreas.map((area: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="bg-primary rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white">
                                      {area}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">No areas</span>
                                )}
                              </div>
                            </TableCell> */}
                            <TableCell>
                              <StatusBadge status={status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                              {new Date(dateCreated).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-end gap-1">
                                {status === "DRAFT" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary h-8 gap-1.5"
                                        onClick={(e) => {
                                          handleSubmitClick(item.id, universeName);
                                          e.stopPropagation();
                                        }}>
                                        <Send className="h-3.5 w-3.5" />
                                        Submit
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Submit for Approval</TooltipContent>
                                  </Tooltip>
                                )}

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          handleView(item.id);
                                          e.stopPropagation();
                                        }}
                                        className="h-8 gap-1.5">
                                        <View className="h-3.5 w-3.5" />
                                        View
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Details</TooltipContent>
                                  </Tooltip>

                                  {item.status === "DRAFT" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            handleEdit(item);
                                            e.stopPropagation();
                                          }}
                                          className="h-8 gap-1.5">
                                          <Pencil className="h-3.5 w-3.5" />
                                          Edit
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit Universe</TooltipContent>
                                    </Tooltip>
                                  )}

                                  {item.status === "DRAFT" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            handleDeleteClick(item.id, universeName);
                                            e.stopPropagation();
                                          }}
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete Universe</TooltipContent>
                                    </Tooltip>
                                  )}
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {currentData.length === 0 ? null : (
                <div className="bg-card border-muted flex items-center justify-between border-t p-6">
                  <CustomPagination
                    pagination={pagination as Pagination}
                    updatePagination={handlePaginationUpdate}
                    showDetails={true}
                    allowSetPageSize={true}
                  />
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUniverse(null);
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Universe"
        description={`Are you sure you want to delete "${selectedUniverse?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="delete"
        isLoading={isDeleting}
      />

      <ConfirmationModal
        open={submitConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setUniverseToSubmit(null);
            setSubmitConfirmOpen(false);
          }
        }}
        onConfirm={handleSubmitConfirm}
        title="Submit Universe for Approval?"
        description={`You are about to submit "${universeToSubmit?.name}" for approval. Once submitted, it will be reviewed by the approval committee.`}
        confirmText="Submit"
        type="default"
        isLoading={isSubmitting}
      />

      <UniverseDialog
        showTrigger={false}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={editingUniverse}
        universeId={editingUniverse?.id}
      />
    </div>
  );
}

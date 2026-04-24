"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Globe, Send, Pencil, Trash2, User } from "lucide-react";
import { notify } from "@/lib/utils";
import { submitUniverseForApproval, deleteUniverseItem } from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/components/back-button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AuditUniverseForm from "./audit-universe-form";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/status-badge";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

interface Universe {
  id: string;
  universe_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status?: string;
  created_by?: string;
  created_by_name?: string;
}

interface UniverseDetailsProps {
  universe: Universe;
  universeItems: any[];
  universeItemsPagination?: Pagination;
}

const UniverseDetails = ({
  universe,
  universeItems,
  universeItemsPagination
}: UniverseDetailsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { checkPermission } = usePermissions();
  const [showItemForm, setShowItemForm] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const safeUniverseItems = Array.isArray(universeItems) ? universeItems : [];

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

  // Mutation for deleting universe item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await deleteUniverseItem(itemId);
    },
    onSuccess: (response) => {
      if (response.success) {
        notify({
          description: response.message || "Universe item deleted successfully",
          type: "success"
        });
        queryClient.invalidateQueries();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        router.refresh();
      } else {
        notify({
          description: response.message || "Failed to delete universe item",
          type: "error"
        });
      }
    },
    onError: (error) => {
      notify({ description: "Failed to delete universe item. Please try again.", type: "error" });
      console.error("Error:", error);
    }
  });

  const handleDeleteClick = (itemId: string) => {
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_delete")) return;
    setItemToDelete(itemId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete);
    }
  };

  const colorConfig = {
    green: {
      label: "Green",
      color: "var(--green-active)"
    },
    amber: {
      label: "Amber",
      color: "var(--amber-active)"
    },
    red: {
      label: "Red",
      color: "var(--red-active)"
    }
  } as const;

  type KriColor = keyof typeof colorConfig;

  if (!universe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Globe className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Universe Not Found</EmptyTitle>
            <EmptyDescription>
              The universe you're looking for doesn't exist or may have been removed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <BackButton title="Back to Universes" />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  };

  const handleSubmitUniverse = async () => {
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_approve")) return;
    setIsSubmitting(true);
    try {
      const result = await submitUniverseForApproval(universe.id);
      if (result.success) {
        notify({ description: "Universe submitted for approval successfully", type: "success" });
        queryClient.invalidateQueries({ queryKey: ["universes"] });
        router.refresh();
      } else {
        notify({
          description: result.message || "Failed to submit universe for approval",
          type: "error"
        });
      }
    } catch (error) {
      notify({ description: "An error occurred while submitting the universe", type: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setSubmitConfirmationOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Universe Header */}
      <div className="group relative">
        <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500/20 to-blue-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
        <Card className="hover:border-primary/30 relative p-8 backdrop-blur-sm transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-3xl font-bold">{universe.universe_name}</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Manage audit universe details and items
              </p>
            </div>
            <div className="flex gap-2">
              {universe.status?.toUpperCase() == "DRAFT" && (
                <Button onClick={() => setSubmitConfirmationOpen(true)} className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit for Approval
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Start Date
              </Label>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/20 p-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-foreground text-lg font-semibold">
                  {universe.start_date ? formatDate(universe.start_date) : "Not set"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                End Date
              </Label>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/20 p-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-foreground text-lg font-semibold">
                  {universe.end_date ? formatDate(universe.end_date) : "Not set"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Created By
              </Label>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/20 p-2">
                  <User className="h-4 w-4 text-cyan-500" />
                </div>
                <p className="text-foreground line-clamp-1 truncate text-lg font-semibold">
                  {universe?.created_by_name || universe?.created_by || "System User"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Status
              </Label>
              <div className="flex items-center gap-3">
                <StatusBadge status={universe.status || "DRAFT"} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Item Form - Using AuditUniverseForm */}
      {showItemForm && (
        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
          <Card className="animate-fade-in hover:border-primary/30 relative p-8 backdrop-blur-sm transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-foreground text-lg font-semibold">
                {editingItemId ? "Edit Universe Item" : "Add New Universe Item"}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItemId(null);
                }}>
                Cancel
              </Button>
            </div>
            <AuditUniverseForm
              mode="item"
              initialData={
                editingItemId
                  ? safeUniverseItems.find((item) => item.id === editingItemId)
                  : { audit_universe_id: universe.id }
              }
              universeId={undefined}
              onSwitchToUniverseTab={() => {}}
              onCancel={() => {
                setShowItemForm(false);
                setEditingItemId(null);
              }}
            />
          </Card>
        </div>
      )}

      {/* Universe Items Section - Hidden when form is open */}
      {!showItemForm && (
        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-emerald-500/20 to-teal-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
          <Card className="hover:border-primary/30 relative overflow-hidden backdrop-blur-sm transition-all duration-300">
            <div className="border-muted from-muted/5 border-b bg-linear-to-r to-transparent px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-2xl font-bold">Universe Items</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Manage individual items and audit areas
                  </p>
                </div>
                {universe.status?.toUpperCase() === "DRAFT" && (
                  <Button onClick={() => setShowItemForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                )}
              </div>
            </div>

            {safeUniverseItems.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Globe className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No Universe Items</EmptyTitle>
                  <EmptyDescription>
                    Start by adding your first universe item to this universe.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div className="border-muted overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-muted hover:bg-muted/40 border-b">
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          Process/Activity
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          Department
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          Auditable Area
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          Frequency
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          KRI Score
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          KRI Color
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold uppercase">
                          Status
                        </TableHead>
                        <TableHead className="text-foreground/70 text-center text-sm font-bold uppercase">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeUniverseItems.map((item: any) => (
                        <TooltipProvider key={item.id}>
                          <TableRow className="hover:bg-muted/30 border-muted/50 border-b transition-all duration-200">
                            {/* Process/Activity */}
                            <TableCell className="text-foreground text-sm">
                              {item.process_activity_name ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="hover:text-primary flex max-w-xs cursor-help flex-col truncate font-semibold">
                                      {item.process_activity_name}
                                      <span className="line-clamp-2 max-w-sm text-xs italic">
                                        {" "}
                                        KRI: {item.kri_name || "--"}
                                      </span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <p className="font-semibold">Process/Activity</p>
                                        <p>{item.process_activity_name}</p>
                                      </div>
                                      {item.strategic_pillar_name && (
                                        <div>
                                          <p className="font-semibold">Strategic Pillar</p>
                                          <p>{item.strategic_pillar_name}</p>
                                        </div>
                                      )}
                                      {item.kri_name && (
                                        <div>
                                          <p className="font-semibold">KRI</p>
                                          <p>{item.kri_name}</p>
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            {/* Department */}
                            <TableCell className="text-foreground text-sm">
                              {item.department_name ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="hover:text-primary max-w-xs cursor-help truncate">
                                      {item.department_name}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{item.department_name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            {/* Auditable Area */}
                            <TableCell className="text-foreground text-sm">
                              {item.auditable_area_name ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="hover:text-primary line-clamp-2 flex max-w-xs min-w-0 cursor-help items-start gap-2 truncate">
                                      {item.auditable_area_name}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <p className="font-semibold">Auditable Area</p>
                                        <p>{item.auditable_area_name}</p>
                                      </div>
                                      {item.indicative_target_name && (
                                        <div>
                                          <p className="font-semibold">Indicative Target</p>
                                          <p>{item.indicative_target_name}</p>
                                        </div>
                                      )}
                                      {item.strategic_initiative_name && (
                                        <div>
                                          <p className="font-semibold">Strategic Initiative</p>
                                          <p>{item.strategic_initiative_name}</p>
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            {/* Audit Frequency */}
                            <TableCell className="text-foreground text-sm">
                              {item.audit_frequency ? (
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                  {item.audit_frequency.replace("_", " ")}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            {/* Average Risk Score */}
                            <TableCell className="text-foreground text-sm">
                              {item.kri_average_score ? (
                                <div className="flex flex-col">
                                  <p>{item.kri_average_score}</p>
                                  <span className="text-xs lowercase italic">
                                    {" "}
                                    Measure Type: {item.kri_measurement_type}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            {/*KRI Color*/}
                            <TableCell className="text-foreground text-sm">
                              {item.kri_color ? (
                                <Badge
                                  style={{
                                    backgroundColor:
                                      colorConfig[item.kri_color.toLowerCase() as KriColor].color,
                                    width: "3rem"
                                  }}>
                                  {item.kri_color}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            {/* Status */}
                            <TableCell>
                              <StatusBadge
                                variant={item.is_active ? "success" : "outline"}
                                status={item.is_active ? "ACTIVE" : "INACTIVE"}
                              />
                            </TableCell>
                            {/* Actions */}
                            <TableCell className="text-center">
                              <div className="flex justify-end gap-1">
                                {universe.status?.toUpperCase() === "DRAFT" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingItemId(item.id);
                                          setShowItemForm(true);
                                        }}
                                        className="gap-1 p-0">
                                        <Pencil className="h-4 w-4" /> Edit
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                )}
                                {universe.status?.toUpperCase() === "DRAFT" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(item.id);
                                        }}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 p-0">
                                        <Trash2 className="h-4 w-4" /> Delete
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </TooltipProvider>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {safeUniverseItems.length === 0 ? null : (
                  <div className="bg-card border-muted flex items-center justify-between border-t p-6">
                    <CustomPagination
                      pagination={universeItemsPagination as Pagination}
                      updatePagination={handlePaginationUpdate}
                      allowSetPageSize={true}
                      showDetails={true}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* Submit for Approval Confirmation Modal */}
      <ConfirmationModal
        open={submitConfirmationOpen}
        onOpenChange={setSubmitConfirmationOpen}
        onConfirm={handleSubmitUniverse}
        title="Submit Universe for Approval?"
        description="You are about to submit this universe for approval. Once submitted, it will be reviewed by the approval committee."
        confirmText="Submit"
        isLoading={isSubmitting}
      />

      {/* Delete Universe Item Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Universe Item"
        description="Are you sure you want to delete this universe item? This action cannot be undone."
        confirmText="Delete"
        type="delete"
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
};

export default UniverseDetails;

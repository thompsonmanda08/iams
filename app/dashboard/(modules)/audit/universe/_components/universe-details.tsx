"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Globe, Send, Eye, Pencil, Trash2, User, UserCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { submitUniverseForApproval, deleteUniverseItem } from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";
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

interface Universe {
  id: string;
  universe_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status?: string;
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
  const [showItemForm, setShowItemForm] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const safeUniverseItems = Array.isArray(universeItems) ? universeItems : [];

  // Mutation for deleting universe item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await deleteUniverseItem(itemId);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Universe item deleted successfully");
        queryClient.invalidateQueries();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete universe item");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete universe item. Please try again.");
      console.error("Error:", error);
    }
  });

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete);
    }
  };

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
    setIsSubmitting(true);
    try {
      const result = await submitUniverseForApproval(universe.id);
      if (result.success) {
        toast.success("Universe submitted for approval successfully");
        queryClient.invalidateQueries({ queryKey: ["universes"] });
        router.refresh();
      } else {
        toast.error(result.message || "Failed to submit universe for approval");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the universe");
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
              <Button onClick={() => setSubmitConfirmationOpen(true)} className="gap-2">
                <Send className="h-4 w-4" />
                Submit for Approval
              </Button>
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
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
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
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <User className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-foreground line-clamp-1 truncate text-lg font-semibold">
                  {universe.created_by || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Approved By
              </Label>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <UserCheckIcon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-foreground line-clamp-1 truncate text-lg font-semibold">
                  {universe.approved_by || "Pending Review"}
                </p>
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
                  ? safeUniverseItems.find((item) => item.id === editingItemId) || {
                      audit_universe_id: universe.id
                    }
                  : {
                      audit_universe_id: universe.id,
                      ...universe,
                      universe_items: [...safeUniverseItems]
                    }
              }
              universeId={editingItemId || undefined}
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
            <div className="border-muted from-muted/5 border-b bg-linear-to-r to-transparent p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-2xl font-bold">Universe Items</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Manage individual items and audit areas
                  </p>
                </div>
                <Button onClick={() => setShowItemForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
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
                        <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                          Item Name
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                          Department
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                          Audit Frequency
                        </TableHead>
                        <TableHead className="text-foreground/70 text-sm font-bold whitespace-nowrap uppercase">
                          Status
                        </TableHead>
                        <TableHead className="text-foreground/70 text-center text-sm font-bold whitespace-nowrap uppercase">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeUniverseItems.map((item: any) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-muted/30 border-muted/50 cursor-pointer border-b transition-all duration-200">
                          <TableCell className="text-foreground font-medium whitespace-nowrap">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">{item.name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground text-sm whitespace-nowrap">
                            {item.department_name || "Not set"}
                          </TableCell>
                          <TableCell className="text-foreground text-sm whitespace-nowrap">
                            {item.audit_frequency?.replace("_", " ") || "Not set"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                                item.is_active
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                              }`}>
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-end gap-2">
                              {/* <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="h-8 gap-1.5">
                                <View className="h-3.5 w-3.5" />
                                View
                              </Button> */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItemId(item.id);
                                  setShowItemForm(true);
                                }}
                                className="h-8 gap-1.5">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(item.id);
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {safeUniverseItems.length === 0 ? null : (
                  <div className="bg-card border-muted flex items-center justify-between border-t p-6">
                    <CustomPagination
                      pagination={
                        universeItemsPagination ||
                        ({
                          page: 1,
                          page_size: 10,
                          total_pages: Math.ceil(safeUniverseItems.length / 10),
                          totalCount: safeUniverseItems.length
                        } as Pagination)
                      }
                      updatePagination={() => {}}
                      showDetails
                      allowSetPageSize
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

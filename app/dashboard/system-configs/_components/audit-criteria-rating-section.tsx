"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  createAuditCriteriaRating,
  deleteAuditCriteriaRating,
  updateAuditCriteriaRating
} from "@/app/_actions/config-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AuditCriteriaRatingDialog } from "./audit-criteria-rating-dialog";
import type { AuditCriteriaRating } from "./report-guide-detail";

interface AuditCriteriaRatingSectionProps {
  reportGuideId: string;
  initialData: AuditCriteriaRating[];
  onDataUpdated: () => void;
}

export function AuditCriteriaRatingSection({
  reportGuideId,
  initialData,
  onDataUpdated
}: AuditCriteriaRatingSectionProps) {
  const [items, setItems] = useState<AuditCriteriaRating[]>(initialData);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: AuditCriteriaRating | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({ open: false, itemId: null, itemName: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      const response = await createAuditCriteriaRating(reportGuideId, data);
      if (response.success) {
        toast.success("Audit criteria rating created successfully");
        onDataUpdated();
      } else {
        toast.error(response.message || "Failed to create audit criteria rating");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create audit criteria rating");
    }
  };

  const handleUpdate = async (itemId: string, data: any) => {
    try {
      const response = await updateAuditCriteriaRating(reportGuideId, itemId, data);
      if (response.success) {
        toast.success("Audit criteria rating updated successfully");
        onDataUpdated();
      } else {
        toast.error(response.message || "Failed to update audit criteria rating");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update audit criteria rating");
    }
  };

  const handleDeleteClick = (item: AuditCriteriaRating) => {
    setDeleteDialog({
      open: true,
      itemId: item.id,
      itemName: item.rating
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.itemId) return;

    setIsDeleting(true);
    try {
      const response = await deleteAuditCriteriaRating(reportGuideId, deleteDialog.itemId);
      if (response.success) {
        toast.success("Audit criteria rating deleted successfully");
        onDataUpdated();
        setDeleteDialog({ open: false, itemId: null, itemName: null });
      } else {
        toast.error(response.message || "Failed to delete audit criteria rating");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete audit criteria rating");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold">Audit Criteria Rating</h2>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              Define audit findings rating scale and criteria
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rating
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Criteria Description</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!items?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  <p className="text-muted-foreground">No audit criteria ratings configured yet</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.rating}</TableCell>
                  <TableCell>
                    <p className="font-mono text-sm">{item.criteria_desc}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ backgroundColor: item.color_hex }}
                      />
                      <code className="text-xs">{item.color_hex}</code>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditDialog({ open: true, item })}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(item)}
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
      </div>

      <AuditCriteriaRatingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        mode="create"
      />

      {editDialog.item && (
        <AuditCriteriaRatingDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, item: null })}
          onSubmit={(data) => handleUpdate(editDialog.item!.id, data)}
          initialData={editDialog.item}
          mode="edit"
        />
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, itemId: null, itemName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Audit Criteria Rating"
        description={`Are you sure you want to delete "${deleteDialog.itemName}"? This action cannot be undone.`}
        type="delete"
        isLoading={isDeleting}
      />
    </Card>
  );
}

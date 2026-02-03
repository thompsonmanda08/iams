"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  createRiskFindingGrading,
  deleteRiskFindingGrading,
  updateRiskFindingGrading
} from "@/app/_actions/config-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { RiskFindingGradingDialog } from "./risk-finding-grading-dialog";
import type { RiskFindingGrading } from "./report-guide-detail";

interface RiskFindingsGradingSectionProps {
  reportGuideId: string;
  initialData: RiskFindingGrading[];
  onDataUpdated: () => void;
}

export function RiskFindingsGradingSection({
  reportGuideId,
  initialData,
  onDataUpdated
}: RiskFindingsGradingSectionProps) {
  const [items, setItems] = useState<RiskFindingGrading[]>(initialData);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: RiskFindingGrading | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({ open: false, itemId: null, itemName: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      const response = await createRiskFindingGrading(reportGuideId, data);
      if (response.success) {
        toast.success("Risk finding grading created successfully");
        onDataUpdated();
      } else {
        toast.error(response.message || "Failed to create risk finding grading");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create risk finding grading");
    }
  };

  const handleUpdate = async (itemId: string, data: any) => {
    try {
      const response = await updateRiskFindingGrading(reportGuideId, itemId, data);
      if (response.success) {
        toast.success("Risk finding grading updated successfully");
        onDataUpdated();
      } else {
        toast.error(response.message || "Failed to update risk finding grading");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update risk finding grading");
    }
  };

  const handleDeleteClick = (item: RiskFindingGrading) => {
    setDeleteDialog({
      open: true,
      itemId: item.id,
      itemName: item.issue_rating
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.itemId) return;

    setIsDeleting(true);
    try {
      const response = await deleteRiskFindingGrading(reportGuideId, deleteDialog.itemId);
      if (response.success) {
        toast.success("Risk finding grading deleted successfully");
        onDataUpdated();
        setDeleteDialog({ open: false, itemId: null, itemName: null });
      } else {
        toast.error(response.message || "Failed to delete risk finding grading");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete risk finding grading");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-semibold">Risk Findings Grading</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Define risk finding severity levels and grades
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Grade
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue Rating</TableHead>
              <TableHead>Term Rating</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!items?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <p className="text-muted-foreground">No risk finding gradings configured yet</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.issue_rating}</TableCell>
                  <TableCell>{item.term_rating}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded font-bold text-white"
                      style={{ backgroundColor: item.color_hex }}>
                      {item.symbol}
                    </span>
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
                  <TableCell className="max-w-sm">
                    <p className="text-sm font-mono">{item.description}</p>
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

      <RiskFindingGradingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        mode="create"
      />

      {editDialog.item && (
        <RiskFindingGradingDialog
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
        title="Delete Risk Finding Grading"
        description={`Are you sure you want to delete "${deleteDialog.itemName}"? This action cannot be undone.`}
        type="delete"
        isLoading={isDeleting}
      />
    </Card>
  );
}

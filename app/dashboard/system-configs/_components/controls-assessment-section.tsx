"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, ShieldCheck } from "lucide-react";
import { notify } from "@/lib/utils";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  createControlsAssessmentGuide,
  deleteControlsAssessmentGuide,
  updateControlsAssessmentGuide
} from "@/app/_actions/config-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ControlsAssessmentDialog } from "./controls-assessment-dialog";
import type { ControlsAssessmentGuide } from "./report-guide-detail";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

interface ControlsAssessmentSectionProps {
  reportGuideId: string;
  initialData: ControlsAssessmentGuide[];
  onDataUpdated: () => void;
}

export function ControlsAssessmentSection({
  reportGuideId,
  initialData,
  onDataUpdated
}: ControlsAssessmentSectionProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [items, setItems] = useState<ControlsAssessmentGuide[]>(initialData);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: ControlsAssessmentGuide | null;
  }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    itemId: string | null;
    itemName: string | null;
  }>({ open: false, itemId: null, itemName: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (data: any) => {
    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_create")) return;
    try {
      const response = await createControlsAssessmentGuide(reportGuideId, data);
      if (response.success) {
        notify({ description: "Controls assessment guide created successfully", type: "success" });
        onDataUpdated();
      } else {
        notify({ description: response.message || "Failed to create controls assessment guide", type: "error" });
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to create controls assessment guide", type: "error" });
    }
  };

  const handleUpdate = async (itemId: string, data: any) => {
    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_edit")) return;
    try {
      const response = await updateControlsAssessmentGuide(reportGuideId, itemId, data);
      if (response.success) {
        notify({ description: "Controls assessment guide updated successfully", type: "success" });
        onDataUpdated();
      } else {
        notify({ description: response.message || "Failed to update controls assessment guide", type: "error" });
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to update controls assessment guide", type: "error" });
    }
  };

  const handleDeleteClick = (item: ControlsAssessmentGuide) => {
    if (!checkPermission(MODULE_CODES.AUDIT_MODULE_CONFIG, "can_delete")) return;
    setDeleteDialog({
      open: true,
      itemId: item.id,
      itemName: item.control_name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.itemId) return;

    setIsDeleting(true);
    try {
      const response = await deleteControlsAssessmentGuide(reportGuideId, deleteDialog.itemId);
      if (response.success) {
        notify({ description: "Controls assessment guide deleted successfully", type: "success" });
        onDataUpdated();
        setDeleteDialog({ open: false, itemId: null, itemName: null });
      } else {
        notify({ description: response.message || "Failed to delete controls assessment guide", type: "error" });
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to delete controls assessment guide", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Controls Assessment Guide</h2>
          </div>

          <p className="text-muted-foreground text-sm">
            Define control assessment criteria and evaluation guidelines
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Control
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Control Name</TableHead>
              <TableHead>Assessment Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!items?.length ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No controls assessment guides configured yet
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.control_name}</TableCell>
                  <TableCell>
                    <p className=" text-sm font-mono">{item.assessment_desc}</p>
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

      <ControlsAssessmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        mode="create"
      />

      {editDialog.item && (
        <ControlsAssessmentDialog
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
        title="Delete Controls Assessment Guide"
        description={`Are you sure you want to delete "${deleteDialog.itemName}"? This action cannot be undone.`}
        type="delete"
        isLoading={isDeleting}
      />
    </Card>
  );
}

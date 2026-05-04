"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Check, X } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CustomPagination } from "@/components/ui/pagination";
import { notify } from "@/lib/utils";
import { Pagination } from "@/lib/types";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useMatrixScales,
  useCreateScale,
  useUpdateScale,
  useDeleteScale,
  useReindexScalesAfterDelete
} from "@/hooks/use-matrix-query-data";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type Scale = {
  id: string;
  scale_type: "LIKELIHOOD" | "IMPACT";
  level: number;
  name: string;
  description: string;
  matrix_id?: string;
  created_at: string;
  updated_at: string;
};

type Rating = {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  color_hex: string;
};

type ScalesListProps = {
  matrixId: string;
  scaleType: "LIKELIHOOD" | "IMPACT";
  ratings: Rating[];
  initialData?: any[];
};

// Derive a color for a scale level by computing the diagonal score (level × level)
// and looking up which rating's score range contains it.
function getScaleColor(level: number, ratings: Rating[]): string {
  if (!ratings.length) return "#6b7280";
  const score = level * level;
  const sorted = [...ratings].sort((a, b) => a.min_score - b.min_score);
  const match = sorted.find((r) => score >= r.min_score && score <= r.max_score);
  if (match) return match.color_hex;
  if (score < sorted[0].min_score) return sorted[0].color_hex;
  return sorted[sorted.length - 1].color_hex;
}

export function ScalesList({ matrixId, scaleType, ratings, initialData }: ScalesListProps) {
  const { checkPermission } = usePermissions();

  const { data: scales = [], isLoading } = useMatrixScales(matrixId, scaleType, initialData);
  const createScaleMutation = useCreateScale(matrixId, scaleType);
  const updateScaleMutation = useUpdateScale(matrixId, scaleType);
  const deleteScaleMutation = useDeleteScale(matrixId, scaleType);
  const reindexMutation = useReindexScalesAfterDelete(matrixId, scaleType);

  const isBusy = deleteScaleMutation.isPending || reindexMutation.isPending;

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 10,
    total_pages: 1,
    totalCount: 0,
    has_next: false,
    has_prev: false
  });

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", description: "" });

  // New row state
  const [addingNew, setAddingNew] = useState(false);
  const [newData, setNewData] = useState({ name: "", description: "" });

  const newRowNameRef = useRef<HTMLInputElement>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    scaleId: string | null;
    scaleName: string | null;
    scaleLevel: number | null;
  }>({ open: false, scaleId: null, scaleName: null, scaleLevel: null });

  useEffect(() => {
    if (addingNew) {
      setTimeout(() => newRowNameRef.current?.focus(), 50);
    }
  }, [addingNew]);

  // ── Pagination ───────────────────────────────────────────────────────────

  const paginatedScales = useMemo(() => {
    const start = (pagination.page - 1) * pagination.page_size;
    return scales.slice(start, start + pagination.page_size);
  }, [scales, pagination.page, pagination.page_size]);

  const customPaginationData = useMemo(() => {
    const totalCount = scales.length;
    const total_pages = Math.ceil(totalCount / pagination.page_size) || 1;
    return {
      ...pagination,
      total_pages,
      totalCount,
      has_next: pagination.page < total_pages,
      has_prev: pagination.page > 1
    };
  }, [scales.length, pagination]);

  const updatePagination = ({ page, page_size }: { page: number; page_size?: number }) => {
    setPagination((prev) => ({ ...prev, page, page_size: page_size ?? prev.page_size }));
  };

  const nextLevel = useMemo(
    () => (scales.length === 0 ? 1 : Math.max(...scales.map((s: Scale) => s.level)) + 1),
    [scales]
  );

  // ── Inline edit ──────────────────────────────────────────────────────────

  const startEdit = (scale: Scale) => {
    setAddingNew(false);
    setNewData({ name: "", description: "" });
    setEditingId(scale.id);
    setEditData({ name: scale.name, description: scale.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", description: "" });
  };

  const isDirty = (scale: Scale) =>
    editData.name !== scale.name || editData.description !== scale.description;

  const handleSaveEdit = async (scale: Scale) => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_edit")) return;
    if (!editData.name.trim()) {
      notify({ description: "Name is required", type: "error" });
      return;
    }
    const response = await updateScaleMutation.mutateAsync({
      id: scale.id,
      data: { name: editData.name, description: editData.description, matrix_id: scale.matrix_id }
    });
    if (response.success) {
      notify({ description: "Scale updated successfully", type: "success" });
      cancelEdit();
    } else {
      notify({ description: response.message || "Failed to update scale", type: "error" });
    }
  };

  // ── New row ──────────────────────────────────────────────────────────────

  const startAddNew = () => {
    cancelEdit();
    setAddingNew(true);
    setNewData({ name: "", description: "" });
  };

  const cancelAddNew = () => {
    setAddingNew(false);
    setNewData({ name: "", description: "" });
  };

  const handleSaveNew = async () => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_create")) return;
    if (!newData.name.trim()) {
      notify({ description: "Name is required", type: "error" });
      return;
    }
    const response = await createScaleMutation.mutateAsync({
      level: nextLevel,
      name: newData.name,
      description: newData.description
    });
    if (response.success) {
      notify({ description: "Scale created successfully", type: "success" });
      cancelAddNew();
    } else {
      notify({ description: response.message || "Failed to create scale", type: "error" });
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_delete")) return;
    if (!deleteDialog.scaleId || deleteDialog.scaleLevel === null) return;
    const deletedLevel = deleteDialog.scaleLevel;
    const snapshot = scales as Scale[];

    const response = await deleteScaleMutation.mutateAsync(deleteDialog.scaleId);
    if (!response.success) {
      notify({ description: response.message || "Failed to delete scale", type: "error" });
      return;
    }

    const toShift = snapshot.filter((s) => s.level > deletedLevel);
    if (toShift.length > 0) {
      const reindexResult = await reindexMutation.mutateAsync({
        deletedLevel,
        scales: toShift.map((s) => ({
          id: s.id,
          level: s.level,
          name: s.name,
          description: s.description,
          matrix_id: s.matrix_id
        }))
      });
      if (!reindexResult.success) {
        notify({
          description: `Deleted, but failed to reindex ${reindexResult.failed.length} item(s). Refresh to verify.`,
          type: "error"
        });
      } else {
        notify({ description: "Scale deleted and levels reindexed", type: "success" });
      }
    } else {
      notify({ description: "Scale deleted successfully", type: "success" });
    }
    setDeleteDialog({ open: false, scaleId: null, scaleName: null, scaleLevel: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold">
            {scaleType === "LIKELIHOOD" ? "Likelihood" : "Impact"} Scales
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage levels for {scaleType === "LIKELIHOOD" ? "likelihood" : "impact"}{" "}
            assessment
          </p>
        </div>
        <Button onClick={startAddNew} size="default" className="gap-2" disabled={addingNew || isBusy}>
          <Plus className="h-4 w-4" />
          Add Level
        </Button>
      </div>

      {scales.length === 0 && !addingNew ? (
        <Card className="mt-4 border-dashed">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Plus className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No {scaleType.toLowerCase()} scales configured
            </h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Get started by adding your first {scaleType.toLowerCase()} level.
            </p>
            <Button onClick={startAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Level
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-card relative mt-4 rounded-lg border">
          {isBusy && (
            <div className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}
          <Table>
            <TableHeader className="uppercase">
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-foreground w-24">Level</TableHead>
                <TableHead className="text-foreground w-56">Name</TableHead>
                <TableHead className="text-foreground">Description</TableHead>
                <TableHead className="text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedScales.map((scale: any) => {
                const isEditing = editingId === scale.id;
                const isSaving = isEditing && updateScaleMutation.isPending;
                const dirty = isEditing && isDirty(scale);

                return (
                  <TableRow key={scale.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
                        style={{ backgroundColor: getScaleColor(scale.level, ratings) }}>
                        <span className="text-base font-bold">{scale.level}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                          disabled={isSaving}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold">{scale.name}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.description}
                          onChange={(e) =>
                            setEditData((p) => ({ ...p, description: e.target.value }))
                          }
                          disabled={isSaving}
                          placeholder="Optional description"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {scale.description || "—"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(scale)}
                              disabled={!dirty || isSaving}
                              isLoading={isSaving}
                              className="h-8 gap-1.5">
                              <Check className="h-3.5 w-3.5" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="h-8 gap-1.5">
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(scale)}
                              className="h-8 gap-1.5"
                              disabled={addingNew || isBusy}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  scaleId: scale.id,
                                  scaleName: `${scale.name} (Level ${scale.level})`,
                                  scaleLevel: scale.level
                                })
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                              disabled={addingNew || isBusy}>
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* New row */}
              {addingNew && (
                <TableRow className="bg-muted/20">
                  <TableCell>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{ backgroundColor: getScaleColor(nextLevel, ratings) }}>
                      <span className="text-base font-bold">{nextLevel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      ref={newRowNameRef}
                      value={newData.name}
                      onChange={(e) => setNewData((p) => ({ ...p, name: e.target.value }))}
                      disabled={createScaleMutation.isPending}
                      placeholder="Name *"
                      className="h-8 text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newData.description}
                      onChange={(e) => setNewData((p) => ({ ...p, description: e.target.value }))}
                      disabled={createScaleMutation.isPending}
                      placeholder="Optional description"
                      className="h-8 text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNew}
                        disabled={!newData.name.trim() || createScaleMutation.isPending}
                        isLoading={createScaleMutation.isPending}
                        className="h-8 gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelAddNew}
                        disabled={createScaleMutation.isPending}
                        className="h-8 gap-1.5">
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {scales.length > 0 && (
            <CustomPagination
              pagination={customPaginationData}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          )}
        </div>
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, scaleId: null, scaleName: null, scaleLevel: null })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Scale"
        description={`Are you sure you want to delete "${deleteDialog.scaleName}"? This action cannot be undone.`}
        type="delete"
      />
    </Card>
  );
}

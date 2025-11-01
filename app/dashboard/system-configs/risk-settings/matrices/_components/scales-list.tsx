"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMatrixScales, deleteScale } from "@/app/_actions/config-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateScaleDialog } from "./create-scale-dialog";
import { EditScaleDialog } from "./edit-scale-dialog";


type Scale = {
  id: string;
  scale_type: "LIKELIHOOD" | "IMPACT";
  level: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type ScalesListProps = {
  matrixId: string;
  scaleType: "LIKELIHOOD" | "IMPACT";
};

export function ScalesList({ matrixId, scaleType }: ScalesListProps) {
  const [scales, setScales] = useState<Scale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    scale: Scale | null;
  }>({ open: false, scale: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    scaleId: string | null;
    scaleName: string | null;
  }>({ open: false, scaleId: null, scaleName: null });

  useEffect(() => {
    fetchScales();
  }, [matrixId, scaleType]);

  const fetchScales = async () => {
    setIsLoading(true);
    try {
      const response = await getMatrixScales(matrixId, scaleType);
      if (response.success && response.data?.data) {
        // Sort by level
        const sortedScales = response.data.data.sort((a: Scale, b: Scale) => a.level - b.level);
        setScales(sortedScales);
      }
    } catch (error) {
      toast.error("Failed to load scales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (scale: Scale) => {
    setDeleteDialog({
      open: true,
      scaleId: scale.id,
      scaleName: `${scale.name} (Level ${scale.level})`
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.scaleId) return;

    try {
      const response = await deleteScale(deleteDialog.scaleId);
      if (response.success) {
        toast.success("Scale deleted successfully");
        await fetchScales();
        setDeleteDialog({ open: false, scaleId: null, scaleName: null });
      } else {
        toast.error(response.message || "Failed to delete scale");
      }
    } catch (error) {
      toast.error("Failed to delete scale");
    }
  };

  const handleEditClick = (scale: Scale) => {
    setEditDialog({ open: true, scale });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">
            {scaleType === "LIKELIHOOD" ? "Likelihood" : "Impact"} Scales
          </h2>
          <p className="text-muted-foreground text-sm">
            Define levels for {scaleType === "LIKELIHOOD" ? "likelihood" : "impact"} assessment
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Level
        </Button>
      </div>

      <div className="grid gap-4">
        {scales.map((scale) => (
          <Card key={scale.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                      {scale.level}
                    </span>
                    {scale.name}
                  </CardTitle>
                  <CardDescription>{scale.description || "No description"}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(scale)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(scale)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {scales.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No {scaleType.toLowerCase()} scales configured
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Level
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateScaleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        matrixId={matrixId}
        scaleType={scaleType}
        onSuccess={fetchScales}
      />

      {editDialog.scale && (
        <EditScaleDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, scale: null })}
          scale={editDialog.scale}
          onSuccess={fetchScales}
        />
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, scaleId: null, scaleName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Scale"
        description={`Are you sure you want to delete "${deleteDialog.scaleName}"?`}
        type="delete"
      />
    </>
  );
}

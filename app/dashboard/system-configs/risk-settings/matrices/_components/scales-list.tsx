"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getMatrixScales, deleteScale } from "@/app/_actions/config-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateScaleDialog } from "./create-scale-dialog";
import { EditScaleDialog } from "./edit-scale-dialog";
import { cn } from "@/lib/utils";

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

const getLevelColor = (level: number) => {
  if (level === 1) return "bg-green-500";
  if (level === 2) return "bg-emerald-500";
  if (level === 3) return "bg-amber-500";
  if (level === 4) return "bg-orange-500";
  if (level === 5) return "bg-red-500";
  return "bg-primary";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrixId, scaleType]);

  const fetchScales = async () => {
    setIsLoading(true);
    try {
      const response = await getMatrixScales(matrixId, scaleType);

      if (response.success && response.data) {
        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        const filteredScales = rawData.filter((scale: Scale) => scale.scale_type === scaleType);
        const sortedScales = filteredScales.sort((a: Scale, b: Scale) => a.level - b.level);
        setScales(sortedScales);
      } else {
        setScales([]);
      }
    } catch (error) {
      console.error("Error fetching scales:", error);
      toast.error("Failed to load scales");
      setScales([]);
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
        setDeleteDialog({ open: false, scaleId: null, scaleName: null });
        await fetchScales();
      } else {
        toast.error(response.message || "Failed to delete scale");
      }
    } catch (error) {
      console.error("Error deleting scale:", error);
      toast.error("Failed to delete scale. Please try again.");
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
    <div className="space-y-6">
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
        <Button onClick={() => setCreateDialogOpen(true)} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Level
        </Button>
      </div>

      {scales.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Plus className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No {scaleType.toLowerCase()} scales configured
            </h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Get started by adding your first {scaleType.toLowerCase()} level to begin risk
              assessment.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Level
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {scales.map((scale, index) => (
            <Card key={scale.id} style={{ animationDelay: `${index * 50}ms` }}>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white",
                      getLevelColor(scale.level)
                    )}>
                    <span className="text-lg font-bold">{scale.level}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <CardTitle className="mb-1 text-lg font-semibold">{scale.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {scale.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(scale)}
                      className="h-8 gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(scale)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

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
        description={`Are you sure you want to delete "${deleteDialog.scaleName}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}

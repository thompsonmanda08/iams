"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateRiskMatrixDialog } from "./create-risk-matrix-dialog";
import { EditRiskMatrixDialog } from "./edit-risk-matrix-dialog";
import { deleteRiskMatrix, getRiskMatrices } from "@/app/_actions/config-actions";

type RiskMatrix = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export function RiskMatrixConfigList() {
  const router = useRouter();
  const [matrices, setMatrices] = useState<RiskMatrix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    matrix: RiskMatrix | null;
  }>({ open: false, matrix: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    matrixId: string | null;
    matrixName: string | null;
  }>({ open: false, matrixId: null, matrixName: null });

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskMatrices();

      if (response.success && response.data.data) {
        setMatrices(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load risk matrices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (matrix: RiskMatrix) => {
    setDeleteDialog({
      open: true,
      matrixId: matrix.id,
      matrixName: matrix.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.matrixId) return;

    try {
      const response = await deleteRiskMatrix(deleteDialog.matrixId);
      if (response.success) {
        toast.success("Risk matrix deleted successfully");
        await fetchMatrices();
        setDeleteDialog({ open: false, matrixId: null, matrixName: null });
      } else {
        toast.error(response.message || "Failed to delete risk matrix");
      }
    } catch (error) {
      toast.error("Failed to delete risk matrix");
    }
  };

  const handleEditClick = (matrix: RiskMatrix) => {
    setEditDialog({ open: true, matrix });
  };

  const handleConfigureScales = (matrixId: string) => {
    router.push(`/dashboard/system-configs/risk-settings/matrices/${matrixId}/scales`);
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
          <h2 className="text-foreground text-2xl font-semibold">Risk Matrices</h2>
          <p className="text-muted-foreground text-sm">
            Configure risk assessment matrices for your organization
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Matrix
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matrices.map((matrix) => (
          <Card key={matrix.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2 flex items-center gap-2">
                    {matrix.name}
                    {matrix.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {matrix.description || "No description"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfigureScales(matrix.id)}
                  className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditClick(matrix)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(matrix)}
                  disabled={matrix.is_default}
                  className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {matrices.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No risk matrices configured</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Matrix
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateRiskMatrixDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchMatrices}
      />

      {editDialog.matrix && (
        <EditRiskMatrixDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, matrix: null })}
          matrix={editDialog.matrix}
          onSuccess={fetchMatrices}
        />
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, matrixId: null, matrixName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Risk Matrix"
        description={`Are you sure you want to delete "${deleteDialog.matrixName}"? This will also delete all associated scales and rating levels.`}
        type="delete"
      />
    </div>
  );
}

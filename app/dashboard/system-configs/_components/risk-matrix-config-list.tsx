"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Settings, Loader2, Grid3x3 } from "lucide-react";
import { notify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateRiskMatrixDialog } from "./create-risk-matrix-dialog";
import { EditRiskMatrixDialog } from "./edit-risk-matrix-dialog";
import { deleteRiskMatrix, getRiskMatrices } from "@/app/_actions/config-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomPagination } from "@/components/ui/pagination";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type RiskMatrix = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type PaginationState = {
  page: number;
  page_size: number;
  total_pages: number;
  total: number;
  has_prev: boolean;
  has_next: boolean;
};

export function RiskMatrixConfigList() {
  const router = useRouter();
  const { checkPermission, hasPermission } = usePermissions();
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

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 10,
    total_pages: 0,
    total: 0,
    has_prev: false,
    has_next: false
  });

  useEffect(() => {
    fetchMatrices();
  }, [pagination.page, pagination.page_size]);

  const fetchMatrices = async () => {
    setIsLoading(true);
    try {
      const response = await getRiskMatrices({
        page: pagination.page,
        page_size: pagination.page_size
      });

      if (response.success && response.data?.data) {
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setMatrices(data);

        // Update pagination from API response
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: response.data.pagination.page || prev.page,
            page_size: response.data.pagination.page_size || prev.page_size,
            total: response.data.pagination.total || 0,
            total_pages: response.data.pagination.total_pages || 0,
            has_prev: response.data.pagination.has_prev || false,
            has_next: response.data.pagination.has_next || false
          }));
        }
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to load risk matrices", type: "error" });
      setMatrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagination = (updates: { page?: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: updates.page || prev.page,
      page_size: updates.page_size || prev.page_size
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleDeleteClick = (matrix: RiskMatrix) => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_delete")) return;
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
        notify({ description: "Risk matrix deleted successfully", type: "success" });
        await fetchMatrices();
        setDeleteDialog({ open: false, matrixId: null, matrixName: null });
      } else {
        notify({ description: response.message || "Failed to delete risk matrix", type: "error" });
      }
    } catch (error) {
      notify({ description: "Failed to delete risk matrix", type: "error" });
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
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">Risk</h2>
          <p className="text-muted-foreground text-sm">
            Configure risk assessment matrices for your organization
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Risk Matrix
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Updated Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!matrices.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted mb-4 rounded-full p-4">
                      <Grid3x3 className="text-muted-foreground h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No risk matrices configured
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center text-sm">
                      Get started by creating your first risk matrix to organize and classify risks.
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Matrix
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              matrices.map((matrix) => (
                <TableRow key={matrix.id}>
                  <TableCell>
                    <p className="text-foreground font-medium">{matrix.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {matrix.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={matrix.is_default ? "secondary" : "outline"}>
                      {matrix.is_default ? "Default" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(matrix.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(matrix.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfigureScales(matrix.id)}
                        className="h-8 gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(matrix)}
                        className="h-8 gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(matrix)}
                        disabled={matrix.is_default}
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

        {matrices.length > 0 && (
          <CustomPagination
            pagination={pagination}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
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
    </Card>
  );
}

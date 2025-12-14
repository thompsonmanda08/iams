"use client";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMatrixScales, deleteScale } from "@/app/_actions/config-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateScaleDialog } from "./create-scale-dialog";
import { EditScaleDialog } from "./edit-scale-dialog";
import { CustomPagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Pagination } from "@/lib/types";

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
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 10,
    total_pages: 1,
    totalCount: 0,
    has_next: false,
    has_prev: false
  });

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

  // Paginated data
  const paginatedScales = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    return scales.slice(startIndex, endIndex);
  }, [scales, pagination.page, pagination.page_size]);

  // Update pagination metadata
  const customPaginationData = useMemo(() => {
    const totalCount = scales.length;
    const total_pages = Math.ceil(totalCount / pagination.page_size);

    return {
      ...pagination,
      total_pages,
      totalCount,
      has_next: pagination.page < total_pages,
      has_prev: pagination.page > 1
    };
  }, [scales.length, pagination]);

  const updatePagination = ({ page, page_size }: { page: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: page_size ?? prev.page_size
    }));
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
        <Button onClick={() => setCreateDialogOpen(true)} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Level
        </Button>
      </div>

      {scales.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16">
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
          </div>
        </Card>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader className="uppercase">
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-foreground w-24">Level</TableHead>
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">Description</TableHead>
                <TableHead className="text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedScales.map((scale, index) => (
                <TableRow
                  key={scale.id}
                  className="hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <TableCell>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm",
                        getLevelColor(scale.level)
                      )}>
                      <span className="text-base font-bold">{scale.level}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{scale.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {scale.description || "No description provided"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
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
    </Card>
  );
}

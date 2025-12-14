"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteRating, getMatrixRatingsById } from "@/app/_actions/config-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateRatingDialog } from "./create-rating-dialog";
import { EditRatingDialog } from "./edit-rating-dialog";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";

type Rating = {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  color_hex: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type RatingLevelsListProps = {
  matrixId: string;
};

export function RatingLevelsList({ matrixId }: RatingLevelsListProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
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
    rating: Rating | null;
  }>({ open: false, rating: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ratingId: string | null;
    ratingName: string | null;
  }>({ open: false, ratingId: null, ratingName: null });

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrixId]);

  const fetchRatings = async () => {
    setIsLoading(true);
    try {
      const response = await getMatrixRatingsById(matrixId);

      if (response.success && response.data) {
        const sortedRatings = response.data.sort(
          (a: Rating, b: Rating) => a.min_score - b.min_score
        );
        setRatings(sortedRatings);
      } else {
        setRatings([]);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast.error("Failed to load rating levels");
      setRatings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Paginated data
  const paginatedRatings = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    return ratings.slice(startIndex, endIndex);
  }, [ratings, pagination.page, pagination.page_size]);

  // Update pagination metadata
  const customPaginationData = useMemo(() => {
    const totalCount = ratings.length;
    const total_pages = Math.ceil(totalCount / pagination.page_size);

    return {
      ...pagination,
      total_pages,
      totalCount,
      has_next: pagination.page < total_pages,
      has_prev: pagination.page > 1
    };
  }, [ratings.length, pagination]);

  const updatePagination = ({ page, page_size }: { page: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page,
      page_size: page_size ?? prev.page_size
    }));
  };

  const handleDeleteClick = (rating: Rating) => {
    setDeleteDialog({
      open: true,
      ratingId: rating.id,
      ratingName: rating.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.ratingId) return;

    try {
      const response = await deleteRating(deleteDialog.ratingId);
      if (response.success) {
        toast.success("Rating level deleted successfully");
        setDeleteDialog({ open: false, ratingId: null, ratingName: null });
        await fetchRatings();
      } else {
        toast.error(response.message || "Failed to delete rating level");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Failed to delete rating level. Please try again.");
    }
  };

  const handleEditClick = (rating: Rating) => {
    setEditDialog({ open: true, rating });
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
          <h2 className="text-foreground text-2xl font-bold">Rating Levels</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define risk rating levels based on calculated scores
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Rating
        </Button>
      </div>

      {ratings.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Plus className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No rating levels configured
            </h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Get started by adding your first rating level to begin risk assessment.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Rating
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-card rounded-lg border" >
          <Table>
            <TableHeader className="uppercase">
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-foreground w-20">Color</TableHead>
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">Score Range</TableHead>
                <TableHead className="text-foreground">Description</TableHead>
                <TableHead className="text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRatings.map((rating, index) => (
                <TableRow
                  key={rating.id}
                  className="hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-lg shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: rating.color_hex }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{rating.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      <div
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-semibold shadow-sm"
                        style={{
                          backgroundColor: `${rating.color_hex}20`,
                          color: rating.color_hex,
                          border: `1px solid ${rating.color_hex}40`
                        }}>
                        <span className="tabular-nums">{rating.min_score}</span>
                        <span className="opacity-60">→</span>
                        <span className="tabular-nums">{rating.max_score}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {rating.description || "No description provided"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(rating)}
                        className="h-8 gap-1.5">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(rating)}
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

          {ratings.length > 0 && (
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

      <CreateRatingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        matrixId={matrixId}
        onSuccess={fetchRatings}
      />

      {editDialog.rating && (
        <EditRatingDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, rating: null })}
          rating={editDialog.rating}
          onSuccess={fetchRatings}
        />
      )}

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ratingId: null, ratingName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Rating Level"
        description={`Are you sure you want to delete "${deleteDialog.ratingName}"? This action cannot be undone.`}
        type="delete"
      />
    </Card>
  );
}

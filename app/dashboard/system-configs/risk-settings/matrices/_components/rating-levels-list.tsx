"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMatrixRatings, deleteRating } from "@/app/_actions/config-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { CreateRatingDialog } from "./create-rating-dialog";
import { EditRatingDialog } from "./edit-rating-dialog";


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
  }, [matrixId]);

  const fetchRatings = async () => {
    setIsLoading(true);
    try {
      const response = await getMatrixRatings(matrixId);
      if (response.success && response.data?.data) {
        // Sort by min_score
        const sortedRatings = response.data.data.sort(
          (a: Rating, b: Rating) => a.min_score - b.min_score
        );
        setRatings(sortedRatings);
      }
    } catch (error) {
      toast.error("Failed to load rating levels");
    } finally {
      setIsLoading(false);
    }
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
        await fetchRatings();
        setDeleteDialog({ open: false, ratingId: null, ratingName: null });
      } else {
        toast.error(response.message || "Failed to delete rating level");
      }
    } catch (error) {
      toast.error("Failed to delete rating level");
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
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">Rating Levels</h2>
          <p className="text-muted-foreground text-sm">
            Define risk rating levels based on calculated scores
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rating
        </Button>
      </div>

      <div className="grid gap-4">
        {ratings.map((rating) => (
          <Card key={rating.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg"
                    style={{ backgroundColor: rating.color_hex }}
                  />
                  <div className="flex-1">
                    <CardTitle className="mb-2">{rating.name}</CardTitle>
                    <CardDescription>{rating.description || "No description"}</CardDescription>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary">
                        Score: {rating.min_score} - {rating.max_score}
                      </Badge>
                      <Badge variant="outline">{rating.color_hex}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(rating)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(rating)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {ratings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No rating levels configured</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Rating
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

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
        description={`Are you sure you want to delete "${deleteDialog.ratingName}"?`}
        type="delete"
      />
    </>
  );
}

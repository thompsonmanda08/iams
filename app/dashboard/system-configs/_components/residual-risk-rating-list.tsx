"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, Columns3Cog } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { deleteResidualRiskRating, getResidualRiskRatings } from "@/app/_actions/config-actions";
import { ResidualRiskRatingDialog } from "./residual-risk-rating-dialog";
import { Badge } from "@/components/ui/badge";

type ResidualRiskRating = {
  id: string;
  name: string;
  value: number;
  description: string;
  condition: string;
  created_at: string;
  updated_at: string;
};

export function ResidualRiskRatingList() {
  const [ratings, setRatings] = useState<ResidualRiskRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    rating: ResidualRiskRating | null;
  }>({ open: false, rating: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ratingId: string | null;
    ratingName: string | null;
  }>({ open: false, ratingId: null, ratingName: null });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setIsLoading(true);
    try {
      const response = await getResidualRiskRatings();
      if (response.success && response.data?.data) {
        setRatings(response.data.data);
      } else {
        setRatings([]);
      }
    } catch (error) {
      console.error("Error fetching residual risk ratings:", error);
      toast.error("Failed to load residual risk ratings");
      setRatings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (rating: ResidualRiskRating) => {
    setDeleteDialog({
      open: true,
      ratingId: rating.id,
      ratingName: rating.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.ratingId) return;

    try {
      const response = await deleteResidualRiskRating(deleteDialog.ratingId);
      if (response.success) {
        toast.success("Residual risk rating deleted successfully");
        await fetchRatings();
        setDeleteDialog({ open: false, ratingId: null, ratingName: null });
      } else {
        toast.error(response.message || "Failed to delete residual risk rating");
      }
    } catch (error) {
      console.error("Error deleting residual risk rating:", error);
      toast.error("Failed to delete residual risk rating");
    }
  };

  const handleCreateClick = () => {
    setDialog({ open: true, rating: null });
  };

  const handleEditClick = (rating: ResidualRiskRating) => {
    setDialog({ open: true, rating });
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
          <h2 className="text-foreground text-2xl font-bold">Residual Risk Ratings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Define and manage residual risk ratings for comprehensive risk management
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Residual Risk Rating
        </Button>
      </div>

      {!ratings.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Columns3Cog className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No Residual Risk Ratings Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
              Get started by creating your first residual risk rating to identify and manage
              post-control risk levels.
            </p>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Risk Rating
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ratings.map((rating) => {
            return (
              <Card key={rating.id} className="group transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{rating.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {`${rating.condition} ${rating.value}`}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {rating.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(rating)}
                      className="flex-1">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(rating)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ResidualRiskRatingDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, rating: null })}
        rating={dialog?.rating as any}
        onSuccess={fetchRatings}
      />

      <ConfirmationModal
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ratingId: null, ratingName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Residual Risk Rating"
        description={`Are you sure you want to delete "${deleteDialog.ratingName}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}

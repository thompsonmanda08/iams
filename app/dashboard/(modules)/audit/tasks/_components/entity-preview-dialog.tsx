/**
 * Entity Preview Dialog Component
 *
 * Modal dialog that displays entity summary before approval/rejection.
 * Shows loading and error states, and provides link to view full details.
 *
 * @module entity-preview-dialog
 */

"use client";

import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EntityPreviewDialogProps, EntityType } from "@/lib/types/entity-preview-types";
import {
  getEntityDetailRoute,
  getEntityTypeLabel,
  normalizeEntityType
} from "@/lib/utils/entity-preview-utils";
import { useEntityPreview } from "./entity-preview-hooks";
import { EntitySummaryCard } from "./entity-summary-card";

/**
 * Entity Preview Dialog Component
 *
 * Displays a preview of the entity being approved/rejected before the user
 * proceeds to the confirmation dialog. Shows loading and error states.
 */
export function EntityPreviewDialog({
  open,
  onOpenChange,
  entityId,
  entityType,
  entityName,
  action,
  onProceed
}: EntityPreviewDialogProps) {
  // Fetch entity details
  const { data: entityData, isLoading, error } = useEntityPreview(entityType, entityId, open);

  // Get the route to view full details
  const detailRoute = getEntityDetailRoute(entityType, entityId, entityData);

  // Determine button styling based on action
  const isReject = action === "REJECT" || action === "REJECTED";
  const buttonVariant = isReject ? "destructive" : "default";
  const actionLabel = isReject ? "Reject" : "Approve";

  const handleProceed = () => {
    onOpenChange(false);
    onProceed();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Preview {getEntityTypeLabel(entityType)}</DialogTitle>
          <DialogDescription>
            Review the entity details below before proceeding with your {actionLabel.toLowerCase()}{" "}
            decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Entity identification */}
          <div className="border-b pb-3">
            <h3 className="font-semibold text-sm">{entityName}</h3>
            <p className="text-xs text-muted-foreground">ID: {entityId}</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading entity details...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive text-sm">Failed to Load Details</h4>
                  <p className="text-xs text-destructive/80 mt-1">{error.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can still proceed with your {actionLabel.toLowerCase()}, but we recommend
                    viewing the full details first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success State - Entity Summary */}
          {entityData && !isLoading && (
            <>
              <EntitySummaryCard entityType={entityType} entityData={entityData} />

              {/* View Full Details Link */}
              {detailRoute ? (
                <div className="pt-2">
                  <Link
                    href={detailRoute}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                    aria-label={`Open full details for ${entityName} in new tab`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Full Details
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pt-2">
                  Full details page not available for this entity type.
                </p>
              )}
            </>
          )}

          {/* Empty State - No data available */}
          {!entityData && !isLoading && !error && (
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Entity details are not available at this time.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please use "View Full Details" to see complete information.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleProceed}
            disabled={isLoading}
            className="gap-2"
          >
            Proceed to {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

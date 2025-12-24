/**
 * Entity Preview Dialog Component
 *
 * Modal dialog that displays entity summary before approval/rejection.
 * Uses data from workflow task row and provides link to view full details.
 *
 * @module entity-preview-dialog
 */

"use client";

import { ExternalLink } from "lucide-react";
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
import type { WorkflowEntityType } from "@/lib/types/entity-preview-types";

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
  onProceed,
  initialData
}: EntityPreviewDialogProps) {
  // Normalize entity type to handle workflow variations (FINDINGS -> FINDING, AUDIT_CLOSURE -> AUDIT_PLAN, etc.)
  const normalizedType = normalizeEntityType(entityType as WorkflowEntityType);

  // Task row data is always sufficient for preview display
  // We have objectives, conclusion, and other details from the workflow task
  // No need to fetch additional data from API - use what we already have
  const entityData = initialData;

  // Disable API fetching completely - task row data is complete enough for preview
  // Users can click "View Full Details" to see complete information from detail pages
  const { data: fetchedData, isLoading, error } = useEntityPreview(
    normalizedType,
    entityId,
    false  // Never fetch - we have everything we need from task row
  );

  // Get the route to view full details, passing original entity type for proper routing
  const detailRoute = getEntityDetailRoute(normalizedType, entityId, {
    ...entityData,
    original_entity_type: entityType
  });

  // Determine button styling based on action
  const isReject = action === "REJECT" || action === "REJECTED";
  const buttonVariant = isReject ? "destructive" : "default";
  const actionLabel = isReject ? "Reject" : "Approve";
  const hasAction = action && onProceed;

  const handleProceed = () => {
    if (onProceed) {
      onOpenChange(false);
      onProceed();
    }
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
          </div>

          {/* Entity Summary - Always shown since we use task row data */}
          {entityData ? (
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
          ) : (
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
            {hasAction ? "Cancel" : "Close"}
          </Button>
          {hasAction && (
            <Button
              variant={buttonVariant}
              onClick={handleProceed}
              className="gap-2"
            >
              Proceed to {actionLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

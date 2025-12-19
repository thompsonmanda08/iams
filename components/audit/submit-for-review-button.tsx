/**
 * Submit for Review Button Component
 *
 * Allows users to submit an audit plan for review, which triggers
 * automatic workpaper generation from the selected template categories.
 *
 * @module submit-for-review-button
 */

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useSubmitAuditPlanMutation } from "@/hooks/use-audit-mutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface SubmitForReviewButtonProps {
  auditPlanId: string;
  categoryCount: number;
}

export function SubmitForReviewButton({ auditPlanId, categoryCount }: SubmitForReviewButtonProps) {
  const router = useRouter();

  const { mutate: submitPlan, isPending: isSubmitting } = useSubmitAuditPlanMutation({
    onSuccess: () => {
      // Refresh the page to show updated status and workpapers
      router.refresh();
    }
  });

  const handleSubmit = () => {
    submitPlan(auditPlanId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={isSubmitting || categoryCount === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Audit Plan for Review?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will generate <span className="font-semibold">{categoryCount}</span> workpapers
              based on your selected template categories.
            </p>
            <p className="text-sm">
              The audit plan status will be changed to &quot;Under Review&quot; and workpapers will
              be automatically created with pre-filled audit procedures, objectives, and scope from
              the template.
            </p>
            <p className="text-sm font-medium">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit & Generate Workpapers"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Submit for Review Button Component
 *
 * Allows users to submit an audit plan for review, which triggers
 * automatic workpaper generation from the selected template categories.
 *
 * @module submit-for-review-button
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitAuditPlanForReview } from '@/app/_actions/audit-module-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SubmitForReviewButtonProps {
  auditPlanId: string;
  categoryCount: number;
}

export function SubmitForReviewButton({
  auditPlanId,
  categoryCount,
}: SubmitForReviewButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await submitAuditPlanForReview(auditPlanId);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Audit plan submitted for review',
        });

        // Refresh the page to show updated status and workpapers
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to submit audit plan for review',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
              This will generate <span className="font-semibold">{categoryCount}</span>{' '}
              workpapers based on your selected template categories.
            </p>
            <p className="text-sm">
              The audit plan status will be changed to &quot;Under Review&quot; and workpapers
              will be automatically created with pre-filled audit procedures, objectives,
              and scope from the template.
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
              'Submit & Generate Workpapers'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

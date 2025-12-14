"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardListIcon, Send } from "lucide-react";
import type { AuditPlan } from "@/lib/types/audit-types";

interface RequiresApprovalStateProps {
  auditPlan: AuditPlan;
  onSubmitForApproval: () => void;
  isSubmitting?: boolean;
}

export function RequiresApprovalState({
  auditPlan,
  onSubmitForApproval,
  isSubmitting = false
}: RequiresApprovalStateProps) {
  return (
    <Card className="bg-canvas/50 border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-8 py-8">
        <div className="relative mb-4">
          <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
          <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
            <ClipboardListIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-foreground mb-2 text-2xl font-semibold">Requires Approval</h3>
        <p className="text-muted-foreground mb-8 max-w-md text-center">
          You need to submit this plan for approval before findings can be recorded.
        </p>

        <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
            <div className="text-primary mb-1 font-mono">SUBMIT</div>
            <div className="text-muted-foreground">Audit Plan for Approval</div>
          </div>
          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
            <div className="text-primary mb-1 font-mono">RECORD</div>
            <div className="text-muted-foreground">Engagement Findings</div>
          </div>
          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
            <div className="text-primary mb-1 font-mono">ASSESS</div>
            <div className="text-muted-foreground">Findings Evidence</div>
          </div>
        </div>

        {auditPlan.status.toUpperCase() === "DRAFT" && (
          <Button
            size="lg"
            onClick={onSubmitForApproval}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Submitting..."
            className="gap-2">
            <Send className="h-6 w-6" />
            Submit for Approval
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

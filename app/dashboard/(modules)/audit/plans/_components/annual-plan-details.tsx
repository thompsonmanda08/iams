"use client";
import { Download, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  useAnnualAuditPlanItems,
  useSubmitAnnualAuditPlanForApproval
} from "@/hooks/use-audit-query-data";
import { Suspense, useState } from "react";
import Loader from "@/components/ui/loader";
import { AnnualPlanItems, CreateOrUpdatePlanItem } from "./annual-plan-items";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/date-format";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

export default function AuditDetailClient({
  auditPlan,
  planItems
}: {
  auditPlan: any;
  planItems: any;
}) {
  const { checkPermission, hasPermission } = usePermissions();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [openAddPlanItemModal, setOpenAddPlanItemModal] = useState(false);

  const { data: itemsResponse } = useAnnualAuditPlanItems(
    auditPlan?.id,
    {
      page: 1,
      page_size: 100
    },
    planItems
  );

  const items = itemsResponse?.data || itemsResponse || [];

  console.log({ items });

  const submitMutation = useSubmitAnnualAuditPlanForApproval();

  const confirmSubmitForApproval = () => {
    submitMutation.mutate({
      registerId: auditPlan?.id,
      comments
    });
  };

  // Close dialog only on successful submission
  if (submitMutation.isSuccess && submitDialogOpen) {
    setSubmitDialogOpen(false);
    setComments("");
  }

  return (
    <>
      {/* Audit Plan Header */}
      <Card className="border-0 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-foreground text-3xl font-bold">
                  Annual Plan ({auditPlan.year})
                </h3>
                <StatusBadge status={auditPlan.status} size="md" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                {auditPlan.status.toUpperCase() === "COMPLETED" && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                )}
                {auditPlan.status.toUpperCase() === "DRAFT" && (
                  <PermissionButton moduleCode={MODULE_CODES.AUDIT_PLANS} action="can_approve"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
  setSubmitDialogOpen(true);
}}
                    disabled={submitMutation.isPending || items.length === 0}
                    isLoading={submitMutation.isPending}
                    loadingText="Submitting..."
                    title={
                      items.length === 0
                        ? "Add at least one plan item before submitting for approval"
                        : ""
                    }>
                    <Send className="h-4 w-4" />
                    Submit for Approval
                  </PermissionButton>
                )}
              </div>
            </div>

            {/* CREATED/UPDATED INFO */}
            <div className="text-muted-foreground flex gap-6">
              <div className="text-right">
                <p className="text-foreground mb-1.5 font-medium">Created</p>
                <p>{formatDate(auditPlan.created_at)}</p>
                {auditPlan?.created_by_name && (
                  <>
                    <p className="text-sm">by {auditPlan?.created_by_name || "System"}</p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-foreground mb-1.5 font-medium">Updated</p>
                <p>{formatDate(auditPlan?.updated_at)}</p>
                {auditPlan?.updated_by_name && (
                  <>
                    <p className="text-sm">by {auditPlan?.updated_by_name || "System"}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Suspense fallback={<TableLoading />}>
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-base leading-none font-medium">Engagement Items</h4>
              <p className="text-muted-foreground text-sm">
                Possible audit engagements and future audits
              </p>
            </div>
            <div className="flex items-end gap-2">
              <CreateOrUpdatePlanItem
                planId={auditPlan?.id}
                showTrigger={true}
                openModal={openAddPlanItemModal}
                setOpenModal={setOpenAddPlanItemModal}
              />
            </div>
          </div>
          {/* Results Summary */}
          {auditPlan && items.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {items.length} audit plan item
                {auditPlan?.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <AnnualPlanItems items={items} planId={auditPlan?.id} annualPlan={auditPlan} />
        </Card>
      </Suspense>

      {/* Submit for Approval Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Annual Plan for Approval?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this audit plan for approval? This will send it to
              HIAR or HOD for review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              label="Comments"
              placeholder="Provide comments here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setSubmitDialogOpen(false);
                setComments("");
              }}>
              Cancel
            </Button>
            <Button
              onClick={confirmSubmitForApproval}
              disabled={submitMutation.isPending}
              isLoading={submitMutation.isPending}
              loadingText="Submitting...">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      <Loader size={32} loadingText="Please wait..." />
    </div>
  );
}

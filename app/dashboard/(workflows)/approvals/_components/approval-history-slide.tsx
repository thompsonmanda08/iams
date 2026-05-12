"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { Pagination } from "@/lib/types";
import type { Task } from "@/lib/types/task";
import { formatDateTime } from "@/lib/utils/date-format";

interface ApprovalRecord {
  id: string;
  instance_id: string;
  approved_by: string;
  approved_by_name: string;
  role_name: string;
  action: "APPROVED" | "REJECTED";
  remarks: string;
  created_at: string;
}

interface ApprovalHistorySlideProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  approvals: ApprovalRecord[];
  pagination: Pagination;
  isLoading: boolean;
  onPageChange: (page: number, pageSize?: number) => void;
}

export function ApprovalHistorySlide({
  isOpen,
  onOpenChange,
  task,
  approvals,
  pagination,
  isLoading,
  onPageChange
}: ApprovalHistorySlideProps) {
  const [localPage, setLocalPage] = useState(pagination.page);

  useEffect(() => {
    setLocalPage(pagination.page);
  }, [pagination.page]);

  const handlePaginationChange = ({ page, page_size }: { page: number; page_size?: number }) => {
    setLocalPage(page);
    onPageChange(page, page_size);
  };

  const getActionBadge = (action: string) => {
    if (action === "APPROVED") {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
          Rejected
        </Badge>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Approval History</SheetTitle>
          {task && (
            <SheetDescription>
              {task.entity_name}
              {task.instance?.id && (
                <span className="text-muted-foreground block text-xs mt-1">
                  ID: {task.instance.id.substring(0, 8)}...
                </span>
              )}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 px-4 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading approvals...</p>
              </div>
            </div>
          ) : !approvals?.length ? (
            <div className="border-border bg-muted/50 flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
              <div className="mx-auto flex max-w-[300px] flex-col items-center justify-center text-center">
                <h3 className="mt-2 text-sm font-semibold">No approval history</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  There are no approvals or rejections recorded for this task yet.
                </p>
              </div>
            </div>
          ) : (
            (approvals ?? []).map((approval) => (
              <Card key={approval.id} className="p-4">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        {getActionBadge(approval.action)}
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="font-medium text-sm">{approval.approved_by_name}</span>
                        <span className="text-muted-foreground text-xs">{approval.role_name}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Remarks */}
                  {approval.remarks && (
                    <div className="border-l-2 border-muted-foreground/20 bg-muted/50 rounded px-3 py-2">
                      <p className="text-xs text-foreground break-words">{approval.remarks}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>ID: {approval.id.substring(0, 8)}...</span>
                    <span>{formatDateTime(approval.created_at)}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {!isLoading && !!approvals?.length && pagination && pagination.total_pages > 1 && (
          <div className="border-t pt-4 px-4">
            <CustomPagination
              pagination={pagination}
              updatePagination={handlePaginationChange}
              allowSetPageSize={true}
              showDetails={true}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

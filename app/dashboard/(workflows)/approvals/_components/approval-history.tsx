"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Pagination } from "@/lib/types";
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

interface ApprovalHistoryProps {
  instanceId: string;
  initialApprovals: ApprovalRecord[];
  initialPagination: Pagination;
  onPageChange: (page: number, pageSize?: number) => void;
}

export function ApprovalHistory({
  instanceId,
  initialApprovals,
  initialPagination,
  onPageChange
}: ApprovalHistoryProps) {
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(initialApprovals);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  useEffect(() => {
    setApprovals(initialApprovals);
    setPagination(initialPagination);
  }, [initialApprovals, initialPagination]);

  const handlePaginationChange = ({ page, page_size }: { page: number; page_size?: number }) => {
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

  if (approvals.length === 0) {
    return (
      <div className="border-border bg-muted/50 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No approval history</h3>
          <p className="text-muted-foreground mt-2 mb-4 text-sm">
            There are no approvals or rejections recorded for this workflow instance yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline/History Items */}
      <div className="space-y-3">
        {approvals.map((approval) => (
          <Card key={approval.id} className="p-4">
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getActionBadge(approval.action)}
                    <div className="flex flex-col">
                      <span className="font-medium">{approval.approved_by_name}</span>
                      <span className="text-muted-foreground text-xs">{approval.role_name}</span>
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Remarks */}
              {approval.remarks && (
                <div className="border-l-2 border-muted-foreground/20 bg-muted/50 rounded px-3 py-2">
                  <p className="text-sm text-foreground">{approval.remarks}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>ID: {approval.id.substring(0, 8)}...</span>
                <span>{formatDateTime(approval.created_at)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <CustomPagination
          pagination={pagination}
          updatePagination={handlePaginationChange}
          allowSetPageSize={true}
          showDetails={true}
          className="border-t mt-4 pt-4"
        />
      )}
    </div>
  );
}

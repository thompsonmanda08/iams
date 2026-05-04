"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ExternalLink, Download, AlertCircle } from "lucide-react";
import type { EvidenceType, FindingEvidence } from "@/lib/types/audit-types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

interface EvidenceListProps {
  evidence: FindingEvidence[];
  onEdit: (evidence: FindingEvidence) => void;
  onDelete: (evidence: FindingEvidence) => void;
  isLoading?: boolean;
  stats?: {
    total_count?: number;
    verified_count?: number;
    unverified_count?: number;
  };
}

const EVIDENCE_TYPE_COLORS: Record<EvidenceType, string> = {
  Document: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Observation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Interview: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Testing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
};

export function EvidenceList({ evidence, onEdit, onDelete, isLoading, stats }: EvidenceListProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (evidence.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8" />
            <p className="text-sm">No evidence attached to this finding yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-blue-200 bg-blue-50 py-4 dark:border-blue-900 dark:bg-blue-950/50">
            <CardContent className="py-0">
              <p className="text-muted-foreground text-xs">Total</p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                {stats.total_count || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50 py-4 dark:border-green-900 dark:bg-green-950/50">
            <CardContent className="py-0">
              <p className="text-muted-foreground text-xs">Verified</p>
              <p className="text-base font-bold text-green-600 dark:text-green-400">
                {stats.verified_count || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 py-4 dark:border-yellow-900 dark:bg-yellow-950/50">
            <CardContent className="py-0">
              <p className="text-muted-foreground text-xs">Unverified</p>
              <p className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                {stats.unverified_count || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evidence Items */}
      {evidence.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Header with Title and Type */}
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <Badge
                    className={cn(
                      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
                      EVIDENCE_TYPE_COLORS[item.evidence_type]
                    )}
                    variant="secondary">
                    {item.evidence_type.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                    {item.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-xs">
                  {item.collection_date && (
                    <span>Collected: {new Date(item.collection_date).toLocaleDateString()}</span>
                  )}
                  <span>
                    Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Expandable Content */}
                {expandedId === item.id && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    {item.external_link && (
                      <div>
                        <p className="mb-1 text-xs font-semibold">External Link:</p>
                        <a
                          href={item.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs hover:underline">
                          {item.external_link}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {item.file_link && (
                      <div>
                        <p className="mb-1 text-xs font-semibold">Attached File:</p>
                        <a
                          href={item.file_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs hover:underline">
                          <Download className="h-3 w-3" />
                          Download File
                        </a>
                      </div>
                    )}

                    {item.notes && (
                      <div>
                        <p className="mb-1 text-xs font-semibold">Notes:</p>
                        <p className="text-muted-foreground text-xs">{item.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand/Collapse Button */}
                {(item.external_link || item.file_link || item.notes) && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="text-primary mt-2 text-xs font-medium hover:underline">
                    {expandedId === item.id ? "Show less" : "Show more"}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 gap-2">
                <PermissionButton moduleCode={MODULE_CODES.AUDIT_WPS} action="can_edit"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
  onEdit(item);
}}
                  disabled={isLoading}
                  className="h-8 w-8 p-0">
                  <Edit2 className="h-4 w-4" />
                </PermissionButton>
                <PermissionButton moduleCode={MODULE_CODES.AUDIT_WPS} action="can_delete"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
  onDelete(item);
}}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </PermissionButton>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

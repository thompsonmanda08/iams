"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { FindingSeverity, FindingStatus } from "@/lib/types/audit-types";

interface FindingsFiltersProps {
  selectedSeverities: FindingSeverity[];
  selectedStatuses: FindingStatus[];
  onSeverityToggle: (severity: FindingSeverity) => void;
  onStatusToggle: (status: FindingStatus) => void;
  onClearAll: () => void;
}

export function FindingsFilters({
  selectedSeverities,
  selectedStatuses,
  onSeverityToggle,
  onStatusToggle,
  onClearAll,
}: FindingsFiltersProps) {
  const severities: FindingSeverity[] = ["critical", "high", "medium", "low"];
  const statuses: FindingStatus[] = ["open", "in-progress", "resolved", "closed"];

  const hasActiveFilters = selectedSeverities.length > 0 || selectedStatuses.length > 0;

  const getSeverityColor = (severity: FindingSeverity, isSelected: boolean) => {
    if (!isSelected) return "";
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white hover:bg-red-700 border-red-600";
      case "high":
        return "bg-orange-600 text-white hover:bg-orange-700 border-orange-600";
      case "medium":
        return "bg-amber-600 text-white hover:bg-amber-700 border-amber-600";
      case "low":
        return "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
    }
  };

  const getStatusColor = (status: FindingStatus, isSelected: boolean) => {
    if (!isSelected) return "";
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300";
      case "in-progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-300";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Severity Filters */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Severity</label>
        <div className="flex flex-wrap gap-2">
          {severities.map((severity) => {
            const isSelected = selectedSeverities.includes(severity);
            return (
              <Badge
                key={severity}
                variant="outline"
                className={`cursor-pointer transition-colors ${getSeverityColor(severity, isSelected)}`}
                onClick={() => onSeverityToggle(severity)}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const isSelected = selectedStatuses.includes(status);
            return (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer transition-colors ${getStatusColor(status, isSelected)}`}
                onClick={() => onStatusToggle(status)}
              >
                {status
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { AlertCircle, Database, FileQuestion, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetEmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  hasDataSource?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const WidgetEmptyState = ({
  icon,
  title,
  description,
  hasDataSource = false,
  isError = false,
  onRetry,
  isRetrying = false
}: WidgetEmptyStateProps) => {
  // Determine icon
  const displayIcon = icon || (
    isError ? (
      <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
    ) : hasDataSource ? (
      <Database className="mx-auto h-10 w-10 text-gray-400" />
    ) : (
      <FileQuestion className="mx-auto h-10 w-10 text-gray-400" />
    )
  );

  // Determine title
  const displayTitle = title || (
    isError
      ? "Failed to load data"
      : hasDataSource
      ? "No data available"
      : "No data configured"
  );

  // Determine description
  const displayDescription = description || (
    isError
      ? "We couldn't load the data for this widget. Please check your connection and try again, or contact support if the issue persists."
      : hasDataSource
      ? "The data source returned no results. This may be expected if there are no records matching the criteria."
      : "Configure this widget to display data"
  );

  return (
    <div
      className={`flex min-h-48 items-center justify-center rounded-lg border-2 border-dashed p-8 ${
        isError
          ? "border-red-200 bg-red-50"
          : "border-gray-300 bg-gray-50"
      }`}>
      <div className="max-w-sm text-center">
        {displayIcon}
        <p className={`mt-3 text-sm font-medium ${isError ? "text-red-900" : "text-gray-900"}`}>
          {displayTitle}
        </p>
        <p className={`mt-1 text-xs ${isError ? "text-red-600" : "text-gray-500"}`}>
          {displayDescription}
        </p>
        {isError && onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            size="sm"
            variant="outline"
            className="mt-4 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Retrying..." : "Retry"}
          </Button>
        )}
      </div>
    </div>
  );
};

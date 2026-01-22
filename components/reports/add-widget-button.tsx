"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AddWidgetButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "default" | "dashed" | "compact";
}

/**
 * AddWidgetButton - Button to trigger adding a new widget
 * Three variants:
 * - default: Standard button with icon and text
 * - dashed: Large dashed border button (for empty state)
 * - compact: Small icon-only button
 */
export function AddWidgetButton({
  onClick,
  className,
  variant = "default"
}: AddWidgetButtonProps) {
  if (variant === "dashed") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600",
          className
        )}
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add Widget</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        className={cn("h-8 w-8 p-0", className)}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add Widget</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <Plus className="h-4 w-4" />
      Add Widget
    </Button>
  );
}

export default AddWidgetButton;

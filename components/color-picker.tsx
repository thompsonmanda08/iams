"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
};

export function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const colors = [
    // Reds
    { hex: "#ef4444", name: "Red" },
    { hex: "#f97316", name: "Orange" },
    { hex: "#f59e0b", name: "Amber" },

    // Yellows
    { hex: "#eab308", name: "Yellow" },
    { hex: "#fde047", name: "Light Yellow" },

    // Greens
    { hex: "#84cc16", name: "Lime" },
    { hex: "#22c55e", name: "Green" },
    { hex: "#10b981", name: "Emerald" },

    // Cyans/Blues
    { hex: "#06b6d4", name: "Cyan" },
    { hex: "#0ea5e9", name: "Sky" },
    { hex: "#3b82f6", name: "Blue" },
    { hex: "#6366f1", name: "Indigo" },

    // Purples/Pinks
    { hex: "#8b5cf6", name: "Violet" },
    { hex: "#a855f7", name: "Purple" },
    { hex: "#d946ef", name: "Fuchsia" },
    { hex: "#ec4899", name: "Pink" },

    // Neutrals
    { hex: "#64748b", name: "Slate" },
    { hex: "#6b7280", name: "Gray" },
    { hex: "#71717a", name: "Zinc" },
    { hex: "#737373", name: "Neutral" }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-10 gap-2">
        {colors.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => !disabled && onChange(color.hex)}
            disabled={disabled}
            className={cn(
              "group relative aspect-square rounded-lg transition-all duration-200",
              "focus:ring-primary hover:scale-110 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none",
              disabled && "cursor-not-allowed opacity-50",
              value.toLowerCase() === color.hex.toLowerCase() &&
                "ring-primary scale-110 ring-2 ring-offset-2"
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}>
            {value.toLowerCase() === color.hex.toLowerCase() && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow-lg" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Color Display */}
      <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3">
        <div
          className="border-border h-10 w-10 rounded-md border-2 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1">
          <div className="font-mono text-sm font-medium">{value.toUpperCase()}</div>
          <div className="text-muted-foreground text-xs">Selected color</div>
        </div>
      </div>
    </div>
  );
}

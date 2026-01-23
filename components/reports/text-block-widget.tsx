"use client";

import React, { useState } from "react";
import { FileText, Edit2 } from "lucide-react";
import { DataSource } from "@/lib/types/report-types";
import { WidgetDataSourcePicker } from "./widget-data-source-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextBlockWidgetData {
  title?: string;
  content: string;
  data_source_id?: string;
}

interface TextBlockWidgetProps {
  data: TextBlockWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: TextBlockWidgetData) => void;
  showDataSourcePicker?: boolean;
}

export const TextBlockWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true
}: TextBlockWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";

  const updateField = (field: keyof TextBlockWidgetData, value: any) => {
    if (!onDataChange) return;
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {data.title && (
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {data.title}
          </h4>
          <div className="flex items-center gap-2">
            {showDataSourcePicker && onDataSourceChange && (
              <WidgetDataSourcePicker
                widgetType="text_block"
                currentDataSourceId={dataSourceId}
                onDataSourceChange={onDataSourceChange}
              />
            )}
            {isManualMode && onDataChange && (
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  isConfiguring ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
                }`}>
                <Edit2 className="h-3 w-3" />
                {isConfiguring ? "Done" : "Edit"}
              </button>
            )}
          </div>
        </div>
      )}

      {isConfiguring ? (
        <div className="space-y-3 rounded-lg bg-muted/50 p-3">
          <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Edit Text Block
          </div>
          <div className="space-y-2">
            <Input
              label="Title (optional)"
              type="text"
              value={data.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter title..."
              className="h-9"
            />
            <Textarea
              label="Content"
              value={data.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Enter your text content..."
              rows={8}
            />
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <div
            className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      )}
    </div>
  );
};

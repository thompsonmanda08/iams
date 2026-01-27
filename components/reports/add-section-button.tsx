import React from "react";
import { Plus } from "lucide-react";
import { useReportStore } from "@/store/report-store";

interface AddSectionButtonProps {
  variant?: "main" | "sidebar";
  className?: string;
}

export const AddSectionButton = ({
  variant = "sidebar",
  className = ""
}: AddSectionButtonProps) => {
  const { setAddSectionModalOpen } = useReportStore();

  if (variant === "main") {
    return (
      <div
        onClick={() => setAddSectionModalOpen(true)}
        className={`border-border group hover:border-primary/50 hover:bg-primary/5 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed py-8 transition-colors ${className}`}>
        <span
          // onClick={() => setAddSectionModalOpen(true)}
          className="text-muted-foreground group-hover:text-primary flex flex-col items-center gap-2">
          <div className="bg-card group-hover:bg-primary group-hover:text-primary-foreground ring-border rounded-full p-2 shadow-sm ring-1">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium">Add New Section</span>
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setAddSectionModalOpen(true)}
      className={`border-border text-muted-foreground hover:border-primary/50 hover:text-primary flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm font-medium transition-colors ${className}`}>
      <Plus className="h-4 w-4" />
      Add Section
    </button>
  );
};

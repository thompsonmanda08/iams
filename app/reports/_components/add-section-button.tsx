import React from "react";
import { Plus } from "lucide-react";
import { useReportStore } from "../store";

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
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50 ${className}`}>
        <button
          onClick={() => setAddSectionModalOpen(true)}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-blue-600">
          <div className="rounded-full bg-white p-2 shadow-sm ring-1 ring-gray-200">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium">Add New Section</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setAddSectionModalOpen(true)}
      className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 ${className}`}>
      <Plus className="h-4 w-4" />
      Add Section
    </button>
  );
};

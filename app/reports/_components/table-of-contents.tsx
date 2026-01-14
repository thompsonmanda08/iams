import React from "react";
import { List } from "lucide-react";
import { ReportSection } from "../types";

interface TOCProps {
  sections: ReportSection[];
  onItemClick: (sectionId: string) => void;
}

export const TableOfContents = ({ sections, onItemClick }: TOCProps) => {
  const tocItems = sections
    .filter((s) => s.include_in_toc && s.header)
    .sort((a, b) => a.order - b.order);

  let mainCounter = 0;
  let subCounter = 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <List className="h-4 w-4" />
        Table of Contents
      </h3>
      <nav className="space-y-1">
        {tocItems.map((section) => {
          let label = "";
          if (section.toc_level === 1) {
            mainCounter++;
            subCounter = 0;
            label = `${mainCounter}.`;
          } else if (section.toc_level === 2) {
            subCounter++;
            label = `${mainCounter}.${subCounter}`;
          } else {
            label = "•";
          }

          return (
            <button
              key={section.section_id}
              onClick={() => onItemClick(section.section_id)}
              className={`block w-full text-left text-sm transition-colors hover:text-blue-600 ${
                section.toc_level === 1
                  ? "font-medium text-gray-900"
                  : section.toc_level === 2
                    ? "pl-4 text-gray-700"
                    : "pl-8 text-gray-600"
              }`}>
              <span className="mr-2 text-gray-400">{label}</span>
              {section.header}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

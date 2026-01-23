import React from "react";
import { List } from "lucide-react";
import { ReportSection, SectionTreeNode } from "@/lib/types/report-types";
import { buildSectionTree } from "@/lib/utils/report-hierarchy-utils";

interface TOCProps {
  sections: ReportSection[];
  onItemClick: (sectionId: string) => void;
}

export const TableOfContents = ({ sections, onItemClick }: TOCProps) => {
  const tree = buildSectionTree(sections.filter((s) => s.include_in_toc && s.header));

  const renderNode = (node: SectionTreeNode, parentNumber: string = ""): JSX.Element => {
    // Calculate hierarchical numbering
    const number = parentNumber ? `${parentNumber}.${node.order}` : `${node.order}.`;

    return (
      <div key={node.section_id}>
        <button
          onClick={() => onItemClick(node.section_id)}
          className={`block w-full text-left text-sm transition-colors hover:text-primary ${
            node.depth === 0
              ? "font-medium text-foreground"
              : node.depth === 1
              ? "pl-4 text-foreground/80"
              : "pl-8 text-muted-foreground"
          }`}
        >
          <span className="mr-2 text-muted-foreground">{number}</span>
          {node.header}
        </button>

        {/* Recursively render children */}
        {node.children.length > 0 && (
          <div className="mt-1 space-y-1">
            {node.children
              .sort((a, b) => a.order - b.order)
              .map((child) => renderNode(child, number.replace(/\.$/, "")))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <List className="h-4 w-4" />
        Table of Contents
      </h3>
      <nav className="space-y-1">
        {tree.sort((a, b) => a.order - b.order).map((node) => renderNode(node))}
      </nav>
    </div>
  );
};

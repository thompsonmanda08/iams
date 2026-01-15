import React, { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { FindingSummary } from "../types";

interface FindingsSelectorProps {
  findings: FindingSummary[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

// Helper components for badges
const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    critical: "bg-purple-100 text-purple-800 border-purple-200",
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[severity] || "bg-gray-100 text-gray-800"}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    OPEN: "bg-red-50 text-red-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    CLOSED: "bg-green-50 text-green-700"
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export const FindingsSelector = ({
  findings,
  selectedIds,
  onSelectionChange
}: FindingsSelectorProps) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const filteredFindings =
    filterSeverity === "all" ? findings : findings.filter((f) => f.severity === filterSeverity);

  // Group findings by category
  const groupedFindings = useMemo(() => {
    const groups: Record<string, FindingSummary[]> = {};

    filteredFindings.forEach((finding) => {
      const category = finding.category_name || "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(finding);
    });

    // Sort categories alphabetically
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredFindings]);

  // Initialize all categories as expanded on first render
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    groupedFindings.forEach(([category]) => {
      if (!(category in expandedCategories)) {
        initialExpanded[category] = true;
      }
    });
    if (Object.keys(initialExpanded).length > 0) {
      setExpandedCategories((prev) => ({ ...prev, ...initialExpanded }));
    }
  }, [groupedFindings.length]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleFinding = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange(filteredFindings.map((f) => f.id));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const selectCategory = (categoryFindings: FindingSummary[]) => {
    const categoryIds = categoryFindings.map((f) => f.id);
    const newSelected = [...new Set([...selectedIds, ...categoryIds])];
    onSelectionChange(newSelected);
  };

  const deselectCategory = (categoryFindings: FindingSummary[]) => {
    const categoryIds = categoryFindings.map((f) => f.id);
    const newSelected = selectedIds.filter((id) => !categoryIds.includes(id));
    onSelectionChange(newSelected);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <h4 className="text-sm font-semibold text-gray-900">Select Findings for Report</h4>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {selectedIds.length} of {findings.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={selectAll}
            className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
            Deselect All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {groupedFindings.map(([category, categoryFindings]) => {
          const isExpanded = expandedCategories[category] ?? true;
          const selectedInCategory = categoryFindings.filter((f) =>
            selectedIds.includes(f.id)
          ).length;
          const allSelected = selectedInCategory === categoryFindings.length;
          const someSelected = selectedInCategory > 0 && !allSelected;

          return (
            <div key={category} className="bg-white">
              {/* Category Header */}
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex flex-1 items-center gap-2 text-left">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm font-semibold text-gray-900">{category}</span>
                  <span className="text-xs text-gray-500">
                    ({selectedInCategory}/{categoryFindings.length})
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {!allSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCategory(categoryFindings);
                      }}
                      className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                      Select All
                    </button>
                  )}
                  {someSelected || allSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deselectCategory(categoryFindings);
                      }}
                      className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
                      Deselect All
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Category Findings */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {categoryFindings.map((finding) => {
                    const isSelected = selectedIds.includes(finding.id);
                    return (
                      <div
                        key={finding.id}
                        onClick={() => toggleFinding(finding.id)}
                        className={`flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors ${
                          isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                          }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">
                              {finding.reference_code}
                            </span>
                            <span className="font-medium text-gray-900">{finding.title}</span>
                          </div>
                          {finding.conformity_status && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {finding.conformity_status === "CONFORMITY"
                                ? "Conformity"
                                : finding.conformity_status === "NON_CONFORMITY"
                                  ? "Major Non-Conformity"
                                  : finding.conformity_status === "PARTIAL_CONFORMITY"
                                    ? "Minor Non-Conformity"
                                    : finding.conformity_status}
                            </p>
                          )}
                        </div>
                        <SeverityBadge severity={finding.severity} />
                        <StatusBadge status={finding.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

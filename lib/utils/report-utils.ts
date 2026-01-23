import type { ReportSection } from "@/lib/types/report-types";
import { buildSectionTree, flattenSectionTree } from "./report-hierarchy-utils";

/**
 * Widget data types for risk assessment report
 */
export interface BarChartData {
  categories: string[];
  series: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

export interface PieChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface RiskObjectiveMappingData {
  objectives: Array<{
    id: string;
    label: string;
    shortLabel?: string;
  }>;
  risks: Array<{
    id: string;
    number: number;
    description: string;
    mappedObjectives: string[];
  }>;
}

/**
 * Reorders sections by swapping their order values within the same parent (hierarchy-aware).
 */
export const reorderSections = (
  sections: ReportSection[],
  index: number,
  direction: "up" | "down"
): ReportSection[] => {
  const section = sections[index];
  const parentId = section.parent_section_id;

  // Get siblings (sections with same parent)
  const siblings = sections.filter((s) => s.parent_section_id === parentId);
  const siblingIndex = siblings.findIndex((s) => s.section_id === section.section_id);

  if (direction === "up" && siblingIndex > 0) {
    // Swap with previous sibling
    const prevSibling = siblings[siblingIndex - 1];
    const newSections = sections.map((s) => {
      if (s.section_id === section.section_id) return { ...s, order: prevSibling.order };
      if (s.section_id === prevSibling.section_id) return { ...s, order: section.order };
      return s;
    });

    // Rebuild tree to get proper flat ordering
    const tree = buildSectionTree(newSections);
    return flattenSectionTree(tree);
  } else if (direction === "down" && siblingIndex < siblings.length - 1) {
    // Swap with next sibling
    const nextSibling = siblings[siblingIndex + 1];
    const newSections = sections.map((s) => {
      if (s.section_id === section.section_id) return { ...s, order: nextSibling.order };
      if (s.section_id === nextSibling.section_id) return { ...s, order: section.order };
      return s;
    });

    // Rebuild tree to get proper flat ordering
    const tree = buildSectionTree(newSections);
    return flattenSectionTree(tree);
  }

  return sections;
};

/**
 * Handles drag and drop reordering of sections.
 */
export const dragAndDropSections = (
  sections: ReportSection[],
  draggedId: string,
  targetId: string
): ReportSection[] | null => {
  if (!draggedId || draggedId === targetId) return null;

  const newSections = [...sections];
  const draggedIndex = newSections.findIndex((s) => s.section_id === draggedId);
  const targetIndex = newSections.findIndex((s) => s.section_id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) return null;

  // Remove dragged item
  const [draggedItem] = newSections.splice(draggedIndex, 1);
  // Insert at target index
  newSections.splice(targetIndex, 0, draggedItem);

  // Re-assign order
  return newSections.map((s, i) => ({ ...s, order: i + 1 }));
};

/**
 * Updates a specific widget within a section.
 */
export const updateWidgetInSections = (
  sections: ReportSection[],
  sectionId: string,
  widgetId: string,
  updateFn: (widget: any) => any
): ReportSection[] => {
  return sections.map((s) => {
    if (s.section_id !== sectionId) return s;
    return {
      ...s,
      widgets: s.widgets.map((w) => {
        if (w.instance_id !== widgetId) return w;
        return updateFn(w);
      })
    };
  });
};

/**
 * Auto-populates organization logo into cover page.
 */
export const populateReportLogo = (sections: ReportSection[], logoUrl: string): ReportSection[] => {
  const hasCover = sections.find((s) => s.section_type === "cover_page");
  if (!hasCover) return sections;

  return sections.map((section) => {
    if (section.section_type !== "cover_page") return section;

    try {
      const content = JSON.parse(section.content || "{}");
      const currentLogo = content.organization?.logo_url;

      if (
        currentLogo &&
        !currentLogo.includes("placeholder") &&
        currentLogo !== "/images/infratel-logo.png"
      ) {
        return section;
      }

      const newContent = {
        ...content,
        organization: {
          ...content.organization,
          logo_url: logoUrl
        }
      };
      return {
        ...section,
        content: JSON.stringify(newContent)
      };
    } catch (e) {
      return section;
    }
  });
};

/**
 * Populate widget with pie chart data from API response
 */
export const populatePieChartWidget = (
  sections: ReportSection[],
  sectionId: string,
  widgetId: string,
  slices: PieChartSlice[]
): ReportSection[] => {
  return updateWidgetInSections(sections, sectionId, widgetId, (widget) => ({
    ...widget,
    data: {
      ...widget.data,
      slices
    }
  }));
};

/**
 * Populate widget with bar chart data from API response
 */
export const populateBarChartWidget = (
  sections: ReportSection[],
  sectionId: string,
  widgetId: string,
  data: BarChartData
): ReportSection[] => {
  return updateWidgetInSections(sections, sectionId, widgetId, (widget) => ({
    ...widget,
    data: {
      ...widget.data,
      categories: data.categories,
      series: data.series
    }
  }));
};

/**
 * Populate widget with table data from API response
 */
export const populateTableWidget = (
  sections: ReportSection[],
  sectionId: string,
  widgetId: string,
  rows: any[]
): ReportSection[] => {
  return updateWidgetInSections(sections, sectionId, widgetId, (widget) => ({
    ...widget,
    data: {
      ...widget.data,
      rows
    }
  }));
};

/**
 * Populate risk objective mapping widget with dynamic data
 */
export const populateRiskObjectiveMappingWidget = (
  sections: ReportSection[],
  sectionId: string,
  widgetId: string,
  data: RiskObjectiveMappingData
): ReportSection[] => {
  return updateWidgetInSections(sections, sectionId, widgetId, (widget) => ({
    ...widget,
    data: {
      ...widget.data,
      objectives: data.objectives,
      risks: data.risks
    }
  }));
};

/**
 * Populate all risk widgets in a report with dynamic data
 * Accepts an object mapping widget IDs to their respective data
 */
export const populateRiskWidgets = (
  sections: ReportSection[],
  widgetDataMap: Record<
    string,
    {
      sectionId: string;
      type: "pie_chart" | "bar_chart" | "table" | "risk_objective_mapping";
      data: any;
    }
  >
): ReportSection[] => {
  let updatedSections = [...sections];

  Object.entries(widgetDataMap).forEach(([widgetId, { sectionId, type, data }]) => {
    switch (type) {
      case "pie_chart":
        updatedSections = populatePieChartWidget(updatedSections, sectionId, widgetId, data);
        break;
      case "bar_chart":
        updatedSections = populateBarChartWidget(updatedSections, sectionId, widgetId, data);
        break;
      case "table":
        updatedSections = populateTableWidget(updatedSections, sectionId, widgetId, data);
        break;
      case "risk_objective_mapping":
        updatedSections = populateRiskObjectiveMappingWidget(updatedSections, sectionId, widgetId, data);
        break;
    }
  });

  return updatedSections;
};

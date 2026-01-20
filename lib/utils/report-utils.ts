import type { ReportSection } from "@/lib/types/report-types";

/**
 * Reorders sections by swapping their order values.
 */
export const reorderSections = (
  sections: ReportSection[],
  index: number,
  direction: "up" | "down"
): ReportSection[] => {
  const newSections = [...sections];
  if (direction === "up" && index > 0) {
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
  } else if (direction === "down" && index < newSections.length - 1) {
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
  }

  // Re-assign order based on new index to ensure consistency
  return newSections.map((s, i) => ({ ...s, order: i + 1 }));
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

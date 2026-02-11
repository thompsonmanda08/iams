import { create } from "zustand";
import type {
  ReportContent,
  ReportSection,
  FindingSummary,
  TableColumn,
  DataSource,
  ReportEntityType,
  WidgetInstance
} from "@/lib/types/report-types";
import {
  reorderSections,
  dragAndDropSections,
  updateWidgetInSections
} from "../lib/utils/report-utils";
import {
  normalizeManagementStandard,
  getTemplateForStandard
} from "../components/reports/report-templates";
import {
  calculateTocLevel,
  buildSectionTree,
  flattenSectionTree,
  validateSectionMove
} from "../lib/utils/report-hierarchy-utils";

interface ReportState {
  // Data State
  report: ReportContent | null;
  findings: FindingSummary[];
  dataSources: DataSource[];
  isLoading: boolean;
  entityId: string | null;
  entityType: ReportEntityType | null;

  // UI State
  expandedSections: Record<string, boolean>;
  isAddSectionModalOpen: boolean;
  draggedSectionId: string | null;

  // Actions
  setReport: (report: ReportContent) => void;
  updateReportMetadata: (updates: Partial<ReportContent>) => void;
  setFindings: (findings: FindingSummary[]) => void;
  setDataSources: (dataSources: DataSource[]) => void;
  setLoading: (isLoading: boolean) => void;
  setEntityId: (id: string | null) => void;
  setEntityType: (type: ReportEntityType | null) => void;

  // Section Actions
  addSection: (section: ReportSection) => void;
  updateSection: (id: string, updates: Partial<ReportSection>) => void;
  deleteSection: (id: string) => void;
  toggleSection: (id: string) => void;
  moveSection: (index: number, direction: "up" | "down") => void;
  handleDragStart: (id: string) => void;
  handleDrop: (targetId: string) => void;
  reparentSection: (sectionId: string, newParentId: string | null) => void;
  promoteSection: (sectionId: string) => void;

  // Widget Actions
  addWidget: (sectionId: string, widget: WidgetInstance) => void;
  removeWidget: (sectionId: string, widgetId: string) => void;
  updateWidget: (sectionId: string, widgetId: string, updates: Partial<WidgetInstance>) => void;
  reorderWidgets: (sectionId: string, widgets: WidgetInstance[]) => void;
  updateWidgetColumns: (sectionId: string, widgetId: string, columns: TableColumn[]) => void;
  updateWidgetRows: (sectionId: string, widgetId: string, rows: Record<string, any>[]) => void;
  updateWidgetData: (sectionId: string, widgetId: string, data: any) => void;
  updateWidgetDataSource: (
    sectionId: string,
    widgetId: string,
    dataSource: DataSource | null
  ) => void;
  toggleTableManualOverride: (sectionId: string, widgetId: string, enabled: boolean) => void;

  // UI Actions
  setAddSectionModalOpen: (isOpen: boolean) => void;
  changeManagementStandard: (standard: string) => void;
  resetStore: () => void;
}

const initialState = {
  report: null,
  findings: [],
  dataSources: [],
  isLoading: false,
  entityId: null,
  entityType: null,
  expandedSections: {},
  isAddSectionModalOpen: false,
  draggedSectionId: null
};

export const useReportStore = create<ReportState>((set, get) => ({
  ...initialState,

  setReport: (report) => set({ report }),

  updateReportMetadata: (updates) =>
    set((state) => ({
      report: state.report ? { ...state.report, ...updates } : null
    })),

  setFindings: (findings) => set({ findings }),
  setDataSources: (dataSources) => set({ dataSources }),
  setLoading: (isLoading) => set({ isLoading }),
  setEntityId: (entityId) => set({ entityId }),
  setEntityType: (entityType) => set({ entityType }),

  addSection: (section) =>
    set((state) => {
      if (!state.report) return {};

      // Auto-calculate toc_level based on parent
      const toc_level = calculateTocLevel(section, state.report.sections);

      return {
        report: {
          ...state.report,
          sections: [...state.report.sections, { ...section, toc_level }]
        },
        expandedSections: { ...state.expandedSections, [section.section_id]: true }
      };
    }),

  updateSection: (id, updates) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: state.report.sections.map((s) =>
            s.section_id === id ? { ...s, ...updates } : s
          )
        }
      };
    }),

  deleteSection: (id) =>
    set((state) => {
      if (!state.report) return {};

      // Find section being deleted
      const sectionToDelete = state.report.sections.find((s) => s.section_id === id);
      if (!sectionToDelete) return {};

      // Promote children to grandparent level (orphan protection)
      const updatedSections = state.report.sections
        .filter((s) => s.section_id !== id) // Remove deleted section
        .map((s) => {
          if (s.parent_section_id === id) {
            // Promote child to parent's parent
            const promoted = { ...s, parent_section_id: sectionToDelete.parent_section_id };
            return {
              ...promoted,
              toc_level: calculateTocLevel(promoted, state.report!.sections)
            };
          }
          return s;
        });

      // Clean up expanded state
      const newExpandedSections = { ...state.expandedSections };
      delete newExpandedSections[id];

      return {
        report: { ...state.report, sections: updatedSections },
        expandedSections: newExpandedSections
      };
    }),

  toggleSection: (id) =>
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [id]: !state.expandedSections[id]
      }
    })),

  moveSection: (index, direction) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: reorderSections(state.report.sections, index, direction)
        }
      };
    }),

  handleDragStart: (id) => set({ draggedSectionId: id }),

  handleDrop: (targetId) =>
    set((state) => {
      if (!state.draggedSectionId || !state.report) return {};
      const newSections = dragAndDropSections(
        state.report.sections,
        state.draggedSectionId,
        targetId
      );
      if (!newSections) return { draggedSectionId: null };

      return {
        report: { ...state.report, sections: newSections },
        draggedSectionId: null
      };
    }),

  reparentSection: (sectionId, newParentId) =>
    set((state) => {
      if (!state.report) return {};

      // Validate move
      const validation = validateSectionMove(sectionId, newParentId, state.report.sections);
      if (!validation.isValid) {
        console.error("Invalid move:", validation.error);
        return {};
      }

      // Update parent and recalculate toc_level
      const updatedSections = state.report.sections.map((s) => {
        if (s.section_id === sectionId) {
          const updated = { ...s, parent_section_id: newParentId };
          return {
            ...updated,
            toc_level: calculateTocLevel(updated, state.report!.sections)
          };
        }
        return s;
      });

      // Rebuild tree and flatten for proper ordering
      const tree = buildSectionTree(updatedSections);
      const flatSections = flattenSectionTree(tree);

      return {
        report: { ...state.report, sections: flatSections }
      };
    }),

  promoteSection: (sectionId) => {
    const state = get();
    if (!state.report) return;

    const section = state.report.sections.find((s) => s.section_id === sectionId);
    if (!section || !section.parent_section_id) return;

    // Find grandparent
    const parent = state.report.sections.find((s) => s.section_id === section.parent_section_id);
    const grandparentId = parent?.parent_section_id || null;

    // Use reparent action
    get().reparentSection(sectionId, grandparentId);
  },

  // Widget CRUD Actions
  addWidget: (sectionId, widget) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: state.report.sections.map((s) => {
            if (s.section_id !== sectionId) return s;
            const newOrder = s.widgets.length;
            return {
              ...s,
              widgets: [...s.widgets, { ...widget, order: newOrder }]
            };
          })
        }
      };
    }),

  removeWidget: (sectionId, widgetId) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: state.report.sections.map((s) => {
            if (s.section_id !== sectionId) return s;
            return {
              ...s,
              widgets: s.widgets
                .filter((w) => w.instance_id !== widgetId)
                .map((w, i) => ({ ...w, order: i })) // Re-order remaining widgets
            };
          })
        }
      };
    }),

  updateWidget: (sectionId, widgetId, updates) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: state.report.sections.map((s) => {
            if (s.section_id !== sectionId) return s;
            return {
              ...s,
              widgets: s.widgets.map((w) =>
                w.instance_id === widgetId ? { ...w, ...updates } : w
              )
            };
          })
        }
      };
    }),

  reorderWidgets: (sectionId, widgets) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: state.report.sections.map((s) =>
            s.section_id === sectionId
              ? { ...s, widgets: widgets.map((w, i) => ({ ...w, order: i })) }
              : s
          )
        }
      };
    }),

  updateWidgetColumns: (sectionId, widgetId, columns) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: updateWidgetInSections(state.report.sections, sectionId, widgetId, (w) => ({
            ...w,
            data: { ...w.data, columns }
          }))
        }
      };
    }),

  updateWidgetRows: (sectionId, widgetId, rows) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: updateWidgetInSections(state.report.sections, sectionId, widgetId, (w) => ({
            ...w,
            data: { ...w.data, rows }
          }))
        }
      };
    }),

  updateWidgetData: (sectionId, widgetId, data) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: updateWidgetInSections(state.report.sections, sectionId, widgetId, (w) => ({
            ...w,
            data
          }))
        }
      };
    }),

  updateWidgetDataSource: (sectionId, widgetId, dataSource) =>
    set((state) => {
      if (!state.report) return {};

      return {
        report: {
          ...state.report,
          sections: state.report.sections.map((s) => {
            if (s.section_id !== sectionId) return s;

            return {
              ...s,
              widgets: s.widgets.map((w) => {
                if (w.instance_id !== widgetId) return w;

                // If a valid data source is selected, update the reference
                // Note: Actual data should be fetched separately using the data source ID
                if (dataSource) {
                  return {
                    ...w,
                    data: {
                      ...w.data,
                      title: dataSource.name,
                      data_source_id: dataSource.id,
                      is_manual_override: false
                    }
                  };
                } else {
                  // Reset to manual/empty if disconnected
                  return {
                    ...w,
                    data: {
                      ...w.data,
                      data_source_id: undefined,
                      is_manual_override: false
                    }
                  };
                }

                return w;
              })
            };
          })
        }
      };
    }),

  toggleTableManualOverride: (sectionId, widgetId, enabled) =>
    set((state) => {
      if (!state.report) return {};
      return {
        report: {
          ...state.report,
          sections: updateWidgetInSections(state.report.sections, sectionId, widgetId, (w) => ({
            ...w,
            data: { ...w.data, is_manual_override: enabled }
          }))
        }
      };
    }),

  setAddSectionModalOpen: (isOpen) => set({ isAddSectionModalOpen: isOpen }),

  changeManagementStandard: (newValue) =>
    set((state) => {
      if (!state.report) return {};

      // Normalize the management standard and get the template
      const normalizedStandard = normalizeManagementStandard(newValue);
      const template = getTemplateForStandard(newValue);

      // Preserve cover page content if it exists
      const currentCover = state.report.sections.find((s) => s.section_type === "cover_page");
      const newSections = template.default_sections.map((s) => {
        if (s.section_type === "cover_page" && currentCover) {
          return { ...s, content: currentCover.content };
        }
        return s;
      });

      return {
        report: {
          ...state.report,
          management_standard: normalizedStandard,
          report_type: template.type,
          sections: newSections
        }
      };
    }),

  resetStore: () => set(initialState)
}));

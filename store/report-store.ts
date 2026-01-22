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
      return {
        report: {
          ...state.report,
          sections: [...state.report.sections, section]
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
      const newExpandedSections = { ...state.expandedSections };
      delete newExpandedSections[id];

      return {
        report: {
          ...state.report,
          sections: state.report.sections.filter((s) => s.section_id !== id)
        },
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

                // If a valid data source is selected, inject its sample data
                if (dataSource) {
                  const widgetTypeKey = w.widget_type as keyof typeof dataSource.sample_data;
                  const sampleData = dataSource.sample_data[widgetTypeKey];

                  if (sampleData) {
                    if (w.widget_type === "table") {
                      const sampleTable = dataSource.sample_data.table || dataSource.sample_data;
                      const rawColumns = sampleTable.columns || [];

                      // Ensure columns are objects { key, header }
                      const columns = rawColumns.map((col: any) => {
                        if (typeof col === "string") {
                          return { key: col.toLowerCase().replace(/\s+/g, "_"), header: col };
                        }
                        return col;
                      });

                      return {
                        ...w,
                        data: {
                          ...w.data,
                          ...sampleTable,
                          columns,
                          title: dataSource.name,
                          data_source_id: dataSource.id
                        }
                      };
                    } else if (w.widget_type === "pie_chart") {
                      return {
                        ...w,
                        data: {
                          ...w.data,
                          slices: sampleData,
                          title: dataSource.name,
                          data_source_id: dataSource.id
                        }
                      };
                    } else if (w.widget_type === "bar_chart") {
                      return {
                        ...w,
                        data: {
                          ...w.data,
                          ...sampleData,
                          title: dataSource.name,
                          data_source_id: dataSource.id
                        }
                      };
                    } else if (w.widget_type === "line_chart" || w.widget_type === "area_chart") {
                      return {
                        ...w,
                        data: {
                          ...w.data,
                          ...sampleData,
                          title: dataSource.name,
                          data_source_id: dataSource.id
                        }
                      };
                    } else {
                      // For other widget types, merge the sample data directly
                      return {
                        ...w,
                        data: {
                          ...w.data,
                          ...sampleData,
                          title: dataSource.name,
                          data_source_id: dataSource.id
                        }
                      };
                    }
                  }
                } else {
                  // Reset to manual/empty if disconnected
                  return {
                    ...w,
                    data: {
                      ...w.data,
                      data_source_id: undefined
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

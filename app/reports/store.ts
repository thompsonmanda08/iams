import { create } from "zustand";
import { ReportContent, ReportSection, FindingSummary, TableColumn, DataSource } from "./types";
import { reorderSections, dragAndDropSections, updateWidgetInSections } from "./utils";
import { REPORT_TEMPLATES } from "./report-templates";

interface ReportState {
  // Data State
  report: ReportContent | null;
  findings: FindingSummary[];
  dataSources: DataSource[];
  isLoading: boolean;

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

  // Section Actions
  addSection: (section: ReportSection) => void;
  updateSection: (id: string, updates: Partial<ReportSection>) => void;
  deleteSection: (id: string) => void;
  toggleSection: (id: string) => void;
  moveSection: (index: number, direction: "up" | "down") => void;
  handleDragStart: (id: string) => void;
  handleDrop: (targetId: string) => void;

  // Widget Actions
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
}

export const useReportStore = create<ReportState>((set, get) => ({
  report: null,
  findings: [],
  dataSources: [],
  isLoading: false,
  expandedSections: {},
  isAddSectionModalOpen: false,
  draggedSectionId: null,

  setReport: (report) => set({ report }),

  updateReportMetadata: (updates) =>
    set((state) => ({
      report: state.report ? { ...state.report, ...updates } : null
    })),

  setFindings: (findings) => set({ findings }),
  setDataSources: (dataSources) => set({ dataSources }),
  setLoading: (isLoading) => set({ isLoading }),

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
                          columns, // Use normalized columns
                          title: dataSource.name,
                          data_source_id: dataSource.id
                        }
                      };
                    } else if (w.widget_type === "pie_chart") {
                      return {
                        ...w,
                        data: {
                          ...w.data, // keep existing type info
                          slices: sampleData,
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
      const template = REPORT_TEMPLATES[newValue];
      if (!template) return {};

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
          management_standard: newValue,
          report_type: template.type,
          sections: newSections
        }
      };
    })
}));

import React, { useState } from "react";
import {
  Plus,
  X,
  GripVertical,
  FileText,
  PieChart,
  AlertCircle,
  Edit2,
  CheckCircle
} from "lucide-react";
import { ReportSection, SectionType, TableColumn, WidgetInstance, TableWidgetData } from "@/lib/types/report-types";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (section: ReportSection) => void;
  existingSectionsCount: number;
}

export const AddSectionModal = ({
  isOpen,
  onClose,
  onAdd,
  existingSectionsCount
}: AddSectionModalProps) => {
  const [sectionType, setSectionType] = useState<SectionType>("text_only");
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [includeInToc, setIncludeInToc] = useState(true);
  const [tocLevel, setTocLevel] = useState<1 | 2 | 3>(1);
  const [addTable, setAddTable] = useState(false);
  const [addPieChart, setAddPieChart] = useState(false);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([
    { key: "column_1", header: "Column 1" },
    { key: "column_2", header: "Column 2" }
  ]);
  const [newColumnHeader, setNewColumnHeader] = useState("");

  if (!isOpen) return null;

  const addColumn = () => {
    if (!newColumnHeader.trim()) return;
    const key = newColumnHeader.toLowerCase().replace(/\s+/g, "_");
    setTableColumns([...tableColumns, { key, header: newColumnHeader }]);
    setNewColumnHeader("");
  };

  const removeColumn = (key: string) => {
    setTableColumns(tableColumns.filter((c) => c.key !== key));
  };

  const handleSubmit = () => {
    if (!header.trim()) return;

    const widgets: WidgetInstance[] = [];

    // Logic for creating initial widgets based on user selection
    if (
      sectionType === "text_with_widgets" ||
      sectionType === "findings_selector" ||
      sectionType === "cover_page"
    ) {
      if (
        addTable ||
        sectionType === "findings_selector" ||
        (sectionType === "cover_page" && addTable)
      ) {
        widgets.push({
          instance_id: `widget-table-${Date.now()}`,
          widget_type: "table",
          order: 0,
          data: {
            title: "Data Table",
            is_configurable: true,
            columns: tableColumns,
            rows: []
          } as TableWidgetData
        });
      }

      if (addPieChart && sectionType === "text_with_widgets") {
        widgets.push({
          instance_id: `widget-pie-${Date.now()}`,
          widget_type: "pie_chart",
          order: 1,
          data: {
            title: "Pie Chart",
            slices: [
              { label: "Segment A", value: 30, color: "#3b82f6" },
              { label: "Segment B", value: 70, color: "#10b981" }
            ]
          }
        });
      }
    }

    const newSection: ReportSection = {
      section_id: `section-${Date.now()}`,
      section_type: sectionType,
      order: existingSectionsCount + 1,
      include_in_toc: includeInToc,
      toc_level: tocLevel,
      header,
      sub_header: subHeader,
      content: "",
      widgets
    };

    // Inject sample schema for verification
    if (sectionType === "dynamic_form") {
      newSection.fields = [
        {
          id: `field-${Date.now()}-1`,
          name: "auditee_contact",
          label: "Auditee Contact Person",
          type: "text",
          required: true,
          placeholder: "e.g., John Doe"
        },
        {
          id: `field-${Date.now()}-2`,
          name: "audit_date",
          label: "Date of Audit",
          type: "date",
          required: true
        },
        {
          id: `field-${Date.now()}-3`,
          name: "department_type",
          label: "Department Type",
          type: "select",
          required: false,
          options: [
            { label: "IT Operations", value: "it_ops" },
            { label: "Finance", value: "finance" },
            { label: "HR", value: "hr" }
          ]
        }
      ];
      newSection.field_values = {};
    }

    onAdd(newSection);
    onClose();
  };

  const SECTION_TYPES: { type: SectionType; label: string; icon: any; desc: string }[] = [
    {
      type: "text_only",
      label: "Text Only",
      icon: Edit2,
      desc: "Simple text content block"
    },
    {
      type: "text_with_widgets",
      label: "Text + Widgets",
      icon: PieChart,
      desc: "Text content with charts/tables"
    },
    {
      type: "findings_selector",
      label: "Findings Selector",
      icon: AlertCircle,
      desc: "Select and display audit findings"
    },
    {
      type: "compliance_findings",
      label: "Compliance Findings",
      icon: CheckCircle,
      desc: "ISO/Compliance specific finding lists"
    },
    {
      type: "cover_page",
      label: "Cover Page",
      icon: FileText,
      desc: "Report title page with logo"
    },
    {
      type: "dynamic_form",
      label: "Dynamic Form",
      icon: FileText,
      desc: "Structured form input fields"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900">Add New Section</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Section Type
                </label>
                <div className="space-y-2">
                  {SECTION_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => setSectionType(t.type)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        sectionType === t.type
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                      }`}>
                      <div
                        className={`rounded-lg p-2 ${
                          sectionType === t.type
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                        <t.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-medium ${
                            sectionType === t.type ? "text-blue-900" : "text-gray-900"
                          }`}>
                          {t.label}
                        </div>
                        <div className="text-xs text-gray-500">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Header</label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="e.g. Executive Summary"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {sectionType !== "cover_page" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sub-Header</label>
                  <input
                    type="text"
                    value={subHeader}
                    onChange={(e) => setSubHeader(e.target.value)}
                    placeholder="e.g. Overview"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeInToc}
                    onChange={(e) => setIncludeInToc(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Include in TOC</span>
                </label>

                {includeInToc && (
                  <select
                    value={tocLevel}
                    onChange={(e) => setTocLevel(Number(e.target.value) as 1 | 2 | 3)}
                    className="rounded border border-gray-300 py-1 text-sm focus:border-blue-500 focus:outline-none">
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                  </select>
                )}
              </div>

              {(sectionType === "text_with_widgets" || sectionType === "cover_page") && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Initial Widgets
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addTable}
                        onChange={(e) => setAddTable(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Add Table</span>
                    </label>

                    {addTable && (
                      <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-3">
                        <div className="text-xs font-medium text-gray-500 uppercase">Columns</div>
                        <div className="flex flex-wrap gap-2">
                          {tableColumns.map((col) => (
                            <span
                              key={col.key}
                              className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200">
                              {col.header}
                              <button
                                onClick={() => removeColumn(col.key)}
                                className="text-gray-400 hover:text-red-500">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newColumnHeader}
                            onChange={(e) => setNewColumnHeader(e.target.value)}
                            placeholder="New column..."
                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            onClick={addColumn}
                            disabled={!newColumnHeader.trim()}
                            className="rounded bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {sectionType === "text_with_widgets" && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addPieChart}
                          onChange={(e) => setAddPieChart(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Add Pie Chart</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!header.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
            Create Section
          </button>
        </div>
      </div>
    </div>
  );
};

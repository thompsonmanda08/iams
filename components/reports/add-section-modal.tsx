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
import { getEligibleParents, getSectionDepth } from "@/lib/utils/report-hierarchy-utils";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (section: ReportSection) => void;
  existingSections: ReportSection[];
}

export const AddSectionModal = ({
  isOpen,
  onClose,
  onAdd,
  existingSections
}: AddSectionModalProps) => {
  const [sectionType, setSectionType] = useState<SectionType>("text_only");
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [includeInToc, setIncludeInToc] = useState(true);
  const [parentSectionId, setParentSectionId] = useState<string | null>(null);
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
      order: existingSections.length + 1,
      include_in_toc: includeInToc,
      toc_level: 1, // Will be recalculated by store
      header,
      sub_header: subHeader,
      content: "",
      widgets,
      parent_section_id: parentSectionId
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
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h3 className="text-xl font-bold text-foreground">Add New Section</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Section Type
                </label>
                <div className="space-y-2">
                  {SECTION_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => setSectionType(t.type)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        sectionType === t.type
                          ? "border-primary bg-primary/10 ring-1 ring-primary dark:bg-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}>
                      <div
                        className={`rounded-lg p-2 ${
                          sectionType === t.type
                            ? "bg-primary/20 text-primary dark:bg-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}>
                        <t.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-medium ${
                            sectionType === t.type ? "text-primary" : "text-foreground"
                          }`}>
                          {t.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Header</label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="e.g. Executive Summary"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>

              {sectionType !== "cover_page" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Sub-Header</label>
                  <input
                    type="text"
                    value={subHeader}
                    onChange={(e) => setSubHeader(e.target.value)}
                    placeholder="e.g. Overview"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                  />
                </div>
              )}

              {/* Parent Section Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Parent Section (Optional)
                </label>
                <select
                  value={parentSectionId || ""}
                  onChange={(e) => setParentSectionId(e.target.value || null)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">None (Top Level)</option>
                  {getEligibleParents(existingSections).map((section) => (
                    <option key={section.section_id} value={section.section_id}>
                      {section.header}
                      {section.parent_section_id && " (Level 2)"}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select a parent section to create a subsection. Only Level 1 and Level 2 sections can have children.
                </p>
              </div>

              {/* Include in TOC Checkbox */}
              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeInToc}
                    onChange={(e) => setIncludeInToc(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="text-sm font-medium text-foreground">Include in TOC</span>
                </label>

                {/* Preview of calculated level */}
                {includeInToc && (
                  <div className="ml-auto rounded bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <strong>Preview:</strong> This will be a Level{" "}
                    {parentSectionId
                      ? Math.min(getSectionDepth({ parent_section_id: parentSectionId } as any, existingSections) + 2, 3)
                      : 1}{" "}
                    section
                  </div>
                )}
              </div>

              {(sectionType === "text_with_widgets" || sectionType === "cover_page") && (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <h4 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Initial Widgets
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addTable}
                        onChange={(e) => setAddTable(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">Add Table</span>
                    </label>

                    {addTable && (
                      <div className="ml-6 space-y-2 border-l-2 border-border pl-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase">Columns</div>
                        <div className="flex flex-wrap gap-2">
                          {tableColumns.map((col) => (
                            <span
                              key={col.key}
                              className="inline-flex items-center gap-1 rounded bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-border">
                              {col.header}
                              <button
                                onClick={() => removeColumn(col.key)}
                                className="text-muted-foreground hover:text-destructive">
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
                            className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <button
                            onClick={addColumn}
                            disabled={!newColumnHeader.trim()}
                            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
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
                          className="rounded border-input text-primary focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">Add Pie Chart</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 p-6">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!header.trim()}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50">
            Create Section
          </button>
        </div>
      </div>
    </div>
  );
};

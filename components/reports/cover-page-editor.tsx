import React, { useMemo, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useSystemSetup } from "@/hooks/use-users-query-data";
import { useReportStore } from "@/store/report-store";
import { Trash2, Plus, Settings2, X, GripVertical } from "lucide-react";
import { format, formatDate } from "date-fns";

interface TableColumn {
  key: string;
  header: string;
}

interface CoverPageData {
  report_title: string;
  report_date: string;
  report_subtitle: string;
  footer_label: string;
  footer_value: string;
  organization: {
    name: string;
    logo_url?: string;
    tagline?: string;
  };
  cover_page_table?: {
    columns: TableColumn[];
    rows: Record<string, any>[];
  };
}

export const CoverPageEditor = ({
  data,
  onChange
}: {
  data: string;
  onChange: (data: string) => void;
}) => {
  const { data: session } = useSystemSetup(true);
  const report = useReportStore((state) => state.report);
  const hasPrefilled = useRef(false);

  const [newColumnHeader, setNewColumnHeader] = useState("");
  const [isEditingColumns, setIsEditingColumns] = useState(false);

  const parsedData: CoverPageData = useMemo(() => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      // Ensure specific fields exist to prevent runtime errors
      // Use session data as fallback for organization fields
      const sessionOrg = session?.data;
      return {
        report_title: parsed.report_title || parsed.title || "",
        report_subtitle: parsed.report_subtitle || parsed.subtitle || "",
        footer_label: parsed.footer_label || parsed.footer_label || "",
        footer_value: parsed.footer_value || parsed.footer_value || "",
        report_date: parsed.report_date || parsed.date || report?.created_at || "",
        organization: {
          name: parsed.organization?.name?.trim() || sessionOrg?.organisation_name || "",
          tagline: parsed.organization?.tagline?.trim() || sessionOrg?.tagline || "",
          logo_url: parsed.organization?.logo_url?.trim() || parsed.logoUrl?.trim() || sessionOrg?.logo_url || ""
        },
        author:
          typeof parsed.author === "string"
            ? { name: parsed.author }
            : {
                name: parsed.author?.name || "",
                certification: parsed.author?.certification || "",
                title: parsed.author?.title || ""
              },
        cover_page_table: parsed.cover_page_table || { columns: [], rows: [] }
      };
    } catch (e) {
      // Use session data as fallback even on parse error
      const sessionOrg = session?.data;
      return {
        report_title: "",
        report_date: report?.created_at || "",
        report_subtitle: "",
        footer_label: "",
        footer_value: "",
        organization: {
          name: sessionOrg?.organisation_name || "",
          tagline: sessionOrg?.tagline || "",
          logo_url: sessionOrg?.logo_url || ""
        },
        author: { name: "", certification: "" },
        cover_page_table: { columns: [], rows: [] }
      };
    }
  }, [data, session?.data, report?.created_at]);

  // Persist session data to stored data once when session loads
  // This ensures the data is saved even if user doesn't edit anything
  useEffect(() => {
    if (hasPrefilled.current) return;
    if (!session?.data) return;

    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const org = parsed?.organization || {};
      let needsUpdate = false;
      const updated = { ...parsed, organization: { ...org } };

      // Persist organization name from session if not already set
      if (!org.name?.trim() && session.data.organisation_name) {
        updated.organization.name = session.data.organisation_name;
        needsUpdate = true;
      }

      // Persist logo_url from session if not already set
      if (!org.logo_url?.trim() && session.data.logo_url) {
        updated.organization.logo_url = session.data.logo_url;
        needsUpdate = true;
      }

      // Persist tagline from session if not already set
      if (!org.tagline?.trim() && session.data.tagline) {
        updated.organization.tagline = session.data.tagline;
        needsUpdate = true;
      }

      // Persist report_date from report created_at if not already set
      if (!parsed.report_date?.trim() && report?.created_at) {
        updated.report_date = report.created_at;
        needsUpdate = true;
      }

      if (needsUpdate) {
        hasPrefilled.current = true;
        // Use setTimeout to avoid state update during render
        setTimeout(() => onChange(JSON.stringify(updated)), 0);
      } else {
        // Mark as prefilled even if no update needed to prevent re-running
        hasPrefilled.current = true;
      }
    } catch {
      // Ignore parse errors
    }
  }, [session?.data, report?.created_at, data, onChange]);

  const updateField = (path: string, value: any) => {
    const newData = { ...parsedData };
    const keys = path.split(".");
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(JSON.stringify(newData));
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Cover Page Details
          </h4>

          <div className="space-y-3">
            <Input
              label="Report Title"
              type="text"
              value={parsedData.report_title}
              onChange={(e) => updateField("report_title", e.target.value)}
              className="font-semibold"
            />
            <Input
              label="Report Subtitle"
              type="text"
              value={parsedData.report_subtitle}
              onChange={(e) => updateField("report_subtitle", e.target.value)}
              className="font-semibold"
            />
            <Input
              label="Report Date"
              type="text"
              disabled
              value={format(
                parsedData.report_date || report?.created_at || new Date(),
                "MMM d, yyyy"
              )}
              className="cursor-not-allowed opacity-70"
            />
          </div>
        </div>
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Organization Details
          </h4>
          <div className="space-y-3">
            <Input
              label="Name"
              type="text"
              value={parsedData.organization.name}
              onChange={(e) => updateField("organization.name", e.target.value)}
            />
            <Input
              label="Tagline"
              type="text"
              value={parsedData.organization.tagline}
              onChange={(e) => updateField("organization.tagline", e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Logo
          </h4>
          <div className="space-y-3">
            <Input
              label="Logo URL"
              type="text"
              value={parsedData.organization.logo_url || ""}
              onChange={(e) => updateField("organization.logo_url", e.target.value)}
              placeholder="https://..."
            />
            {parsedData.organization.logo_url && (
              <div className="border-border bg-card flex items-center justify-center rounded-lg border p-4">
                <img
                  src={parsedData.organization.logo_url}
                  alt="Logo Preview"
                  className="max-h-24 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Footer Details
          </h4>
          <div className="space-y-3">
            <Input
              label="Label"
              type="text"
              value={parsedData.footer_label}
              onChange={(e) => updateField("footer_label", e.target.value)}
            />

            <Input
              label="Value"
              type="text"
              value={parsedData.footer_value}
              onChange={(e) => updateField("footer_value", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cover Page Table Configuration */}
      <div className="col-span-full">
        <div className="bg-card border-border rounded-lg border">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4 text-blue-600" />
              Cover Page Information Table
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingColumns(!isEditingColumns)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  isEditingColumns ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}>
                <Settings2 className="h-3 w-3" />
                {isEditingColumns ? "Done" : "Configure Columns"}
              </button>
              {(parsedData.cover_page_table?.columns || []).length > 0 && (
                <button
                  onClick={() => {
                    const newRow = parsedData.cover_page_table!.columns.reduce(
                      (acc, col) => ({ ...acc, [col.key]: "" }),
                      {} as Record<string, any>
                    );
                    const updatedTable = {
                      ...parsedData.cover_page_table,
                      rows: [...(parsedData.cover_page_table?.rows || []), newRow]
                    };
                    updateField("cover_page_table", updatedTable);
                  }}
                  className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100">
                  <Plus className="h-3 w-3" />
                  Add Row
                </button>
              )}
            </div>
          </div>

          {/* Column Configuration Section */}
          {isEditingColumns && (
            <div className="bg-muted border-border border-b px-4 py-3">
              <div className="text-muted-foreground mb-2 text-xs font-medium">Current Columns:</div>
              <div className="mb-3 flex flex-wrap gap-2">
                {parsedData.cover_page_table?.columns &&
                parsedData.cover_page_table.columns.length > 0 ? (
                  parsedData.cover_page_table.columns.map((col) => (
                    <span
                      key={col.key}
                      className="bg-card border-border inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm shadow-sm">
                      <GripVertical className="text-muted-foreground h-3 w-3 cursor-move" />
                      {col.header}
                      <button
                        onClick={() => {
                          const updatedTable = {
                            ...parsedData.cover_page_table,
                            columns: parsedData.cover_page_table!.columns.filter(
                              (c) => c.key !== col.key
                            ),
                            rows: parsedData.cover_page_table!.rows.map((row) => {
                              const newRow = { ...row };
                              delete newRow[col.key];
                              return newRow;
                            })
                          };
                          updateField("cover_page_table", updatedTable);
                        }}
                        className="text-muted-foreground ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs italic">No columns yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColumnHeader}
                  onChange={(e) => setNewColumnHeader(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!newColumnHeader.trim()) return;
                      const newKey = newColumnHeader.toLowerCase().replace(/\s+/g, "_");
                      const updatedTable = {
                        ...parsedData.cover_page_table,
                        columns: [
                          ...(parsedData.cover_page_table?.columns || []),
                          { key: newKey, header: newColumnHeader }
                        ]
                      };
                      updateField("cover_page_table", updatedTable);
                      setNewColumnHeader("");
                    }
                  }}
                  placeholder="New column header..."
                  className="bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary flex-1 rounded border px-3 py-1.5 text-sm focus:ring-1 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!newColumnHeader.trim()) return;
                    const newKey = newColumnHeader.toLowerCase().replace(/\s+/g, "_");
                    const updatedTable = {
                      ...parsedData.cover_page_table,
                      columns: [
                        ...(parsedData.cover_page_table?.columns || []),
                        { key: newKey, header: newColumnHeader }
                      ]
                    };
                    updateField("cover_page_table", updatedTable);
                    setNewColumnHeader("");
                  }}
                  disabled={!newColumnHeader.trim()}
                  className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-border border-b">
                  {parsedData.cover_page_table?.columns &&
                  parsedData.cover_page_table.columns.length > 0 ? (
                    <>
                      {parsedData.cover_page_table.columns.map((col) => (
                        <th
                          key={col.key}
                          className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          {col.header}
                        </th>
                      ))}
                      <th className="w-10 px-4 py-3"></th>
                    </>
                  ) : (
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Column
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {parsedData.cover_page_table?.rows &&
                parsedData.cover_page_table.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={(parsedData.cover_page_table?.columns?.length || 1) + 1}
                      className="text-muted-foreground px-4 py-8 text-center">
                      {(parsedData.cover_page_table?.columns || []).length > 0
                        ? "No data yet. Click 'Add Row' to get started."
                        : "Configure columns first to add rows."}
                    </td>
                  </tr>
                ) : (
                  parsedData.cover_page_table?.rows?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="group hover:bg-muted/50">
                      {parsedData.cover_page_table!.columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          <input
                            type="text"
                            value={row[col.key] || ""}
                            onChange={(e) => {
                              const updatedRows = [...parsedData.cover_page_table!.rows];
                              updatedRows[rowIndex] = {
                                ...updatedRows[rowIndex],
                                [col.key]: e.target.value
                              };
                              const updatedTable = {
                                ...parsedData.cover_page_table,
                                rows: updatedRows
                              };
                              updateField("cover_page_table", updatedTable);
                            }}
                            className="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-none"
                            placeholder="..."
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => {
                            const updatedTable = {
                              ...parsedData.cover_page_table,
                              rows: parsedData.cover_page_table!.rows.filter(
                                (_, i) => i !== rowIndex
                              )
                            };
                            updateField("cover_page_table", updatedTable);
                          }}
                          className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

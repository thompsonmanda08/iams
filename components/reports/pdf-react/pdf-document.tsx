import React from "react";
import { Document, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import {
  ReportContent,
  FindingSummary,
  GeneralFindingSummary,
  GeneralFindingsConfig,
  ReportSection
} from "@/lib/types/report-types";
import { getEffectiveOrientation } from "@/lib/utils/report-utils";
import { DetailedCoverPage } from "./cover-page";

// Define styles
const createStyles = (primaryColor: string, secondaryColor: string) =>
  StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 11,
      fontFamily: "Helvetica",
      color: "#1e293b"
    },
    coverPage: {
      padding: 60,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      backgroundColor: primaryColor
    },
    coverTitle: {
      fontSize: 36,
      fontWeight: "bold",
      color: "white",
      marginBottom: 20,
      textAlign: "center"
    },
    coverSubtitle: {
      fontSize: 18,
      color: "white",
      marginBottom: 40,
      textAlign: "center",
      opacity: 0.9
    },
    coverMetadata: {
      fontSize: 12,
      color: "white",
      marginTop: 60,
      opacity: 0.8
    },
    tocTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 30,
      color: primaryColor,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      borderBottomStyle: "solid",
      paddingBottom: 10
    },
    tocItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#cbd5e1",
      borderBottomStyle: "dotted"
    },
    tocItemTitle: {
      flex: 1
    },
    tocItemPage: {
      marginLeft: 20,
      color: secondaryColor
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 6,
      marginTop: 30,
      color: primaryColor
    },
    sectionTitleDivider: {
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      borderBottomStyle: "solid",
      marginBottom: 14
    },
    sectionSubHeader: {
      fontSize: 12,
      color: secondaryColor,
      marginBottom: 10,
      fontStyle: "italic"
    },
    sectionContent: {
      marginTop: 20
    },
    widgetTitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 15,
      marginTop: 20,
      color: primaryColor
    },
    table: {
      marginVertical: 15
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      minHeight: 28
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: primaryColor,
      color: "white",
      fontWeight: "bold",
      minHeight: 32
    },
    ObjTableHeader: {
      flexDirection: "row",
      backgroundColor: primaryColor,
      color: "white",
      fontWeight: "bold",
      minHeight: "10%"
    },
    tableCell: {
      padding: 10,
      flex: 1,
      fontSize: 10
    },
    tableCellHeader: {
      padding: 10,
      flex: 1,
      fontSize: 10,
      fontWeight: "bold",
      color: "white"
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 7,
      fontWeight: "bold"
    },
    badgeConformity: {
      backgroundColor: "#dcfce7",
      color: "#166534"
    },
    badgeMajor: {
      backgroundColor: "#fee2e2",
      color: "#991b1b"
    },
    badgeMinor: {
      backgroundColor: "#fef3c7",
      color: "#92400e"
    },
    textContent: {
      textAlign: "justify",
      fontSize: 12,
      lineHeight: 1.5
    },
    watermark: {
      position: "absolute",
      fontSize: 80,
      fontWeight: "bold",
      color: "rgba(200, 200, 200, 0.25)",
      transform: "rotate(-45deg)",
      top: "50%",
      left: "50%",
      marginLeft: -200,
      marginTop: -100,
      zIndex: -1
    }
  });

interface PDFDocumentProps {
  report: ReportContent;
  findings: FindingSummary[];
  generalFindings?: GeneralFindingSummary[];
  generalFindingsConfig?: GeneralFindingsConfig | null;
  workpaperMetadata?: { work_done: string; conclusion: string } | null;
}

// ─── General Findings PDF Helpers ────────────────────────────────────────────

function getColumnValuePdf(finding: GeneralFindingSummary, colKey: string): string {
  for (const col of finding.columns ?? []) {
    if (col.key === colKey) return col.value ?? "—";
    if ((col as any)[colKey] !== undefined) return String((col as any)[colKey]) || "—";
  }
  return "—";
}

function getKeyValuePdf(finding: GeneralFindingSummary, keyKey: string): any {
  for (const k of finding.keys ?? []) {
    if (k.key === keyKey) return k.value ?? null;
    if ((k as any)[keyKey] !== undefined) return (k as any)[keyKey];
  }
  return null;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  report,
  findings,
  generalFindings = [],
  generalFindingsConfig,
  workpaperMetadata
}) => {
  const primaryColor = report.branding?.primary_color || "#1e40af";
  const secondaryColor = report.branding?.secondary_color || "#64748b";
  const styles = createStyles(primaryColor, secondaryColor);

  const getConformityLabel = (status: string) => {
    switch (status) {
      case "CONFORMITY":
        return "Conformity";
      case "NON_CONFORMITY":
        return "Major Non-Conformity";
      case "PARTIAL_CONFORMITY":
        return "Minor Non-Conformity";
      default:
        return status;
    }
  };

  const getConformityStyle = (status: string) => {
    switch (status) {
      case "CONFORMITY":
        return styles.badgeConformity;
      case "NON_CONFORMITY":
        return styles.badgeMajor;
      case "PARTIAL_CONFORMITY":
        return styles.badgeMinor;
      default:
        return styles.badge;
    }
  };

  // Filter sections
  const coverSection = report.sections.find((s) => s.section_type === "cover_page");
  const tocSections = report.sections.filter((s) => s.include_in_toc);
  const contentSections = report.sections
    .filter((s) => s.section_type !== "cover_page")
    .sort((a, b) => a.order - b.order);

  // Get report type label for cover
  const getReportTypeLabel = () => {
    switch (report.report_type) {
      case "general_audit":
        return "INTERNAL AUDIT REPORT";
      case "compliance_audit":
        return "ISO 27001 COMPLIANCE AUDIT REPORT";
      case "risk":
        return "RISK ASSESSMENT REPORT";
      case "followup":
        return "AUDIT FOLLOW-UP LOG";
      default:
        return "INTERNAL AUDIT REPORT";
    }
  };

  // Group consecutive content sections by effective page orientation
  const sectionGroups: { orientation: "portrait" | "landscape"; sections: typeof contentSections }[] =
    [];
  contentSections.forEach((section) => {
    const orientation = getEffectiveOrientation(section);
    const lastGroup = sectionGroups[sectionGroups.length - 1];
    if (lastGroup && lastGroup.orientation === orientation) {
      lastGroup.sections.push(section);
    } else {
      sectionGroups.push({ orientation, sections: [section] });
    }
  });

  const Watermark = () => {
    return (
      <View style={styles.watermark} fixed>
        <Text>Confidential</Text>
      </View>
    );
  };

  return (
    <Document>
      {/* Cover Page */}
      {coverSection && <DetailedCoverPage report={report} reportTypeLabel={getReportTypeLabel()} />}

      {/* Table of Contents */}
      {tocSections.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.tocTitle}>Table of Contents</Text>
          {tocSections.map((section, index) => (
            <View key={section.section_id} style={styles.tocItem}>
              <Text style={styles.tocItemTitle}>{section.header}</Text>
              <Text style={styles.tocItemPage}>{index + 2}</Text>
            </View>
          ))}
          <Watermark />
        </Page>
      )}

      {/* Content Sections — grouped by page orientation */}
      {sectionGroups.map((group, groupIndex) => (
        <Page key={groupIndex} size="A4" orientation={group.orientation} style={styles.page}>
          <Watermark />
          {group.sections.map((section) => {
            const globalIndex = contentSections.indexOf(section);
            return (
              <View key={section.section_id} style={{ marginBottom: 30 }}>
                <Text style={styles.sectionTitle}>
                  {globalIndex + 1}. {section.header}
                </Text>
                {section.sub_header && section.show_sub_header !== false && (
                  <Text style={styles.sectionSubHeader}>{section.sub_header}</Text>
                )}
                <View style={styles.sectionTitleDivider} />
            <View style={styles.sectionContent}>
              {/* Section content */}
              {section.content && <Text style={styles.textContent}>{section.content}</Text>}

              {/* Findings table for findings_selector sections */}
              {(section.section_type === "compliance_findings" ||
                section.section_type === "findings_selector") &&
                section.selected_finding_ids &&
                (report.management_standard?.toUpperCase() === "GENERAL"
                  ? /* General findings table */
                    (() => {
                      const selectedGeneral = generalFindings.filter((f) =>
                        section.selected_finding_ids?.includes(f.id)
                      );
                      const cfgColumns = generalFindingsConfig?.columns ?? [];
                      const cfgKeys = generalFindingsConfig?.keys ?? [];
                      const totalCols = cfgColumns.length + cfgKeys.length + 4;
                      const fs = totalCols > 8 ? 7 : totalCols > 6 ? 8 : 9;

                      return (
                        <View style={styles.table} wrap>
                          <View style={[styles.tableRow, styles.tableHeader]} minPresenceAhead={50}>
                            <Text style={[styles.tableCellHeader, { flex: 0.3, fontSize: fs }]}>
                              #
                            </Text>
                            {cfgColumns.map((col) => (
                              <Text
                                key={col.key}
                                style={[styles.tableCellHeader, { flex: 1, fontSize: fs }]}>
                                {col.name}
                              </Text>
                            ))}
                            {cfgKeys.map((k) => (
                              <Text
                                key={k.key}
                                style={[
                                  styles.tableCellHeader,
                                  { flex: 0.6, fontSize: fs, backgroundColor: "#fef3c7", color: "#92400e" }
                                ]}>
                                {k.name}
                              </Text>
                            ))}
                            <Text style={[styles.tableCellHeader, { flex: 1.5, fontSize: fs }]}>
                              Observation
                            </Text>
                            <Text style={[styles.tableCellHeader, { flex: 1.5, fontSize: fs }]}>
                              Comments
                            </Text>
                            <Text style={[styles.tableCellHeader, { flex: 0.6, fontSize: fs }]}>
                              Status
                            </Text>
                          </View>
                          {selectedGeneral.map((finding, idx) => (
                            <View key={finding.id} style={styles.tableRow} wrap={false}>
                              <Text style={[styles.tableCell, { flex: 0.3, fontSize: fs }]}>
                                {idx + 1}
                              </Text>
                              {cfgColumns.map((col) => (
                                <Text
                                  key={col.key}
                                  style={[styles.tableCell, { flex: 1, fontSize: fs }]}>
                                  {getColumnValuePdf(finding, col.key)}
                                </Text>
                              ))}
                              {cfgKeys.map((k) => {
                                const val = getKeyValuePdf(finding, k.key);
                                const isBool = typeof val === "boolean" || val === "true" || val === "false";
                                return (
                                  <Text
                                    key={k.key}
                                    style={[styles.tableCell, { flex: 0.6, fontSize: fs }]}>
                                    {isBool
                                      ? (val === true || val === "true")
                                        ? "Yes"
                                        : "No"
                                      : (val ?? "—")}
                                  </Text>
                                );
                              })}
                              <Text style={[styles.tableCell, { flex: 1.5, fontSize: fs }]}>
                                {finding.audit_observation || "—"}
                              </Text>
                              <Text style={[styles.tableCell, { flex: 1.5, fontSize: fs }]}>
                                {finding.audit_comments || "—"}
                              </Text>
                              <Text style={[styles.tableCell, { flex: 0.6, fontSize: fs }]}>
                                {finding.status || "—"}
                              </Text>
                            </View>
                          ))}
                        </View>
                      );
                    })()
                  : /* Compliance findings table */
                    (
                      <View style={styles.table} wrap>
                        <View style={[styles.tableRow, styles.tableHeader]} minPresenceAhead={50}>
                          <Text style={[styles.tableCellHeader, { flex: 0.25 }]}>Ref</Text>
                          <Text style={[styles.tableCellHeader, { flex: 0.25 }]}>Clause</Text>
                          <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Finding</Text>
                          <Text style={[styles.tableCellHeader, { flex: 1.25 }]}>Status</Text>
                          <Text style={[styles.tableCellHeader, { flex: 2 }]}>Observation</Text>
                        </View>
                        {findings
                          .filter((f) => section.selected_finding_ids?.includes(f.id))
                          .map((finding) => (
                            <View key={finding.id} style={styles.tableRow} wrap={false}>
                              <Text style={[styles.tableCell, { flex: 0.25 }]}>
                                {finding.reference_code}
                              </Text>
                              <Text style={[styles.tableCell, { flex: 0.25 }]}>
                                {finding.clause_number || ""}
                              </Text>
                              <View style={[styles.tableCell, { flex: 1.5 }]}>
                                <Text style={{ fontSize: 10 }}>{finding.title}</Text>
                                {finding.clause_description && (
                                  <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>
                                    {finding.clause_description}
                                  </Text>
                                )}
                              </View>
                              <View style={[styles.tableCell, { flex: 1.25 }]}>
                                <Text
                                  style={[
                                    styles.badge,
                                    getConformityStyle(finding.conformity_status || "")
                                  ]}>
                                  {getConformityLabel(finding.conformity_status || "")}
                                </Text>
                              </View>
                              <Text style={[styles.tableCell, { flex: 2 }]}>
                                {finding.observation || ""}
                              </Text>
                            </View>
                          ))}
                      </View>
                    ))}

              {/* Work Done & Conclusion for general framework findings sections */}
              {(section.section_type === "compliance_findings" ||
                section.section_type === "findings_selector") &&
                report.management_standard?.toUpperCase() === "GENERAL" &&
                workpaperMetadata && (
                  <View>
                    {workpaperMetadata.work_done ? (
                      <View style={{ marginTop: 15 }}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6, color: primaryColor }}>
                          Work Done
                        </Text>
                        <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#374151" }}>
                          {workpaperMetadata.work_done}
                        </Text>
                      </View>
                    ) : null}
                    {workpaperMetadata.conclusion ? (
                      <View style={{ marginTop: 15 }}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6, color: primaryColor }}>
                          Conclusion
                        </Text>
                        <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#374151" }}>
                          {workpaperMetadata.conclusion}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}

              {/* Widgets — skip for general framework findings sections */}
              {!(
                report.management_standard?.toUpperCase() === "GENERAL" &&
                (section.section_type === "findings_selector" || section.section_type === "compliance_findings")
              ) && section.widgets?.map((widget) => {
                // Hide widgets that have no real data so the PDF doesn't show
                // placeholder titles ("Manual Entry", "New Pie Chart", ...) or
                // "No X data available" stubs to readers.
                const d = (widget.data ?? {}) as any;
                const PLACEHOLDER_TITLES = new Set([
                  "manual entry",
                  "new widget",
                  "new pie chart",
                  "new bar chart",
                  "new line chart",
                  "new area chart",
                  "new metric",
                  "new metric card",
                  "new text block",
                  "new table",
                  "data table"
                ]);
                const titleNorm = String(d.title ?? "").trim().toLowerCase();
                const isPlaceholderTitle = !titleNorm || PLACEHOLDER_TITLES.has(titleNorm);

                let isEmpty = false;
                switch (widget.widget_type) {
                  case "table":
                    isEmpty =
                      !Array.isArray(d.columns) ||
                      d.columns.length === 0 ||
                      !Array.isArray(d.rows) ||
                      d.rows.length === 0;
                    break;
                  case "pie_chart":
                    isEmpty =
                      !Array.isArray(d.slices) ||
                      d.slices.length === 0 ||
                      d.slices.every((s: any) => !s?.value);
                    break;
                  case "bar_chart":
                    isEmpty =
                      !Array.isArray(d.categories) ||
                      d.categories.length === 0 ||
                      d.categories.every(
                        (c: any) =>
                          !Array.isArray(c?.series) ||
                          c.series.length === 0 ||
                          c.series.every((s: any) => !s?.value)
                      );
                    break;
                  case "line_chart":
                  case "area_chart":
                    isEmpty =
                      !Array.isArray(d.categories) ||
                      d.categories.length === 0 ||
                      !Array.isArray(d.series) ||
                      d.series.length === 0 ||
                      d.series.every(
                        (s: any) =>
                          !Array.isArray(s?.data) || s.data.every((v: number) => !v)
                      );
                    break;
                  case "metric_card":
                    isEmpty =
                      (!Array.isArray(d.metrics) || d.metrics.length === 0) &&
                      !d.value;
                    break;
                  case "text_block":
                    isEmpty = !String(d.content ?? "").trim();
                    break;
                  case "risk_objective_mapping":
                    isEmpty =
                      !Array.isArray(d.risks) ||
                      d.risks.length === 0 ||
                      !Array.isArray(d.objectives) ||
                      d.objectives.length === 0;
                    break;
                }

                if (isEmpty) return null;

                return (
                <View key={widget.instance_id}>
                  {d.title && !isPlaceholderTitle && (
                    <Text style={styles.widgetTitle}>{d.title}</Text>
                  )}

                  {/* Table Widget */}
                  {widget.widget_type === "table" && "columns" in widget.data && (
                    <View style={styles.table}>
                      {(() => {
                        const columns = Array.isArray((widget.data as any).columns)
                          ? (widget.data as any).columns
                          : [];
                        const rows = Array.isArray((widget.data as any).rows)
                          ? (widget.data as any).rows
                          : [];

                        if (columns.length === 0 || columns.some((c: any) => !c?.key)) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No table data available
                            </Text>
                          );
                        }

                        // Use flex-based layout so columns share space and text wraps
                        const columnFlex = columns.map((col: any) => {
                          return col.width ? parseInt(col.width) / 100 : 1;
                        });

                        // Scale font size down for tables with many columns
                        const cellFontSize = columns.length > 5 ? 8 : 9;

                        return (
                          <View wrap>
                            {/* Header Row */}
                            <View style={[styles.tableRow, styles.tableHeader]} minPresenceAhead={50}>
                              {columns.map((col: any, idx: number) => (
                                <View
                                  key={col.key}
                                  style={{
                                    flex: columnFlex[idx],
                                    paddingHorizontal: 6,
                                    paddingVertical: 8
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: cellFontSize,
                                      fontWeight: "bold",
                                      color: "white"
                                    }}>
                                    {col.header}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Data Rows */}
                            {rows.length === 0 ? (
                              <View style={styles.tableRow}>
                                <Text
                                  style={{
                                    padding: 10,
                                    fontSize: 10,
                                    color: "#999",
                                    textAlign: "center"
                                  }}>
                                  No data available
                                </Text>
                              </View>
                            ) : (
                              rows.map((row: any, rowIdx: number) => (
                                <View
                                  key={rowIdx}
                                  wrap={false}
                                  style={[
                                    styles.tableRow,
                                    {
                                      backgroundColor: rowIdx % 2 === 0 ? "#f8f9fa" : "#ffffff"
                                    }
                                  ]}>
                                  {columns.map((col: any, colIdx: number) => {
                                    // Apply color_hex only to the first column
                                    const cellBackgroundColor =
                                      colIdx === 0 && row.color_hex ? row.color_hex : undefined;
                                    const cellTextColor =
                                      colIdx === 0 && row.color_hex ? "#ffffff" : "#1f2937";

                                    return (
                                      <View
                                        key={`${rowIdx}-${col.key}`}
                                        style={{
                                          flex: columnFlex[colIdx],
                                          paddingHorizontal: 6,
                                          paddingVertical: 8,
                                          borderBottomColor: "#e2e8f0",
                                          ...(cellBackgroundColor && {
                                            backgroundColor: cellBackgroundColor
                                          })
                                        }}>
                                        <Text
                                          style={{
                                            fontSize: cellFontSize,
                                            color: cellTextColor
                                          }}>
                                          {String(row[col.key] || "-")}
                                        </Text>
                                      </View>
                                    );
                                  })}
                                </View>
                              ))
                            )}
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* Pie Chart Widget */}
                  {widget.widget_type === "pie_chart" && (
                    <View
                      style={{
                        marginVertical: 15
                      }}>
                      {(() => {
                        const slices = Array.isArray((widget.data as any).slices)
                          ? (widget.data as any).slices
                          : [];
                        if (slices.length === 0) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No pie chart data available
                            </Text>
                          );
                        }

                        // Calculate total of ALL slices (including zeros)
                        const total = slices.reduce(
                          (sum: number, slice: any) => sum + (slice.value || 0),
                          0
                        );

                        if (total === 0) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>No data to display</Text>
                          );
                        }

                        // Filter slices with values > 0 for pie rendering only
                        const renderSlices = slices.filter((slice: any) => (slice.value || 0) > 0);

                        const generatePieSlices = () => {
                          const radius = 50;
                          const centerX = 80;
                          const centerY = 80;
                          let currentAngle = -Math.PI / 2; // Start from top (12 o'clock)
                          const pieSlices = [] as any[];

                          renderSlices.forEach((slice: any, idx: number) => {
                            const sliceValue = slice.value || 0;
                            const sliceAngle = (sliceValue / total) * 2 * Math.PI;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + sliceAngle;

                            // Calculate start and end points on the circumference
                            const x1 = centerX + radius * Math.cos(startAngle);
                            const y1 = centerY + radius * Math.sin(startAngle);
                            const x2 = centerX + radius * Math.cos(endAngle);
                            const y2 = centerY + radius * Math.sin(endAngle);

                            // Large arc flag - 1 if angle > 180 degrees
                            const largeArc = sliceAngle > Math.PI ? 1 : 0;

                            // Handle full circle case (when sliceAngle ≈ 2π)
                            // SVG arcs can't render a full 360-degree arc, so split it into two 180-degree arcs
                            let pathData;
                            if (sliceAngle >= 2 * Math.PI - 0.001) {
                              // Full circle: draw two semicircles
                              const midAngle = startAngle + Math.PI;
                              const xMid = centerX + radius * Math.cos(midAngle);
                              const yMid = centerY + radius * Math.sin(midAngle);
                              pathData = [
                                `M ${x1.toFixed(2)} ${y1.toFixed(2)}`, // Move to start point
                                `A ${radius} ${radius} 0 1 1 ${xMid.toFixed(2)} ${yMid.toFixed(2)}`, // First semicircle
                                `A ${radius} ${radius} 0 1 1 ${x1.toFixed(2)} ${y1.toFixed(2)}` // Second semicircle back to start
                              ].join(" ");
                            } else {
                              // Normal wedge path
                              pathData = [
                                `M ${centerX} ${centerY}`, // Move to center
                                `L ${x1.toFixed(2)} ${y1.toFixed(2)}`, // Line to start point
                                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`, // Arc to end point
                                `Z` // Close path
                              ].join(" ");
                            }

                            pieSlices.push({
                              d: pathData,
                              fill: slice.color || getDefaultColor(idx),
                              label: slice.label || `Slice ${idx + 1}`,
                              value: sliceValue,
                              percentage: ((sliceValue / total) * 100).toFixed(1)
                            });

                            currentAngle = endAngle;
                          });

                          return pieSlices;
                        };

                        // Helper function for default colors
                        const getDefaultColor = (index: number) => {
                          const colors = [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                            "#FF6384",
                            "#C9CBCF",
                            "#FF6384",
                            "#36A2EB"
                          ];
                          return colors[index % colors.length];
                        };

                        const pieSlices = generatePieSlices();

                        // Create actual circular pie chart using SVG paths
                        const createVisualRepresentation = () => {
                          return (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                              {/* Circular Pie Chart */}
                              <View
                                style={{
                                  width: 160,
                                  height: 160,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}>
                                <Svg width="160" height="160" viewBox="0 0 160 160">
                                  {/* Draw each pie slice as a wedge path */}
                                  {pieSlices.map((slice: any, idx: number) => (
                                    <Path
                                      key={idx}
                                      d={slice.d}
                                      fill={slice.fill}
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                  ))}
                                </Svg>
                              </View>

                              {/* Legend - Show all slices including zeros */}
                              <View style={{ flex: 1, justifyContent: "center" }}>
                                {slices.map((slice: any, idx: number) => {
                                  const percentage = (((slice.value || 0) / total) * 100).toFixed(
                                    1
                                  );
                                  const color = slice.color || getDefaultColor(idx);

                                  return (
                                    <View
                                      key={idx}
                                      style={{
                                        marginBottom: 10,
                                        flexDirection: "row",
                                        alignItems: "flex-start",
                                        paddingRight: 10
                                      }}>
                                      <View
                                        style={{
                                          width: 14,
                                          height: 14,
                                          backgroundColor: color,
                                          borderRadius: 2,
                                          marginRight: 10,
                                          marginTop: 2,
                                          flexShrink: 0
                                        }}
                                      />
                                      <View style={{ flex: 1 }}>
                                        <Text
                                          style={{
                                            fontSize: 10,
                                            textTransform: "capitalize",
                                            color: "#1f2937",
                                            fontWeight: "500"
                                          }}>
                                          {slice.label}
                                        </Text>
                                        <Text
                                          style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
                                          {slice.value || 0} ({percentage}%)
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          );
                        };

                        return createVisualRepresentation();
                      })()}
                    </View>
                  )}

                  {/* Bar Chart Widget */}
                  {widget.widget_type === "bar_chart" && (
                  <View style={{ marginVertical: 15 }}>
                    {/* Determine orientation */}
                    {(() => {
                      const orientation = (widget.data as any).orientation || "vertical";
                      let rawCategories = (widget.data as any).categories || [];
                      const seriesData = (widget.data as any).series;

                      // Detect if using flat structure (from API) or nested structure (legacy)
                      const isFlatStructure =
                        Array.isArray(rawCategories) &&
                        typeof rawCategories[0] === "string" &&
                        seriesData;

                      // Convert flat structure to nested for rendering if needed
                      const categories = isFlatStructure
                        ? (rawCategories as string[]).map((catLabel, catIndex) => ({
                            label: catLabel,
                            series: (seriesData || []).map((s: any) => ({
                              label: s.label,
                              value: s.data?.[catIndex] || 0,
                              color: s.color
                            }))
                          }))
                        : Array.isArray(rawCategories)
                          ? rawCategories
                          : [];

                      // Safely calculate max value
                      const values = categories
                        .flatMap((cat: any) => cat?.series?.map((s: any) => s.value) || [])
                        .filter((v: any) => typeof v === "number");
                      const maxValue = values.length > 0 ? Math.max(...values) : 100;

                      // Validate we have categories and data
                      if (!categories || categories.length === 0) {
                        return (
                          <Text style={{ fontSize: 10, color: "#666" }}>
                            No bar chart data available
                          </Text>
                        );
                      }

                      // Helper function to chunk array into groups of 3
                      const chunkArray = (arr: any[], size: number) => {
                        const chunks = [];
                        for (let i = 0; i < arr.length; i += size) {
                          chunks.push(arr.slice(i, i + size));
                        }
                        return chunks;
                      };

                      if (orientation === "vertical") {
                        // Split categories into rows of 3
                        const categoryRows = chunkArray(categories, 3);

                        return (
                          <View style={{ paddingHorizontal: 10 }}>
                            {categoryRows.map((row: any[], rowIndex: number) => (
                              <View
                                key={rowIndex}
                                style={{
                                  height: 200,
                                  marginBottom: rowIndex < categoryRows.length - 1 ? 15 : 0
                                }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-around",
                                    alignItems: "flex-end",
                                    height: 160
                                  }}>
                                  {row.map((category: any, catIndex: number) => (
                                    <View key={catIndex} style={{ alignItems: "center", flex: 1 }}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "flex-end",
                                          justifyContent: "center",
                                          height: 140,
                                          gap: 2
                                        }}>
                                        {(category?.series || []).map(
                                          (series: any, seriesIndex: number) => {
                                            const barHeight =
                                              maxValue > 0 ? (series.value / maxValue) * 120 : 0;
                                            return (
                                              <View
                                                key={seriesIndex}
                                                style={{ alignItems: "center" }}>
                                                <Text style={{ fontSize: 8, marginBottom: 2 }}>
                                                  {series.value || 0}
                                                </Text>
                                                <View
                                                  style={{
                                                    width: 20,
                                                    height: barHeight > 0 ? barHeight : 2,
                                                    backgroundColor: series.color || "#ccc",
                                                    borderTopLeftRadius: 2,
                                                    borderTopRightRadius: 2
                                                  }}
                                                />
                                              </View>
                                            );
                                          }
                                        )}
                                      </View>
                                      <Text
                                        style={{ fontSize: 9, marginTop: 6, textAlign: "center" }}>
                                        {category.label}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}

                            {/* Legend - shown once at the bottom */}
                            {categories && categories.length > 0 && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  marginTop: 10,
                                  gap: 8
                                }}>
                                {Array.from(
                                  new Set(
                                    categories.flatMap((cat: any) =>
                                      (cat?.series || []).map((s: any) => s.label)
                                    )
                                  )
                                ).map((seriesLabel: any, index: number) => {
                                  const firstSeries = categories
                                    .flatMap((cat: any) => cat?.series || [])
                                    .find((s: any) => s.label === seriesLabel);
                                  return (
                                    <View
                                      key={index}
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4
                                      }}>
                                      <View
                                        style={{
                                          width: 10,
                                          height: 10,
                                          backgroundColor: firstSeries?.color || "#ccc",
                                          borderRadius: 2
                                        }}
                                      />
                                      <Text style={{ fontSize: 8, color: "#4b5563" }}>
                                        {seriesLabel}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        );
                      } else {
                        // Horizontal bars remain unchanged
                        return (
                          <View style={{ paddingHorizontal: 10 }}>
                            {categories.map((category: any, catIndex: number) => (
                              <View
                                key={catIndex}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginBottom: 8
                                }}>
                                <Text style={{ width: 80, fontSize: 9, color: "#4b5563" }}>
                                  {category.label}
                                </Text>
                                <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
                                  {(category?.series || []).map(
                                    (series: any, seriesIndex: number) => {
                                      const barWidth =
                                        maxValue > 0 ? `${(series.value / maxValue) * 100}%` : "0%";
                                      return (
                                        <View
                                          key={seriesIndex}
                                          style={{
                                            width: barWidth,
                                            height: 20,
                                            backgroundColor: series.color || "#ccc",
                                            borderRadius: 2,
                                            justifyContent: "center",
                                            paddingHorizontal: 4
                                          }}>
                                          <Text
                                            style={{
                                              fontSize: 8,
                                              color: "white",
                                              fontWeight: "bold"
                                            }}>
                                            {series.value || 0}
                                          </Text>
                                        </View>
                                      );
                                    }
                                  )}
                                </View>
                              </View>
                            ))}
                            {/* Legend */}
                            {categories && categories.length > 0 && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  marginTop: 10,
                                  gap: 8
                                }}>
                                {Array.from(
                                  new Set(
                                    categories.flatMap((cat: any) =>
                                      (cat?.series || []).map((s: any) => s.label)
                                    )
                                  )
                                ).map((seriesLabel: any, index: number) => {
                                  const firstSeries = categories
                                    .flatMap((cat: any) => cat?.series || [])
                                    .find((s: any) => s.label === seriesLabel);
                                  return (
                                    <View
                                      key={index}
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4
                                      }}>
                                      <View
                                        style={{
                                          width: 10,
                                          height: 10,
                                          backgroundColor: firstSeries?.color || "#ccc",
                                          borderRadius: 2
                                        }}
                                      />
                                      <Text style={{ fontSize: 8, color: "#4b5563" }}>
                                        {seriesLabel}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        );
                      }
                    })()}
                  </View>
                  )}
                  {/* Metric Card Widget */}
                  {widget.widget_type === "metric_card" && (() => {
                    const metricData = widget.data as any;
                    const metrics = metricData?.metrics as Array<{
                      title: string;
                      value: string;
                      subtitle?: string;
                      trend?: string;
                      trend_value?: string;
                      trend_period?: string;
                      color?: string;
                    }> | undefined;

                    if (metrics && metrics.length > 0) {
                      // Multi-metric grid layout
                      return (
                        <View style={{ marginVertical: 15 }}>
                          {metricData.title && (
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                marginBottom: 12,
                                color: "#475569"
                              }}>
                              {metricData.title}
                            </Text>
                          )}
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {metrics.map((metric, idx) => (
                              <View
                                key={idx}
                                style={{
                                  width: "48%",
                                  padding: 12,
                                  backgroundColor: "#f8fafc",
                                  borderWidth: 1,
                                  borderColor: "#e2e8f0",
                                  borderRadius: 6,
                                  alignItems: "center"
                                }}>
                                <Text style={{ fontSize: 8, color: "#64748b", marginBottom: 4 }}>
                                  {metric.title}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                    color: metric.color || "#0f172a"
                                  }}>
                                  {metric.value}
                                </Text>
                                {metric.subtitle ? (
                                  <Text style={{ fontSize: 7, color: "#94a3b8", marginTop: 2 }}>
                                    {metric.subtitle}
                                  </Text>
                                ) : null}
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    }

                    // Single metric fallback
                    return (
                      <View
                        style={{
                          marginVertical: 15,
                          padding: 20,
                          backgroundColor: "#f8fafc",
                          borderWidth: 1,
                          borderColor: "#e2e8f0",
                          borderRadius: 6
                        }}>
                        {metricData.title && (
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "bold",
                              marginBottom: 12,
                              color: "#475569"
                            }}>
                            {metricData.title}
                          </Text>
                        )}
                        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#0f172a" }}>
                            {metricData.value || 0}
                          </Text>
                          {metricData.unit && (
                            <Text style={{ fontSize: 14, color: "#64748b" }}>
                              {metricData.unit}
                            </Text>
                          )}
                          {metricData.trend !== undefined && (
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: metricData.trend >= 0 ? "#16a34a" : "#dc2626"
                              }}>
                              {metricData.trend >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(metricData.trend)}%
                            </Text>
                          )}
                        </View>
                        {metricData.description && (
                          <Text style={{ fontSize: 9, color: "#78909c", marginTop: 8 }}>
                            {metricData.description}
                          </Text>
                        )}
                      </View>
                    );
                  })()}

                  {/* Line Chart Widget  TODO!!!*/}
                  {widget.widget_type === "line_chart" && (
                    <View
                      style={{
                        marginVertical: 15
                      }}>
                      {(() => {
                        const categories = (widget.data as any).categories || [];
                        const series = (widget.data as any).series || [];

                        if (
                          !categories ||
                          categories.length === 0 ||
                          !series ||
                          series.length === 0
                        ) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No line chart data available
                            </Text>
                          );
                        }

                        // Generate SVG line chart
                        const dataPoints = categories.length;
                        const chartWidth = 400;
                        const chartHeight = 200;
                        const padding = 40;
                        const graphWidth = chartWidth - padding * 2;
                        const graphHeight = chartHeight - padding * 2;

                        // Find min and max values
                        let minValue = Infinity;
                        let maxValue = -Infinity;
                        series.forEach((s: any) => {
                          s.data?.forEach((val: number) => {
                            minValue = Math.min(minValue, val || 0);
                            maxValue = Math.max(maxValue, val || 0);
                          });
                        });

                        const range = maxValue - minValue || 1;
                        const scale = graphHeight / range;
                        const xStep = graphWidth / (dataPoints - 1 || 1);

                        return (
                          <View
                            style={{
                              width: "100%",
                              alignItems: "center"
                            }}>
                            <Svg
                              width={chartWidth}
                              height={chartHeight}
                              viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                              {/* Grid lines */}
                              {[0, 1, 2, 3, 4].map((i: number) => {
                                const y = padding + (graphHeight / 4) * i;
                                return (
                                  <Path
                                    key={`grid-${i}`}
                                    d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
                                    stroke="#e5e7eb"
                                    strokeWidth="0.5"
                                  />
                                );
                              })}

                              {/* Lines for each series */}
                              {series.map((s: any, seriesIdx: number) => {
                                let pathData = "";
                                (s.data || []).forEach((val: number, pointIdx: number) => {
                                  const x = padding + xStep * pointIdx;
                                  const y = chartHeight - padding - (val - minValue) * scale;
                                  if (pointIdx === 0) {
                                    pathData += `M ${x} ${y}`;
                                  } else {
                                    pathData += ` L ${x} ${y}`;
                                  }
                                });

                                return (
                                  <Path
                                    key={`line-${seriesIdx}`}
                                    d={pathData}
                                    stroke={s.color || "#3b82f6"}
                                    strokeWidth="2"
                                    fill="none"
                                  />
                                );
                              })}
                            </Svg>

                            {/* Legend */}
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 15,
                                marginTop: 15,
                                justifyContent: "center"
                              }}>
                              {series.map((s: any, idx: number) => (
                                <View
                                  key={idx}
                                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                  <View
                                    style={{
                                      width: 12,
                                      height: 12,
                                      backgroundColor: s.color || "#3b82f6"
                                    }}
                                  />
                                  <Text style={{ fontSize: 9, color: "#475569" }}>{s.label}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* Area Chart Widget  TODO!!!*/}
                  {widget.widget_type === "area_chart" && (
                    <View
                      style={{
                        marginVertical: 15
                      }}>
                      {(() => {
                        const categories = (widget.data as any).categories || [];
                        const series = (widget.data as any).series || [];

                        if (
                          !categories ||
                          categories.length === 0 ||
                          !series ||
                          series.length === 0
                        ) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No area chart data available
                            </Text>
                          );
                        }

                        // Generate SVG area chart (similar to line chart but with filled areas)
                        const dataPoints = categories.length;
                        const chartWidth = 400;
                        const chartHeight = 200;
                        const padding = 40;
                        const graphWidth = chartWidth - padding * 2;
                        const graphHeight = chartHeight - padding * 2;

                        // Find min and max values
                        let minValue = Infinity;
                        let maxValue = -Infinity;
                        series.forEach((s: any) => {
                          s.data?.forEach((val: number) => {
                            minValue = Math.min(minValue, val || 0);
                            maxValue = Math.max(maxValue, val || 0);
                          });
                        });

                        const range = maxValue - minValue || 1;
                        const scale = graphHeight / range;
                        const xStep = graphWidth / (dataPoints - 1 || 1);

                        return (
                          <View
                            style={{
                              width: "100%",
                              alignItems: "center"
                            }}>
                            <Svg
                              width={chartWidth}
                              height={chartHeight}
                              viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                              {/* Grid lines */}
                              {[0, 1, 2, 3, 4].map((i: number) => {
                                const y = padding + (graphHeight / 4) * i;
                                return (
                                  <Path
                                    key={`grid-${i}`}
                                    d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
                                    stroke="#e5e7eb"
                                    strokeWidth="0.5"
                                  />
                                );
                              })}

                              {/* Areas for each series */}
                              {series.map((s: any, seriesIdx: number) => {
                                let pathData = "";
                                const dataLength = s.data?.length || 0;
                                (s.data || []).forEach((val: number, pointIdx: number) => {
                                  const x = padding + xStep * pointIdx;
                                  const y = chartHeight - padding - (val - minValue) * scale;
                                  if (pointIdx === 0) {
                                    pathData += `M ${x} ${y}`;
                                  } else {
                                    pathData += ` L ${x} ${y}`;
                                  }
                                });

                                // Close the area by drawing bottom baseline
                                const lastX = padding + xStep * (dataLength - 1);
                                pathData += ` L ${lastX} ${chartHeight - padding}`;
                                pathData += ` L ${padding} ${chartHeight - padding}`;
                                pathData += " Z";

                                return (
                                  <Path
                                    key={`area-${seriesIdx}`}
                                    d={pathData}
                                    fill={s.color || "#3b82f6"}
                                    fillOpacity="0.3"
                                    stroke={s.color || "#3b82f6"}
                                    strokeWidth="2"
                                  />
                                );
                              })}
                            </Svg>

                            {/* Legend */}
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 15,
                                marginTop: 15,
                                justifyContent: "center"
                              }}>
                              {series.map((s: any, idx: number) => (
                                <View
                                  key={idx}
                                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                  <View
                                    style={{
                                      width: 12,
                                      height: 12,
                                      backgroundColor: s.color || "#3b82f6"
                                    }}
                                  />
                                  <Text style={{ fontSize: 9, color: "#475569" }}>{s.label}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* Risk Objective Mapping Table Widget */}
                  {widget.widget_type === "risk_objective_mapping" &&
                    "objectives" in widget.data &&
                    "risks" in widget.data && (
                      <View style={styles.table}>
                        {/* Header Row 1 - Main Headers */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                          <Text style={[styles.tableCellHeader, { flex: 2 }]}>GROUP RISK</Text>
                          <Text style={[styles.tableCellHeader, { flex: 3, textAlign: "center" }]}>
                            STRATEGIC OBJECTIVES
                          </Text>
                        </View>

                        {/* Header Row 2 - Objective Labels */}
                        <View style={[styles.tableRow, styles.ObjTableHeader]}>
                          <Text style={[styles.tableCellHeader, { flex: 2 }]}></Text>
                          {(widget.data as any).objectives?.map((objective: any) => (
                            <Text
                              key={objective.id}
                              style={[
                                styles.tableCellHeader,
                                { flex: 1, textAlign: "center", fontSize: 8 }
                              ]}>
                              {objective.shortLabel || objective.label}
                            </Text>
                          ))}
                        </View>

                        {/* Data Rows */}
                        {(widget.data as any).risks?.map((risk: any, idx: number) => (
                          <View key={idx} style={styles.tableRow}>
                            {/* Risk Description Cell */}
                            <View
                              style={[styles.tableCell, { flex: 2, flexDirection: "row", gap: 8 }]}>
                              {(widget.data as any).showNumbers !== false && (
                                <View
                                  style={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: "#1e293b",
                                    borderRadius: 2,
                                    justifyContent: "center",
                                    alignItems: "center"
                                  }}>
                                  <Text style={{ color: "white", fontSize: 8, fontWeight: "bold" }}>
                                    {risk.number}
                                  </Text>
                                </View>
                              )}
                              <Text style={{ fontSize: 10, flex: 1 }}>{risk.description}</Text>
                            </View>

                            {/* Objective Checkmark Cells */}
                            {(widget.data as any).objectives?.map((objective: any) => (
                              <View
                                key={objective.id}
                                style={[styles.tableCell, { flex: 1, alignItems: "center" }]}>
                                {risk.mappedObjectives?.includes(objective.id) && (
                                  <View
                                    style={{
                                      justifyContent: "center",
                                      alignItems: "center"
                                    }}>
                                    <View
                                      style={{
                                        width: 10,
                                        height: 6,
                                        marginBottom: 2,
                                        borderLeftWidth: 1.5,
                                        borderBottomWidth: 1.5,
                                        borderColor: "#16a34a",
                                        transform: "rotate(-45deg)"
                                      }}
                                    />
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Bar Chart Widget */}
                  {widget.widget_type === "bar_chart" && (
                    <View style={{ marginVertical: 15 }}>
                      {(() => {
                        const categories = (widget.data as any).categories || [];
                        if (!categories.length) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No bar chart data available
                            </Text>
                          );
                        }

                        const chartWidth = 400;
                        const chartHeight = 200;
                        const padding = 40;
                        const graphWidth = chartWidth - padding * 2;
                        const graphHeight = chartHeight - padding * 2;

                        let maxValue = 0;
                        const seriesLabels: { label: string; color: string }[] = [];
                        const seriesColorMap: Record<string, string> = {};
                        categories.forEach((cat: any) => {
                          (cat.series || []).forEach((s: any) => {
                            maxValue = Math.max(maxValue, s.value || 0);
                            if (!seriesColorMap[s.label]) {
                              seriesColorMap[s.label] = s.color || "#3b82f6";
                              seriesLabels.push({
                                label: s.label,
                                color: s.color || "#3b82f6"
                              });
                            }
                          });
                        });
                        if (maxValue === 0) maxValue = 1;

                        const groupWidth = graphWidth / categories.length;
                        const seriesCount = seriesLabels.length || 1;
                        const barWidth = (groupWidth * 0.8) / seriesCount;

                        return (
                          <View style={{ width: "100%", alignItems: "center" }}>
                            <Svg
                              width={chartWidth}
                              height={chartHeight}
                              viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                              {[0, 1, 2, 3, 4].map((i: number) => {
                                const y = padding + (graphHeight / 4) * i;
                                return (
                                  <Path
                                    key={`bar-grid-${i}`}
                                    d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
                                    stroke="#e5e7eb"
                                    strokeWidth="0.5"
                                  />
                                );
                              })}

                              {categories.map((cat: any, catIdx: number) => {
                                const groupX = padding + groupWidth * catIdx + groupWidth * 0.1;
                                return (cat.series || []).map((s: any, sIdx: number) => {
                                  const value = s.value || 0;
                                  const barH = (value / maxValue) * graphHeight;
                                  const x = groupX + barWidth * sIdx;
                                  const y = chartHeight - padding - barH;
                                  return (
                                    <Path
                                      key={`bar-${catIdx}-${sIdx}`}
                                      d={`M ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${chartHeight - padding} L ${x} ${chartHeight - padding} Z`}
                                      fill={s.color || "#3b82f6"}
                                    />
                                  );
                                });
                              })}
                            </Svg>

                            <View
                              style={{
                                flexDirection: "row",
                                gap: 6,
                                marginTop: 5,
                                paddingHorizontal: padding
                              }}>
                              {categories.map((cat: any, idx: number) => (
                                <Text
                                  key={`bar-cat-${idx}`}
                                  style={{
                                    fontSize: 8,
                                    color: "#475569",
                                    flex: 1,
                                    textAlign: "center"
                                  }}>
                                  {cat.label}
                                </Text>
                              ))}
                            </View>

                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 15,
                                marginTop: 10,
                                justifyContent: "center"
                              }}>
                              {seriesLabels.map((s, idx) => (
                                <View
                                  key={idx}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6
                                  }}>
                                  <View
                                    style={{
                                      width: 12,
                                      height: 12,
                                      backgroundColor: s.color
                                    }}
                                  />
                                  <Text style={{ fontSize: 9, color: "#475569" }}>{s.label}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* Text Block Widget */}
                  {widget.widget_type === "text_block" && (
                    <View style={{ marginVertical: 10 }}>
                      {(widget.data as any).title && (
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "bold",
                            color: "#0f172a",
                            marginBottom: 6
                          }}>
                          {(widget.data as any).title}
                        </Text>
                      )}
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#334155",
                          lineHeight: 1.5
                        }}>
                        {(widget.data as any).content || ""}
                      </Text>
                    </View>
                  )}
                </View>
                );
              })}
            </View>
          </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
};

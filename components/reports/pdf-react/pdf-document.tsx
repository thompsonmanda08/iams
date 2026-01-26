import React from "react";
import { Document, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import { ReportContent, FindingSummary } from "@/lib/types/report-types";
import {
  StandardCoverPage,
  SimpleCoverPage,
  DetailedCoverPage,
  SignatureCoverPage
} from "./cover-pages";

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
      marginBottom: 20,
      marginTop: 30,
      color: primaryColor,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      borderBottomStyle: "solid",
      paddingBottom: 10
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
      borderBottomStyle: "solid"
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: primaryColor,
      color: "white",
      fontWeight: "bold"
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
      fontSize: 48,
      color: "rgba(200, 200, 200, 0.5)",
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
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ report, findings }) => {
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

  // Get metadata label for first row based on report type
  const getMetadataLabel = () => {
    switch (report.report_type) {
      case "risk":
        return "Assessment Scope";
      case "followup":
        return "Follow-up Period";
      case "compliance_audit":
        return "Audit Scope";
      default:
        return "Process";
    }
  };

  // Determine cover page style based on report type
  const getCoverPageStyle = () => {
    switch (report.report_type) {
      case "followup":
        return "simple"; // White background, simple layout
      case "risk":
        return "signature"; // White background with signature table
      case "compliance_audit":
        return "detailed"; // White background with version and author
      case "general_audit":
      default:
        return "standard"; // Blue background with yellow highlights (current style)
    }
  };

  const Watermark = () => {
    return (
      <View style={styles.watermark} fixed>
        <Text>Confidential</Text>
      </View>
    );
  };

  return (
    <Document>
      {/* Cover Page - Dynamic based on report type */}
      {coverSection &&
        (() => {
          const coverStyle = getCoverPageStyle();
          const props = { report, reportTypeLabel: getReportTypeLabel() };

          switch (coverStyle) {
            case "simple":
              return <SimpleCoverPage {...props} />;
            case "signature":
              return <SignatureCoverPage {...props} />;
            case "detailed":
              return <DetailedCoverPage {...props} />;
            case "standard":
            default:
              return <StandardCoverPage {...props} />;
          }
        })()}

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

      {/* All Content Sections on Same Page (flows naturally) */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        {contentSections.map((section, sectionIndex) => (
          <View key={section.section_id} style={{ marginBottom: 30 }}>
            <Text style={styles.sectionTitle}>
              {sectionIndex + 1}. {section.header}
            </Text>
            <View style={styles.sectionContent}>
              {/* Section content */}
              {section.content && <Text style={styles.textContent}>{section.content}</Text>}

              {/* Findings table for findings_selector sections */}
              {(section.section_type === "compliance_findings" ||
                section.section_type === "findings_selector") &&
                section.selected_finding_ids && (
                  <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCellHeader, { flex: 0.25 }]}>Ref</Text>
                      <Text style={[styles.tableCellHeader, { flex: 0.25 }]}>Clause</Text>
                      <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Finding</Text>
                      <Text style={[styles.tableCellHeader, { flex: 1.25 }]}>Status</Text>
                      <Text style={[styles.tableCellHeader, { flex: 2 }]}>Observation</Text>
                    </View>
                    {findings
                      .filter((f) => section.selected_finding_ids?.includes(f.id))
                      .map((finding) => (
                        <View key={finding.id} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { flex: 0.25 }]}>
                            {finding.reference_code}
                          </Text>
                          <Text style={[styles.tableCell, { flex: 0.25 }]}>
                            {finding.clause_number || ""}
                          </Text>
                          <Text style={[styles.tableCell, { flex: 1.5 }]}>{finding.title}</Text>
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
                )}

              {/* Widgets */}
              {section.widgets?.map((widget) => (
                <View key={widget.instance_id} wrap={false}>
                  {widget.data.title && <Text style={styles.widgetTitle}>{widget.data.title}</Text>}

                  {/* Table Widget */}
                  {widget.widget_type === "table" && "columns" in widget.data && (
                    <View style={styles.table}>
                      {(() => {
                        const columns = (widget.data as any).columns || [];
                        const rows = (widget.data as any).rows || [];

                        if (!columns || columns.length === 0) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No table data available
                            </Text>
                          );
                        }

                        // Calculate column width dynamically based on number of columns
                        const totalWidth = 540; // Available width in PDF page
                        const minColumnWidth = 60; // Minimum width per column
                        const columnCount = columns.length;
                        const calculatedWidth = Math.max(minColumnWidth, totalWidth / columnCount);

                        const columnWidths = columns.map((col: any) => {
                          // If column has custom width, use it; otherwise use calculated width
                          return col.width ? parseInt(col.width) : calculatedWidth;
                        });

                        return (
                          <View>
                            {/* Header Row */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                              {columns.map((col: any, idx: number) => (
                                <View
                                  key={col.key}
                                  style={{
                                    width: columnWidths[idx],
                                    padding: 5
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 9,
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
                                  style={[
                                    styles.tableRow,
                                    {
                                      backgroundColor: rowIdx % 2 === 0 ? "#f8f9fa" : "#ffffff"
                                    }
                                  ]}>
                                  {columns.map((col: any, colIdx: number) => (
                                    <View
                                      key={`${rowIdx}-${col.key}`}
                                      style={{
                                        width: columnWidths[colIdx],
                                        padding: 5,
                                        borderBottomColor: "#e2e8f0"
                                      }}>
                                      <Text
                                        style={{
                                          fontSize: 9,
                                          color: "#1f2937"
                                        }}>
                                        {String(row[col.key] || "-")}
                                      </Text>
                                    </View>
                                  ))}
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
                        // Handle both formats: slices property or direct array
                        let slices = Array.isArray(widget.data)
                          ? widget.data
                          : (widget.data as any).slices || [];
                        if (!slices || slices.length === 0) {
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
                  {widget.widget_type === "bar_chart" && "categories" in widget.data && (
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

                        if (orientation === "vertical") {
                          return (
                            <View style={{ height: 200, paddingHorizontal: 10 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-around",
                                  alignItems: "flex-end",
                                  height: 160
                                }}>
                                {categories.map((category: any, catIndex: number) => (
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
                        } else {
                          // Horizontal bars
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
                                          maxValue > 0
                                            ? `${(series.value / maxValue) * 100}%`
                                            : "0%";
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

                  {/* Metric Card Widget  TODO!!!*/}
                  {widget.widget_type === "metric_card" && (
                    <View
                      style={{
                        marginVertical: 15,
                        padding: 20,
                        backgroundColor: "#f8fafc",
                        borderWidth: 1,
                        borderColor: "#e2e8f0",
                        borderRadius: 6
                      }}>
                      {(widget.data as any).title && (
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "bold",
                            marginBottom: 12,
                            color: "#475569"
                          }}>
                          {(widget.data as any).title}
                        </Text>
                      )}
                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                        <Text style={{ fontSize: 36, fontWeight: "bold", color: "#0f172a" }}>
                          {(widget.data as any).value || 0}
                        </Text>
                        {(widget.data as any).unit && (
                          <Text style={{ fontSize: 14, color: "#64748b" }}>
                            {(widget.data as any).unit}
                          </Text>
                        )}
                        {(widget.data as any).trend !== undefined && (
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: (widget.data as any).trend >= 0 ? "#16a34a" : "#dc2626"
                            }}>
                            {(widget.data as any).trend >= 0 ? "↑" : "↓"}{" "}
                            {Math.abs((widget.data as any).trend)}%
                          </Text>
                        )}
                      </View>
                      {(widget.data as any).description && (
                        <Text style={{ fontSize: 9, color: "#78909c", marginTop: 8 }}>
                          {(widget.data as any).description}
                        </Text>
                      )}
                    </View>
                  )}

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
                        <View style={[styles.tableRow, styles.tableHeader]}>
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
                </View>
              ))}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};

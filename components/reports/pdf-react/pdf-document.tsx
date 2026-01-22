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
      fontSize: 9,
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
              {section.section_type === "findings_selector" && section.selected_finding_ids && (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Reference</Text>
                    <Text style={[styles.tableCellHeader, { flex: 0.6 }]}>Clause</Text>
                    <Text style={[styles.tableCellHeader, { flex: 1.5 }]}>Finding</Text>
                    <Text style={[styles.tableCellHeader, { flex: 0.8 }]}>Status</Text>
                    <Text style={[styles.tableCellHeader, { flex: 2 }]}>Observation</Text>
                  </View>
                  {findings
                    .filter((f) => section.selected_finding_ids?.includes(f.id))
                    .map((finding) => (
                      <View key={finding.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 0.8 }]}>
                          {finding.reference_code}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 0.6 }]}>
                          {finding.clause_number || ""}
                        </Text>
                        <Text style={[styles.tableCell, { flex: 1.5 }]}>{finding.title}</Text>
                        <View style={[styles.tableCell, { flex: 0.8 }]}>
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
                      <View style={[styles.tableRow, styles.tableHeader]}>
                        {(widget.data as any).columns?.map((col: any) => (
                          <Text key={col.key} style={styles.tableCellHeader}>
                            {col.header}
                          </Text>
                        ))}
                      </View>
                      {(widget.data as any).rows?.map((row: any, idx: number) => (
                        <View key={idx} style={styles.tableRow}>
                          {(widget.data as any).columns?.map((col: any) => (
                            <Text key={col.key} style={styles.tableCell}>
                              {String(row[col.key] || "")}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Pie Chart Widget */}
                  {widget.widget_type === "pie_chart" && "slices" in widget.data && (
                    <View style={{ marginVertical: 15 }}>
                      {(() => {
                        const slices = (widget.data as any).slices || [];
                        if (!slices || slices.length === 0) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No pie chart data available
                            </Text>
                          );
                        }

                        const total = slices.reduce(
                          (sum: number, slice: any) => sum + (slice.value || 0),
                          0
                        );

                        if (total === 0) {
                          return (
                            <Text style={{ fontSize: 10, color: "#666" }}>
                              No data to display
                            </Text>
                          );
                        }

                        // Helper function to generate SVG pie chart path
                        const generatePieChart = () => {
                          const radius = 50;
                          const centerX = 60;
                          const centerY = 60;
                          let currentAngle = -Math.PI / 2; // Start from top
                          const paths = [];

                          slices.forEach((slice: any, idx: number) => {
                            const sliceAngle = (slice.value / total) * 2 * Math.PI;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + sliceAngle;

                            const x1 = centerX + radius * Math.cos(startAngle);
                            const y1 = centerY + radius * Math.sin(startAngle);
                            const x2 = centerX + radius * Math.cos(endAngle);
                            const y2 = centerY + radius * Math.sin(endAngle);

                            const largeArc = sliceAngle > Math.PI ? 1 : 0;

                            const pathData = [
                              `M${centerX},${centerY}`,
                              `L${x1},${y1}`,
                              `A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}`,
                              'Z'
                            ].join(' ');

                            paths.push({
                              d: pathData,
                              fill: slice.color || '#ccc',
                              label: slice.label || 'Unknown',
                              value: slice.value,
                              percentage: ((slice.value / total) * 100).toFixed(1)
                            });

                            currentAngle = endAngle;
                          });

                          return paths;
                        };

                        const piePaths = generatePieChart();

                        return (
                          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 20 }}>
                            {/* Pie Chart SVG */}
                            <View style={{ width: 140 }}>
                              <Svg width="120" height="120" viewBox="0 0 120 120">
                                {piePaths.map((path: any, idx: number) => (
                                  <Path
                                    key={idx}
                                    d={path.d}
                                    fill={path.fill}
                                    stroke="white"
                                    strokeWidth="1"
                                  />
                                ))}
                              </Svg>
                            </View>

                            {/* Legend */}
                            <View style={{ flex: 1 }}>
                              {slices.map((slice: any, idx: number) => {
                                const percentage = total > 0 ? ((slice.value / total) * 100).toFixed(1) : 0;

                                return (
                                  <View key={idx} style={{ marginBottom: 8 }}>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginBottom: 2
                                      }}>
                                      <View
                                        style={{
                                          width: 10,
                                          height: 10,
                                          backgroundColor: slice.color || "#ccc",
                                          borderRadius: 1,
                                          marginRight: 6
                                        }}
                                      />
                                      <Text style={{ fontSize: 8, color: "#4b5563", flex: 1 }}>
                                        {slice.label || "Unknown"}
                                      </Text>
                                      <Text style={{ fontSize: 8, fontWeight: "bold", marginLeft: 4 }}>
                                        {percentage}%
                                      </Text>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        );
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
                        const isFlatStructure = Array.isArray(rawCategories) &&
                          typeof rawCategories[0] === 'string' &&
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
                        const values = categories.flatMap((cat: any) =>
                          cat?.series?.map((s: any) => s.value) || []
                        ).filter((v: any) => typeof v === 'number');
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
                                      {(category?.series || []).map((series: any, seriesIndex: number) => {
                                        const barHeight = maxValue > 0 ? (series.value / maxValue) * 120 : 0;
                                        return (
                                          <View key={seriesIndex} style={{ alignItems: "center" }}>
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
                                      })}
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
                                    {(category?.series || []).map((series: any, seriesIndex: number) => {
                                      const barWidth = maxValue > 0 ? `${(series.value / maxValue) * 100}%` : "0%";
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
                                    })}
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

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ReportContent, FindingSummary } from "../../types";
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
      lineHeight: 1.8,
      marginBottom: 12
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
        </Page>
      )}

      {/* All Content Sections on Same Page (flows naturally) */}
      <Page size="A4" style={styles.page}>
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
                <View key={widget.instance_id}>
                  {widget.data.title && <Text style={styles.widgetTitle}>{widget.data.title}</Text>}

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

                  {widget.widget_type === "pie_chart" && "slices" in widget.data && (
                    <View style={styles.table}>
                      <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableCellHeader}>Category</Text>
                        <Text style={styles.tableCellHeader}>Value</Text>
                      </View>
                      {(widget.data as any).slices?.map((slice: any, idx: number) => (
                        <View key={idx} style={styles.tableRow}>
                          <Text style={styles.tableCell}>{slice.label}</Text>
                          <Text style={styles.tableCell}>{slice.value}</Text>
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

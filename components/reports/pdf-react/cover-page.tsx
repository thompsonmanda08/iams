import React from "react";
import { Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { ReportContent } from "@/lib/types/report-types";
import { useSession } from "@/store/session-store";
import { formatDate } from "@/lib/utils/date-format";

// Shared styles
const sharedStyles = StyleSheet.create({
  whitePage: {
    padding: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  bluePage: {
    padding: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: "#1e40af"
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10
  },
  tagline: {
    fontSize: 10,
    marginTop: 5
  },
  idcTagline: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 40
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
  author?: {
    name: string;
    certification?: string;
    title?: string;
  };
  cover_page_table?: {
    columns: TableColumn[];
    rows: Record<string, any>[];
  };
}

interface CoverPageProps {
  report: ReportContent;
  reportTypeLabel: string;
  coverPageData?: CoverPageData;
}

{
  /* Confidential Watermark */
}
const Watermark = () => {
  return (
    <View style={sharedStyles.watermark}>
      <Text>Confidential</Text>
    </View>
  );
};

// Helper function to parse cover page data from JSON string
const parseCoverPageData = (jsonString?: string): CoverPageData | null => {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    return {
      report_title: parsed.report_title || "",
      report_date: parsed.report_date || "",
      report_subtitle: parsed.report_subtitle || "",
      footer_label: parsed.footer_label || "",
      footer_value: parsed.footer_value || "",
      organization: {
        name: parsed.organization?.name || "",
        logo_url: parsed.organization?.logo_url || "",
        tagline: parsed.organization?.tagline || ""
      },
      author: {
        name: parsed.author?.name || "",
        certification: parsed.author?.certification || "",
        title: parsed.author?.title || ""
      },
      cover_page_table: parsed.cover_page_table || { columns: [], rows: [] }
    };
  } catch {
    return null;
  }
};

// Cover Page (White background with version and author info)
export const DetailedCoverPage: React.FC<CoverPageProps> = ({
  report,
  reportTypeLabel,
  coverPageData
}) => {
  // Parse cover page data from coverPageData prop or try to extract from report
  let pageData = coverPageData;

  if (!pageData && report.sections) {
    const coverSection = report.sections.find((s) => s.section_type === "cover_page");
    if (coverSection?.content) {
      pageData = parseCoverPageData(coverSection.content) as any;
    }
  }

  // Fallback to report data if no cover page data is available
  const logoTagline = pageData?.organization.tagline || "";
  const reportTitle = pageData?.report_title || reportTypeLabel;
  const reportSubtitle = pageData?.report_subtitle || "";
  const reportDate = pageData?.report_date || report.created_at || "";
  const orgName = pageData?.organization.name || "";
  const logoUrl = pageData?.organization.logo_url || "";
  const footerLabel = pageData?.footer_label || "";
  const footerValue = pageData?.footer_value || "";

  return (
    <Page
      size="A4"
      style={{ ...sharedStyles.whitePage, justifyContent: "space-between", padding: 40 }}>
      <Watermark />

      {/* HEADER SECTION */}
      <View style={{ alignItems: "center", marginBottom: 60 }}>
        {/* Logo */}
        {logoUrl && logoUrl.trim() && (
          <Image src={logoUrl} style={{ width: 160, height: 100, objectFit: "contain" }} />
        )}
        <View style={{ marginBottom: 15, alignItems: "center" }}>
          <Text style={{ ...sharedStyles.logo, color: "#1e40af" }}>{orgName}</Text>
          <Text
            style={{
              fontSize: 10,
              color: "#64748b",
              fontStyle: "italic",
              marginTop: 10
            }}>
            {logoTagline}
          </Text>
        </View>

        {/* Divider Line */}
        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#1e40af"
          }}
        />
      </View>

      {/* Report Title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#1e40af",
          textAlign: "center",
          marginBottom: 15
        }}>
        {reportTitle}
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 14,
          color: "#000",
          textAlign: "center",
          marginBottom: 10
        }}>
        {reportSubtitle}
      </Text>

      {/* MAIN CONTENT SECTION */}
      <View style={{ flex: 1, width: "100%", justifyContent: "center" }}>
        {/* Information Table (from editor) */}
        {pageData?.cover_page_table && pageData.cover_page_table.columns.length > 0 && (
          <View style={{ width: "100%", marginBottom: 60 }}>
            {/* Table Header */}
            <View style={{ flexDirection: "row", backgroundColor: "#1e40af", marginBottom: 0 }}>
              {pageData.cover_page_table.columns.map((col) => (
                <View
                  key={col.key}
                  style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: "#fff" }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: "#fff" }}>
                    {col.header}
                  </Text>
                </View>
              ))}
            </View>
            {/* Table Rows */}
            {pageData.cover_page_table.rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: "row",
                  backgroundColor: rowIndex % 2 === 0 ? "#f8fafc" : "#fff",
                  borderBottomWidth: 1,
                  borderBottomColor: "#e2e8f0"
                }}>
                {pageData.cover_page_table!.columns.map((col) => (
                  <View
                    key={col.key}
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRightWidth: 1,
                      borderRightColor: "#e2e8f0"
                    }}>
                    <Text style={{ fontSize: 9, color: "#000" }}>{row[col.key] || ""}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* FOOTER SECTION */}
        <View
          style={{ width: "100%", paddingTop: 40, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {/* Left Footer */}
            <View>
              <Text style={{ fontSize: 9, color: "#64748b" }}>{footerLabel}</Text>
              <Text style={{ fontSize: 8, color: "#999", marginTop: 4 }}>{footerValue}</Text>
            </View>
            {/* Right Footer */}
            <View style={{ textAlign: "right" }}>
              <Text style={{ fontSize: 9, color: "#64748b" }}>
                Generated: {formatDate(new Date())}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
};

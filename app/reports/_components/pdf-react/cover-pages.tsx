import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ReportContent } from "../../types";

// Shared styles
const sharedStyles = StyleSheet.create({
  whitePage: {
    padding: 60,
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

interface CoverPageProps {
  report: ReportContent;
  reportTypeLabel: string;
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

// Style 1: Standard (Blue background with yellow highlights) - General Audit
export const StandardCoverPage: React.FC<CoverPageProps> = ({ report, reportTypeLabel }) => (
  <Page size="A4" style={sharedStyles.bluePage}>
    <Watermark />
    {/* Logo */}
    <View style={{ marginBottom: 40, alignItems: "center" }}>
      <Text style={{ ...sharedStyles.logo, color: "white" }}>INFRATEL</Text>
      <Text style={{ ...sharedStyles.tagline, color: "white", opacity: 0.9 }}>
        Accessible. Everywhere.
      </Text>
    </View>

    {/* Tagline */}
    <Text style={{ ...sharedStyles.idcTagline, color: "white", opacity: 0.9 }}>
      "A member of the IDC group of Companies"
    </Text>

    {/* Report Title */}
    <View
      style={{
        borderTopWidth: 2,
        borderTopColor: "white",
        borderBottomWidth: 2,
        borderBottomColor: "white",
        paddingVertical: 15,
        marginBottom: 30,
        width: "100%"
      }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", textAlign: "center" }}>
        {reportTypeLabel}
      </Text>
    </View>

    {/* Department/Process */}
    <View
      style={{
        backgroundColor: "#fef08a",
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 40,
        width: "100%"
      }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#000",
          textAlign: "center",
          textTransform: "uppercase"
        }}>
        {report.title}
      </Text>
    </View>

    {/* Metadata Table */}
    <View style={{ width: "60%", marginBottom: 40 }}>
      <View style={{ flexDirection: "row", borderWidth: 1, borderColor: "white" }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#fef08a",
            borderRightWidth: 1,
            borderRightColor: "white"
          }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>Process</Text>
        </View>
        <View style={{ flex: 2, padding: 8, backgroundColor: "white" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            {report.title}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "white",
          borderTopWidth: 0
        }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#fef08a",
            borderRightWidth: 1,
            borderRightColor: "white"
          }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            Creation Date
          </Text>
        </View>
        <View style={{ flex: 2, padding: 8, backgroundColor: "white" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "white",
          borderTopWidth: 0
        }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#fef08a",
            borderRightWidth: 1,
            borderRightColor: "white"
          }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            Document Number
          </Text>
        </View>
        <View style={{ flex: 2, padding: 8, backgroundColor: "white" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            {report.report_id || "INF/HCA/IAR/Q2-2025-01"}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "white",
          borderTopWidth: 0
        }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#fef08a",
            borderRightWidth: 1,
            borderRightColor: "white"
          }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            Revision Number
          </Text>
        </View>
        <View style={{ flex: 2, padding: 8, backgroundColor: "white" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", fontStyle: "italic" }}>
            {report.version || "001"}
          </Text>
        </View>
      </View>
    </View>

    {/* Quarter Info */}
    <View
      style={{
        backgroundColor: "#fef08a",
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginBottom: 20
      }}>
      <Text style={{ fontSize: 12, fontWeight: "bold" }}>
        Quarter II, 30th June {new Date().getFullYear()}
      </Text>
    </View>
  </Page>
);

// Style 2: Simple (White background, minimal) - Follow-up Log
export const SimpleCoverPage: React.FC<CoverPageProps> = ({ report, reportTypeLabel }) => (
  <Page size="A4" style={sharedStyles.whitePage}>
    <Watermark />
    {/* Logo */}
    <View style={{ marginBottom: 60, alignItems: "center" }}>
      <Text style={{ ...sharedStyles.logo, color: "#1e40af" }}>INFRATEL</Text>
      <Text style={{ ...sharedStyles.tagline, color: "#64748b" }}>Accessible. Everywhere.</Text>
    </View>

    {/* Tagline */}
    <Text style={{ ...sharedStyles.idcTagline, color: "#64748b" }}>
      "A member of the IDC group of Companies"
    </Text>

    {/* Horizontal line */}
    <View
      style={{
        width: "100%",
        height: 2,
        backgroundColor: "#000",
        marginBottom: 40
      }}
    />

    {/* Long descriptive title */}
    <Text
      style={{
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
        marginBottom: 40,
        paddingHorizontal: 20
      }}>
      {reportTypeLabel} submitted to the Executive Committee and Management of INFRATEL Corporation
      Limited
    </Text>

    {/* Horizontal line */}
    <View
      style={{
        width: "100%",
        height: 2,
        backgroundColor: "#000",
        marginBottom: 80
      }}
    />

    {/* Date */}
    <Text style={{ fontSize: 12, color: "#000", marginBottom: 10 }}>
      {new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}
    </Text>

    {/* Report type */}
    <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000" }}>Monthly Report</Text>
  </Page>
);

// Style 3: Detailed (White background with version and author) - Compliance Audit
export const DetailedCoverPage: React.FC<CoverPageProps> = ({ report, reportTypeLabel }) => (
  <Page size="A4" style={sharedStyles.whitePage}>
    <Watermark />
    {/* Logo */}
    <View style={{ marginBottom: 80, alignItems: "center" }}>
      <Text style={{ ...sharedStyles.logo, color: "#1e40af" }}>INFRATEL</Text>
      <Text style={{ ...sharedStyles.tagline, color: "#64748b" }}>Accessible. Everywhere.</Text>
    </View>

    {/* Report Title */}
    <Text
      style={{
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
        marginBottom: 60
      }}>
      {reportTypeLabel}
    </Text>

    {/* Organization */}
    <Text
      style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
        marginBottom: 30
      }}>
      INFRATEL Corporation Limited
    </Text>

    {/* Date */}
    <Text
      style={{
        fontSize: 14,
        color: "#000",
        textAlign: "center",
        marginBottom: 80
      }}>
      {new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}
    </Text>

    {/* Version */}
    <Text
      style={{
        fontSize: 12,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
        marginBottom: 10
      }}>
      Ver {report.version || "1.0"}
    </Text>

    {/* Version Date */}
    <Text
      style={{
        fontSize: 11,
        color: "#000",
        textAlign: "center",
        marginBottom: 40
      }}>
      {new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })}
    </Text>

    {/* Author */}
    <Text
      style={{
        fontSize: 11,
        color: "#000",
        textAlign: "center"
      }}>
      Report Author: Alex M. Maka
    </Text>
  </Page>
);

// Style 4: Signature (White background with approval table) - Risk Report
export const SignatureCoverPage: React.FC<CoverPageProps> = ({ report, reportTypeLabel }) => (
  <Page size="A4" style={{ ...sharedStyles.whitePage, justifyContent: "flex-start", padding: 40 }}>
    <Watermark />
    {/* Logo */}
    <View style={{ marginBottom: 40, alignItems: "center", width: "100%" }}>
      <Text style={{ ...sharedStyles.logo, color: "#1e40af" }}>INFRATEL</Text>
      <Text style={{ ...sharedStyles.tagline, color: "#64748b" }}>Accessible. Everywhere.</Text>
    </View>

    {/* Tagline */}
    <Text
      style={{
        ...sharedStyles.idcTagline,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 60
      }}>
      "A member of the IDC group of Companies"
    </Text>

    {/* Report Title with Date */}
    <Text
      style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 40,
        textDecoration: "underline"
      }}>
      INFRATEL Corporation {reportTypeLabel} as of{" "}
      {new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}
    </Text>

    {/* Signature Table */}
    <View style={{ width: "100%", marginTop: 20 }}>
      {/* Header Row */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#1e40af",
          borderWidth: 1,
          borderColor: "#000"
        }}>
        <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: "white" }}>Action</Text>
        </View>
        <View style={{ flex: 2, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: "white" }}>Name/Role</Text>
        </View>
        <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: "white" }}>Signature</Text>
        </View>
        <View style={{ flex: 1, padding: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: "white" }}>Date</Text>
        </View>
      </View>

      {/* Prepared by */}
      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#000",
          borderTopWidth: 0
        }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#1e40af",
            borderRightWidth: 1,
            borderRightColor: "#000"
          }}>
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "white" }}>Prepared by</Text>
        </View>
        <View style={{ flex: 2, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }}>
          <Text style={{ fontSize: 9 }}>Alex Maka (Senior Information Systems Auditor)</Text>
        </View>
        <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }} />
        <View style={{ flex: 1, padding: 8 }}>
          <Text style={{ fontSize: 9 }}>
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })}
          </Text>
        </View>
      </View>

      {/* Reviewed by */}
      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#000",
          borderTopWidth: 0
        }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#1e40af",
            borderRightWidth: 1,
            borderRightColor: "#000"
          }}>
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "white" }}>Reviewed by</Text>
        </View>
        <View style={{ flex: 2, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }}>
          <Text style={{ fontSize: 9 }}>Mwenya Zulu (Head Internal Audit & Risk)</Text>
        </View>
        <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }} />
        <View style={{ flex: 1, padding: 8 }}>
          <Text style={{ fontSize: 9 }}>
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })}
          </Text>
        </View>
      </View>

      {/* Approved by */}
      <View
        style={{
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#000",
          borderTopWidth: 0
        }}>
        <View
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#1e40af",
            borderRightWidth: 1,
            borderRightColor: "#000"
          }}>
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "white" }}>Approved by</Text>
        </View>
        <View style={{ flex: 2, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }}>
          <Text style={{ fontSize: 9 }}>Dr. Evans Silarwe (Chief Executive Officer)</Text>
        </View>
        <View style={{ flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: "#000" }} />
        <View style={{ flex: 1, padding: 8 }}>
          <Text style={{ fontSize: 9 }}>
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })}
          </Text>
        </View>
      </View>
    </View>
  </Page>
);

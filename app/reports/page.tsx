"use client";

import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import { useSession } from "@/store/session-store";

// Imports from extracted files
import { ReportSection } from "./types";
import { useReportStore } from "./store";
import { useReportFetching } from "./hooks/use-report-fetching";
import { populateReportLogo } from "./utils";

import { SectionEditor } from "./_components/section-editor";
import { AddSectionModal } from "./_components/add-section-modal";
import { ReportHeader } from "./_components/report-header";
import { ReportSidebar } from "./_components/report-sidebar";
import { AddSectionButton } from "./_components/add-section-button";
import Loader from "@/components/ui/loader";
import { log } from "console";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuditReportSystem() {
  const { session } = useSession();

  // Initialize fetching hooks (triggers queries and state sync)
  useReportFetching();

  // Access state from store
  const {
    report,
    findings,
    expandedSections,
    isAddSectionModalOpen,
    isLoading,

    // Actions
    setReport,
    addSection,
    updateSection,
    deleteSection,
    toggleSection,
    moveSection,
    setAddSectionModalOpen,
    handleDragStart,
    handleDrop,
    updateWidgetColumns,
    updateWidgetRows,
    updateWidgetData,
    updateWidgetDataSource
  } = useReportStore();

  // Auto-populate organization logo from session
  useEffect(() => {
    const logoToUse = session?.logo_url || "/images/infratel-logo.png";
    if (report) {
      // We use the helper utility, but we need to update state
      // This logic inside useEffect can be tricky with Zustand if not careful to avoid loops
      // Let's do a check inside populateReportLogo or here
      const updatedSections = populateReportLogo(report.sections, logoToUse);
      // Check if actually changed to avoid loop?
      // Assuming setReport does shallow compare or we blindly set it once?
      // Ideally this should be an action "checkAndSetLogo".
      // For now, let's just leave it, or assuming initial load handles it.
      // Or update sections only.
      if (JSON.stringify(updatedSections) !== JSON.stringify(report.sections)) {
        setReport({ ...report, sections: updatedSections });
      }
    }
  }, [session?.logo_url, report?.report_id]); // Depend on ID to run once per report load

  if (isLoading || !report) {
    return (
      <Loader
        loadingText="Loading report..."
        className="flex h-screen items-center justify-center"
      />
    );
  }
  console.log("Rendering report editor with report:", report);
  return (
    <div className="min-h-screen bg-gray-50">
      <ReportHeader />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          <ReportSidebar />

          {/* Editor Area */}
          <div className="col-span-12 space-y-6 lg:col-span-9">
            {report.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <SectionEditor
                  key={section.section_id}
                  section={section}
                  findings={findings}
                  isExpanded={!!expandedSections[section.section_id]}
                  onToggle={() => toggleSection(section.section_id)}
                  onHeaderChange={(header) => updateSection(section.section_id, { header })}
                  onSubHeaderChange={(sub_header) =>
                    updateSection(section.section_id, { sub_header })
                  }
                  onContentChange={(content) => updateSection(section.section_id, { content })}
                  onFindingsSelectionChange={(ids) =>
                    updateSection(section.section_id, { selected_finding_ids: ids })
                  }
                  onFieldValuesChange={(values) =>
                    updateSection(section.section_id, { field_values: values })
                  }
                  onSchemaChange={(fields) => updateSection(section.section_id, { fields: fields })}
                  onWidgetColumnsChange={(wId, cols) =>
                    updateWidgetColumns(section.section_id, wId, cols)
                  }
                  onWidgetRowsChange={(wId, rows) =>
                    updateWidgetRows(section.section_id, wId, rows)
                  }
                  onWidgetDataChange={(wId, data) =>
                    updateWidgetData(section.section_id, wId, data)
                  }
                  onWidgetDataSourceChange={(wId, ds) =>
                    updateWidgetDataSource(section.section_id, wId, ds)
                  }
                  onMove={(direction) => moveSection(index, direction)}
                  onDelete={() => deleteSection(section.section_id)}
                  onDragStart={(e) => handleDragStart(section.section_id)}
                  onDrop={(e) => handleDrop(section.section_id)}
                />
              ))}

            <AddSectionButton variant="main" />
          </div>
        </div>
      </div>

      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setAddSectionModalOpen(false)}
        onAdd={addSection}
        existingSectionsCount={report.sections.length}
      />
    </div>
  );
}

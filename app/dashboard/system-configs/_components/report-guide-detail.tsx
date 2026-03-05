"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Plus } from "lucide-react";
import { notify } from "@/lib/utils";
import { getReportGuideById } from "@/app/_actions/config-actions";
import BackButton from "@/components/back-button";

import { RiskFindingsGradingSection } from "./risk-findings-grading-section";
import { ControlsAssessmentSection } from "./controls-assessment-section";
import { AuditCriteriaRatingSection } from "./audit-criteria-rating-section";
import PageHeader from "@/components/page-header";

interface ReportGuideDetailProps {
  guideId: string;
}

export interface ReportGuideData {
  id: string;
  organization_id: string;
  report_type: "RISK_REPORT" | "AUDIT_REPORT";
  name: string;
  description: string;
  risk_findings_grading: RiskFindingGrading[];
  controls_assessment_guide: ControlsAssessmentGuide[];
  audit_criteria_rating: AuditCriteriaRating[];
  created_at: string;
  updated_at: string;
}

export interface RiskFindingGrading {
  id: string;
  report_guide_id: string;
  guide_type: "RISK_FINDINGS_GRADING";
  issue_rating: string;
  term_rating: string;
  symbol: string;
  color_hex: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ControlsAssessmentGuide {
  id: string;
  report_guide_id: string;
  guide_type: "CONTROLS_ASSESSMENT_GUIDE";
  control_name: string;
  assessment_desc: string;
  created_at: string;
  updated_at: string;
}

export interface AuditCriteriaRating {
  id: string;
  report_guide_id: string;
  guide_type: "AUDIT_CRITERIA_RATING";
  rating: string;
  criteria_desc: string;
  color_hex: string;
  created_at: string;
  updated_at: string;
}

export function ReportGuideDetail({ guideId }: ReportGuideDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [guide, setGuide] = useState<ReportGuideData | null>(null);

  useEffect(() => {
    fetchGuideDetail();
  }, [guideId]);

  const fetchGuideDetail = async () => {
    setIsLoading(true);
    try {
      const response = await getReportGuideById(guideId);

      if (response.success && response.data) {
        setGuide(response.data);
      } else {
        notify({ description: response.message || "Failed to load report guide", type: "error" });
        router.push("/dashboard/system-configs/report-guides");
      }
    } catch (error: any) {
      notify({ description: error?.message || "Failed to load report guide", type: "error" });
      router.push("/dashboard/system-configs/report-guides");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Report guide not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader title={guide.name} description={guide.description} icon="Compass" />
            <BackButton title="Back to Report Guides" />
          </div>
        </div>
      </div>

      {/* Risk Findings Grading Section */}
      <RiskFindingsGradingSection
        reportGuideId={guideId}
        initialData={guide.risk_findings_grading}
        onDataUpdated={fetchGuideDetail}
      />

      {/* Controls Assessment Guide Section */}
      <ControlsAssessmentSection
        reportGuideId={guideId}
        initialData={guide.controls_assessment_guide}
        onDataUpdated={fetchGuideDetail}
      />

      {/* Audit Criteria Rating Section */}
      <AuditCriteriaRatingSection
        reportGuideId={guideId}
        initialData={guide.audit_criteria_rating}
        onDataUpdated={fetchGuideDetail}
      />
    </div>
  );
}

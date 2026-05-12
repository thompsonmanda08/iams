import type { ReportContent } from "@/lib/types/report-types";

export function ensureVersionedShape(content: ReportContent): ReportContent {
  if (Array.isArray(content.versions) && typeof content.current_version_number === "number") {
    return content;
  }
  return {
    ...content,
    current_version_number: content.current_version_number ?? 1,
    versions: content.versions ?? []
  };
}

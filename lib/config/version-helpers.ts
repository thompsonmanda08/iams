import type {
  ReportContent,
  ReportUserRef,
  ReportVersionSnapshot,
  VersionEdit
} from "@/lib/types/report-types";

export function nextVersionNumber(versions: Pick<ReportVersionSnapshot, "version_number">[]): number {
  if (versions.length === 0) return 1;
  return versions.reduce((max, v) => (v.version_number > max ? v.version_number : max), 0) + 1;
}

export function buildSnapshotFromCurrent(
  content: ReportContent,
  user: ReportUserRef,
  label?: string
): ReportVersionSnapshot {
  const versions = content.versions ?? [];
  return {
    version_number: nextVersionNumber(versions),
    label,
    status: "DRAFT",
    title: content.title,
    management_standard: content.management_standard,
    branding: structuredClone(content.branding),
    sections: structuredClone(content.sections),
    snapshotted_at: new Date().toISOString(),
    snapshotted_by: user,
    edit_log: []
  };
}

export function findVersionIndex(
  versions: ReportVersionSnapshot[],
  versionNumber: number
): number {
  return versions.findIndex((v) => v.version_number === versionNumber);
}

export function applyVersionPatch(
  version: ReportVersionSnapshot,
  patch: Partial<ReportVersionSnapshot>,
  user: ReportUserRef,
  summary?: string
): ReportVersionSnapshot {
  // Destructure out version_number and edit_log so they cannot be overwritten by a patch
  const { version_number: _ignored, edit_log: _ignoredLog, ...allowed } = patch;
  void _ignored;
  void _ignoredLog;
  const edit: VersionEdit = {
    edited_at: new Date().toISOString(),
    edited_by: user,
    summary
  };
  return {
    ...version,
    ...allowed,
    edit_log: [...version.edit_log, edit]
  };
}

export function computeAggregateStatus(
  versions: ReportVersionSnapshot[]
): "DRAFT" | "PUBLISHED" | "ARCHIVED" {
  if (versions.length === 0) return "DRAFT";
  if (versions.some((v) => v.status === "PUBLISHED")) return "PUBLISHED";
  if (versions.every((v) => v.status === "ARCHIVED")) return "ARCHIVED";
  return "DRAFT";
}

export function syncTopLevelToVersion(
  content: ReportContent,
  versionNumber: number,
  user: ReportUserRef
): ReportContent {
  const versions = content.versions ?? [];
  const idx = findVersionIndex(versions, versionNumber);
  if (idx === -1) return content;

  const edit: VersionEdit = {
    edited_at: new Date().toISOString(),
    edited_by: user
  };

  const updatedVersion: ReportVersionSnapshot = {
    ...versions[idx],
    title: content.title,
    management_standard: content.management_standard,
    branding: structuredClone(content.branding),
    sections: structuredClone(content.sections),
    edit_log: [...versions[idx].edit_log, edit]
  };

  const updatedVersions = [...versions];
  updatedVersions[idx] = updatedVersion;

  return { ...content, versions: updatedVersions };
}

export function bootstrapV1FromTopLevel(
  content: ReportContent,
  user: ReportUserRef
): ReportContent {
  const v1 = buildSnapshotFromCurrent({ ...content, versions: [] }, user);
  return {
    ...content,
    versions: [v1],
    current_version_number: 1
  };
}

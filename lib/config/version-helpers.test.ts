import { describe, expect, it } from "vitest";
import {
  buildSnapshotFromCurrent,
  nextVersionNumber,
  findVersionIndex,
  applyVersionPatch,
  computeAggregateStatus
} from "./version-helpers";
import type {
  ReportContent,
  ReportUserRef,
  ReportVersionSnapshot
} from "@/lib/types/report-types";

const user: ReportUserRef = { user_id: "u1", name: "Alice", email: "a@x" };

const baseContent: ReportContent = {
  report_id: "r1",
  report_type: "general_audit",
  title: "Current Draft",
  version: "1.0",
  branding: { primary_color: "#0a0", secondary_color: "#bbb", font_family: "Inter" },
  sections: [
    {
      section_id: "s1",
      section_type: "text_only",
      order: 0,
      include_in_toc: true,
      toc_level: 1,
      header: "Intro",
      widgets: []
    }
  ],
  management_standard: "ISO27001",
  current_version_number: 1,
  versions: []
};

describe("nextVersionNumber", () => {
  it("returns 1 for empty versions", () => {
    expect(nextVersionNumber([])).toBe(1);
  });
  it("returns max + 1 for non-empty versions", () => {
    expect(
      nextVersionNumber([
        { version_number: 2 } as ReportVersionSnapshot,
        { version_number: 5 } as ReportVersionSnapshot,
        { version_number: 3 } as ReportVersionSnapshot
      ])
    ).toBe(6);
  });
});

describe("buildSnapshotFromCurrent", () => {
  it("captures current top-level fields with metadata", () => {
    const snap = buildSnapshotFromCurrent(baseContent, user, "before-review");
    expect(snap.version_number).toBe(1);
    expect(snap.label).toBe("before-review");
    expect(snap.status).toBe("DRAFT");
    expect(snap.title).toBe("Current Draft");
    expect(snap.management_standard).toBe("ISO27001");
    expect(snap.branding).toEqual(baseContent.branding);
    expect(snap.sections).toEqual(baseContent.sections);
    expect(snap.sections).not.toBe(baseContent.sections); // deep clone
    expect(snap.snapshotted_by).toEqual(user);
    expect(snap.edit_log).toEqual([]);
    expect(typeof snap.snapshotted_at).toBe("string");
  });

  it("omits label when not supplied", () => {
    const snap = buildSnapshotFromCurrent(baseContent, user);
    expect(snap.label).toBeUndefined();
  });

  it("increments version number based on existing versions", () => {
    const withExisting: ReportContent = {
      ...baseContent,
      versions: [{ version_number: 7 } as ReportVersionSnapshot]
    };
    const snap = buildSnapshotFromCurrent(withExisting, user);
    expect(snap.version_number).toBe(8);
  });
});

describe("findVersionIndex", () => {
  it("returns index of matching version_number", () => {
    const versions = [
      { version_number: 1 } as ReportVersionSnapshot,
      { version_number: 5 } as ReportVersionSnapshot,
      { version_number: 9 } as ReportVersionSnapshot
    ];
    expect(findVersionIndex(versions, 5)).toBe(1);
  });
  it("returns -1 when not found", () => {
    expect(findVersionIndex([], 1)).toBe(-1);
  });
});

describe("applyVersionPatch", () => {
  const version: ReportVersionSnapshot = {
    version_number: 1,
    status: "DRAFT",
    title: "Old",
    branding: baseContent.branding,
    sections: [],
    snapshotted_at: "2026-01-01T00:00:00Z",
    snapshotted_by: user,
    edit_log: []
  };

  it("applies patch fields and appends edit log entry", () => {
    const updated = applyVersionPatch(version, { title: "New" }, user, "renamed");
    expect(updated.title).toBe("New");
    expect(updated.edit_log).toHaveLength(1);
    expect(updated.edit_log[0].summary).toBe("renamed");
    expect(updated.edit_log[0].edited_by).toEqual(user);
    expect(typeof updated.edit_log[0].edited_at).toBe("string");
  });

  it("does not mutate the original version", () => {
    const updated = applyVersionPatch(version, { title: "New" }, user);
    expect(version.title).toBe("Old");
    expect(version.edit_log).toHaveLength(0);
    expect(updated).not.toBe(version);
  });

  it("ignores version_number changes in patch", () => {
    const updated = applyVersionPatch(
      version,
      { version_number: 999, title: "X" } as Partial<ReportVersionSnapshot>,
      user
    );
    expect(updated.version_number).toBe(1);
  });
});

describe("computeAggregateStatus", () => {
  it("returns PUBLISHED when any version is PUBLISHED", () => {
    expect(
      computeAggregateStatus([
        { status: "DRAFT" } as ReportVersionSnapshot,
        { status: "PUBLISHED" } as ReportVersionSnapshot
      ])
    ).toBe("PUBLISHED");
  });
  it("returns ARCHIVED when all versions are ARCHIVED", () => {
    expect(
      computeAggregateStatus([
        { status: "ARCHIVED" } as ReportVersionSnapshot,
        { status: "ARCHIVED" } as ReportVersionSnapshot
      ])
    ).toBe("ARCHIVED");
  });
  it("returns DRAFT for empty versions", () => {
    expect(computeAggregateStatus([])).toBe("DRAFT");
  });
  it("returns DRAFT when only DRAFT versions exist", () => {
    expect(
      computeAggregateStatus([{ status: "DRAFT" } as ReportVersionSnapshot])
    ).toBe("DRAFT");
  });
});

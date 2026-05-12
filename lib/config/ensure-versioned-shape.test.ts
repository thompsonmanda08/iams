import { describe, expect, it } from "vitest";
import { ensureVersionedShape } from "./ensure-versioned-shape";
import type { ReportContent } from "@/lib/types/report-types";

const baseLegacy: ReportContent = {
  report_id: "r1",
  report_type: "general_audit",
  title: "Legacy Report",
  version: "1.0",
  branding: { primary_color: "#000", secondary_color: "#111", font_family: "Inter" },
  sections: []
};

describe("ensureVersionedShape", () => {
  it("adds versions=[] and current_version_number=1 when missing", () => {
    const result = ensureVersionedShape(baseLegacy);
    expect(result.versions).toEqual([]);
    expect(result.current_version_number).toBe(1);
  });

  it("preserves existing versions and counter if already present", () => {
    const versioned: ReportContent = {
      ...baseLegacy,
      current_version_number: 3,
      versions: [
        {
          version_number: 1,
          status: "PUBLISHED",
          title: "v1",
          branding: baseLegacy.branding,
          sections: [],
          snapshotted_at: "2026-01-01T00:00:00Z",
          snapshotted_by: { user_id: "u1", name: "U", email: "u@x" },
          edit_log: []
        }
      ]
    };
    const result = ensureVersionedShape(versioned);
    expect(result.versions).toHaveLength(1);
    expect(result.current_version_number).toBe(3);
  });

  it("is idempotent", () => {
    const once = ensureVersionedShape(baseLegacy);
    const twice = ensureVersionedShape(once);
    expect(twice).toEqual(once);
  });

  it("preserves all other top-level fields untouched", () => {
    const result = ensureVersionedShape(baseLegacy);
    expect(result.report_id).toBe("r1");
    expect(result.title).toBe("Legacy Report");
    expect(result.report_type).toBe("general_audit");
  });
});

# Report Versioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-version support to reports so users can manually snapshot a report into a labeled, editable version history, with per-version publish and PDF.

**Architecture:** Versions live inside `report_content.versions[]` as an append-only array of frozen-ish snapshots; the current draft remains at top-level so existing renderer/PDF code paths stay unchanged. Server actions read → patch → write the full `report_content` blob (no new backend endpoints required). UI exposes versions via a new History tab next to the existing Editor.

**Tech Stack:** Next.js 15 (server actions), React 19, TanStack Query v5, Zustand, Tailwind, shadcn/ui (Radix), Vitest + Testing Library (added in Phase 0).

**Spec:** [`docs/superpowers/specs/2026-05-12-report-versioning-design.md`](../specs/2026-05-12-report-versioning-design.md)

---

## File Structure

### Create

- `vitest.config.ts` — vitest setup w/ Next.js path aliases (`@/`)
- `vitest.setup.ts` — Testing Library `expect` extensions, jsdom polyfills
- `lib/config/version-helpers.ts` — pure helpers: build snapshot, find/mutate version, compute aggregate status, append edit log
- `lib/config/version-helpers.test.ts` — unit tests
- `lib/config/ensure-versioned-shape.ts` — lazy migration helper
- `lib/config/ensure-versioned-shape.test.ts` — unit tests
- `components/reports/report-version-history.tsx` — history list view
- `components/reports/snapshot-version-dialog.tsx` — "Save as new version" dialog
- `components/reports/version-viewer-dialog.tsx` — view/edit a single snapshot

### Modify

- `package.json` — add vitest, @testing-library/{react,jest-dom,user-event}, jsdom, @vitejs/plugin-react, test script
- `lib/types/report-types.ts` — add `VersionEdit`, `ReportVersionSnapshot`; extend `ReportContent` with `current_version_number`, `versions`
- `app/_actions/reports-actions.ts` — 4 new actions (`snapshotReportVersion`, `updateReportVersion`, `getReportVersion`, `publishReportVersion`); modify `publishReport` to auto-snapshot
- `hooks/use-report-queries.ts` — new `useReportVersions`, `useSnapshotVersion`, `useUpdateVersion`, `usePublishVersion` mutations
- `app/dashboard/(modules)/reports/_components/report-details-client.tsx` — wrap builder in tabs; add History tab; apply `ensureVersionedShape` to initial report
- `components/reports/report-builder.tsx` — add "Save as New Version" button next to Save Draft

---

## Phase 0: Test Infrastructure

### Task 0.1: Install Vitest + Testing Library

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Install dev dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vite-tsconfig-paths
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"]
  }
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to `package.json`**

Inside `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify vitest runs (no tests yet)**

Run: `pnpm test`
Expected: `No test files found` (exit 0 or 1 — both acceptable; what matters is no config error)

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts vitest.setup.ts
git commit -m "test: add vitest + testing library setup"
```

---

## Phase 1: Types + Pure Helpers

### Task 1.1: Add version types

**Files:**
- Modify: `lib/types/report-types.ts`

- [ ] **Step 1: Append types after the existing `ReportContent` definition**

Edit `lib/types/report-types.ts`. Find the `ReportContent` interface (around line 174) and add after it:

```ts
export interface VersionEdit {
  edited_at: string;
  edited_by: ReportUserRef;
  summary?: string;
}

export interface ReportVersionSnapshot {
  version_number: number;
  label?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  title: string;
  management_standard?: string;
  branding: ReportBranding;
  sections: ReportSection[];
  pdf_url?: string;
  snapshotted_at: string;
  snapshotted_by: ReportUserRef;
  published_at?: string;
  published_by?: ReportUserRef;
  edit_log: VersionEdit[];
}
```

- [ ] **Step 2: Extend `ReportContent`**

In the same file, edit the `ReportContent` interface (around line 174–187) to add two optional fields:

```ts
export interface ReportContent {
  report_id: string;
  report_type: ReportType;
  title: string;
  version: string;
  status?: ReportStatus;
  management_standard?: string;
  branding: ReportBranding;
  sections: ReportSection[];
  created_at?: string;
  updated_at?: string;
  created_by?: ReportUserRef;
  updated_by?: ReportUserRef;
  // NEW — versioning
  current_version_number?: number;
  versions?: ReportVersionSnapshot[];
}
```

Both fields are optional to keep legacy reports type-compatible. The `ensureVersionedShape` helper in Task 1.2 normalizes them to defined values at read time.

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors related to report-types.ts

- [ ] **Step 4: Commit**

```bash
git add lib/types/report-types.ts
git commit -m "types(reports): add VersionEdit and ReportVersionSnapshot"
```

### Task 1.2: `ensureVersionedShape` migration helper (TDD)

**Files:**
- Create: `lib/config/ensure-versioned-shape.ts`
- Test: `lib/config/ensure-versioned-shape.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/config/ensure-versioned-shape.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test, confirm failure**

Run: `pnpm test -- lib/config/ensure-versioned-shape.test.ts`
Expected: FAIL — `Cannot find module './ensure-versioned-shape'`

- [ ] **Step 3: Implement**

Create `lib/config/ensure-versioned-shape.ts`:

```ts
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
```

- [ ] **Step 4: Run test, confirm pass**

Run: `pnpm test -- lib/config/ensure-versioned-shape.test.ts`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add lib/config/ensure-versioned-shape.ts lib/config/ensure-versioned-shape.test.ts
git commit -m "feat(reports): add ensureVersionedShape lazy migration helper"
```

### Task 1.3: Version helpers (TDD)

**Files:**
- Create: `lib/config/version-helpers.ts`
- Test: `lib/config/version-helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/config/version-helpers.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test, confirm failure**

Run: `pnpm test -- lib/config/version-helpers.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

Create `lib/config/version-helpers.ts`:

```ts
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
  const { version_number: _ignored, edit_log: _ignoredLog, ...allowed } = patch;
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
```

- [ ] **Step 4: Run test, confirm pass**

Run: `pnpm test -- lib/config/version-helpers.test.ts`
Expected: PASS — all describes green

- [ ] **Step 5: Commit**

```bash
git add lib/config/version-helpers.ts lib/config/version-helpers.test.ts
git commit -m "feat(reports): add pure version helpers (snapshot, patch, status aggregate)"
```

---

## Phase 2: Server Actions

### Task 2.1: `getReportVersion` action

**Files:**
- Modify: `app/_actions/reports-actions.ts`

- [ ] **Step 1: Add the action**

At the end of the REPORTS CRUD section (before the DATA SOURCES section, around line 346 in the current file), insert:

```ts
/**
 * Get a single version snapshot from a report
 */
export async function getReportVersion(
  reportId: string,
  versionNumber: number
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const versions = reportRes.data.data.report_content.versions ?? [];
    const snapshot = versions.find((v: any) => v.version_number === versionNumber);

    if (!snapshot) {
      return handleBadRequest(`Version ${versionNumber} not found`);
    }

    return successResponse(snapshot);
  } catch (error: any) {
    return handleError(
      error,
      "GET | GET REPORT VERSION",
      `/api/v1/reports/${reportId}#v${versionNumber}`
    );
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): add getReportVersion server action"
```

### Task 2.2: `snapshotReportVersion` action

**Files:**
- Modify: `app/_actions/reports-actions.ts`

- [ ] **Step 1: Add imports at the top**

Edit the import block at the top of `app/_actions/reports-actions.ts`. Add `buildSnapshotFromCurrent` and `computeAggregateStatus`:

```ts
import {
  normalizeManagementStandard,
  getTemplateForStandard
} from "@/components/reports/report-templates";
import {
  buildSnapshotFromCurrent,
  computeAggregateStatus,
  findVersionIndex,
  applyVersionPatch
} from "@/lib/config/version-helpers";
import { ensureVersionedShape } from "@/lib/config/ensure-versioned-shape";
import { getSessionUser } from "@/app/_actions/session-actions"; // adjust path per actual session helper
```

Note: confirm the session-fetching helper. If `getSessionUser` does not exist under that exact path, use whatever the project's existing server-side session retrieval is (search for `getServerSession`, `getCurrentUser`, or similar in `app/_actions/`). Document the choice in the commit message.

- [ ] **Step 2: Find the project's server-side session helper**

Run: `pnpm exec grep -r --include="*.ts" -l "session" app/_actions/`
Inspect candidates and pick the one returning `{ id, name, email }`. If none exists, create `lib/server/session.ts` with a minimal `getServerSession()` that reads from the existing auth setup. (Out of scope to design a new one — if blocked, raise to user.)

- [ ] **Step 3: Add the action**

Append to `app/_actions/reports-actions.ts` after `getReportVersion`:

```ts
/**
 * Create a new version snapshot of the current draft
 */
export async function snapshotReportVersion(
  reportId: string,
  label?: string
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const session = await getSessionUser();
    if (!session) {
      return handleBadRequest("Session required to snapshot");
    }

    const current = ensureVersionedShape(reportRes.data.data.report_content);
    const userRef = { user_id: session.id, name: session.name, email: session.email };
    const newSnapshot = buildSnapshotFromCurrent(current, userRef, label);

    const updatedContent = {
      ...current,
      versions: [...(current.versions ?? []), newSnapshot],
      current_version_number: newSnapshot.version_number
    };

    const aggregateStatus = computeAggregateStatus(updatedContent.versions ?? []);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        report_content: updatedContent,
        status: aggregateStatus,
        is_active: true
      }
    });

    revalidatePath(`/dashboard/reports/${reportId}`);
    return successResponse(response?.data, `Snapshot v${newSnapshot.version_number} created`);
  } catch (error: any) {
    return handleError(
      error,
      "POST | SNAPSHOT REPORT VERSION",
      `/api/v1/reports/${reportId}#snapshot`
    );
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors. Fix any import path issues for `getSessionUser` based on Step 2 findings.

- [ ] **Step 5: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): add snapshotReportVersion server action"
```

### Task 2.3: `updateReportVersion` action

**Files:**
- Modify: `app/_actions/reports-actions.ts`

- [ ] **Step 1: Add the action**

Append after `snapshotReportVersion`:

```ts
/**
 * Update a specific version snapshot's fields and append an edit log entry
 */
export async function updateReportVersion(
  reportId: string,
  versionNumber: number,
  patch: Partial<{
    label: string;
    title: string;
    management_standard: string;
    branding: any;
    sections: any[];
  }>,
  summary?: string
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const session = await getSessionUser();
    if (!session) {
      return handleBadRequest("Session required to edit version");
    }

    const current = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = current.versions ?? [];
    const idx = findVersionIndex(versions, versionNumber);

    if (idx === -1) {
      return handleBadRequest(`Version ${versionNumber} not found`);
    }

    const userRef = { user_id: session.id, name: session.name, email: session.email };
    const updatedVersion = applyVersionPatch(versions[idx], patch as any, userRef, summary);

    const updatedVersions = [...versions];
    updatedVersions[idx] = updatedVersion;

    const updatedContent = { ...current, versions: updatedVersions };
    const aggregateStatus = computeAggregateStatus(updatedVersions);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        report_content: updatedContent,
        status: aggregateStatus,
        is_active: true
      }
    });

    revalidatePath(`/dashboard/reports/${reportId}`);
    return successResponse(response?.data, `Version ${versionNumber} updated`);
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE REPORT VERSION",
      `/api/v1/reports/${reportId}#v${versionNumber}`
    );
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): add updateReportVersion server action"
```

### Task 2.4: `publishReportVersion` action

**Files:**
- Modify: `app/_actions/reports-actions.ts`

- [ ] **Step 1: Add the action**

Append after `updateReportVersion`:

```ts
/**
 * Publish a specific version. Optionally generates the PDF for that snapshot.
 * Idempotent if the version is already PUBLISHED (regenerates PDF when generatePdf=true).
 */
export async function publishReportVersion(
  reportId: string,
  versionNumber: number,
  generatePdf: boolean = true
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const reportRes = await getReport(reportId);
    if (!reportRes.success || !reportRes.data?.data?.report_content) {
      return handleBadRequest("Report not found");
    }

    const session = await getSessionUser();
    if (!session) {
      return handleBadRequest("Session required to publish version");
    }

    const current = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = current.versions ?? [];
    const idx = findVersionIndex(versions, versionNumber);

    if (idx === -1) {
      return handleBadRequest(`Version ${versionNumber} not found`);
    }

    const userRef = { user_id: session.id, name: session.name, email: session.email };
    const now = new Date().toISOString();

    let pdfUrl: string | undefined = versions[idx].pdf_url;
    if (generatePdf) {
      try {
        const pdfRes = await authenticatedApiClient({
          url: `/api/v1/reports/${reportId}/publish`,
          method: "POST",
          data: { generate_pdf: true, version_number: versionNumber }
        });
        pdfUrl = pdfRes?.data?.data?.pdf_url ?? pdfUrl;
      } catch (pdfError: any) {
        console.warn("[publishReportVersion] PDF generation failed:", pdfError?.message);
        // Continue — publish status is still applied; pdf_url remains as it was
      }
    }

    const updatedVersion = {
      ...versions[idx],
      status: "PUBLISHED" as const,
      published_at: versions[idx].published_at ?? now,
      published_by: versions[idx].published_by ?? userRef,
      pdf_url: pdfUrl
    };

    const updatedVersions = [...versions];
    updatedVersions[idx] = updatedVersion;

    const updatedContent = { ...current, versions: updatedVersions };
    const aggregateStatus = computeAggregateStatus(updatedVersions);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        report_content: updatedContent,
        status: aggregateStatus,
        is_active: true
      }
    });

    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath("/dashboard/reports");
    return successResponse(response?.data, `Version ${versionNumber} published`);
  } catch (error: any) {
    return handleError(
      error,
      "POST | PUBLISH REPORT VERSION",
      `/api/v1/reports/${reportId}#publish-v${versionNumber}`
    );
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): add publishReportVersion server action"
```

### Task 2.5: Modify `publishReport` to auto-snapshot

**Files:**
- Modify: `app/_actions/reports-actions.ts:302-326`

- [ ] **Step 1: Replace `publishReport` body**

Edit `app/_actions/reports-actions.ts`, find the `publishReport` function (around line 302). Replace its body with:

```ts
export async function publishReport(
  reportId: string,
  generatePdf: boolean = true
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    // Always snapshot current draft first so published state is tracked
    const snapshotRes = await snapshotReportVersion(reportId);
    if (!snapshotRes.success) {
      return snapshotRes;
    }

    // Re-read to find the version we just created (snapshotReportVersion sets current_version_number)
    const reportRes = await getReport(reportId);
    const versionNumber = reportRes.data?.data?.report_content?.current_version_number;
    if (typeof versionNumber !== "number") {
      return handleBadRequest("Could not locate snapshot to publish");
    }

    return publishReportVersion(reportId, versionNumber, generatePdf);
  } catch (error: any) {
    return handleError(error, "POST | PUBLISH REPORT", `/api/v1/reports/${reportId}/publish`);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "refactor(reports): publishReport auto-snapshots current draft before publishing"
```

### Task 2.6: Apply migration helper in `getReport`

**Files:**
- Modify: `app/_actions/reports-actions.ts:156-171`

- [ ] **Step 1: Add migration on read**

Find `getReport` (around line 156). Modify the success path to apply `ensureVersionedShape`:

```ts
export async function getReport(reportId: string): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "GET"
    });

    // Lazy-migrate report_content shape
    if (response?.data?.data?.report_content) {
      response.data.data.report_content = ensureVersionedShape(
        response.data.data.report_content
      );
    }

    return successResponse(response?.data);
  } catch (error: any) {
    return handleError(error, "GET | GET REPORT", `/api/v1/reports/${reportId}`);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): apply ensureVersionedShape on getReport read path"
```

---

## Phase 3: React Query Hooks

### Task 3.1: Add version mutation hooks

**Files:**
- Modify: `hooks/use-report-queries.ts`

- [ ] **Step 1: Add imports**

At the top of `hooks/use-report-queries.ts`, extend the existing import from `@/app/_actions/reports-actions`:

```ts
import {
  fetchInitialReport,
  fetchFindingsForReport,
  getDataSources,
  saveReport as saveReportAction,
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  publishReport,
  fetchWidgetData as fetchWidgetDataAction,
  getReportByEntityId,
  snapshotReportVersion,
  updateReportVersion,
  publishReportVersion,
  getReportVersion
} from "@/app/_actions/reports-actions";
```

- [ ] **Step 2: Add hooks at the bottom of the file**

Append at end of file:

```ts
/**
 * Mutation: create a new version snapshot of the current draft
 */
export function useSnapshotVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (label?: string) => {
      const result = await snapshotReportVersion(reportId, label);
      if (!result.success) throw new Error(result.message || "Failed to snapshot");
      return result.data;
    },
    onSuccess: () => {
      notify({ description: "Version saved", type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to save version", type: "error" });
    }
  });
}

/**
 * Mutation: update a specific version snapshot
 */
export function useUpdateVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      versionNumber: number;
      patch: Parameters<typeof updateReportVersion>[2];
      summary?: string;
    }) => {
      const result = await updateReportVersion(
        reportId,
        args.versionNumber,
        args.patch,
        args.summary
      );
      if (!result.success) throw new Error(result.message || "Failed to update version");
      return result.data;
    },
    onSuccess: (_data, args) => {
      notify({ description: `Version ${args.versionNumber} updated`, type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to update version", type: "error" });
    }
  });
}

/**
 * Mutation: publish a specific version
 */
export function usePublishVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { versionNumber: number; generatePdf?: boolean }) => {
      const result = await publishReportVersion(
        reportId,
        args.versionNumber,
        args.generatePdf ?? true
      );
      if (!result.success) throw new Error(result.message || "Failed to publish version");
      return result.data;
    },
    onSuccess: (_data, args) => {
      notify({
        description: `Version ${args.versionNumber} published`,
        type: "success"
      });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to publish version", type: "error" });
    }
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add hooks/use-report-queries.ts
git commit -m "feat(reports): add useSnapshotVersion / useUpdateVersion / usePublishVersion hooks"
```

---

## Phase 4: UI Components

### Task 4.1: Snapshot dialog

**Files:**
- Create: `components/reports/snapshot-version-dialog.tsx`

- [ ] **Step 1: Implement**

Create `components/reports/snapshot-version-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSnapshotVersion } from "@/hooks/use-report-queries";

interface SnapshotVersionDialogProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function SnapshotVersionDialog({
  reportId,
  open,
  onOpenChange,
  onSaved
}: SnapshotVersionDialogProps) {
  const [label, setLabel] = useState("");
  const snapshot = useSnapshotVersion(reportId);

  const handleConfirm = () => {
    snapshot.mutate(label.trim() || undefined, {
      onSuccess: () => {
        setLabel("");
        onOpenChange(false);
        onSaved?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as new version</DialogTitle>
          <DialogDescription>
            Captures the current draft as an immutable-feeling version snapshot. You can keep
            editing the draft afterward.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="version-label">Label (optional)</Label>
          <Input
            id="version-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Pre-management review"
            maxLength={120}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={snapshot.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={snapshot.isPending}>
            {snapshot.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

Verify component import paths match the project conventions. The shadcn `Dialog`, `Button`, `Input`, `Label` components must already exist at `@/components/ui/*`. Adjust paths if they differ.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add components/reports/snapshot-version-dialog.tsx
git commit -m "feat(reports): add SnapshotVersionDialog component"
```

### Task 4.2: Version history list

**Files:**
- Create: `components/reports/report-version-history.tsx`

- [ ] **Step 1: Implement**

Create `components/reports/report-version-history.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Eye, FileText, History, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { usePublishVersion } from "@/hooks/use-report-queries";
import type { ReportVersionSnapshot } from "@/lib/types/report-types";
import { VersionViewerDialog } from "./version-viewer-dialog";

interface ReportVersionHistoryProps {
  reportId: string;
  versions: ReportVersionSnapshot[];
}

export function ReportVersionHistory({ reportId, versions }: ReportVersionHistoryProps) {
  const [openVersion, setOpenVersion] = useState<{
    version: ReportVersionSnapshot;
    mode: "view" | "edit";
  } | null>(null);
  const publish = usePublishVersion(reportId);

  const sorted = useMemo(
    () => [...versions].sort((a, b) => b.version_number - a.version_number),
    [versions]
  );

  if (sorted.length === 0) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <History className="text-muted-foreground mb-3 h-10 w-10" strokeWidth={1.5} />
          <h3 className="text-foreground mb-1 text-lg font-semibold">No versions yet</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            Take a snapshot from the editor to start tracking versions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <ul className="divide-border bg-card divide-y rounded-lg border">
        {sorted.map((v) => (
          <li key={v.version_number} className="flex items-center gap-4 px-4 py-3">
            <Badge variant="outline" className="font-mono">
              v{v.version_number}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground truncate font-medium">{v.title}</span>
                {v.label && (
                  <span className="text-muted-foreground truncate text-sm">— {v.label}</span>
                )}
                <StatusBadge status={v.status} />
                {v.edit_log.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {v.edit_log.length} edit{v.edit_log.length === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                Snapshotted {format(new Date(v.snapshotted_at), "PPp")} by {v.snapshotted_by.name}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="View"
                onClick={() => setOpenVersion({ version: v, mode: "view" })}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Edit"
                onClick={() => setOpenVersion({ version: v, mode: "edit" })}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {v.pdf_url && (
                <Button asChild size="icon" variant="ghost" title="Download PDF">
                  <a href={v.pdf_url} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {v.status === "PUBLISHED" && !v.pdf_url && (
                <Button
                  size="icon"
                  variant="ghost"
                  title="Retry PDF generation"
                  disabled={publish.isPending}
                  onClick={() =>
                    publish.mutate({ versionNumber: v.version_number, generatePdf: true })
                  }
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}
              {v.status === "DRAFT" && (
                <Button
                  size="icon"
                  variant="ghost"
                  title="Publish version"
                  disabled={publish.isPending}
                  onClick={() => publish.mutate({ versionNumber: v.version_number })}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {openVersion && (
        <VersionViewerDialog
          reportId={reportId}
          version={openVersion.version}
          mode={openVersion.mode}
          open={openVersion !== null}
          onOpenChange={(open) => {
            if (!open) setOpenVersion(null);
          }}
        />
      )}
    </>
  );
}
```

If `StatusBadge` import doesn't accept the version's `status` string, normalize first by mapping `DRAFT|PUBLISHED|ARCHIVED` to whatever values `StatusBadge` expects (check `components/status-badge.tsx`).

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors (other than `VersionViewerDialog` not existing — created next task; you may temporarily stub the import as `() => null` to keep typecheck clean if working sequentially)

- [ ] **Step 3: Commit (after Task 4.3 completes — or commit with stub now and unstub later)**

Recommend: commit together with Task 4.3 to avoid broken intermediate state.

### Task 4.3: Version viewer/editor dialog

**Files:**
- Create: `components/reports/version-viewer-dialog.tsx`

- [ ] **Step 1: Implement**

Create `components/reports/version-viewer-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateVersion } from "@/hooks/use-report-queries";
import type { ReportVersionSnapshot } from "@/lib/types/report-types";

interface VersionViewerDialogProps {
  reportId: string;
  version: ReportVersionSnapshot;
  mode: "view" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionViewerDialog({
  reportId,
  version,
  mode,
  open,
  onOpenChange
}: VersionViewerDialogProps) {
  const [title, setTitle] = useState(version.title);
  const [label, setLabel] = useState(version.label ?? "");
  const [summary, setSummary] = useState("");
  const update = useUpdateVersion(reportId);

  const isEdit = mode === "edit";

  const handleSave = () => {
    update.mutate(
      {
        versionNumber: version.version_number,
        patch: {
          title: title.trim() || version.title,
          label: label.trim() || undefined
        },
        summary: summary.trim() || undefined
      },
      {
        onSuccess: () => {
          setSummary("");
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit version v${version.version_number}` : `View version v${version.version_number}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes are recorded in the version edit log."
              : "Read-only snapshot view."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="v-title">Title</Label>
            <Input
              id="v-title"
              value={title}
              readOnly={!isEdit}
              disabled={!isEdit}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="v-label">Label</Label>
            <Input
              id="v-label"
              value={label}
              readOnly={!isEdit}
              disabled={!isEdit}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="(no label)"
            />
          </div>

          <div className="text-muted-foreground text-xs">
            {version.sections.length} section{version.sections.length === 1 ? "" : "s"} captured in
            this snapshot. Section-level editing on prior versions is not yet supported — use the
            current draft for content changes and re-snapshot.
          </div>

          {isEdit && (
            <div className="grid gap-1.5">
              <Label htmlFor="v-summary">Edit summary (optional)</Label>
              <Textarea
                id="v-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. Renamed for clarity"
                rows={2}
              />
            </div>
          )}

          {version.edit_log.length > 0 && (
            <div className="bg-muted/40 rounded-md p-3">
              <div className="text-foreground mb-2 text-xs font-semibold">Edit log</div>
              <ul className="space-y-1 text-xs">
                {version.edit_log.map((e, i) => (
                  <li key={i} className="text-muted-foreground">
                    {new Date(e.edited_at).toLocaleString()} — {e.edited_by.name}
                    {e.summary ? ` · ${e.summary}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            {isEdit ? "Cancel" : "Close"}
          </Button>
          {isEdit && (
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

The dialog deliberately limits prior-version edits to title/label only for v1 — full section-level editing of prior versions adds significant complexity (renderer state, widget data refetch, etc.) and is out of scope. Spec line: "Editable, with edit log" is honored; the patch surface is intentionally small.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit (with Task 4.2)**

```bash
git add components/reports/report-version-history.tsx components/reports/version-viewer-dialog.tsx
git commit -m "feat(reports): add version history list and viewer dialog"
```

---

## Phase 5: Wire Into Report Details Page

### Task 5.1: Add "Save as New Version" button to report builder

**Files:**
- Modify: `components/reports/report-builder.tsx:5,777-792`

- [ ] **Step 1: Add icon import**

Find the existing icon import (around line 5):

```ts
import { Save, Download, FileText, Eye, Send, Loader2, Menu } from "lucide-react";
```

Change to:

```ts
import { Save, Download, FileText, Eye, Send, Loader2, Menu, GitBranch } from "lucide-react";
```

- [ ] **Step 2: Add SnapshotVersionDialog import**

Near the other component imports (around lines 9–36), add:

```ts
import { SnapshotVersionDialog } from "./snapshot-version-dialog";
```

- [ ] **Step 3: Add state for dialog**

Inside the component (find the `useState` block near the top of the component body, around line 100–150), add:

```ts
const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
```

- [ ] **Step 4: Add the button to the toolbar**

Find the toolbar block around line 777 (`<div className="flex gap-1 sm:gap-2">`). Insert the snapshot button right after the existing Save Draft button (after line 792):

```tsx
{report.status !== "PUBLISHED" && report.report_id && (
  <PermissionButton
    moduleCode={MODULE_CODES.AUDIT_REPORTS}
    action="can_edit"
    variant={"outline"}
    size="icon"
    onClick={() => setShowSnapshotDialog(true)}
    className="sm:w-auto sm:px-3"
    title="Save as new version">
    <GitBranch className="h-4 w-4" />
    <span className="hidden sm:inline md:hidden">Version</span>
    <span className="hidden md:inline">Save as Version</span>
  </PermissionButton>
)}
```

- [ ] **Step 5: Render the dialog**

Find the end of the component's return JSX (near the existing modals). Add:

```tsx
{report.report_id && (
  <SnapshotVersionDialog
    reportId={report.report_id}
    open={showSnapshotDialog}
    onOpenChange={setShowSnapshotDialog}
  />
)}
```

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 7: Commit**

```bash
git add components/reports/report-builder.tsx
git commit -m "feat(reports): add Save as Version button to report builder toolbar"
```

### Task 5.2: Add History tab to report details

**Files:**
- Modify: `app/dashboard/(modules)/reports/_components/report-details-client.tsx:283` (the final `return` statement)

- [ ] **Step 1: Add imports**

At the top of `app/dashboard/(modules)/reports/_components/report-details-client.tsx`, after the existing imports, add:

```ts
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportVersionHistory } from "@/components/reports/report-version-history";
import { ensureVersionedShape } from "@/lib/config/ensure-versioned-shape";
```

- [ ] **Step 2: Compute normalized versions inside the component**

Inside `ReportDetailsClient`, find the existing `mergedReport` useMemo (around line 202). After that block, add:

```ts
const versions = useMemo(() => {
  if (!initialReport) return [];
  const normalized = ensureVersionedShape(initialReport);
  return normalized.versions ?? [];
}, [initialReport]);
```

- [ ] **Step 3: Replace the existing return**

The current return at line 283 is exactly:

```tsx
return <ReportBuilder entity={entity} entityType={entityType} readOnlyType />;
```

Replace it with:

```tsx
return (
  <Tabs defaultValue="editor" className="w-full">
    <TabsList>
      <TabsTrigger value="editor">Editor</TabsTrigger>
      <TabsTrigger value="history">
        History
        {versions.length > 0 && (
          <span className="text-muted-foreground ml-1">({versions.length})</span>
        )}
      </TabsTrigger>
    </TabsList>
    <TabsContent value="editor" className="mt-4">
      <ReportBuilder entity={entity} entityType={entityType} readOnlyType />
    </TabsContent>
    <TabsContent value="history" className="mt-4">
      <ReportVersionHistory reportId={reportId} versions={versions} />
    </TabsContent>
  </Tabs>
);
```

Keep `readOnlyType` on the ReportBuilder — it's how the existing call site works.

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors

- [ ] **Step 6: Manual smoke test**

Run: `pnpm dev`
- Open an existing report at `/dashboard/reports/{id}`
- Verify both tabs render
- Editor tab: existing behavior unchanged
- History tab: empty state shows for un-versioned report

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/\(modules\)/reports/_components/report-details-client.tsx
git commit -m "feat(reports): add Editor/History tabs to report detail page"
```

---

## Phase 6: End-to-End Manual Verification

### Task 6.1: Full flow walk-through

**Files:** none

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Verify legacy report loads**

Open an existing pre-versioning report at `/dashboard/reports/{id}`. Confirm:
- Editor tab renders unchanged
- History tab shows empty state ("No versions yet")
- Browser console shows no migration errors

- [ ] **Step 3: Take first snapshot**

In Editor tab, click "Save as Version" → enter label "Initial baseline" → confirm.
Confirm:
- Toast: "Version saved"
- History tab badge shows `(1)`
- History list shows `v1` row with label, DRAFT status, snapshotted_at, snapshotted_by

- [ ] **Step 4: Edit prior version**

In History tab, click Edit on v1 → change title → enter edit summary → save.
Confirm:
- Toast: "Version 1 updated"
- Re-open v1 → edit log shows one entry with summary

- [ ] **Step 5: Take second snapshot**

In Editor tab, make a change to current draft, then click "Save as Version" with no label.
Confirm:
- v2 appears in History
- v1 row title reflects the edit from step 4 (not the new edit)

- [ ] **Step 6: Publish v1**

In History tab, click Publish on v1 → confirm.
Confirm:
- Toast: "Version 1 published"
- v1 status pill changes to PUBLISHED
- v1 row shows Download PDF button (if PDF generation succeeded)

- [ ] **Step 7: Verify aggregate status**

Navigate back to `/dashboard/reports` list. The row for this report should show PUBLISHED status (because v1 is PUBLISHED).

- [ ] **Step 8: Document any deviations**

Note any issues, missing pieces, or UX awkwardness in a follow-up task. Do NOT mark this phase complete until the golden path works end-to-end.

- [ ] **Step 9: Commit any small fixes discovered**

Stage and commit each fix as a discrete, scoped commit. Do not bundle multiple fixes into one commit.

---

## Phase 7: Lint + Final Build Verification

### Task 7.1: Lint and build

**Files:** none

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: no new errors. Fix any introduced lint violations.

- [ ] **Step 2: Run tests**

Run: `pnpm test`
Expected: all tests in `lib/config/*.test.ts` pass

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: build succeeds

- [ ] **Step 4: Commit (only if fixes were needed)**

Only commit if Step 1 introduced any source changes.

---

## Out of Scope (defer to v2 if requested)

- Section-level editing inside prior version snapshots (current spec limits prior-version edits to title/label)
- Diff/compare view between two versions
- Restore-from-version action that copies a prior snapshot back into current draft
- Version dropdown switcher in the editor header
- Backend-enforced atomicity for concurrent snapshot writes (ETags / optimistic concurrency)
- Search/filter/sort controls in the history list
- Component tests for `ReportVersionHistory`, `SnapshotVersionDialog`, `VersionViewerDialog` (require Testing Library helpers around Radix portals — defer once the Phase 0 setup matures)

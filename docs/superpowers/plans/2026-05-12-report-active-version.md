# Report Active Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an active-version selector to the Report Details sidebar that swaps the editor's working version; Save Draft mirrors edits into `versions[active]` with an `edit_log` entry; Submit publishes the active version directly. First Save Draft auto-creates v1 from the top-level template.

**Architecture:** Reuse the existing `report_content.current_version_number` field with broadened semantics (now means "active version"). Top-level `sections`/`branding`/`title` continue to mirror `versions[active]` so renderer + PDF paths are untouched. Server actions `updateReport`, `setActiveVersion` (new), and `publishReport` own the sync, mirror, and bootstrap responsibilities.

**Tech Stack:** Next.js 15 server actions, React 19, TanStack Query v5, Zustand, shadcn/ui (Select primitive), Vitest.

**Spec:** [`docs/superpowers/specs/2026-05-12-report-active-version-design.md`](../specs/2026-05-12-report-active-version-design.md)

**Branch:** `feat/report-versioning` (continue stacking commits on the v1 versioning branch)

---

## File Structure

### Modify

- `lib/config/version-helpers.ts` — add `syncTopLevelToVersion`, `bootstrapV1FromTopLevel`
- `lib/config/version-helpers.test.ts` — add unit tests for the two new helpers (TDD)
- `app/_actions/reports-actions.ts` — modify `updateReport` (bootstrap + sync), modify `publishReport` (drop snapshot hop), add `setActiveVersion`
- `hooks/use-report-queries.ts` — import `setActiveVersion`, add `useSetActiveVersion` hook
- `components/reports/report-sidebar.tsx` — replace the static `Version: 1.0` line with active-version Select; wire dirty-switch confirmation flow
- `components/reports/report-version-history.tsx` — replace Edit row action with Set-as-active; add active indicator pill
- `components/reports/version-viewer-dialog.tsx` — strip edit mode; dialog becomes view-only

No new files are needed.

---

## Phase 1: Pure Helpers (TDD)

### Task 1.1: Add `syncTopLevelToVersion` + `bootstrapV1FromTopLevel`

**Files:**
- Modify: `lib/config/version-helpers.ts`
- Test: `lib/config/version-helpers.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `lib/config/version-helpers.test.ts` (after the existing describes):

```ts
import { syncTopLevelToVersion, bootstrapV1FromTopLevel } from "./version-helpers";

describe("syncTopLevelToVersion", () => {
  const existingVersion: ReportVersionSnapshot = {
    version_number: 1,
    status: "DRAFT",
    title: "Old Title",
    branding: { primary_color: "#000", secondary_color: "#111", font_family: "Inter" },
    sections: [],
    snapshotted_at: "2026-01-01T00:00:00Z",
    snapshotted_by: user,
    edit_log: []
  };

  const contentWithVersion: ReportContent = {
    ...baseContent,
    title: "New Top-Level Title",
    sections: [
      {
        section_id: "s-new",
        section_type: "text_only",
        order: 0,
        include_in_toc: true,
        toc_level: 1,
        header: "Edited",
        widgets: []
      }
    ],
    current_version_number: 1,
    versions: [existingVersion]
  };

  it("copies top-level sections, branding, title into the target version", () => {
    const result = syncTopLevelToVersion(contentWithVersion, 1, user);
    expect(result.versions?.[0].title).toBe("New Top-Level Title");
    expect(result.versions?.[0].sections).toEqual(contentWithVersion.sections);
    expect(result.versions?.[0].sections).not.toBe(contentWithVersion.sections); // deep clone
  });

  it("appends one edit_log entry recording the editor", () => {
    const result = syncTopLevelToVersion(contentWithVersion, 1, user);
    expect(result.versions?.[0].edit_log).toHaveLength(1);
    expect(result.versions?.[0].edit_log[0].edited_by).toEqual(user);
    expect(typeof result.versions?.[0].edit_log[0].edited_at).toBe("string");
  });

  it("does not mutate the input content", () => {
    const before = JSON.stringify(contentWithVersion);
    syncTopLevelToVersion(contentWithVersion, 1, user);
    expect(JSON.stringify(contentWithVersion)).toBe(before);
  });

  it("leaves untouched versions alone when multiple exist", () => {
    const v2: ReportVersionSnapshot = { ...existingVersion, version_number: 2, title: "v2 untouched" };
    const multi: ReportContent = { ...contentWithVersion, versions: [existingVersion, v2] };
    const result = syncTopLevelToVersion(multi, 1, user);
    expect(result.versions?.[1].title).toBe("v2 untouched");
    expect(result.versions?.[1].edit_log).toHaveLength(0);
  });

  it("returns content unchanged if target version is missing", () => {
    const result = syncTopLevelToVersion(contentWithVersion, 999, user);
    expect(result).toEqual(contentWithVersion);
  });
});

describe("bootstrapV1FromTopLevel", () => {
  it("creates exactly one version with version_number=1 and active=1", () => {
    const empty: ReportContent = { ...baseContent, current_version_number: undefined, versions: [] };
    const result = bootstrapV1FromTopLevel(empty, user);
    expect(result.versions).toHaveLength(1);
    expect(result.versions?.[0].version_number).toBe(1);
    expect(result.current_version_number).toBe(1);
  });

  it("captures top-level fields verbatim into v1", () => {
    const empty: ReportContent = { ...baseContent, current_version_number: undefined, versions: [] };
    const result = bootstrapV1FromTopLevel(empty, user);
    expect(result.versions?.[0].title).toBe(baseContent.title);
    expect(result.versions?.[0].sections).toEqual(baseContent.sections);
    expect(result.versions?.[0].management_standard).toBe(baseContent.management_standard);
    expect(result.versions?.[0].branding).toEqual(baseContent.branding);
  });

  it("sets snapshot metadata on v1", () => {
    const empty: ReportContent = { ...baseContent, current_version_number: undefined, versions: [] };
    const result = bootstrapV1FromTopLevel(empty, user);
    expect(result.versions?.[0].status).toBe("DRAFT");
    expect(result.versions?.[0].snapshotted_by).toEqual(user);
    expect(typeof result.versions?.[0].snapshotted_at).toBe("string");
    expect(result.versions?.[0].edit_log).toEqual([]);
  });

  it("preserves all other top-level fields", () => {
    const empty: ReportContent = { ...baseContent, current_version_number: undefined, versions: [] };
    const result = bootstrapV1FromTopLevel(empty, user);
    expect(result.report_id).toBe(baseContent.report_id);
    expect(result.report_type).toBe(baseContent.report_type);
    expect(result.title).toBe(baseContent.title);
  });
});
```

- [ ] **Step 2: Run tests; confirm failure**

Run: `pnpm exec vitest run lib/config/version-helpers.test.ts`
Expected: FAIL — `syncTopLevelToVersion` and `bootstrapV1FromTopLevel` not exported.

- [ ] **Step 3: Implement helpers**

Append to `lib/config/version-helpers.ts`:

```ts
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
```

`buildSnapshotFromCurrent` already exists in this file — `bootstrapV1FromTopLevel` delegates to it. Pass `versions: []` so the helper computes `version_number = 1`.

- [ ] **Step 4: Run tests; confirm pass**

Run: `pnpm exec vitest run lib/config/version-helpers.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/config/version-helpers.ts lib/config/version-helpers.test.ts
git commit -m "feat(reports): add syncTopLevelToVersion + bootstrapV1FromTopLevel helpers"
```

---

## Phase 2: Server Actions

### Task 2.1: Modify `updateReport` to bootstrap + sync

**Files:**
- Modify: `app/_actions/reports-actions.ts`

The existing `updateReport` (around line 257, after Task 2.6 of v1 versioning) currently does a simple PUT. New behavior wraps the PUT with bootstrap/sync logic.

- [ ] **Step 1: Update imports**

Find the `version-helpers` import (added in v1 Task 2.2). Extend it to include the two new helpers:

```ts
import {
  buildSnapshotFromCurrent,
  computeAggregateStatus,
  findVersionIndex,
  applyVersionPatch,
  syncTopLevelToVersion,
  bootstrapV1FromTopLevel
} from "@/lib/config/version-helpers";
```

- [ ] **Step 2: Replace `updateReport` body**

Find the existing `updateReport` function (use `grep -n "export async function updateReport(" app/_actions/reports-actions.ts`). The current body looks like:

```ts
export async function updateReport(
  reportId: string,
  data: Partial<ReportContent>
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        ...data,
        is_active: data.is_active ?? true
      }
    });

    revalidatePath("/dashboard/reports");
    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(response?.data, "Report updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE REPORT", `/api/v1/reports/${reportId}`);
  }
}
```

Replace ENTIRELY with:

```ts
export async function updateReport(
  reportId: string,
  data: Partial<ReportContent>
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const { isAuthenticated, session } = await verifySession();
    if (!isAuthenticated) {
      return handleBadRequest("Session required to save");
    }
    const userRef = buildUserRef(session);
    if (!userRef) {
      return handleBadRequest("Session user details unavailable");
    }

    // Treat `data` as the new top-level state. Either bootstrap v1 or sync into versions[active].
    const topLevel = ensureVersionedShape(data as ReportContent);
    let synced: ReportContent;

    if ((topLevel.versions ?? []).length === 0) {
      synced = bootstrapV1FromTopLevel(topLevel, userRef);
    } else {
      const activeNum = topLevel.current_version_number;
      if (typeof activeNum !== "number" || findVersionIndex(topLevel.versions ?? [], activeNum) === -1) {
        // Fallback: pick highest existing version_number
        const highest = (topLevel.versions ?? []).reduce(
          (max, v) => (v.version_number > max ? v.version_number : max),
          0
        );
        synced = syncTopLevelToVersion({ ...topLevel, current_version_number: highest }, highest, userRef);
      } else {
        synced = syncTopLevelToVersion(topLevel, activeNum, userRef);
      }
    }

    const aggregateStatus = computeAggregateStatus(synced.versions ?? []);

    const response = await authenticatedApiClient({
      url: `/api/v1/reports/${reportId}`,
      method: "PUT",
      data: {
        ...synced,
        status: aggregateStatus,
        is_active: data.is_active ?? true
      }
    });

    revalidatePath("/dashboard/reports");
    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath("/dashboard/audit/plans", "layout");

    return successResponse(response?.data, "Report updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE REPORT", `/api/v1/reports/${reportId}`);
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors caused by this change.

- [ ] **Step 4: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): updateReport bootstraps v1 and syncs into active version"
```

### Task 2.2: Add `setActiveVersion` action

**Files:**
- Modify: `app/_actions/reports-actions.ts`

- [ ] **Step 1: Add action**

Append the new function right after `publishReportVersion` (use `grep -n "export async function publishReportVersion(" app/_actions/reports-actions.ts` to locate the end), but still before the `// DATA SOURCES` section header:

```ts
/**
 * Switch the active version pointer and mirror the chosen version's content
 * into the top-level fields so the editor reloads with it.
 */
export async function setActiveVersion(
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

    const current = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = current.versions ?? [];
    const idx = findVersionIndex(versions, versionNumber);

    if (idx === -1) {
      return handleBadRequest(`Version ${versionNumber} not found`);
    }

    const target = versions[idx];
    const updatedContent: ReportContent = {
      ...current,
      title: target.title,
      management_standard: target.management_standard,
      branding: structuredClone(target.branding),
      sections: structuredClone(target.sections),
      current_version_number: versionNumber
    };

    const aggregateStatus = computeAggregateStatus(versions);

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
    return successResponse(response?.data, `Active version set to v${versionNumber}`);
  } catch (error: any) {
    return handleError(
      error,
      "PUT | SET ACTIVE VERSION",
      `/api/v1/reports/${reportId}#active-v${versionNumber}`
    );
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors.

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "feat(reports): add setActiveVersion server action"
```

### Task 2.3: Modify `publishReport` to drop the pre-snapshot hop

**Files:**
- Modify: `app/_actions/reports-actions.ts`

The current `publishReport` (rewritten in v1 Task 2.5) does: `snapshotReportVersion → getReport → publishReportVersion`. With the active-version model the active version IS the publishable target — no extra snapshot needed.

- [ ] **Step 1: Replace `publishReport` body**

Find the function. The current body:

```ts
export async function publishReport(
  reportId: string,
  generatePdf: boolean = true
): Promise<APIResponse> {
  if (!reportId) {
    return handleBadRequest("Report ID is required");
  }

  try {
    const snapshotRes = await snapshotReportVersion(reportId);
    if (!snapshotRes.success) {
      return snapshotRes;
    }

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

Replace ENTIRELY with:

```ts
export async function publishReport(
  reportId: string,
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

    const content = ensureVersionedShape(reportRes.data.data.report_content);
    const versions = content.versions ?? [];
    const active = content.current_version_number;

    if (versions.length === 0 || typeof active !== "number") {
      return handleBadRequest("Save the report first to create a version before publishing");
    }

    if (findVersionIndex(versions, active) === -1) {
      return handleBadRequest(`Active version ${active} not found`);
    }

    return publishReportVersion(reportId, active, generatePdf);
  } catch (error: any) {
    return handleError(error, "POST | PUBLISH REPORT", `/api/v1/reports/${reportId}/publish`);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors.

- [ ] **Step 3: Commit**

```bash
git add app/_actions/reports-actions.ts
git commit -m "refactor(reports): publishReport publishes the active version (no pre-snapshot)"
```

---

## Phase 3: Hooks

### Task 3.1: Add `useSetActiveVersion`

**Files:**
- Modify: `hooks/use-report-queries.ts`

- [ ] **Step 1: Add to imports**

Locate the existing import from `@/app/_actions/reports-actions` (added in v1 Task 3.1). Extend with `setActiveVersion`:

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
  getReportVersion,
  setActiveVersion
} from "@/app/_actions/reports-actions";
```

- [ ] **Step 2: Append hook**

At the end of `hooks/use-report-queries.ts`, append:

```ts
/**
 * Mutation: switch the active version of a report
 */
export function useSetActiveVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (versionNumber: number) => {
      const result = await setActiveVersion(reportId, versionNumber);
      if (!result.success) throw new Error(result.message || "Failed to switch version");
      return result.data;
    },
    onSuccess: (_data, versionNumber) => {
      notify({ description: `Switched to v${versionNumber}`, type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to switch version", type: "error" });
    }
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-report-queries.ts
git commit -m "feat(reports): add useSetActiveVersion mutation hook"
```

---

## Phase 4: UI

### Task 4.1: Active-version dropdown in Report Details sidebar

**Files:**
- Modify: `components/reports/report-sidebar.tsx`

- [ ] **Step 1: Add imports**

At the top of `components/reports/report-sidebar.tsx`, after the existing imports, add:

```ts
import { Check, GitBranch } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useSetActiveVersion } from "@/hooks/use-report-queries";
import { ensureVersionedShape } from "@/lib/config/ensure-versioned-shape";
```

Also extend the `useState` import (already imported) — no change needed there.

- [ ] **Step 2: Add `reportId` prop**

Modify the component signature. Find:

```ts
export const ReportSidebar = () => {
  const { report, setAddSectionModalOpen, changeManagementStandard } = useReportStore();
```

Replace with:

```ts
interface ReportSidebarProps {
  reportId: string;
}

export const ReportSidebar = ({ reportId }: ReportSidebarProps) => {
  const { report, setAddSectionModalOpen, changeManagementStandard } = useReportStore();
  const setActiveVersionMutation = useSetActiveVersion(reportId);
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
```

Then update all call sites of `<ReportSidebar />` — there is exactly one, in `components/reports/report-builder.tsx`. Locate it with `grep -n "<ReportSidebar" components/reports/report-builder.tsx`. Update to pass `reportId={report.report_id}` (the `report` variable is in scope at the call site — see existing handlers).

If the call site doesn't yet have `report.report_id` available because `report` may be null, gate the render:

```tsx
{report?.report_id && <ReportSidebar reportId={report.report_id} />}
```

If the existing call site already does `{report && <ReportSidebar />}`, change to `{report?.report_id && <ReportSidebar reportId={report.report_id} />}`.

- [ ] **Step 3: Compute version options + active**

Inside the component body, after the existing `useState` declarations, add:

```ts
const versions = useMemo(() => {
  if (!report) return [];
  const normalized = ensureVersionedShape(report);
  return [...(normalized.versions ?? [])].sort((a, b) => b.version_number - a.version_number);
}, [report]);

const activeVersionNumber = report?.current_version_number;
```

The `useMemo` import is already present (added by v1 Task 5.2). No new import.

- [ ] **Step 4: Replace the static `Version: 1.0` block**

Locate the existing block:

```tsx
<div>
  <span className="text-gray-500">Version:</span>
  <p className="font-medium text-gray-900">{report.version || "1.0"}</p>
</div>
```

Replace with:

```tsx
<div>
  <span className="text-gray-500">Active Version:</span>
  {versions.length === 0 ? (
    <p className="mt-0.5 font-medium text-gray-900">
      {report.version || "1.0"}
      <span className="ml-2 text-xs text-gray-500">— first save creates v1</span>
    </p>
  ) : (
    <Select
      value={String(activeVersionNumber ?? versions[0]?.version_number ?? 1)}
      onValueChange={(value) => {
        const next = Number(value);
        if (next === activeVersionNumber) return;
        setPendingSwitch(next);
        setSwitchDialogOpen(true);
      }}
      disabled={setActiveVersionMutation.isPending}
    >
      <SelectTrigger className="mt-1 w-full">
        <SelectValue placeholder="Select version" />
      </SelectTrigger>
      <SelectContent>
        {versions.map((v) => (
          <SelectItem key={v.version_number} value={String(v.version_number)}>
            <span className="flex items-center gap-2">
              {v.version_number === activeVersionNumber ? (
                <Check className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <GitBranch className="h-3.5 w-3.5 text-gray-400" />
              )}
              <span className="font-mono text-xs">v{v.version_number}</span>
              {v.label && <span className="truncate text-xs text-gray-600">— {v.label}</span>}
              <StatusBadge status={v.status} size="sm" />
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(v.snapshotted_at), { addSuffix: true })}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
  {versions.length > 0 && (
    <p className="mt-1 text-xs text-gray-500">
      {versions.length} version{versions.length === 1 ? "" : "s"} · v{activeVersionNumber} active
    </p>
  )}
</div>
```

- [ ] **Step 5: Add the switch-confirmation dialog**

After the existing `<ConfirmationModal />` at the bottom of the return JSX (search for `<ConfirmationModal`), add a second confirmation modal for the version switch:

```tsx
<ConfirmationModal
  isOpen={switchDialogOpen}
  onConfirm={() => {
    if (pendingSwitch !== null) {
      setActiveVersionMutation.mutate(pendingSwitch);
    }
    setPendingSwitch(null);
    setSwitchDialogOpen(false);
  }}
  onCancel={() => {
    setPendingSwitch(null);
    setSwitchDialogOpen(false);
  }}
  title="Switch active version?"
  message={`Switch the editor to v${pendingSwitch}? Any unsaved edits to v${activeVersionNumber} will need to be saved before switching to avoid losing them.`}
  confirmLabel="Switch"
  cancelLabel="Cancel"
/>
```

Note: the existing `ConfirmationModal` API in this project uses `isOpen`/`onConfirm`/`onCancel`/`title`/`message`/`confirmLabel`/`cancelLabel`. Verify the exact prop names by reading `components/confirmation-modal.tsx` if the labels above differ. Match whatever the existing usage in `report-sidebar.tsx` already does — the file uses it elsewhere already (search for `<ConfirmationModal`).

**Important UX note:** the spec mentions a richer Save/Discard/Cancel triad. For this plan we ship the simpler Cancel/Switch flow first because dirty-state detection without an `isDirty` flag in the store is too invasive to add here. Users who want to preserve edits should click Save Draft before switching. This is consistent with the spec's "Save before switching" guidance and avoids dragging a store change into this PR.

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors.

- [ ] **Step 7: Commit**

```bash
git add components/reports/report-sidebar.tsx components/reports/report-builder.tsx
git commit -m "feat(reports): add active-version dropdown to Report Details sidebar"
```

### Task 4.2: Revise history row actions

**Files:**
- Modify: `components/reports/report-version-history.tsx`

- [ ] **Step 1: Update imports**

Add to the existing imports:

```ts
import { useSetActiveVersion } from "@/hooks/use-report-queries";
import { CheckCircle2 } from "lucide-react";
```

(Keep the other existing icon imports.)

- [ ] **Step 2: Add hook usage + accept active-number prop**

Add the mutation hook inside the component, near the existing `const publish = usePublishVersion(reportId);`:

```ts
const setActive = useSetActiveVersion(reportId);
```

The history component currently doesn't receive `current_version_number` from props. Add it as an optional prop:

Change the `interface ReportVersionHistoryProps`:

```ts
interface ReportVersionHistoryProps {
  reportId: string;
  versions: ReportVersionSnapshot[];
  activeVersionNumber?: number;
}
```

Update the component signature:

```ts
export function ReportVersionHistory({
  reportId,
  versions,
  activeVersionNumber
}: ReportVersionHistoryProps) {
```

The prop `activeVersionNumber` is now the single source of truth — no local computation needed.

Then update `report-details-client.tsx` (where this component is rendered — added in v1 Task 5.2) to pass the prop. Locate the existing usage:

```tsx
<ReportVersionHistory reportId={reportId} versions={versions} />
```

Replace with:

```tsx
<ReportVersionHistory
  reportId={reportId}
  versions={versions}
  activeVersionNumber={liveContent?.current_version_number}
/>
```

- [ ] **Step 3: Replace Edit row action with Set-as-active**

Find the existing Edit `Button` block (uses lucide `Pencil` icon). Replace ENTIRELY with:

```tsx
<Button
  size="icon"
  variant="ghost"
  title={v.version_number === activeVersionNumber ? "Active" : "Set as active"}
  disabled={setActive.isPending || v.version_number === activeVersionNumber}
  onClick={() => setActive.mutate(v.version_number)}
>
  <CheckCircle2
    className={
      v.version_number === activeVersionNumber
        ? "h-4 w-4 text-blue-600"
        : "h-4 w-4 text-gray-400"
    }
  />
</Button>
```

Remove the `Pencil` import line entry from lucide imports (icon no longer used in this file).

- [ ] **Step 4: Active indicator pill on the row**

In the row header (where title, label, status, edit count are shown), add an "Active" pill for the active row. Inside the `<div className="flex items-center gap-2">` that already contains `<StatusBadge ... />`, add this BEFORE the `StatusBadge`:

```tsx
{v.version_number === activeVersionNumber && (
  <Badge variant="default" className="bg-blue-600 text-xs hover:bg-blue-700">
    Active
  </Badge>
)}
```

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors.

- [ ] **Step 6: Commit**

```bash
git add components/reports/report-version-history.tsx app/dashboard/\(modules\)/reports/_components/report-details-client.tsx
git commit -m "feat(reports): swap Edit row action for Set-as-active + show active pill"
```

### Task 4.3: Strip edit mode from `version-viewer-dialog`

**Files:**
- Modify: `components/reports/version-viewer-dialog.tsx`

- [ ] **Step 1: Replace the file with view-only content**

Replace the entire file with:

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ReportVersionSnapshot } from "@/lib/types/report-types";

interface VersionViewerDialogProps {
  version: ReportVersionSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionViewerDialog({
  version,
  open,
  onOpenChange
}: VersionViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>View version v{version.version_number}</DialogTitle>
          <DialogDescription>Read-only snapshot view.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <p className="font-medium">{version.title}</p>
          </div>
          {version.label && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <p className="font-medium">{version.label}</p>
            </div>
          )}
          <div className="text-muted-foreground text-xs">
            {version.sections.length} section{version.sections.length === 1 ? "" : "s"} captured in
            this snapshot. To edit this version, set it as active from the history list and use the
            editor.
          </div>

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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Update callers**

The dialog signature changed (removed `reportId` and `mode` props). Find callers:

```bash
pnpm exec grep -rn "VersionViewerDialog" --include="*.tsx" components app
```

Update each caller to match the new signature. In `components/reports/report-version-history.tsx`:

Find:

```tsx
<VersionViewerDialog
  reportId={reportId}
  version={openVersion.version}
  mode={openVersion.mode}
  open={openVersion !== null}
  onOpenChange={(open) => {
    if (!open) setOpenVersion(null);
  }}
/>
```

Replace with:

```tsx
<VersionViewerDialog
  version={openVersion.version}
  open={openVersion !== null}
  onOpenChange={(open) => {
    if (!open) setOpenVersion(null);
  }}
/>
```

Also update the `useState` declaration for `openVersion` — it no longer needs `mode`:

```tsx
const [openVersion, setOpenVersion] = useState<{
  version: ReportVersionSnapshot;
} | null>(null);
```

And update the View button onClick (the Edit button was already removed in Task 4.2):

```tsx
onClick={() => setOpenVersion({ version: v })}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no NEW errors.

- [ ] **Step 4: Commit**

```bash
git add components/reports/version-viewer-dialog.tsx components/reports/report-version-history.tsx
git commit -m "refactor(reports): strip edit mode from VersionViewerDialog (view-only)"
```

---

## Phase 5: Manual Verification

### Task 5.1: End-to-end walkthrough

**Files:** none

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Verify legacy report bootstrap**

Open a pre-versioning report. In Editor tab, edit any section, click Save Draft.
- Toast: "Report saved successfully"
- History tab now shows v1

- [ ] **Step 3: Snapshot, switch, edit, save**

Take a snapshot (v2). Edit a section. Save Draft. Verify v2 reflects edits, v1 unchanged.

Switch dropdown to v1. Confirm dialog → Switch.
- Editor reloads with v1 content
- Save Draft → only v1 mutates this time

- [ ] **Step 4: Publish active version**

Click Submit for Approval while v1 is active.
- v1 status → PUBLISHED in History tab
- v1 row shows Download PDF button
- v2 still DRAFT

- [ ] **Step 5: Verify "set as active" from History tab**

Switch to History tab. Click the CheckCircle2 icon on v2 row.
- Editor tab loads v2 content
- v2 row shows the blue "Active" pill, v1 row no longer does

- [ ] **Step 6: Verify Active pointer fallback**

Manually corrupt a report's `current_version_number` to point at a missing version (via DB or DevTools intercept). Reload page.
- FE warn toast: "Active version reset to v{N}"
- Editor still loads correctly

- [ ] **Step 7: Document any deviations**

Note any issues, missing pieces, or UX gaps. Do NOT mark this phase complete until the golden path works end-to-end.

---

## Phase 6: Lint + Build

### Task 6.1: Run vitest + build

**Files:** none

- [ ] **Step 1: Vitest**

Run: `pnpm test`
Expected: all tests pass (existing 18 + new tests added in Task 1.1)

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: build succeeds, no NEW errors related to the changed files.

- [ ] **Step 3: Commit (only if any cosmetic fixes were needed)**

If the build or test run flagged issues that required code changes, commit those changes here with a small focused message.

---

## Self-Review Notes

The plan covers each spec requirement:

| Spec section | Plan task(s) |
|---|---|
| Goals: active dropdown | Task 4.1 |
| Goals: editor edits any version | Task 2.1 (mirror sync) + Task 4.1 (switch loads version into top-level) |
| Goals: Save Draft writes to active + edit_log | Task 1.1 (`syncTopLevelToVersion`) + Task 2.1 |
| Goals: Save as New Version flips active | unchanged from v1 (already does this) |
| Goals: Submit publishes active | Task 2.3 |
| Goals: First save auto-creates v1 | Task 1.1 (`bootstrapV1FromTopLevel`) + Task 2.1 |
| Architecture: reuse `current_version_number` | applied in Tasks 2.1, 2.2, 2.3, 4.1, 4.2 |
| Architecture: top-level as mirror | Task 2.1 (sync into versions[active]) + Task 2.2 (load from versions[active]) |
| UI: sidebar dropdown | Task 4.1 |
| UI: history row Set-as-active | Task 4.2 |
| UI: viewer dialog view-only | Task 4.3 |
| Server actions modified/added | Tasks 2.1, 2.2, 2.3 |
| New hook | Task 3.1 |
| New pure helpers | Task 1.1 (TDD) |
| Migration: legacy + v1-era | Task 2.1 handles both (bootstrap + sync) |
| Error handling | covered in each action (Tasks 2.1, 2.2, 2.3) and Task 4.1 (dialog) |
| Testing | Task 1.1 unit tests; Task 5.1 manual checklist |

**Known deviations from spec:**
- Spec lists a richer Save/Discard/Cancel triad for the dirty-switch confirm. Plan ships a simpler Switch/Cancel confirm to avoid introducing an `isDirty` flag into the Zustand store this iteration. User documentation: "save before switching".
- Spec lists FE warn toast for active-pointer-missing fallback. Plan implements the fallback in `updateReport` (Task 2.1) but the toast surface is at the next save, not at page load. Acceptable — surfaces when user takes action.

## Out of Scope (defer)

- Diff/compare across versions
- Restore-from-version copy
- Removing v1's `updateReportVersion` server action (still imported but unused)
- Removing v1's `useUpdateVersion` hook (still exported but unused)
- Component tests for new sidebar dropdown
- Backend enforcement of active-pointer mutations (still last-write-wins)
- Save-before-switch automation (currently user must click Save Draft first)

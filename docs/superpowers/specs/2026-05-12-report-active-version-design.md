# Report Active Version Switching — Design

**Date:** 2026-05-12
**Builds on:** [`2026-05-12-report-versioning-design.md`](./2026-05-12-report-versioning-design.md) (v1 versioning — already shipped on `feat/report-versioning`)
**Scope:** Add an active-version selector in the Report Details sidebar; let the editor edit any selected version directly; remove the "current draft vs. snapshots" split. Publish/Submit operates on the active version.

## Goals

- Users can pick any existing version from a dropdown in the Report Details sidebar
- Editor fully edits the selected version (sections, widgets, branding, dynamic field values)
- Save Draft writes to the active version and appends an `edit_log` entry
- Save as New Version still creates a fresh version and makes it active
- Submit for Approval / Publish operates on the active version (no implicit pre-snapshot)
- First Save Draft on a freshly-created or legacy report auto-creates `v1`

## Non-Goals

- "Latest" / "approval target" pointer separate from active (dropped per user request)
- Diff or compare views
- Restore-from-version copy semantics
- Schema migration scripts — JSON blob is tolerant; lazy at read time still applies

## User Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Edit scope on switch | Full edit of selected version |
| Top-level "current draft" | Drop the separate draft — only versions exist conceptually |
| "Latest" marker | Drop it — active version is the single pointer |
| Publish flow | Publishes the active version |
| Bootstrap | Auto-create v1 on first Save Draft |

## Architecture

Keep the v1 storage shape: `report_content.versions[]` is the source of truth; `report_content.{sections, branding, title, management_standard}` is an **editor mirror** of `versions[active]`. The renderer and PDF generator continue to read top-level fields → zero changes to those code paths.

The pointer `report_content.current_version_number` (introduced in v1) is reused with broadened semantics: it now means **active version** — the version the editor reads/writes, the version Submit publishes.

## Data Model

No new fields. Types unchanged. Semantic shift only:

```ts
interface ReportContent {
  // ...existing fields
  current_version_number?: number;   // now: ACTIVE version pointer
  versions?: ReportVersionSnapshot[]; // append-grow
}
```

`ReportVersionSnapshot` and `VersionEdit` unchanged. `ReportRecord.status` aggregate semantics unchanged.

## Editor Source-of-Truth Flow

### Switch version (dropdown change)

```text
User picks v2 from Report Details dropdown
  → if editor is dirty: ConfirmationModal { Save | Discard | Cancel }
      Save:     saveReport (current top-level → versions[active]); then proceed
      Discard:  proceed without saving
      Cancel:   abort switch
  → setActiveVersion(reportId, 2) server action
      • verifies versions[2] exists
      • copies versions[2].{sections, branding, title, management_standard} → top-level
      • current_version_number = 2
      • PUT
      • revalidatePath
  → TanStack invalidate → liveReportQuery refetches
  → store re-inits editor with new top-level (existing useEffect in report-details-client)
```

### Save Draft

```text
saveReport(report) → updateReport server action
  • writes top-level fields to PUT payload
  • if versions[] empty:
      bootstrap v1 from current top-level
      versions = [v1]; current_version_number = 1
  • else:
      idx = findVersionIndex(versions, current_version_number)
      if idx === -1: fall back to highest version_number, warn
      sync top-level INTO versions[idx].{sections, branding, title, management_standard}
      append VersionEdit { edited_at, edited_by } to versions[idx].edit_log
  • PUT entire report_content
  • revalidatePath
```

### Save as New Version (existing snapshot flow, lightly adjusted)

```text
snapshotReportVersion(reportId, label?)
  • reads report → ensureVersionedShape
  • builds new snapshot from top-level via buildSnapshotFromCurrent
  • pushes to versions[]
  • current_version_number = new_version_number
  • top-level remains unchanged (already mirrors what's now the new active version)
  • PUT, revalidatePath
```

### Submit for Approval / Publish

```text
publishReport(reportId, generatePdf=true)
  • reads report; pick active = current_version_number
  • if active missing or versions[] empty: 400 "Save report first"
  • delegates to publishReportVersion(reportId, active, generatePdf)
  • no auto-snapshot (v1 introduced this; v2 removes it — the active version IS what gets published)
```

## Server Actions

| Action | Status | Behavior |
|---|---|---|
| `updateReport` | **modified** | Adds bootstrap + sync-to-active-version + edit_log append (see Save Draft flow above) |
| `setActiveVersion` | **new** | Switches active pointer + reloads top-level mirror from chosen version |
| `publishReport` | **modified** | No more pre-snapshot hop; publishes whatever `current_version_number` points at |
| `snapshotReportVersion` | unchanged | Still creates new version, sets active = new |
| `updateReportVersion` | retained | Unused by new UI; safe to keep or remove in cleanup pass |
| `publishReportVersion` | unchanged | |
| `getReport` | unchanged | Already runs `ensureVersionedShape` |
| `getReportVersion` | unchanged | |

### `setActiveVersion` signature

```ts
async function setActiveVersion(
  reportId: string,
  versionNumber: number
): Promise<APIResponse>
```

400 if version not found. PUT entire `report_content`. Revalidates `/dashboard/reports/{id}`.

## UI Components

### `components/reports/report-sidebar.tsx` — modified

Replace the static `Version: 1.0` line with an active-version control:

- shadcn `Select` (already used in this file via `SelectField` for Type)
- Label: "Active Version"
- Options sorted by `version_number` DESC, format: `v{N} · {label or "—"} · {status pill} · {relative timestamp}`
- Currently-active row marked with a small `Check` glyph (lucide)
- Below the select: `{count} versions · v{N} is active`
- Empty state: when `versions.length === 0`, render legacy "Version: 1.0" text + small subtitle "First save creates v1"

### `components/reports/report-version-history.tsx` — modified

Row action set:
- **Set as active** (new) — fires `useSetActiveVersion`, switches Tabs to "editor"
- **View** — opens read-only `VersionViewerDialog`
- **Download PDF** — if `pdf_url`
- **Retry PDF** — if PUBLISHED && !pdf_url
- **Publish** — if DRAFT

Remove the **Edit** row action (replaced by Set-as-active flow).

Add an "active" indicator pill on the row matching `current_version_number`.

### `components/reports/version-viewer-dialog.tsx` — modified

Remove edit mode entirely. Dialog becomes view-only:
- No title/label inputs in edit form
- No edit summary textarea
- No Save Changes button
- Still renders title, label, edit_log, section count
- Single action: Close

The `mode: "view" | "edit"` prop reduces to view-only. Callers updated to drop the `mode` arg.

### `components/reports/report-builder.tsx` — minor

No behavior change. The existing Save Draft and Submit-for-Approval buttons keep their handlers; new server-action semantics absorb the version mirror logic transparently.

The existing **Save as Version** button (added in v1 Task 5.1) stays as-is.

## Hooks

New: `useSetActiveVersion(reportId: string)` — appended to `hooks/use-report-queries.ts`.

```ts
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
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to switch version", type: "error" });
    }
  });
}
```

`useSnapshotVersion`, `usePublishVersion` unchanged. `useUpdateVersion` retained but unused; eligible for cleanup later.

## Pure Helpers (additions to `lib/config/version-helpers.ts`)

```ts
export function syncTopLevelToVersion(
  content: ReportContent,
  versionNumber: number,
  user: ReportUserRef
): ReportContent {
  // finds versions[idx]; deep-clones top-level fields into it;
  // appends VersionEdit; returns new content (immutable)
}

export function bootstrapV1FromTopLevel(
  content: ReportContent,
  user: ReportUserRef
): ReportContent {
  // builds v1 from top-level (via buildSnapshotFromCurrent),
  // returns { ...content, versions: [v1], current_version_number: 1 }
}
```

Both are unit-tested in `lib/config/version-helpers.test.ts` (TDD).

## Migration / Backward Compat

- Legacy reports (no `versions[]`): `ensureVersionedShape` already initializes `versions=[]`, `current_version_number=1`. First Save Draft auto-creates v1 via `bootstrapV1FromTopLevel`.
- v1-era reports (have `versions[]` populated): top-level may have unsaved drift from `versions[active]`. First Save Draft after v2 ships syncs top-level INTO `versions[active]` — accepted as implicit commit. No data loss; explicitly documented.
- Active pointer references missing version: helper falls back to highest existing `version_number` and warns via toast.

## Error Handling

| Case | Behavior |
|---|---|
| Switch with unsaved edits + user picks Save | Save then switch. Either step fails → toast + abort switch |
| Switch with unsaved edits + user picks Discard | Skip save, switch directly |
| Switch to nonexistent version | 400 "Version N not found"; toast |
| First save (empty `versions[]`) | Auto-create v1 silently; existing "Report saved successfully" toast covers user feedback. Bootstrap is implicit, not a separate notification |
| Publish with empty `versions[]` or missing active | 400 "Save report first"; UI also disables button |
| Active pointer references missing version | FE falls back to highest version, warn toast "Active version reset to v{N}" |

## Testing

### Unit — `lib/config/version-helpers.test.ts`

- `syncTopLevelToVersion`: mutates only the target version; appends one edit_log entry; preserves other versions; throws / no-op if version not found
- `bootstrapV1FromTopLevel`: creates exactly one version with v=1 and active=1; preserves all top-level fields verbatim
- All new helpers idempotent w.r.t. unrelated fields (do not touch unintended keys)

### Integration (manual checklist in plan)

- Legacy report → Save Draft → v1 auto-created, active=1, edit_log has 1 entry
- 2 versions exist → switch v1 → top-level reloads with v1 content → edit a section → Save Draft → only v1 mutated, v2 untouched
- Dirty switch flow: Save / Discard / Cancel all behave per spec
- Submit for Approval publishes the active version; pdf_url lands on `versions[active]`
- Snapshot creates new version + flips active to it
- Active pointer pointing at deleted version → FE shows warn toast and resets to highest

## Out of Scope (v2 of versioning)

- "Latest" marker independent of active
- Diff / compare across versions
- Restore-from-version copy action (use Snapshot instead)
- Concurrent-write conflict resolution (still last-write-wins, documented)
- Component tests for sidebar dropdown / dialogs (matches existing project test posture)
- Backend-enforced atomicity for active-pointer mutations
- Removing v1's `updateReportVersion` server action (retained for backward compat; cleanup deferred)

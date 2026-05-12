# Report Versioning — Design

**Date:** 2026-05-12
**Scope:** `app/dashboard/(modules)/reports/[id]/page.tsx` and related report module — add multi-version support so a single report can hold a history of labeled snapshots, viewable and editable independently, each publishable to its own PDF.

## Goals

- Let users explicitly capture point-in-time snapshots of a report ("Save as new version")
- Surface the full version history of a report in a dedicated history tab
- Allow editing of prior versions, with an edit log recording who changed what and when
- Allow publishing of any version (not just the latest), each carrying its own PDF artifact
- Preserve current renderer/PDF/edit code paths so existing single-version reports keep working with no behavior change

## Non-Goals

- Automatic versioning on every save
- Side-by-side diff/compare between versions
- "Restore from version" button copying old content into current draft
- Version dropdown switcher in editor header
- Full backend migration script (lazy read-time migration is sufficient — `report_content` is opaque JSON)

## User Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Version trigger | Manual "Save as new version" |
| Mutability | Editable, with edit log per version |
| Storage | Versions array embedded in `report_content` |
| UI surface | Versions history tab/sidebar (no dropdown, no diff, no restore) |
| Numbering | Integer auto-increment + optional user label |
| PDF | One PDF per published version, stored on the version |

## Architecture

Store current working draft at the top level of `report_content` (unchanged shape). Add an append-only `versions[]` array for prior snapshots and a `current_version_number` counter. Renderer, PDF generator, and existing edit dialogs continue to read top-level `sections`/`branding`/`title` — zero downstream changes to those code paths.

Snapshotting copies the current top-level state into `versions[]`. Editing a prior version mutates that array entry and appends to its `edit_log[]`. Publishing a version flips its `status`, sets timestamps, and (optionally) generates its PDF.

## Data Model

Extend `lib/types/report-types.ts`.

```ts
export interface VersionEdit {
  edited_at: string;
  edited_by: ReportUserRef;
  summary?: string;
}

export interface ReportVersionSnapshot {
  version_number: number;          // monotonic, starts at 1
  label?: string;                  // optional user-supplied note
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

export interface ReportContent {
  // ...existing fields kept (report_id, report_type, title, version, sections, branding, ...)
  current_version_number: number;
  versions: ReportVersionSnapshot[];
}
```

The legacy `version: string` field on `ReportContent` is retained for backward compat but deprecated. On read, it is mapped to `current_version_number` for display only; new writes target `current_version_number`.

### `ReportRecord.status` semantics

The top-level `ReportRecord.status` field (DB column) reflects an aggregate view of `versions[]`:

- `PUBLISHED` if any `versions[i].status === "PUBLISHED"`
- `ARCHIVED` if all versions are `ARCHIVED`
- `DRAFT` otherwise (including reports with no snapshots yet)

This aggregate is computed and written by the server actions whenever `versions[]` mutates, so list/index views (`reports/page.tsx`, approvals queue) keep working unchanged.

## Components

### Modified

- `app/dashboard/(modules)/reports/[id]/page.tsx` — passes versioned `report_content` to client unchanged; lazy migration ensures shape.
- `app/dashboard/(modules)/reports/_components/report-details-client.tsx` — wraps `ReportBuilder` in a tab layout with `Editor` and `History` tabs.
- `components/reports/report-builder.tsx` (or equivalent header) — adds **Save as New Version** button next to existing Save/Publish.

### New

- `components/reports/report-version-history.tsx` — vertical list, newest first. Rows show: `v{N}` badge, optional label, status pill, snapshotted_at, snapshotted_by avatar, edit count. Row actions: View, Edit, Download PDF (if `pdf_url`), Publish (if `DRAFT`).
- `components/reports/snapshot-version-dialog.tsx` — small dialog with optional label input, confirms snapshot.
- `components/reports/version-viewer-dialog.tsx` — opens a read-only or editable view of a single `ReportVersionSnapshot` reusing the existing report renderer. Edit mode requires the user to enter an optional edit summary before save.
- `lib/config/ensure-versioned-shape.ts` — pure helper migrating legacy `report_content` to include `versions: []` and `current_version_number: 1` on read.

## Server Actions

In `app/_actions/reports-actions.ts`:

```ts
snapshotReportVersion(reportId: string, label?: string): Promise<APIResponse>
updateReportVersion(
  reportId: string,
  versionNumber: number,
  patch: Partial<ReportVersionSnapshot>,
  summary?: string
): Promise<APIResponse>
getReportVersion(reportId: string, versionNumber: number): Promise<APIResponse>
publishReportVersion(
  reportId: string,
  versionNumber: number,
  generatePdf?: boolean
): Promise<APIResponse>
```

Each action re-reads the full `report_content`, mutates locally, and PUTs the whole blob via the existing `/api/v1/reports/{id}` endpoint. No new backend endpoints are strictly required. If the backend later wants atomic snapshot semantics, a `/api/v1/reports/{id}/versions` endpoint can be added without changing the frontend contract.

Existing `updateReport` is unchanged — it still writes only top-level draft fields.

Existing `publishReport` is augmented so that it **always** snapshots the current top-level draft into `versions[]` as a new version first (using the same logic as `snapshotReportVersion`), then publishes that newly created version. This guarantees every published state is captured as a tracked version. This is not a violation of the "manual snapshot only" rule — the snapshot is a side effect of explicit publish, not of routine saves.

## Data Flow

### Save current draft (existing path)

```text
ReportBuilder → updateReport(id, content)
  → PUT /api/v1/reports/{id}
  → top-level report_content.{sections, branding, title, ...} mutated
  → versions[] untouched
```

### Snapshot as new version

```text
User clicks "Save as New Version" → label dialog → confirm
  → snapshotReportVersion(id, label)
  → server action reads current report_content
  → deep-clones top-level fields into a new ReportVersionSnapshot
  → version_number = max(versions[].version_number) + 1 (1 if empty)
  → status = "DRAFT", edit_log = []
  → push to versions[]
  → current_version_number = new number
  → PUT /api/v1/reports/{id}
  → revalidatePath /dashboard/reports/{id}
```

### Edit prior version

```text
User clicks Edit on v2 in history → version editor opens
  → user modifies → save (optional summary prompted)
  → updateReportVersion(id, 2, patch, summary)
  → reads report_content.versions[], finds version_number === 2
  → applies patch
  → appends { edited_at: now, edited_by: session.user, summary } to edit_log
  → PUT /api/v1/reports/{id}
```

### Publish a version

```text
User clicks Publish on v2 → confirm dialog
  → publishReportVersion(id, 2, generatePdf=true)
  → finds versions[i] where version_number === 2
  → set status="PUBLISHED", published_at=now, published_by=session.user
  → if generatePdf: call existing PDF route with this snapshot → pdf_url
  → store pdf_url on versions[i]
  → PUT /api/v1/reports/{id}
```

### Concurrency

All mutations follow read → patch → write inside a single server action. Last-write-wins, matching the current code's assumptions. Concurrent snapshots by two users could clobber; mitigation is the server-action-local re-read. Out of scope for v1 to introduce ETags or optimistic concurrency tokens.

## Migration / Backward Compat

Legacy reports lack `versions[]` and `current_version_number`. Migration is lazy at read time via `ensureVersionedShape(content)`:

```ts
function ensureVersionedShape(content: ReportContent): ReportContent {
  if (Array.isArray(content.versions)) return content;
  return {
    ...content,
    current_version_number: 1,
    versions: []
  };
}
```

Wired into `getReport` server action and the initial-pass in `report-details-client.tsx`. The legacy `version: "1.0"` string field is read for display fallback but not written.

First snapshot on a legacy report creates `v1` capturing the pre-version state. Empty `versions[]` shows an empty state in the History tab: "No versions yet. Take a snapshot to start tracking."

## Error Handling

| Case | Behavior |
|---|---|
| `snapshotReportVersion` with no current draft state | 400 — "Nothing to snapshot" |
| `updateReportVersion` for missing version_number | 404 |
| `publishReportVersion` on already-PUBLISHED version | Idempotent — regenerates PDF if `generatePdf=true`, no-op otherwise |
| PDF generation fails during publish | Publish still succeeds, `pdf_url` undefined, toast: "Published. PDF generation failed; retry from history." Row exposes a Retry PDF action |
| Concurrent writes | Last-write-wins; log telemetry only |

## Testing

### Unit (`__tests__/reports-versioning.test.ts`)

- `snapshotReportVersion` builds correct snapshot from current draft, increments counter, handles empty `versions[]`
- `updateReportVersion` mutates only the target version and appends one `edit_log` entry
- `ensureVersionedShape` migration is idempotent and preserves all existing fields
- Numbering stays monotonic across multiple snapshots, including after edits

### Component

- `<ReportVersionHistory />` renders rows, empty state, status pills, edit count
- Snapshot dialog: label optional, confirm fires action
- Version viewer dialog: read-only renders snapshot exactly; edit mode wires to `updateReportVersion`

### Integration

- Legacy report (no `versions[]`) → load → snapshot → assert `v1` created
- Snapshot → edit prior → assert `edit_log` grows by one
- Publish `v2` while `v1` also exists → only `v2` gets `pdf_url` and `PUBLISHED` status

## Out of Scope (v1)

- Diff / compare between two versions
- "Restore from version" copying old content back into current draft
- Version dropdown in editor header
- Search/filter in history list
- Backend-enforced atomicity (ETags, optimistic concurrency)
- Server-side snapshot endpoint

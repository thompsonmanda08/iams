# TODO-FIXES

Bug-investigation snapshot. Each item is classified before any code change.

## Status legend
- **CONFIRMED-FE** — bug visible in frontend code, root cause located
- **LIKELY-BE** — frontend looks correct; suspect backend
- **CANNOT-LOCATE** — surface described not found in code
- **VAGUE** — likely surface found but cannot confirm without runtime / extra info
- **MAYBE-FIXED** — recent commit may already address; verify in QA

## Summary

| # | Module | Title | Status | Owner |
|---|--------|-------|--------|-------|
| 1 | Risk / Business Process | Cannot unattach child from parent | CONFIRMED-FE | FE |
| 2 | Audit / Action Assignment | Actioner cannot see Submit Evidence button | MAYBE-FIXED | QA verify |
| 3 | Security / MFA | OTP timing out, not verifying | LIKELY-BE | BE |
| 4 | Risk / Risk Acceptance | Mandatory-field asterisks not red | CONFIRMED-FE | FE |
| 5 | Risk / Risk Acceptance | Approval submitted without signature | CONFIRMED-FE | FE |
| 6 | Risk / KRI | Red color not visible on progress bar | CONFIRMED-FE | FE |
| 7 | Risk / Incidents | Sub Process wrongly mandatory | CONFIRMED-FE | FE |
| 8 | Risk / Risk Actions | Reviewer submits before action worked on | VAGUE | needs info |
| 9 | Risk / Incidents | System should allow incident reassignment | CANNOT-LOCATE | feature build |
| 10 | Audit / Budget | Start/end date subtracting a day (TZ off-by-one) | CONFIRMED-FE | FE |
| 11 | Audit / Budget | Create Budget button active without mandatory fields | CONFIRMED-FE | FE |
| 12 | Audit / Budget | Edit dialog does not pre-fill | CONFIRMED-FE | FE |
| 13 | Audit / Budget | Budget line date validation against parent year | CONFIRMED-FE | FE |
| 14 | Audit / Budget | Email to responsible user on rejection | LIKELY-BE | BE |
| 15 | Audit / Universe | Edit dialog does not pre-fill | CONFIRMED-FE | FE |
| 16 | Audit / Budget+Universe | Back button not working | VAGUE | FE (likely) |
| 17 | Audit / Engagement | Team-member list scrollable | VAGUE | needs info |
| 18 | Audit / Engagement | Number of clauses not shown | VAGUE | needs info |

Tally: 9 CONFIRMED-FE • 1 MAYBE-FIXED • 2 LIKELY-BE • 1 CANNOT-LOCATE • 4 VAGUE • 1 missing-feature.

---

## Details

### #1 — Business Process: cannot unattach child — CONFIRMED-FE
- **File:** `app/dashboard/system-configs/_components/business-processes-dialog.tsx:112,141-146`
- **Root cause:** "None (root process)" option uses `id: ""`. `SearchSelectField` may not fire `onValueChange` when value is empty string, so user cannot clear `parent_id` once set. Also the parent options list filters with `!p.parent_id`, so a child can never be re-parented to another non-root branch.
- **Fix scope (FE):** Use sentinel `id: "__none__"` for the root option; map back to `null` on submit. Optionally drop the `!p.parent_id` filter.

### #2 — Submit Evidence button visibility — MAYBE-FIXED
- **File:** `app/dashboard/(workflows)/actions/audit/_components/finding-action-details-dialog.tsx:113-117,151-154,769-779`
- **Root cause (was):** `currentUserId` defaulted to `session?.user?.id`, undefined when JWT cookie shape lacked nested user.
- **Fix:** Already applied via `currentUserId = session?.user?.id ?? session?.user_id ?? currentUser?.user?.id ?? currentUser?.id`. Plus `isAssignedUser` matches both `assigned_to` and `assigned_to_user.id`.
- **Action:** QA verify as actioner / reviewer / auditor users.

### #3 — MFA OTP timing out — LIKELY-BE
- **Files inspected:** `app/(auth)/otp/otp-form.tsx:47-77`, `app/_actions/auth-actions.ts:70-115`
- **FE behavior:** Posts `{username, otp}` to `verifyOTP` server action. Surfaces backend "Invalid OTP" message verbatim. The 60s countdown is purely a UI resend gate.
- **Action (BE):** Audit OTP TTL on backend `/auth/verify-otp`. Check clock skew between FE-sent timestamp and BE validation window.

### #4 — Risk Acceptance mandatory asterisks — CONFIRMED-FE
- **File:** `components/forms/risk-acceptance-form.tsx:248,258,280,295,313,336`
- **Root cause:** Asterisks are inline plain text; no color class.
- **Fix scope (FE):** Replace ` *` text with `<span className="text-destructive">*</span>`. Standard pattern already used in `business-processes-dialog.tsx:170`.

### #5 — Risk Acceptance: approval without signature — CONFIRMED-FE
- **File:** `components/forms/risk-acceptance-form.tsx:86-114,153-166`
- **Root cause:** `handleSubmit` performs no validation. The form has only 3 steps (Risk Details / Justification / Controls); no UI captures approver / signature inputs at all. Submit happens with empty `signature` strings.
- **Fix scope (FE):** (a) Add Approval step rendering signature inputs for each required approver. (b) Validate required signatures populated before calling `onSubmit`.

### #6 — KRI progress bar red invisible — CONFIRMED-FE
- **Files:** `app/dashboard/(modules)/risks/kri/[id]/page.tsx:76-100,335-352` and `kri/breaches/page.tsx:48-100`
- **Root cause:** `calculateStatus()` lacks `invertDirection` parameter. For `invert_direction === true` KRIs, critical should fire when `current >= limit`, but function uses non-inverted comparison only. Result: inverted KRIs in breach never reach `status === "critical"`, so `bg-red-500` never applies.
- **Fix scope (FE):** Add `invertDirection` parameter; flip comparison when inverted. Apply same fix in `breaches/page.tsx`.

### #7 — Incidents Sub Process required — CONFIRMED-FE
- **File:** `app/dashboard/(modules)/risks/incidents/_components/new-incident.tsx:187-199`
- **Root cause:** SearchSelectField for `specific_cause_id` ("Sub Process") has `required` prop. Bug: parent cause may not have sub-causes.
- **Fix scope (FE):** Drop `required` (line 189) or make conditional on `availableSubCauses.length > 0`.

### #8 — Reviewer submits before action worked — VAGUE
- **File:** `app/dashboard/(modules)/risks/_components/action-review-dialog.tsx`
- **Investigation:** Dialog opens with `actionDefinition.execution`; no precondition on `execution.status`. Whether this is a bug depends on intent — usually call-site enforces eligibility.
- **Need from user:** Under what action statuses should reviewer submit be blocked? Is the bug that the dialog opens too early, or that the submit handler doesn't reject?

### #9 — Incident reassignment — CANNOT-LOCATE (missing feature)
- **Investigation:** Searched `app/dashboard/(modules)/risks/incidents/**` — no `reassign` references. Reassign UI exists only in workflow approvals (`workflow-task-reassign-dialog.tsx`) for approval tasks, not incidents.
- **Action:** Feature build required (BE endpoint + FE dialog + hook). Confirm scope with PM.

### #10 — Budget date TZ off-by-one — CONFIRMED-FE
- **File:** `app/dashboard/(modules)/audit/budgets/_components/budget-form.tsx:178-179,196-197,337,353,553,565`
- **Root cause:** `new Date(...).toISOString()` and `date?.toISOString().split("T")[0]` convert local-tz date to UTC, drops a day for users west of UTC. Zambia (UTC+2) unaffected; affects users in negative-UTC zones.
- **Fix scope (FE):** Replace with `format(date, "yyyy-MM-dd")` from `date-fns` (no tz conversion). 4 spots.

### #11 — Create Budget button always active — CONFIRMED-FE
- **File:** `app/dashboard/(modules)/audit/budgets/_components/budget-form.tsx:386,149-170,593-595`
- **Root cause:** Submit `disabled` checks only loading flags. Validation in handler silently `return`s without notifying user.
- **Fix scope (FE):** Predicate covering `!department_id || !title || total_amount<=0 || !start_date || !end_date`. Add visible field-level errors on attempted submit. Same fix for budget-line submit.

### #12 — Budget edit dialog blank — CONFIRMED-FE
- **Files:** `app/dashboard/(modules)/audit/budgets/_components/budget-edit-modal.tsx:13-34`, `budget-form.tsx:96-122`
- **Root cause:** `BudgetEditModal` passes only `budgetId`; never fetches and never passes `initialData`. `BudgetForm` has no `initialData` prop and no fetch-by-id effect. So edit always opens empty.
- **Fix scope (FE):** (a) Add `initialData` prop to `BudgetForm`. (b) Fetch budget in modal (or accept full record from caller) and pass through. (c) Hydrate state via `useEffect([initialData])`.

### #13 — Budget line date validation — CONFIRMED-FE
- **File:** `app/dashboard/(modules)/audit/budgets/_components/budget-form.tsx:186-202,542-567`
- **Root cause:** `createBudgetLineHandler` only checks dates exist. No bounds check vs parent budget range. `minDate={new Date()}` on the picker is unrelated.
- **Fix scope (FE):** Validate `selectedBudget.start_date <= line.start_date <= line.end_date <= selectedBudget.end_date`. Pass `minDate`/`maxDate` to both DatePickers from `selectedBudget`.

### #14 — Email on task rejection — LIKELY-BE
- **Investigation:** No FE notification/email dispatch surface. Rejection event is handler logic; email should fire on backend status transition.
- **Action (BE):** Hook email service to `REJECTED` transition for budget approval tasks.

### #15 — Universe edit dialog blank — CONFIRMED-FE
- **Files:** `app/dashboard/(modules)/audit/universe/_components/universe-dialog.tsx:127-148`, `audit-universe-form.tsx:128-173`
- **Root cause:** Form uses `useState(() => { ...initialData })` lazy init only. If `initialData` arrives async after mount (typical for fetched data), form stays empty — no `useEffect([initialData])` to re-hydrate.
- **Fix scope (FE):** Add `useEffect` watching `initialData` to call `setUniverseData` / `setItemData` when it changes.

### #16 — Back button not working — VAGUE → likely FE
- **Files inspected:** `components/back-button.tsx`, budget + universe pages
- **Root cause (suspected):** `BackButton` calls `router.back()` (line 31). Direct landing on a page (refresh, deep link) gives no history; back is a no-op or closes the tab. `BackButton` already supports `href` fallback, but budget/universe pages don't pass it.
- **Fix scope (FE):** Pass `href` to all `<BackButton>` instances on budget + universe pages, e.g. `href="/dashboard/audit/budgets"`.
- **Need from user:** Confirm behavior — does back fail always, or only after refresh? If always, deeper bug (state hydration issue).

### #17 — Team members not scrollable — VAGUE
- **File:** `components/ui/multi-select-modal.tsx:172,199,247,265,316`
- **Investigation:** Modal already has `max-h-[80vh]` + `<ScrollArea>` wrappers. Either the bug is in a different selector or refers to selected-pills row growing without scroll.
- **Need from user:** Screenshot or page URL. Is the scroll missing on the modal content, or on the selected-members chips row in the form?

### #18 — Number of clauses not shown — VAGUE
- **Files:** `app/dashboard/(modules)/audit/plans/_components/category-selector.tsx:360-376`, `template-selector-simple.tsx:314`
- **Investigation:** Template-selection step shows `{summary?.mainClausesCount} main clauses`. Clauses-by-category view lists individual clauses but no aggregate count. If `summary` shape is undefined at runtime, template count silently renders blank.
- **Need from user:** Which screen — the template selector, the category view, or the engagement plan summary? If the top-level summary, that field needs adding.

---

## Recommended next steps

1. **QA pass on #2** — verify Submit Evidence visible across actioner/reviewer/auditor roles in dev.
2. **Tackle CONFIRMED-FE bugs in batches** by area:
   - Budget cluster (#10, #11, #12, #13) — single PR, all in `budget-form.tsx` + `budget-edit-modal.tsx`.
   - Risk Acceptance (#4, #5) — single PR in `risk-acceptance-form.tsx`.
   - KRI (#6) — single PR.
   - Universe (#15) — single PR.
   - Incidents/Business Process (#1, #7) — small PRs each.
3. **File BE tickets** for #3 (MFA OTP TTL), #14 (rejection email).
4. **PM/UX clarification needed** for #8, #16, #17, #18 — get answers before estimate.
5. **Feature spec** for #9 (incident reassignment) — out of bug-fix scope.

# Session Management Fixes - Review Guide

## Quick Navigation

There are **2 key documents** for this plan:

### 1. 📋 `SESSION_MANAGEMENT_AUDIT.md`
**Purpose:** Detailed audit findings explaining all issues
**What to read:** For understanding WHY fixes are needed

### 2. 🔧 `SESSION_FIXES_IMPLEMENTATION_PLAN.md`
**Purpose:** Step-by-step fixes with before/after code
**What to read:** For reviewing and approving each fix

---

## How to Review

### Step 1: Read the Plan Overview
Open `SESSION_FIXES_IMPLEMENTATION_PLAN.md` and review:
- **Overview** section (explains the 3 phases)
- **Summary Table** at the end (high-level view)

### Step 2: Review Phase 1 Fixes (One at a time)
These are CRITICAL and must be fixed next release:

1. **Fix #1: Token Refresh Endpoint Path** (5 min effort)
   - File: `app/_actions/auth-actions.ts`
   - Change: Add leading `/` to URL
   - Risk: LOW - Simple one-line fix

2. **Fix #2: Replace Client-Side Logout** (30 min effort)
   - File: `components/screen-lock.tsx`
   - Change: Use server action instead of fetch
   - Risk: MEDIUM - Changes logout flow

3. **Fix #3: Add Fallback Token Refresh** (45 min effort)
   - File: `components/screen-lock.tsx`
   - Change: Retry token refresh if unlock fails
   - Risk: MEDIUM - New error handling path

### Step 3: Review Phase 2 Fixes (Optional)
These improve security but less critical:

4. **Fix #4: Remove Token from Logs** (5 min effort)
5. **Fix #5: Background Token Refresh** (20 min effort)
6. **Fix #6: Align Session Timeouts** (30 min effort)
7. **Fix #7: Error Handling on Refresh** (15 min effort)

### Step 4: Review Phase 3 Fixes (Future)
These are nice-to-have improvements:

8-12. Various medium/low priority fixes

---

## Review Process

For each fix you want to approve, respond with:

```
Fix #X: [NAME]
✅ APPROVED - Implement as proposed
```

Or if you want modifications:

```
Fix #X: [NAME]
⚠️  APPROVED WITH CHANGES:
- Change A: [describe]
- Change B: [describe]
```

Or if you want to skip it:

```
Fix #X: [NAME]
❌ SKIP - Reason: [describe]
```

---

## Recommended Order

### Option A: All Critical Fixes This Release
1. Review & approve Fix #1, #2, #3
2. I implement all three
3. You test the complete workflow
4. Create single commit with all critical fixes

**Timeline:** ~2 hours work + testing

### Option B: Conservative Approach
1. Review & approve Fix #1 only (simplest)
2. I implement and test
3. You verify token refresh works
4. Then move to Fix #2, #3

**Timeline:** ~3 sessions, more thorough

### Option C: Minimal Changes
1. Review & approve Fix #1 only (fix the broken endpoint)
2. Deploy that fix
3. Later: Review other phases

**Timeline:** 5 minutes, lowest risk

---

## What Gets Tested

### Fix #1 Test
- Lock screen after 5 min inactivity
- Click "I'm still here"
- Check console for proper log
- Verify session extended (no logout)

### Fix #2 Test
- Wait for countdown to complete
- Click "Log Out"
- Check cookies in DevTools
- Verify cookies deleted
- Verify redirected to login

### Fix #3 Test
- Simulate unlock failure (if possible)
- Click "I'm still here"
- Should retry with fallback
- Should eventually succeed or logout gracefully

---

## Files Changed Summary

### Phase 1 Changes
- `app/_actions/auth-actions.ts` - Fix token endpoint
- `components/screen-lock.tsx` - Fix logout & add fallback

### Phase 2 Changes
- `hooks/use-users-query-data.ts` - Background refresh
- `lib/session.ts` - Token config alignment
- `lib/session-config.ts` - NEW FILE for constants

### Phase 3 Changes
- Various utility improvements
- New files: `lib/logger.ts`, `app/api/logout/route.ts`

---

## Risk Assessment

| Fix | Risk | Impact | Rollback |
|-----|------|--------|----------|
| #1 | 🟢 LOW | Critical | Simple revert |
| #2 | 🟠 MEDIUM | Critical | Revert function |
| #3 | 🟠 MEDIUM | High | Revert function |
| #4 | 🟢 LOW | Low | Simple revert |
| #5 | 🟡 MEDIUM | High | Disable hook |
| #6 | 🟡 MEDIUM | Medium | Use old values |
| #7 | 🟢 LOW | Low | Remove hook |

---

## Quick Decision Matrix

Choose your path:

```
┌─────────────────────────────────────┐
│ What's your risk tolerance?         │
└─────────────────────────────────────┘
         │
    ┌────┴────┬─────────────┬──────────┐
    │          │             │          │
    ▼          ▼             ▼          ▼
  MINIMAL    MODERATE     AGGRESSIVE  TEST-FIRST
  (Fix #1)   (1,2,3,4)   (1-7)        (Individual)

  5 min       2 hours     3 hours      Iterative
  Lowest      Balanced    Complete     Learning
  Risk        Approach    Approach     Approach
```

---

## What I'll Do After Your Review

1. **Collect Approvals**: You review each fix and approve/modify
2. **Implement**: I make the approved changes
3. **Test Locally**: I verify changes compile
4. **Create PR**: Single PR with all approved fixes
5. **Provide Testing Guide**: Steps to verify each fix works

---

## Questions to Ask Yourself

Before reviewing, consider:

1. ✅ Are these fixes important? **YES** - Current code has security issues
2. ✅ Are they safe? **YES** - All changes preserve functionality
3. ✅ Should I approve all? **MAYBE** - Depends on your risk tolerance
4. ✅ Can I test them? **YES** - Each has clear testing steps
5. ✅ Do I need them now? **YES** - Critical fixes should be ASAP

---

## Let's Start!

Ready to review? Please start with:

**→ Review Fix #1, #2, #3 from `SESSION_FIXES_IMPLEMENTATION_PLAN.md`**

And respond with your approval status for each.

Example response:
```
Fix #1: Token Refresh Endpoint Path
✅ APPROVED - Implement as proposed

Fix #2: Replace Client-Side Logout
⚠️  APPROVED WITH CHANGES - Also add X, Y, Z

Fix #3: Add Fallback Token Refresh
✅ APPROVED - Implement as proposed
```

I'll wait for your approval on Phase 1 fixes before implementing! 🚀

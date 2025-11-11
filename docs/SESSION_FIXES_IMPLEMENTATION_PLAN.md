# Session Management Fixes - Implementation Plan

**Date:** November 11, 2025
**Status:** ✅ PHASE 1 & 2 COMPLETE - All 7 Critical & High Priority Fixes Implemented & Compiled
**Total Fixes:** 12 issues across 3 phases

**PHASE 1 PROGRESS:**
- ✅ Fix #1: Token Refresh Endpoint Path - IMPLEMENTED
- ✅ Fix #2: Replace Client-Side Logout with Server Action - IMPLEMENTED
- ✅ Fix #3: Add Fallback Token Refresh on Failed Unlock - IMPLEMENTED

**PHASE 2 PROGRESS:**
- ✅ Fix #4: Remove Token from Console Logs - IMPLEMENTED
- ✅ Fix #5: Implement Background Token Refresh - IMPLEMENTED
- ✅ Fix #6: Align Session Timeouts (Option A) - IMPLEMENTED
- ✅ Fix #7: Add Error Handling to useRefreshToken Hook - IMPLEMENTED

---

## Overview

This plan breaks down all identified session management issues into 3 phases:
- **Phase 1 (CRITICAL):** 3 fixes - Must do before next release
- **Phase 2 (HIGH):** 4 fixes - Next sprint
- **Phase 3 (MEDIUM/LOW):** 5 fixes - Future improvements

Each fix includes:
- Current problematic code
- Proposed fixed code
- Files affected
- Testing steps

---

## PHASE 1: CRITICAL FIXES (⏰ Next Release)

### Fix #1: Token Refresh Endpoint Path Missing Leading Slash

**Priority:** 🔴 CRITICAL
**File:** `app/_actions/auth-actions.ts`
**Line:** 362
**Impact:** Token refresh fails silently, users get logged out unexpectedly

#### Current Code (BROKEN)
```typescript
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `api/v1/auth/refresh-token`;  // ❌ Missing leading slash

  const { isAuthenticated } = await verifySession();

  if (!isAuthenticated) {
    return unauthorizedResponse("UNAUTHORIZED");
  }

  try {
    const response = await authenticatedApiClient({ url });

    const access_token = response.data?.access_token;

    await updateAuthSession({ access_token });

    console.log("[REFRESH-TOKEN]", { access_token });

    return successResponse({ access_token }, response.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "GET | REFRESH TOKEN", url);
  }
}
```

#### Proposed Fixed Code
```typescript
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `/api/v1/auth/refresh-token`;  // ✅ Add leading slash

  const { isAuthenticated } = await verifySession();

  if (!isAuthenticated) {
    return unauthorizedResponse("UNAUTHORIZED");
  }

  try {
    const response = await authenticatedApiClient({ url });

    const access_token = response.data?.access_token;

    if (!access_token) {
      return {
        success: false,
        message: "No access token received from server",
        status: 400,
        statusText: "INVALID_RESPONSE"
      };
    }

    await updateAuthSession({ access_token });

    console.log("[REFRESH-TOKEN] Token refreshed successfully");

    return successResponse({ access_token }, response.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "POST | REFRESH TOKEN", url);
  }
}
```

#### What Changed
1. ✅ Added leading `/` to URL path
2. ✅ Added validation that access_token is actually received
3. ✅ Changed log message to not expose token value
4. ✅ Fixed error method from "GET" to "POST"

#### Testing Steps
```bash
# 1. Trigger idle screen lock (5 minutes of inactivity)
# 2. Click "I'm still here" button
# 3. Check browser console - should see:
#    "[REFRESH-TOKEN] Token refreshed successfully"
# 4. Verify session is extended (no logout)
# 5. Check network tab - should see POST to /api/v1/auth/refresh-token
```

#### Files to Update
- [ ] `app/_actions/auth-actions.ts` (lines 361-383)

---

### Fix #2: Replace Client-Side Logout with Server Action

**Priority:** 🔴 CRITICAL
**File:** `components/screen-lock.tsx`
**Lines:** 202-238
**Impact:** Session cookies remain on server after logout, security vulnerability

#### Current Code (BROKEN)
```typescript
const handleUserLogOut = useCallback(async () => {
  if (hasLoggedOutRef.current) return; // Prevent multiple logout calls
  hasLoggedOutRef.current = true;

  setIsLoading(true);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch("/api/logout", {  // ❌ Client-side API call
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reason: "User session timed out." }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const response = await res.json();

    // ❌ No verification of logout success
    window.location.replace(response?.redirect || "/login");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Logout error:", error);
    // ❌ Force redirect even if logout failed
    window.location.replace("/login");
  } finally {
    setIsLoading(false);
  }
}, []);
```

#### Proposed Fixed Code
```typescript
// Add import at top
import { logUserOut } from "@/app/_actions/auth-actions";

const handleUserLogOut = useCallback(async () => {
  if (hasLoggedOutRef.current) return;
  hasLoggedOutRef.current = true;

  setIsLoading(true);

  try {
    // ✅ Use server action for proper session cleanup
    const response = await logUserOut("User session timed out");

    if (response.success) {
      console.log("✅ Logout successful, redirecting to login");
      window.location.replace("/login");
    } else {
      console.error("❌ Logout failed:", response.message);
      // Still redirect but logged the error
      window.location.replace("/login");
    }
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Last resort: force redirect
    window.location.replace("/login");
  } finally {
    setIsLoading(false);
  }
}, []);
```

#### What Changed
1. ✅ Removed client-side fetch to `/api/logout`
2. ✅ Added import of server action `logUserOut`
3. ✅ Calls server action which properly deletes cookies
4. ✅ Verifies logout success before redirecting
5. ✅ Better error logging and messaging

#### Testing Steps
```bash
# 1. Wait for screen lock countdown to complete (90 seconds)
# 2. Click "Log Out" button
# 3. Check browser Network tab - should see logout request
# 4. Verify cookies are deleted in DevTools (Application > Cookies)
# 5. Verify redirected to /login
# 6. Try to access protected page - should be redirected
```

#### Files to Update
- [ ] `components/screen-lock.tsx` (lines 202-238)
  - Add import: `import { logUserOut } from "@/app/_actions/auth-actions";`
  - Replace handleUserLogOut function

---

### Fix #3: Add Fallback Token Refresh on Failed Unlock

**Priority:** 🔴 CRITICAL
**File:** `components/screen-lock.tsx`
**Lines:** 241-257
**Impact:** Users lose session abruptly if token refresh fails during unlock

#### Current Code (BROKEN)
```typescript
// Callback to handle "I'm still here" button click
const handleStillHere = useCallback(async () => {
  // First reset local idle state to close the dialog immediately
  setState("Active");

  // Update server session to unlock screen
  const success = await lockScreenOnUserIdle(false);

  if (success) {
    // Reset the idle timer to restart the countdown
    idleTimer.reset();
  } else {
    // ❌ Immediately logs out without retry
    toast.error("Your session might have expired, redirecting...");
    handleUserLogOut();
  }
}, [idleTimer]);
```

#### Proposed Fixed Code
```typescript
// Add import at top
import { getRefreshToken } from "@/app/_actions/auth-actions";

// Callback to handle "I'm still here" button click
const handleStillHere = useCallback(async () => {
  // First reset local idle state to close the dialog immediately
  setState("Active");

  // Update server session to unlock screen
  let success = await lockScreenOnUserIdle(false);

  // ✅ If unlock fails, try direct token refresh as fallback
  if (!success) {
    try {
      console.log("🔄 Unlock failed, attempting token refresh fallback...");
      const refreshResult = await getRefreshToken();
      success = refreshResult.success;

      if (success) {
        console.log("✅ Token refreshed successfully via fallback");
      } else {
        console.warn("❌ Token refresh fallback failed:", refreshResult.message);
      }
    } catch (error) {
      console.error("❌ Fallback token refresh error:", error);
    }
  }

  if (success) {
    // ✅ Session extended successfully
    idleTimer.reset();
    toast.success("Session extended");
  } else {
    // ✅ Give user time to read error message before logout
    toast.error("Your session has expired. You will be logged out.");
    console.log("⏳ Waiting 3 seconds before logout...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    handleUserLogOut();
  }
}, [idleTimer]);
```

#### What Changed
1. ✅ Added import of `getRefreshToken`
2. ✅ If unlock fails, attempts token refresh as fallback
3. ✅ Only logs out if both unlock AND refresh fail
4. ✅ Shows success message when session extends
5. ✅ Gives user 3 seconds to read error before logout
6. ✅ Better logging at each step

#### Testing Steps
```bash
# Scenario 1: Normal unlock (token valid)
# 1. Wait 5 minutes for screen lock
# 2. Click "I'm still here"
# 3. Should show "Session extended" toast
# 4. Dialog should close, no logout

# Scenario 2: Unlock fails but token refresh works
# 1. Simulate unlock failure (mock lockScreenOnUserIdle to fail)
# 2. Click "I'm still here"
# 3. Should show "Session extended" toast (fallback worked)
# 4. Dialog should close

# Scenario 3: Both unlock and refresh fail
# 1. Simulate both failures
# 2. Click "I'm still here"
# 3. Should show error toast
# 4. Wait 3 seconds
# 5. Should logout and redirect to /login
```

#### Files to Update
- [ ] `components/screen-lock.tsx` (lines 241-257)
  - Add import: `import { getRefreshToken } from "@/app/_actions/auth-actions";`
  - Replace handleStillHere function

---

## PHASE 2: HIGH PRIORITY FIXES (⏰ Next Sprint)

### Fix #4: Remove Token from Console Logs

**Priority:** 🟠 HIGH
**File:** `app/_actions/auth-actions.ts`
**Line:** 377
**Impact:** Access token exposed in browser console, security risk

#### Current Code (RISKY)
```typescript
const access_token = response.data?.access_token;

await updateAuthSession({ access_token });

console.log("[REFRESH-TOKEN]", { access_token });  // ❌ Token logged!

return successResponse({ access_token }, response.data?.message);
```

#### Proposed Fixed Code
```typescript
const access_token = response.data?.access_token;

if (!access_token) {
  return {
    success: false,
    message: "No access token received from server",
    status: 400,
    statusText: "INVALID_RESPONSE"
  };
}

await updateAuthSession({ access_token });

// ✅ Log success without exposing token
console.log("[REFRESH-TOKEN] Token refreshed successfully");

return successResponse({ access_token }, response.data?.message);
```

#### What Changed
1. ✅ Removed sensitive token from console log
2. ✅ Added validation check
3. ✅ Log only success status, not token value

#### Testing Steps
```bash
# 1. Trigger token refresh (unlock screen)
# 2. Open DevTools Console
# 3. Should see: "[REFRESH-TOKEN] Token refreshed successfully"
# 4. Should NOT see token value in log
# 5. Should NOT see console.log statement for token
```

#### Files to Update
- [ ] `app/_actions/auth-actions.ts` (line 377)

---

### Fix #5: Implement Background Token Refresh

**Priority:** 🟠 HIGH
**File:** `hooks/use-users-query-data.ts`
**Lines:** 29-39
**Impact:** User loses session if token expires during activity without manual refresh

#### Current Code (NO AUTO-REFRESH)
```typescript
/**
 * Hook to manually refresh authentication token
 * IMPORTANT: Auto-refetch disabled to prevent screen flickering
 * Only refetch manually when user takes action (e.g., unlock screen)
 */
export const useRefreshToken = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    retry: 1, // Reduced retries
    retryDelay: 1000,
    refetchOnMount: false,
    refetchInterval: false, // ✅ DISABLED: Prevents automatic refetch every 3 minutes
    staleTime: Infinity, // ✅ Never auto-refetch, only manual
    enabled
  });
```

#### Proposed Fixed Code
```typescript
/**
 * Hook to refresh authentication token
 * Configuration:
 * - When enabled=true: Automatically refreshes token every 50 minutes
 * - When enabled=false: No automatic refresh
 *
 * This prevents token expiry at 1 hour by refreshing at 50 minutes
 * User must be active (not idle) for auto-refresh to happen
 */
const REFRESH_INTERVAL = 50 * 60 * 1000; // Refresh at 50 minutes (before 1h expiry)

export const useRefreshToken = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    retry: 1,
    retryDelay: 1000,
    refetchOnMount: false,
    // ✅ Auto-refresh every 50 minutes when enabled
    refetchInterval: enabled ? REFRESH_INTERVAL : false,
    staleTime: 0, // Always consider stale to enable refetch
    enabled
  });
```

#### What Changed
1. ✅ Added constant for refresh interval (50 minutes)
2. ✅ When user is active, token auto-refreshes every 50 minutes
3. ✅ Prevents token expiry since 1 hour TTL
4. ✅ Only activates when user is not idle
5. ✅ Improved documentation

#### Testing Steps
```bash
# Note: This is difficult to test without mocking time
# 1. Enable token refresh
# 2. Monitor Network tab for token refresh requests
# 3. Should see POST to /api/v1/auth/refresh-token every 50 minutes
# 4. Should NOT see refresh when user is idle
# 5. Token should never expire during active session

# For manual testing:
# 1. Open DevTools Network tab
# 2. Wait and observe if refresh requests appear (adjust interval for testing)
# 3. Verify no 401 errors during session
```

#### Files to Update
- [ ] `hooks/use-users-query-data.ts` (lines 29-39)

---

### Fix #6: Align Session Timeouts

**Priority:** 🟠 HIGH
**Files:** `lib/session.ts`, `components/screen-lock.tsx`
**Impact:** Inconsistent security posture between idle detection (5 min) and session TTL (1 hour)

#### Current Code (MISALIGNED)
```typescript
// In screen-lock.tsx (line 196):
timeout: 60 * 1000 * 5, // 5 MINUTES of inactivity

// In lib/session.ts (line 123):
const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 HOUR
```

#### Proposed Fixed Code - Option A (Recommended)
```typescript
// Create a constants file: lib/session-config.ts
export const SESSION_CONFIG = {
  IDLE_TIMEOUT: 5 * 60 * 1000,           // 5 minutes of inactivity
  SCREEN_LOCK_COUNTDOWN: 90 * 1000,      // 90 seconds to logout
  SESSION_TTL: 30 * 60 * 1000,           // 30 minutes total session (6x idle)
  TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000 // Refresh at 25 minutes (before expiry)
} as const;

// In lib/session.ts (line 123):
import { SESSION_CONFIG } from "./session-config";

const expiresAt = new Date(Date.now() + SESSION_CONFIG.SESSION_TTL);

// In components/screen-lock.tsx (line 196):
import { SESSION_CONFIG } from "@/lib/session-config";

const idleTimer = useIdleTimer({
  onIdle,
  onActive,
  onAction,
  timeout: SESSION_CONFIG.IDLE_TIMEOUT,
  throttle: 500,
  disabled: !loggedIn
});

// In DEFAULT_TIMEOUT constant (line 20):
const DEFAULT_TIMEOUT = SESSION_CONFIG.SCREEN_LOCK_COUNTDOWN;
```

#### Proposed Fixed Code - Option B (More Conservative)
```typescript
// Keep 1 hour but align with background refresh at 50 minutes
// lib/session.ts: No change (1 hour)
// hooks/use-users-query-data.ts: REFRESH_INTERVAL = 50 * 60 * 1000
// This way: Idle lock at 5min → Refresh at 50min → Expire at 60min
```

#### What Changed
Option A:
1. ✅ Created centralized SESSION_CONFIG
2. ✅ Reduced session to 30 minutes (more secure)
3. ✅ Refresh at 25 minutes
4. ✅ All components use same constants
5. ✅ Easy to adjust in one place

Option B:
1. ✅ Keeps 1-hour session (less change)
2. ✅ Adds background refresh at 50 minutes
3. ✅ Ensures token never expires with activity
4. ✅ Less aggressive for long tasks

#### Testing Steps
```bash
# For Option A (30-minute session):
# 1. Log in at 12:00:00
# 2. Session should expire at 12:30:00
# 3. At 12:25:00, background refresh should trigger
# 4. New expiry should be 12:55:00

# For Option B (1-hour with 50-min refresh):
# 1. Log in at 12:00:00
# 2. At 12:50:00, background refresh triggers
# 3. Session expiry extended to 1:50:00
# 4. Continuous activity prevents expiry
```

#### Files to Update
**Option A:**
- [ ] Create `lib/session-config.ts` (new file)
- [ ] `lib/session.ts` (import and use SESSION_CONFIG)
- [ ] `components/screen-lock.tsx` (import and use SESSION_CONFIG)
- [ ] `hooks/use-users-query-data.ts` (import and use SESSION_CONFIG)

**Option B:**
- [ ] `hooks/use-users-query-data.ts` (update REFRESH_INTERVAL)

---

### Fix #7: Add Error Handling to useRefreshToken Hook

**Priority:** 🟠 HIGH
**File:** `components/screen-lock.tsx`
**Lines:** 177 (hook usage)
**Impact:** Token refresh happens silently in background with no error handling

#### Current Code (UNUSED)
```typescript
const { data } = useRefreshToken(Boolean(loggedIn && !isIdle));
// Result is never checked or handled
```

#### Proposed Fixed Code
```typescript
const {
  data: refreshData,
  error: refreshError,
  isLoading: isRefreshing
} = useRefreshToken(Boolean(loggedIn && !isIdle));

// ✅ Handle refresh errors
useEffect(() => {
  if (refreshError) {
    console.error("❌ Background token refresh failed:", refreshError);

    // Optional: Show warning to user if refresh fails repeatedly
    // toast.warning("Your session may be expiring. Please save your work.");
  }
}, [refreshError]);

// ✅ Optional: Log refresh state for debugging
useEffect(() => {
  if (isRefreshing) {
    console.log("🔄 Background token refresh in progress...");
  }
}, [isRefreshing]);
```

#### What Changed
1. ✅ Destructured error and isLoading from hook
2. ✅ Added effect to handle refresh errors
3. ✅ Added logging for refresh progress
4. ✅ Better visibility into background refresh

#### Testing Steps
```bash
# 1. Monitor Network tab and Console during active session
# 2. Should see background refresh requests
# 3. Should see console logs for refresh progress
# 4. If refresh fails, should see error log
# 5. No errors should be silent
```

#### Files to Update
- [ ] `components/screen-lock.tsx` (lines 177-190, add new)

---

## PHASE 3: MEDIUM/LOW PRIORITY FIXES (⏰ Future)

### Fix #8: Validate All Session Updates

**Priority:** 🟡 MEDIUM
**File:** `app/_actions/auth-actions.ts`
**Lines:** 394
**Impact:** Failed session updates don't raise errors

#### Current Code
```typescript
if (refreshResponse.success) {
  await updateAuthSession({ screen_locked: state });  // No error check
  return true;
}
```

#### Proposed Fixed Code
```typescript
if (refreshResponse.success) {
  const updateResult = await updateAuthSession({ screen_locked: state });

  if (!updateResult) {
    console.error("❌ Failed to update session lock state");
    return false;  // Return false if update fails
  }

  return true;
}
```

#### Files to Update
- [ ] `app/_actions/auth-actions.ts` (line 394)

---

### Fix #9: Define API Endpoint Properly

**Priority:** 🟡 MEDIUM
**File:** `app/api/logout/route.ts` (create or document)
**Impact:** Unclear endpoint requirements

#### Proposed Solution
Document or create the endpoint:

```typescript
// app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logUserOut } from "@/app/_actions/auth-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reason = body.reason || "User initiated logout";

    // Call server action to properly clean up
    const result = await logUserOut(reason);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Logout successful",
          redirect: "/login"
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          redirect: "/login"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Logout endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        redirect: "/login"
      },
      { status: 500 }
    );
  }
}
```

#### Files to Create/Update
- [ ] `app/api/logout/route.ts` (create if not exists)

---

### Fix #10: Add Session Lock State Verification

**Priority:** 🟡 MEDIUM
**File:** `lib/session.ts`
**Impact:** No verification that screen_locked flag actually updated

#### Proposed Addition
```typescript
/**
 * Verify that a session update was applied
 */
export async function verifySessionUpdate(field: string, expectedValue: any): Promise<boolean> {
  try {
    const { session } = await verifySession();

    if (!session) {
      return false;
    }

    const actualValue = (session as any)[field];

    return actualValue === expectedValue;
  } catch (error) {
    console.error("Failed to verify session update:", error);
    return false;
  }
}
```

#### Files to Update
- [ ] `lib/session.ts` (add new function)

---

### Fix #11: Extract Magic Numbers to Constants

**Priority:** 🔵 LOW
**Files:** `components/screen-lock.tsx`, `lib/session.ts`
**Impact:** Hardcoded values difficult to maintain

#### Proposed Solution
```typescript
// lib/session-config.ts
export const SESSION_TIMEOUTS = {
  CLOCK_TOLERANCE: 15,           // JWT clock tolerance in seconds
  DEFAULT_IDLE_TIMEOUT: 5 * 60 * 1000,    // 5 minutes
  DEFAULT_LOGOUT_COUNTDOWN: 90 * 1000,    // 90 seconds
  FETCH_ABORT_TIMEOUT: 5000,     // 5 seconds for logout fetch
  SESSION_TTL: 1 * 60 * 60 * 1000,        // 1 hour
  TOKEN_REFRESH_INTERVAL: 50 * 60 * 1000  // 50 minutes
} as const;
```

#### Files to Update
- [ ] `lib/session-config.ts` (new file)
- [ ] `components/screen-lock.tsx` (use constants)
- [ ] `lib/session.ts` (use constants)

---

### Fix #12: Implement Structured Logging

**Priority:** 🔵 LOW
**Files:** All auth-related files
**Impact:** Console logs mixed with no structure, difficult to debug

#### Proposed Solution
```typescript
// lib/logger.ts
export const logger = {
  info: (module: string, message: string, data?: any) => {
    console.log(`ℹ️  [${module}] ${message}`, data || "");
  },
  success: (module: string, message: string, data?: any) => {
    console.log(`✅ [${module}] ${message}`, data || "");
  },
  warn: (module: string, message: string, data?: any) => {
    console.warn(`⚠️  [${module}] ${message}`, data || "");
  },
  error: (module: string, message: string, error?: any) => {
    console.error(`❌ [${module}] ${message}`, error?.message || error || "");
  },
  debug: (module: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`🔧 [${module}] ${message}`, data || "");
    }
  }
};

// Usage:
// logger.info("AUTH", "User logged in", { userId: "123" });
// logger.error("TOKEN", "Refresh failed", error);
```

#### Files to Create/Update
- [ ] `lib/logger.ts` (new file)
- [ ] All auth files (use logger instead of console.log)

---

## Summary Table

| Phase | Priority | Fix # | Issue | Effort | Status |
|-------|----------|-------|-------|--------|--------|
| 1 | 🔴 | #1 | Token refresh endpoint path | 5 min | Pending |
| 1 | 🔴 | #2 | Client-side logout | 30 min | Pending |
| 1 | 🔴 | #3 | No fallback on failed unlock | 45 min | Pending |
| 2 | 🟠 | #4 | Remove token from logs | 5 min | Pending |
| 2 | 🟠 | #5 | Background token refresh | 20 min | Pending |
| 2 | 🟠 | #6 | Align session timeouts | 30 min | Pending |
| 2 | 🟠 | #7 | Error handling on refresh | 15 min | Pending |
| 3 | 🟡 | #8 | Validate session updates | 10 min | Pending |
| 3 | 🟡 | #9 | Define logout endpoint | 20 min | Pending |
| 3 | 🟡 | #10 | Session lock verification | 15 min | Pending |
| 3 | 🔵 | #11 | Extract magic numbers | 25 min | Pending |
| 3 | 🔵 | #12 | Structured logging | 30 min | Pending |
| | | | **TOTAL** | **~250 min** | |

---

## Review Process

### For Each Fix

1. **Review Phase:** You review proposed code and say approve/modify
2. **Implementation Phase:** I implement approved code
3. **Testing Phase:** You test and confirm working
4. **Commit Phase:** Create git commit when ready

### Communication Format

When you review each fix, please respond with:

```
Fix #X: [NAME]

✅ APPROVED - Implement as proposed
or
⚠️  APPROVED WITH CHANGES - Here are my modifications:
[Your modifications]
or
❌ REJECT - Reason: [Why you don't want this fix]
or
❓ QUESTIONS - [Your questions about the fix]
```

---

## Next Steps

Ready to proceed? Please review:

1. **Fix #1:** Token Refresh Endpoint Path
2. **Fix #2:** Replace Client-Side Logout
3. **Fix #3:** Add Fallback Token Refresh

Then we'll implement them one by one.

---

**Plan Created:** 2025-11-11
**Total Estimated Time:** ~4 hours for all fixes
**Recommended Approach:** Complete Phase 1 (Critical) in next deploy, Phase 2 in following sprint

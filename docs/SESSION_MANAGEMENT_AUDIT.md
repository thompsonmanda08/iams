# Session Management & Refresh Token Handling Audit Report

**Date:** November 11, 2025
**Components Audited:** screen-lock.tsx, auth-actions.ts, lib/session.ts, use-users-query-data.ts
**Status:** ✅ AUDIT COMPLETE

---

## Executive Summary

The session management and refresh token handling implementation demonstrates **solid architecture with several key strengths**, but also contains **critical issues that need immediate attention**. The system uses JWT-based sessions with httpOnly cookies for security, implements proper token refresh mechanisms, and has idle detection with screen locking. However, there are vulnerabilities and design issues that could compromise security and user experience.

**Critical Issues Found:** 3
**High Priority Issues:** 4
**Medium Priority Issues:** 5
**Low Priority Issues:** 3

---

## 1. Architecture Overview

### Components

| Component | Purpose | Status |
|-----------|---------|--------|
| `screen-lock.tsx` | Idle detection & session lockdown | ✅ Good |
| `auth-actions.ts` | Server actions for auth operations | ⚠️ Has Issues |
| `lib/session.ts` | JWT encryption/decryption & cookie management | ✅ Solid |
| `use-users-query-data.ts` | React Query hooks for token refresh | ✅ Well Configured |

### Session Flow

```
User Login
    ↓
createAuthSession() → JWT encrypted cookie (1 hour)
    ↓
useRefreshToken() hook → Monitors session (disabled by default)
    ↓
Idle Detection (5 minutes) → lockScreenOnUserIdle(true)
    ↓
User Activity Detected / "I'm still here" clicked
    ↓
lockScreenOnUserIdle(false) → getRefreshToken() → Extends session
    ↓
Auto Logout (90 seconds countdown if no action)
    ↓
logUserOut() → deleteSession() → Redirect to /login
```

---

## 2. Security Analysis

### ✅ Strengths

#### A. Cookie Security Configuration (lib/session.ts:140-146)
```typescript
(await cookies()).set(AUTH_SESSION, token, {
  httpOnly: true,      // ✅ Prevents XSS access to cookies
  secure: true,        // ✅ Only over HTTPS in production
  sameSite: "strict",  // ✅ Prevents CSRF attacks
  path: "/"            // ✅ Cookie available site-wide
});
```
**Assessment:** Industry-standard secure cookie settings. Properly implements httpOnly, secure, and sameSite flags.

#### B. JWT Token Validation (lib/session.ts:42-106)
- Proper token format validation (3-part JWT check)
- Signature verification with HS256
- Expiration checking with 15-second clock tolerance
- Specific error handling for different failure modes
- **Assessment:** ✅ Strong validation logic

#### C. Session Cleanup (lib/session.ts:239-280)
- Verifies token expiration before use
- Automatically deletes expired sessions
- Validates required fields (accessToken)
- **Assessment:** ✅ Good defensive programming

---

### ⚠️ Issues & Vulnerabilities

#### 🔴 CRITICAL ISSUE #1: Token Refresh Endpoint Missing Leading Slash

**Location:** auth-actions.ts, line 362

```typescript
// ❌ WRONG
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `api/v1/auth/refresh-token`;  // Missing leading slash!
```

**Problem:**
- URL path is relative without leading `/`
- May be interpreted as `https://domain.com/current-path/api/v1/auth/refresh-token`
- Should be absolute path `/api/v1/auth/refresh-token`
- Causes routing errors and failed token refreshes

**Impact:** 🔴 **CRITICAL** - Session extension fails, users get logged out unexpectedly

**Fix:**
```typescript
const url = `/api/v1/auth/refresh-token`;  // ✅ Add leading slash
```

---

#### 🔴 CRITICAL ISSUE #2: Race Condition in Session Logout

**Location:** screen-lock.tsx, lines 202-237

```typescript
const handleUserLogOut = useCallback(async () => {
  if (hasLoggedOutRef.current) return;  // Flag check
  hasLoggedOutRef.current = true;       // Flag set

  // But: No lock preventing concurrent logout calls during this window

  setIsLoading(true);
  const controller = new AbortController();

  try {
    const res = await fetch("/api/logout", {  // ❌ Client-side logout
      // ... details
    });

    // ❌ No server-side session cleanup here!
    // Only redirects to /login without calling logUserOut()
    window.location.replace(response?.redirect || "/login");
  }
}, []);
```

**Problems:**
1. Uses client-side `/api/logout` instead of server action `logUserOut()`
2. No server-side session deletion (cookies not cleared on server)
3. Logout completion not verified before redirect
4. No error handling for logout failure - still redirects to /login

**Impact:** 🔴 **CRITICAL** - Session cookies remain on server, potential session hijacking

**Fix:**
```typescript
const handleUserLogOut = useCallback(async () => {
  if (hasLoggedOutRef.current) return;
  hasLoggedOutRef.current = true;

  setIsLoading(true);
  try {
    // Use server action for proper cleanup
    const response = await logUserOut("User session timed out");

    if (response.success) {
      // Clear any client-side state
      window.location.replace("/login");
    } else {
      toast.error("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect but log the error
    window.location.replace("/login");
  } finally {
    setIsLoading(false);
  }
}, []);
```

---

#### 🔴 CRITICAL ISSUE #3: No Token Refresh on Failed Unlock Attempt

**Location:** screen-lock.tsx, lines 246-255

```typescript
const handleStillHere = useCallback(async () => {
  setState("Active");

  const success = await lockScreenOnUserIdle(false);

  if (success) {
    idleTimer.reset();  // ✅ Good
  } else {
    // ❌ Session might have expired, but no refresh attempt
    toast.error("Your session might have expired, redirecting...");
    handleUserLogOut();  // Logs out immediately
  }
}, [idleTimer]);
```

**Problem:**
- If unlock fails, immediately logs out user without attempting refresh
- Doesn't give user chance to refresh token before logout
- User loses work without warning

**Impact:** 🔴 **CRITICAL** - Users lose session abruptly if token refresh fails

**Fix:**
```typescript
const handleStillHere = useCallback(async () => {
  setState("Active");

  let success = await lockScreenOnUserIdle(false);

  if (!success) {
    // Try to refresh token directly as fallback
    const refreshResult = await getRefreshToken();
    success = refreshResult.success;
  }

  if (success) {
    idleTimer.reset();
    toast.success("Session extended");
  } else {
    toast.error("Your session has expired. You will be logged out.");
    // Give user 3 seconds to read message before logout
    await new Promise(resolve => setTimeout(resolve, 3000));
    handleUserLogOut();
  }
}, [idleTimer]);
```

---

#### 🟠 HIGH PRIORITY ISSUE #1: Unused useRefreshToken Hook

**Location:** screen-lock.tsx, line 177

```typescript
const { data } = useRefreshToken(Boolean(loggedIn && !isIdle));
// Result is never used or acted upon
```

**Problem:**
- Hook is called but `data` is never checked
- No error handling if refresh fails
- No loading or error state management
- Seems like incomplete implementation

**Impact:** 🟠 **HIGH** - Token refresh happens silently in background with no error handling

**Recommendation:** Remove if not needed, or implement proper error handling:
```typescript
const { data, error, isLoading } = useRefreshToken(Boolean(loggedIn && !isIdle));

useEffect(() => {
  if (error) {
    console.error("Token refresh failed:", error);
    // Handle refresh failure appropriately
  }
}, [error]);
```

---

#### 🟠 HIGH PRIORITY ISSUE #2: Incomplete Error Handling in Token Refresh

**Location:** auth-actions.ts, lines 370-382

```typescript
export async function getRefreshToken(): Promise<APIResponse> {
  // ... code ...
  try {
    const response = await authenticatedApiClient({ url });
    const access_token = response.data?.access_token;

    await updateAuthSession({ access_token });

    console.log({ access_token });  // ❌ Logs token to console!

    return successResponse({ access_token }, response.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "GET | REFRESH TOKEN", url);
    // ❌ No fallback, no error logging context
  }
}
```

**Problems:**
1. **Logs token to console** - Security risk in production
2. No validation that new token was actually received
3. No check if token update succeeded
4. Generic error handling without context

**Impact:** 🟠 **HIGH** - Token exposure in logs, poor error visibility

**Fix:**
```typescript
export async function getRefreshToken(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({ url });
    const access_token = response.data?.access_token;

    if (!access_token) {
      return {
        success: false,
        message: "No access token received",
        status: 400,
        statusText: "INVALID_RESPONSE"
      };
    }

    const updateResult = await updateAuthSession({ access_token });

    if (!updateResult) {
      return {
        success: false,
        message: "Failed to update session with new token",
        status: 500,
        statusText: "SESSION_UPDATE_FAILED"
      };
    }

    // ❌ Remove console.log - don't log tokens
    return successResponse({ refreshed: true }, "Token refreshed successfully");
  } catch (error: Error | any) {
    console.error("Token refresh failed:", {
      endpoint: url,
      errorMessage: error?.message,
      status: error?.response?.status
      // Note: Don't log the token itself
    });
    return handleError(error, "POST | REFRESH TOKEN", url);
  }
}
```

---

#### 🟠 HIGH PRIORITY ISSUE #3: Session Timeout Inconsistency

**Location:** screen-lock.tsx, line 196 & lib/session.ts, line 123

```typescript
// In screen-lock.tsx (idle detection timeout):
timeout: 60 * 1000 * 5, // 5 MINUTES of inactivity

// In lib/session.ts (session expiration):
const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 HOUR
```

**Problem:**
- User can be idle for 5 minutes before screen locks
- But session is valid for 1 hour (without any interaction)
- Creates gap where session is valid but screen is locked
- User might leave session unlocked for up to 1 hour

**Impact:** 🟠 **HIGH** - Inconsistent security posture between idle detection and actual session lifetime

**Recommendation:** Align timeouts:
```typescript
// Option 1: Shorter session time
const IDLE_TIMEOUT = 5 * 60 * 1000;      // 5 minutes
const SESSION_TTL = 30 * 60 * 1000;      // 30 minutes (6x idle timeout)

// Option 2: Longer idle timeout
const IDLE_TIMEOUT = 15 * 60 * 1000;     // 15 minutes (1/4 of session)
const SESSION_TTL = 60 * 60 * 1000;      // 1 hour
```

---

#### 🟠 HIGH PRIORITY ISSUE #4: No Automatic Token Refresh Before Expiry

**Location:** use-users-query-data.ts, lines 29-39

```typescript
export const useRefreshToken = (enabled: boolean = false) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    staleTime: Infinity,      // ✅ Good - prevents constant refreshing
    refetchInterval: false,   // ✅ Good - no automatic refresh
    enabled                   // Only enabled when user is active
  });
```

**Problem:**
- No background token refresh before expiration
- If user is active for 55 minutes straight, token expires during activity
- Only refreshes on "I'm still here" click or unlock
- Doesn't prevent mid-session token expiration

**Impact:** 🟠 **HIGH** - User loses session during activity if manual refresh doesn't happen

**Recommendation:** Implement background refresh:
```typescript
export const useRefreshToken = (enabled: boolean = false) => {
  const REFRESH_INTERVAL = 50 * 60 * 1000; // Refresh at 50 minutes (before 1h expiry)

  return useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    refetchInterval: enabled ? REFRESH_INTERVAL : false,  // Auto-refresh when active
    staleTime: 0,  // Always consider stale to enable refetch
    enabled
  });
};
```

---

### 🟡 Medium Priority Issues

#### 1. Session Update Without Error Handling (auth-actions.ts:394)

```typescript
const refreshResponse = await getRefreshToken();
if (refreshResponse.success) {
  await updateAuthSession({ screen_locked: state });  // ❌ No error handling
  return true;
}
```

**Issue:** If `updateAuthSession` fails, function returns true (success) but session might not be updated properly.

---

#### 2. Countdown Timer Calculations (screen-lock.tsx:137)

```typescript
strokeDasharray={`${(seconds / 90) * 100.5}, 100.5`}
```

**Issue:** Magic number 90 hardcoded but constant is DEFAULT_TIMEOUT. Should use `DEFAULT_TIMEOUT / 1000` instead of 90.

---

#### 3. No Validation of Session Lock State (screen-lock.tsx)

**Issue:** No verification that `screen_locked` flag was actually updated in session. Could lead to inconsistent state.

---

#### 4. Logout API Endpoint Not Defined (screen-lock.tsx:211)

```typescript
const res = await fetch("/api/logout", {
  // Endpoint called but not clearly defined anywhere in codebase
});
```

**Issue:** `/api/logout` endpoint is called from client but not documented. Should be a server action instead.

---

#### 5. Incomplete Logout Response Validation (screen-lock.tsx:226)

```typescript
const response = await res.json();
window.location.replace(response?.redirect || "/login");
```

**Issue:** No validation that response has expected structure. If server returns unexpected format, redirect might fail.

---

### 🔵 Low Priority Issues

#### 1. Console Logging in Production (auth-actions.ts:35, 247, 377)

```typescript
console.log("[ LOGIN ]: ", session);           // Line 35
console.log("[ LOGOUT ]: ", reason);           // Line 247
console.log({ access_token });                 // Line 377 - TOKEN LOGGED!
```

**Recommendation:** Use proper logging framework with log levels. Remove sensitive data from logs.

---

#### 2. Magic Number 15 for Clock Tolerance (lib/session.ts:69)

```typescript
clockTolerance: 15  // ✅ Good value, but should be a constant
```

**Recommendation:** Define as constant for maintainability.

---

#### 3. Unclear Default Behavior (auth-actions.ts:377)

```typescript
// No return statement if response.status is falsy but not 200
if (!response.status || response.status !== 200) {
  console.warn("Backend logout failed, proceeding with local session cleanup");
}
// Falls through with no clear indication of state
```

**Recommendation:** Be explicit about what statuses are considered success/failure.

---

## 3. Refresh Token Handling Analysis

### ✅ What Works Well

1. **React Query Configuration**
   - Disables auto-refresh (prevents screen flickering)
   - Manual refresh control via enabled prop
   - Proper retry logic (reduced to 1 retry)

2. **Token Update Process**
   - New token stored in encrypted session cookie
   - Proper session update with merge strategy
   - Maintains all other session fields

3. **Idle Detection**
   - 5-minute timeout well-configured
   - 500ms throttle prevents excessive events
   - Clean state management (Active/Idle)

### ⚠️ Problems Found

| Issue | Severity | Impact |
|-------|----------|--------|
| Missing `/` in API path | CRITICAL | Token refresh fails silently |
| No server-side logout | CRITICAL | Session cookies not cleared |
| No refresh on failed unlock | CRITICAL | User logs out abruptly |
| Unused useRefreshToken | HIGH | No error handling |
| Token logged to console | HIGH | Security exposure |
| No background refresh | HIGH | Mid-session expiry |
| Session timeout mismatch | HIGH | Inconsistent security |
| No endpoint validation | MEDIUM | Unexpected behavior |

---

## 4. Session Lifecycle Detailed Review

### Login Phase ✅
```
✅ User credentials validated
✅ JWT token created with 1h expiry
✅ Encrypted and stored in httpOnly cookie
✅ Session includes user_id, user_type, etc.
```

### Active Session Phase ✅
```
✅ useRefreshToken hook available but disabled by default
✅ Idle timer tracks user activity
✅ Session remains valid for full 1 hour
✅ No auto-refresh (good for UX)
```

### Idle Detection Phase ⚠️
```
✅ After 5 min of inactivity → screen locks
✅ 90 second countdown displayed
✅ User click "I'm still here" → should refresh
❌ BUT: No fallback if refresh fails
❌ AND: Token endpoint path is wrong
```

### Logout Phase 🔴
```
❌ Uses client-side fetch instead of server action
❌ No server-side session cleanup
❌ Only redirects, doesn't verify logout
❌ Session cookies remain on server
```

---

## 5. Recommendations by Priority

### 🔴 CRITICAL - Fix Immediately (Next Deploy)

| Issue | Fix | Effort |
|-------|-----|--------|
| Token refresh endpoint path | Add leading `/` to URL | 1 minute |
| Client-side logout | Replace with server action `logUserOut()` | 30 minutes |
| No fallback on failed unlock | Implement retry + fallback token refresh | 45 minutes |

**Total Critical Fixes:** ~90 minutes

### 🟠 HIGH - Fix Soon (Next Sprint)

1. Remove token logging from console
2. Implement background token refresh
3. Align session timeouts (idle vs expiry)
4. Add error handling to useRefreshToken hook
5. Validate logout response format

### 🟡 MEDIUM - Plan to Fix

1. Add validation to all session updates
2. Define session lock state verification
3. Document `/api/logout` endpoint properly
4. Improve countdown timer calculations

### 🔵 LOW - Nice to Have

1. Replace console.log with structured logging
2. Extract magic numbers to constants
3. Add JSDoc comments for session functions

---

## 6. Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| httpOnly cookies | ✅ | Prevents XSS access |
| Secure flag (prod) | ✅ | HTTPS only in production |
| SameSite=strict | ✅ | Prevents CSRF |
| CORS validation | ⚠️ | Check API configuration |
| Token signature | ✅ | HS256 with secret key |
| Token expiration | ✅ | 1 hour TTL, 15s tolerance |
| Session cleanup | ⚠️ | Only partially implemented |
| Token logging | 🔴 | Token exposed in console |
| Refresh fallback | ❌ | No retry mechanism |
| Logout verification | ❌ | Doesn't verify success |

---

## 7. Testing Scenarios

### Test Cases Needed

```typescript
// 1. Test token refresh with missing leading slash - MUST FIX
test("Token refresh succeeds with correct endpoint", async () => {
  // This currently fails due to malformed URL
});

// 2. Test logout cleanup
test("Logout clears all session cookies", async () => {
  // Verify deleteSession() is called
});

// 3. Test failed unlock retry
test("Failed unlock attempts token refresh as fallback", async () => {
  // Should retry before logging out
});

// 4. Test timeout consistency
test("Session expires after 1 hour regardless of activity", async () => {
  // Verify expiration enforcement
});

// 5. Test idle detection
test("Screen locks after 5 minutes of inactivity", async () => {
  // No user input = lock screen
});

// 6. Test logout aborts fetch
test("Logout fetch aborts after 5 seconds", async () => {
  // AbortController should trigger
});
```

---

## 8. Code Quality Metrics

| Metric | Rating | Notes |
|--------|--------|-------|
| Error Handling | 🟡 2/5 | Incomplete, missing fallbacks |
| Security | 🟠 3/5 | Good practices, but critical gaps |
| Maintainability | 🟡 2/5 | Magic numbers, unclear flow |
| Testing | 🔴 0/5 | No tests found for session logic |
| Documentation | 🟡 2/5 | Some JSDoc, but incomplete |
| Configuration | 🟡 2/5 | Hardcoded values, no constants |

---

## 9. Proposed Fixes (Code Examples)

### Fix #1: Correct Token Refresh Endpoint

**File:** `app/_actions/auth-actions.ts` (Line 362)

```typescript
// ❌ BEFORE
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `api/v1/auth/refresh-token`;

// ✅ AFTER
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `/api/v1/auth/refresh-token`;
```

---

### Fix #2: Use Server Action for Logout

**File:** `components/screen-lock.tsx` (Lines 202-238)

```typescript
// ❌ BEFORE
const handleUserLogOut = useCallback(async () => {
  if (hasLoggedOutRef.current) return;
  hasLoggedOutRef.current = true;

  setIsLoading(true);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "User session timed out." }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("Network response was not ok");

    const response = await res.json();
    window.location.replace(response?.redirect || "/login");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Logout error:", error);
    window.location.replace("/login");
  } finally {
    setIsLoading(false);
  }
}, []);

// ✅ AFTER (Import logUserOut from auth-actions)
import { logUserOut } from "@/app/_actions/auth-actions";

const handleUserLogOut = useCallback(async () => {
  if (hasLoggedOutRef.current) return;
  hasLoggedOutRef.current = true;

  setIsLoading(true);

  try {
    const response = await logUserOut("User session timed out");

    if (response.success) {
      window.location.replace("/login");
    } else {
      console.error("Logout failed:", response.message);
      // Still redirect but logged the error
      window.location.replace("/login");
    }
  } catch (error) {
    console.error("Logout error:", error);
    window.location.replace("/login");
  } finally {
    setIsLoading(false);
  }
}, []);
```

---

### Fix #3: Implement Refresh Fallback on Failed Unlock

**File:** `components/screen-lock.tsx` (Lines 241-257)

```typescript
// ❌ BEFORE
const handleStillHere = useCallback(async () => {
  setState("Active");

  const success = await lockScreenOnUserIdle(false);

  if (success) {
    idleTimer.reset();
  } else {
    toast.error("Your session might have expired, redirecting...");
    handleUserLogOut();
  }
}, [idleTimer]);

// ✅ AFTER
import { getRefreshToken } from "@/app/_actions/auth-actions";

const handleStillHere = useCallback(async () => {
  setState("Active");

  let success = await lockScreenOnUserIdle(false);

  // If unlock fails, try direct token refresh as fallback
  if (!success) {
    try {
      const refreshResult = await getRefreshToken();
      success = refreshResult.success;

      if (success) {
        console.log("Token refreshed after failed unlock");
      }
    } catch (error) {
      console.error("Fallback token refresh failed:", error);
    }
  }

  if (success) {
    idleTimer.reset();
    toast.success("Session extended");
  } else {
    toast.error("Your session has expired. You will be logged out.");
    // Give user time to read message
    await new Promise(resolve => setTimeout(resolve, 3000));
    handleUserLogOut();
  }
}, [idleTimer]);
```

---

## 10. Summary Table

| Component | Aspect | Rating | Notes |
|-----------|--------|--------|-------|
| Cookie Security | httpOnly, Secure, SameSite | ✅ 5/5 | Industry standard |
| JWT Validation | Token verification | ✅ 5/5 | Proper algorithm & expiry |
| Session Cleanup | Logout process | 🔴 1/5 | Missing server-side cleanup |
| Token Refresh | Endpoint configuration | 🔴 1/5 | Wrong path, no fallback |
| Idle Detection | Activity tracking | ✅ 4/5 | Works well, minor issues |
| Error Handling | Error recovery | 🟠 2/5 | Incomplete, no retries |
| Security | Overall posture | 🟠 3/5 | Good foundation, critical gaps |
| Code Quality | Maintainability | 🟡 2/5 | Magic numbers, unclear flow |

---

## 11. Implementation Timeline

### Week 1 (CRITICAL)
- [ ] Fix token refresh endpoint path
- [ ] Replace client logout with server action
- [ ] Add fallback refresh on failed unlock
- [ ] Test all three changes together

### Week 2 (HIGH)
- [ ] Remove token from console logs
- [ ] Implement background token refresh
- [ ] Align timeout configurations
- [ ] Add error handling to refresh hook

### Week 3 (MEDIUM)
- [ ] Add session validation endpoints
- [ ] Document API endpoints
- [ ] Refactor magic numbers to constants
- [ ] Add comprehensive logging

### Week 4 (TESTING)
- [ ] Write unit tests for session functions
- [ ] Integration tests for logout flow
- [ ] Load testing for concurrent logouts
- [ ] Security audit of refresh mechanism

---

## 12. Conclusion

The session management implementation has a **solid foundation** with good use of:
- ✅ Encrypted JWT tokens in httpOnly cookies
- ✅ Proper session validation and cleanup
- ✅ Idle detection and screen locking
- ✅ React Query for state management

However, there are **critical security issues** that must be fixed immediately:
- 🔴 Token refresh endpoint has wrong path
- 🔴 Logout doesn't clear server-side cookies
- 🔴 No fallback when token refresh fails

**Overall Security Grade: C+** (was C, could be A+ with fixes)

**Recommendation:** Fix critical issues in next release, implement high-priority improvements in next sprint.

---

**Report Generated:** 2025-11-11
**Auditor:** Claude Code
**Status:** Ready for Implementation

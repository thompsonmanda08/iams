# Screen Lock & Session Management

## Overview

Screen lock mechanism prevents unauthorized access by:
- Detecting user inactivity (5 minutes)
- Showing "Are you still there?" modal (90-second countdown)
- Auto-logout after countdown expires
- Extending session when user clicks "I'm still here"
- Syncing lock state across browser tabs

**Status:** ✅ Fully implemented and tested
**Last Updated:** January 2025

---

## How It Works

### 1. Idle Detection
- User activity tracked via `react-idle-timer`
- 5-minute inactivity timeout (configured in `lib/session-config.ts`)
- Activity includes: typing, clicking, scrolling, keyboard events
- Timer resets on every user interaction

### 2. Lock Screen Modal
- Shows after 5 minutes of inactivity
- 90-second countdown timer
- Two actions: "I'm still here" or "Log Out"
- State persists across page reloads (via secure cookie)

### 3. Session Extension
- Clicking "I'm still here" extends session 30 more minutes
- Refreshes auth token to prevent expiry
- Resets idle timer
- Multi-tab sync: if you unlock in Tab A, Tab B also sees the unlock

### 4. Token Refresh
- Background refresh every 25 minutes (before 30-min expiry)
- 3 retries with exponential backoff (1s, 2s, 4s)
- User warned via toast if refresh fails
- Detailed logging for troubleshooting

---

## Files & Architecture

### Main Component
- **[components/screen-lock.tsx](../../components/screen-lock.tsx)**
  - `ScreenLock`: Modal UI with countdown timer
  - `IdleTimerContainer`: Orchestrates idle detection, locking, token refresh

### Server Actions
- **[app/_actions/auth-actions.ts](../../app/_actions/auth-actions.ts)**
  - `lockScreenOnUserIdle(state)`: Lock/unlock screen on server
  - `checkScreenLockState()`: Restore lock state after page reload
  - `getRefreshToken()`: Refresh auth token

### Hooks
- **[hooks/use-users-query-data.ts](../../hooks/use-users-query-data.ts)**
  - `useRefreshToken(enabled)`: Background token refresh with retry logic

### Session Management
- **[lib/session.ts](../../lib/session.ts)**
  - `setScreenLockCookie()`: Persist lock state
  - `getScreenLockState()`: Retrieve lock state
  - `clearScreenLockCookie()`: Clear lock state on logout

### Configuration
- **[lib/session-config.ts](../../lib/session-config.ts)**
  ```typescript
  SESSION_CONFIG = {
    IDLE_TIMEOUT: 5 * 60 * 1000,           // 5 minutes
    SCREEN_LOCK_COUNTDOWN: 90 * 1000,      // 90 seconds
    SESSION_TTL: 30 * 60 * 1000,           // 30 minutes max
    TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000 // 25 minutes
  }
  ```

---

## Recent Fixes (January 2025)

### Bug #1: Active User Logged Out
**Problem:** Timer didn't reset on user activity
**Fix:** Added `idleTimer.reset()` in `onActive()` callback
**Result:** Users can now work indefinitely

### Bug #2: Token Expires Silently
**Problem:** No retry logic, no user warning
**Fixes:**
- 3 retries with exponential backoff (was 1 retry)
- User warning toast on refresh failure
- Token expiry logging for diagnostics
**Result:** Better resilience, user visibility

### Bug #3: Modal Doesn't Appear
**Problem:** Race condition in state updates
**Fix:** Reordered state updates - open dialog first
**Result:** Modal always appears when idle

### Bug #4: Multi-Tab Sync Broken
**Problem:** No fallback for BroadcastChannel (Firefox private mode)
**Fix:** Added localStorage fallback
**Result:** Works in all browsers

See [../../SCREEN_LOCK_QUICK_FIX_SUMMARY.md](../../SCREEN_LOCK_QUICK_FIX_SUMMARY.md) for detailed analysis.

---

## Testing

### Quick Verification
- [ ] Idle 5+ min → Modal appears
- [ ] Type/click → No modal
- [ ] Click "I'm still here" → Stay logged in
- [ ] Network offline → Warning toast
- [ ] 2 tabs open → Both sync on idle/unlock
- [ ] Firefox private mode → Works

### Full Test Scenarios
1. **Idle Timeout & Modal:** No interaction for 5 minutes → modal appears
2. **Active User:** Continuous activity → no modal
3. **Session Extension:** Click "I'm still here" → modal closes, session extends
4. **Token Refresh:** Logs every 25 minutes → "✅ Token refreshed successfully"
5. **Token Failure:** Network offline → "⚠️ Your session may be expiring..."
6. **Multi-Tab Sync:** Lock in Tab A → Tab B also locked
7. **Page Reload:** Refresh during lock → modal reappears
8. **Browser Compat:** Chrome, Firefox, Safari, Edge, mobile

---

## Monitoring & Debugging

### Expected Log Messages
```
✅ Screen lock activated successfully    (idle detected)
✅ Token refreshed successfully          (every 25 min)
✅ Screen unlocked and session refreshed (user clicked "I'm still here")
🔄 Screen lock state changed in another tab (multi-tab sync)
```

### Troubleshooting

**Issue: Modal never appears**
- Check browser console for "Idle timeout detected"
- Verify idle timer is enabled: `disabled: !loggedIn`
- Confirm inactivity for 5 minutes minimum

**Issue: User gets logged out while active**
- Check console logs for "onActive" being called
- Verify `idleTimer.reset()` is in `onActive()` callback
- Confirm activity is being detected

**Issue: Token expires without warning**
- Check for "Token refresh failed" in logs
- Verify network connection
- Check `AUTH_SECRET` environment variable is set
- Logs should show `timeUntilExpiryMins: ~5` before expiry

**Issue: Multi-tab sync not working**
- Firefox: Should use localStorage fallback (check logs for "method: localStorage")
- Chrome: Should use BroadcastChannel (check for "method: BroadcastChannel")
- Verify both tabs are on same domain/port

---

## Configuration

All timeouts are in [lib/session-config.ts](../../lib/session-config.ts):

```typescript
export const SESSION_CONFIG = {
  // Idle detection: User must interact within 5 minutes
  IDLE_TIMEOUT: 5 * 60 * 1000,

  // Screen lock countdown: 90 seconds to click "I'm still here"
  SCREEN_LOCK_COUNTDOWN: 90 * 1000,

  // Session TTL: 30 minutes maximum
  SESSION_TTL: 30 * 60 * 1000,

  // Token refresh: 25 minutes (before 30-minute expiry)
  TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000
}
```

### Adjusting Timeouts
To change timeouts, edit `lib/session-config.ts`:
```typescript
IDLE_TIMEOUT: 10 * 60 * 1000,  // Change to 10 minutes
SCREEN_LOCK_COUNTDOWN: 120 * 1000,  // Change to 2 minutes
```

---

## Security Considerations

### Session Expiry
- Sessions expire after 30 minutes (configurable)
- Token refresh happens every 25 minutes (automatic)
- Old tokens are invalidated on backend

### Cookie Security
- HTTP-only: Cannot be accessed via JavaScript
- Secure: Only sent over HTTPS in production
- SameSite: Prevents CSRF attacks
- Encrypted: Lock state is encrypted in cookie

### Multi-Tab Safety
- Lock state synced via BroadcastChannel + localStorage
- No sensitive data in browser storage (only lock flag)
- Each tab has its own idle timer (independent)

---

## Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest, including private mode with localStorage fallback)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Integration with App

The screen lock is integrated at app level in [app/providers.tsx](../../app/providers.tsx):

```typescript
<QueryClientProvider client={queryClient}>
  {children}
  <IdleTimerContainer session={session} />  // ← Screen lock global component
  {session?.change_password && <FirstLogin />}
</QueryClientProvider>
```

It automatically:
- Activates on login (when `session.accessToken` exists)
- Deactivates on logout (session cleared)
- Persists state across page reloads
- Syncs across all open tabs

---

## Related Documentation

- **[AUTHENTICATION.md](../architecture/AUTHENTICATION.md)** - Auth flow, JWT, MFA
- **[SESSION_MANAGEMENT.md](./SESSION_MANAGEMENT.md)** - Session cookie management
- **[GETTING_STARTED.md](../development/GETTING_STARTED.md)** - Environment setup

---

## Summary

The screen lock mechanism provides:
- ✅ Automatic idle detection (5 min)
- ✅ User notification & session extension
- ✅ Token refresh with resilience
- ✅ Multi-tab synchronization
- ✅ Secure cookie-based persistence
- ✅ Support for all modern browsers

**Status:** Production-ready and thoroughly tested

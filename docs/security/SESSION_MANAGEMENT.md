# Session Management

**Status:** ✅ COMPLETE (Phases 1 & 2 implemented Nov 11, 2025)

## Session Configuration

All timeouts centralized in `lib/session-config.ts`:

```typescript
SESSION_CONFIG = {
  IDLE_TIMEOUT: 5 min,              // User inactivity lockout
  SCREEN_LOCK_COUNTDOWN: 90 sec,    // Time to confirm presence
  SESSION_TTL: 30 min,              // Session expiry
  TOKEN_REFRESH_INTERVAL: 25 min    // Refresh before expiry
}
```

## How It Works

1. **User Login** → JWT session (30 min)
2. **Active Use** → Auto-refresh every 25 min
3. **No Activity 5 min** → Screen locks with 90-sec countdown
4. **User Confirms** → Token refreshes, session extends
5. **Countdown Expires** → Auto-logout, redirect to `/login`

## Security Features

- ✅ HTTP-only, Secure, SameSite=strict cookies
- ✅ HS256 encrypted JWT tokens
- ✅ Multi-tab synchronization via BroadcastChannel
- ✅ Lock state persists across page reloads
- ✅ Automatic token rotation on unlock

## Key Files

- `lib/session.ts` - Core session logic
- `app/_actions/auth-actions.ts` - Server actions
- `components/screen-lock.tsx` - UI & idle detection
- `lib/logger.ts` - Structured logging

## For Details

See [CURRENT_IMPLEMENTATION.md](../CURRENT_IMPLEMENTATION.md#1-authentication--session-management)

# 04 - Authentication

## Overview

INFRATEL IAMS uses **Supabase Auth** with enhanced security features:
- Email/password authentication
- Two-factor authentication (TOTP)
- Session management
- Screen lock
- Role-based access control (RBAC)

## Authentication Flow

```
User Login → Email/Password → MFA (if enabled) → Session Created → Dashboard
```

## Implementation

### Login

```typescript
// Server Action
export async function login(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  redirect("/dashboard");
}
```

### Logout

```typescript
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

### Session Management

**Server-side:**
```typescript
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

**Client-side:**
```typescript
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return user;
}
```

## Multi-Factor Authentication (MFA)

### Setup Flow

1. User enables MFA in settings
2. System generates TOTP secret
3. User scans QR code with authenticator app
4. User enters verification code
5. MFA is activated

### Verification

```typescript
export async function verifyMFA(code: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.verifyOTP({
    type: "totp",
    token: code
  });

  if (error) throw error;
  return data;
}
```

## Screen Lock

**Purpose:** Lock the application when user is idle for security

**Implementation:**
- Zustand store tracks lock state
- Idle timer monitors user activity
- Locked state requires re-authentication

```typescript
// store/screen-lock-store.ts
export const useScreenLockStore = create((set) => ({
  isLocked: false,
  lockScreen: () => set({ isLocked: true }),
  unlockScreen: () => set({ isLocked: false })
}));
```

**Usage:**
```typescript
const { isLocked, lockScreen } = useScreenLockStore();

// Lock after 15 minutes idle
useIdleTimer({
  timeout: 15 * 60 * 1000,
  onIdle: lockScreen
});
```

## Protected Routes

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !request.url.includes("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

## Role-Based Access Control (RBAC)

**Roles:**
- `admin` - Full system access
- `auditor` - Audit management
- `risk_manager` - Risk management
- `viewer` - Read-only access

**Permission Check:**
```typescript
export async function requireRole(role: string) {
  const user = await getCurrentUser();
  const userRole = user?.user_metadata?.role;

  if (userRole !== role) {
    throw new Error("Insufficient permissions");
  }
}
```

## Security Best Practices

1. **Never store tokens in localStorage** - Use HTTP-only cookies
2. **Validate on server** - Never trust client-side checks
3. **Use RLS** - Database-level security
4. **Enable MFA** - For privileged accounts
5. **Session timeout** - Expire inactive sessions
6. **Screen lock** - Protect against shoulder surfing

## Troubleshooting

**Session expired:**
- Check token expiration settings
- Verify refresh token is working

**MFA not working:**
- Ensure time sync on device
- Try backup codes

**Redirect loops:**
- Clear cookies
- Check middleware logic

## Next Steps

Continue to → [05-database.md](05-database.md)

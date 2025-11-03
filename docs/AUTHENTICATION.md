# Authentication & Session Management

**INFRATEL IAMS Web Application**
**Last Updated:** November 3, 2025

---

## Overview

The INFRATEL IAMS application implements a comprehensive authentication system with:
- Username/password login
- Multi-Factor Authentication (MFA) with OTP
- JWT-based session management
- Role-based access control (RBAC)
- Idle screen locking
- Token refresh mechanism

---

## Authentication Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │ POST /api/v1/auth/login
       │ { username, password }
       ↓
┌──────────────────┐
│  Login Response  │
│  - access_token  │
│  - user_type     │
│  - mfa_required  │
└──────┬───────────┘
       │
       ├─── mfa_required = true ──→ ┌──────────────┐
       │                            │   OTP Page   │
       │                            └──────┬───────┘
       │                                   │ POST /api/v1/auth/verify-otp
       │                                   │ { username, otp }
       │                                   ↓
       │                            ┌──────────────┐
       │                            │ OTP Verified │
       │                            └──────┬───────┘
       │                                   │
       └─── mfa_required = false ─────────┴──→ ┌──────────────────┐
                                                │ Initialize Setup │
                                                │ GET /auth/setup  │
                                                └────────┬─────────┘
                                                         │
                                                         ↓
                                                  ┌────────────────┐
                                                  │   Dashboard    │
                                                  │ (Based on      │
                                                  │  user_type)    │
                                                  └────────────────┘
```

---

## Session Management

### Three-Tier Session Cookie System

The application uses three encrypted JWT cookies for session management:

#### 1. AUTH_SESSION (Primary Authentication)
Contains core authentication data:

```typescript
{
  accessToken: string,              // JWT access token
  user_type: "ORGANIZATION_USER" | "BACKOFFICE_USER",
  user_id: string,
  mfa_required: boolean,
  mfa_verified: boolean,
  change_password: boolean,
  organization_id: string,
  user: User,                       // Full user object
  permissions: Permission[],        // User permissions
  expiresAt: Date
}
```

#### 2. USER_SESSION (User Profile Backup)
Contains user profile information:

```typescript
{
  user: {
    id: string,
    username: string,
    email: string,
    first_name: string,
    last_name: string,
    branch: Branch,
    department: Department,
    role: Role
  }
}
```

#### 3. PERMISSIONS_SESSION (Role Permissions)
Contains role-based permissions:

```typescript
{
  permissions: [
    {
      module_id: string,
      module_name: string,
      can_view: boolean,
      can_create: boolean,
      can_edit: boolean,
      can_delete: boolean,
      can_approve: boolean,
      can_export: boolean,
      can_assign: boolean,
      can_configure: boolean,
      custom_permissions: object
    }
  ]
}
```

### JWT Token Security

**Algorithm:** HS256
**Expiration:** 1 hour (configurable)

**Cookie Security Settings:**
```typescript
{
  httpOnly: true,           // Prevents XSS attacks
  secure: true,             // HTTPS only (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 60 * 60 * 1000   // 1 hour
}
```

### Session Functions

**Core Session Operations:**

```typescript
// Create new session
await createAuthSession({
  accessToken: string,
  user_type: string,
  user_id: string,
  organization_id: string,
  mfa_required?: boolean,
  change_password?: boolean
});

// Update existing session
await updateAuthSession({
  user?: User,
  permissions?: Permission[],
  mfa_verified?: boolean,
  change_password?: boolean
});

// Verify session
const { isAuthenticated, session } = await verifySession();

// Get user session
const userSession = await getUserSession();

// Get permissions
const permissionsSession = await getPermissionsSession();

// Delete all sessions
await deleteSession();
```

---

## Multi-Factor Authentication (MFA)

### MFA Implementation

The system supports optional MFA with OTP (One-Time Password) sent via email.

#### Login with MFA Flow

**1. User Login**
```typescript
// POST /api/v1/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response (MFA Required):**
```json
{
  "access_token": "eyJ...",
  "user_type": "ORGANIZATION_USER",
  "mfa_required": true,
  "message": "OTP sent to your email"
}
```

**2. OTP Verification**
```typescript
// POST /api/v1/auth/verify-otp
{
  "username": "admin",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "access_token": "eyJ...",
  "user_type": "ORGANIZATION_USER",
  "message": "OTP verified successfully"
}
```

#### OTP Verification Component

**Location:** `app/(auth)/otp/otp-form.tsx`

**Features:**
- 6-digit OTP input with visual separation (3-3)
- Gets username from URL query parameters
- Client-side validation
- Loading states during verification
- Error handling with toast notifications
- Auto-clears OTP on error

**Usage:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (otp.length !== 6) {
    toast.error("Please enter a complete 6-digit code");
    return;
  }

  const response = await verifyOTP({ username, otp });

  if (response.success) {
    toast.success("OTP verified successfully!");
    router.push("/");
  } else {
    toast.error("Invalid OTP. Please try again.");
    setOtp("");
  }
};
```

#### MFA Security Features

1. **Session-Based MFA Tracking**
   - MFA status stored in encrypted JWT cookie
   - Cannot be bypassed by URL manipulation

2. **Username Validation**
   - OTP form checks for username in URL
   - Redirects to login if username missing

3. **OTP Validation**
   - Backend validates:
     - OTP matches sent code
     - OTP hasn't expired
     - Username is correct

4. **Complete OTP Required**
   - Submit button disabled until all 6 digits entered
   - Client-side validation before API call

5. **Error Handling**
   - Invalid OTP clears input for retry
   - Failed attempts logged
   - Toast notifications for all error cases

---

## User Types & Routing

### User Types

**ORGANIZATION_USER:**
- Standard organizational users
- Access to dashboard and modules
- Department-scoped permissions
- Routes to `/dashboard/*`

**BACKOFFICE_USER:**
- Administrative users
- Access to admin panel
- System-wide configuration access
- Routes to `/admin/*`

### Routing Logic

**File:** `app/page.tsx`

```typescript
const session = await verifySession();

if (session?.isAuthenticated) {
  // Check if MFA is required but not yet verified
  if (session?.session?.mfa_required && !session?.session?.mfa_verified) {
    redirect("/otp");
  }

  // Route based on user type
  if (session?.session?.user_type === "BACKOFFICE_USER") {
    redirect("/admin/home");
  }

  // Default route for organization users
  redirect("/dashboard/home");
}

// Not authenticated
redirect("/login");
```

**Routing Priority:**
1. Not authenticated → `/login`
2. Authenticated but MFA required → `/otp`
3. Authenticated + BACKOFFICE_USER → `/admin/home`
4. Authenticated + ORGANIZATION_USER → `/dashboard/home`

---

## Password Management

### Change Password

**First Login Password Change:**
- Modal prompt when `change_password` flag is set in session
- User must change password before accessing dashboard

**Authenticated Password Change:**
```typescript
// POST /api/v1/auth/change-password
{
  "old_password": "OldPassword123",
  "new_password": "NewPassword456"
}
```

**Implementation:**
```typescript
export async function changePassword({
  oldPassword,
  newPassword
}: {
  oldPassword: string;
  newPassword: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/change-password`;

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        old_password: oldPassword,
        new_password: newPassword
      }
    });

    // Update session to clear change_password flag
    await updateAuthSession({
      change_password: false
    });

    return successResponse(response.data, "Password changed successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

### Password Reset

**Public Password Reset:**
```typescript
// POST /api/v1/auth/password-reset
{
  "email": "user@example.com"
}
```

Note: Token-based password reset flow requires backend implementation.

---

## Idle Screen Locking

### Idle Timer Configuration

**File:** `components/screen-lock.tsx`

**Features:**
- Automatic lock on user inactivity
- Configurable idle timeout (default: 5 minutes)
- Grace period before lock
- Token refresh on unlock

**Implementation:**
```typescript
import { useIdleTimer } from 'react-idle-timer';

const idleTimer = useIdleTimer({
  timeout: 1000 * 60 * 5, // 5 minutes
  onIdle: () => {
    // Lock screen
    setState("Idle");
  },
  debounce: 500
});

const handleUnlock = async () => {
  // Verify password
  const response = await loginUser({ username, password });

  if (response.success) {
    // Refresh token to extend session
    await refetch();
    setState("Active");
    idleTimer.reset();
  }
};
```

**Function:** `lockScreenOnUserIdle()`
- Extends session on unlock
- Validates user credentials
- Resets idle timer

---

## Token Refresh

### Automatic Token Refresh

**Hook:** `useRefreshToken`

```typescript
export const useRefreshToken = (enabled: boolean) =>
  useQuery({
    queryKey: [USERS_QUERY_KEYS.REFRESH_TOKEN, enabled],
    queryFn: getRefreshToken,
    refetchInterval: 1000 * 60 * 3, // Every 3 minutes
    enabled
  });
```

**Usage in Screen Lock:**
```typescript
const { data, refetch } = useRefreshToken(
  Boolean(loggedIn && !isIdle)
);
```

### Manual Token Refresh

```typescript
// GET /api/v1/auth/refresh-token
export async function getRefreshToken(): Promise<APIResponse> {
  const url = `/api/v1/auth/refresh-token`;

  try {
    const response = await authenticatedApiClient({ url });

    // Initialize system setup with new token
    await initializeSystemSetup({
      access_token: response?.data?.access_token
    });

    return successResponse(response.data, "Token refreshed");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}
```

---

## System Setup Initialization

### Initialize System Setup

**Purpose:** Fetch complete user profile and permissions after authentication

```typescript
export async function initializeSystemSetup({
  access_token
}: {
  access_token: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/setup`;

  try {
    const response = await authenticatedApiClient({ url });
    const session = response?.data;

    // Update auth session with user and permissions
    await updateAuthSession({
      user: session?.user,
      permissions: session?.permissions
    });

    // Create backup user session
    await createUserSession({
      user: session?.user,
      permissions: session?.permissions
    });

    return successResponse(session, response?.data?.message);
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}
```

**API Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "branch": { ... },
    "department": { ... },
    "role": { ... }
  },
  "permissions": [
    {
      "module_id": "uuid",
      "module_name": "Risk Management",
      "can_view": true,
      "can_create": true,
      ...
    }
  ]
}
```

---

## Authentication Server Actions

### Login User

```typescript
export async function loginUser({
  username,
  password
}: LoginCredentials): Promise<APIResponse> {
  const url = `/api/v1/auth/login`;

  try {
    const response = await axios.post(url, { username, password });
    const session = response?.data;

    // Create auth session
    await createAuthSession({
      accessToken: session?.access_token,
      user_type: session?.user_type,
      user_id: session?.user_id,
      change_password: session?.change_password,
      mfa_required: session?.mfa_required,
      organization_id: session?.organization_id
    });

    // If no MFA, fetch user data immediately
    if (!session?.mfa_required) {
      await initializeSystemSetup({
        access_token: session?.access_token
      });
    }

    return successResponse(session, session?.message);
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

### Verify OTP

```typescript
export async function verifyOTP({
  username,
  otp
}: {
  username: string;
  otp: string;
}): Promise<APIResponse> {
  const url = `/api/v1/auth/verify-otp`;

  try {
    const response = await axios.post(url, { username, otp });
    const session = response?.data;

    // Update auth session - mark MFA as complete
    await updateAuthSession({
      accessToken: session?.access_token,
      mfa_required: false,
      mfa_verified: true
    });

    // Initialize system setup to fetch user data
    await initializeSystemSetup({
      access_token: session?.access_token
    });

    return successResponse(session, "OTP verified successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

### Logout User

```typescript
export async function logoutUser(): Promise<APIResponse> {
  const url = `/api/v1/auth/logout`;

  try {
    await authenticatedApiClient({ url, method: "POST" });

    // Clear all session cookies
    await deleteSession();

    return successResponse(null, "Logged out successfully");
  } catch (error: Error | any) {
    // Clear session even if API fails
    await deleteSession();
    return handleError(error, "POST", url);
  }
}
```

---

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/v1/auth/login` | POST | User login | No |
| `/api/v1/auth/verify-otp` | POST | Verify OTP | No |
| `/api/v1/auth/resend-otp` | POST | Resend OTP | No |
| `/api/v1/auth/change-password` | POST | Change password | Yes |
| `/api/v1/auth/register` | POST | Register user | Yes (Admin) |
| `/api/v1/auth/logout` | POST | Logout | Yes |
| `/api/v1/auth/refresh-token` | GET | Refresh token | Yes |
| `/api/v1/auth/setup` | GET | Get user setup | Yes |

---

## Security Best Practices

### Input Validation

**Client-side:**
- React Hook Form with Zod validation
- Email format validation
- Password strength requirements

**Server-side:**
- Zod schema validation in Server Actions
- SQL injection prevention
- XSS protection

### Error Handling

**Standardized error responses:**
```typescript
{
  success: false,
  status: 400 | 401 | 403 | 404 | 500,
  type: "Bad Request" | "Unauthorized" | "Forbidden" | "Not Found" | "Server Error",
  message: "User-friendly error message"
}
```

**Security principles:**
- No sensitive data in error messages
- Generic messages for authentication failures
- Detailed logging server-side only

### Session Security

**Protection mechanisms:**
1. **HTTP-Only Cookies** - Prevent XSS attacks
2. **Secure Flag** - HTTPS only in production
3. **SameSite Strict** - CSRF protection
4. **Encrypted JWT** - Session data encrypted
5. **Expiration** - Auto-logout after 1 hour
6. **Token Rotation** - Refresh token mechanism

---

## Testing

### Login Flow Test Cases

**Test Case 1: Login without MFA**
```
1. Enter valid credentials
2. Submit login form
3. Expect: Direct redirect to dashboard
4. Verify: User object present in session
5. Verify: Permissions loaded
```

**Test Case 2: Login with MFA**
```
1. Enter valid credentials
2. Submit login form
3. Expect: Redirect to /otp page
4. Enter 6-digit OTP
5. Submit OTP
6. Expect: Redirect to dashboard
7. Verify: mfa_verified = true in session
```

**Test Case 3: Invalid Credentials**
```
1. Enter invalid credentials
2. Submit login form
3. Expect: Error toast
4. Verify: Remains on login page
5. Verify: No session created
```

**Test Case 4: Invalid OTP**
```
1. Complete login (MFA enabled)
2. Enter incorrect OTP
3. Submit OTP
4. Expect: Error toast
5. Expect: OTP input cleared
6. Verify: Can retry
```

### Session Management Test Cases

**Test Case 5: Token Refresh**
```
1. Login successfully
2. Wait for idle timeout
3. Unlock screen with password
4. Expect: Token refreshed
5. Verify: Session extended
```

**Test Case 6: Session Expiration**
```
1. Login successfully
2. Wait > 1 hour
3. Attempt protected action
4. Expect: Redirect to login
5. Verify: Session cleared
```

**Test Case 7: Logout**
```
1. Login successfully
2. Click logout
3. Expect: Redirect to login
4. Verify: All cookies cleared
5. Attempt to access dashboard
6. Expect: Redirect to login
```

---

## Troubleshooting

### Common Issues

**Issue: User object missing after login**
- **Cause:** `initializeSystemSetup` not called
- **Solution:** Ensure setup is called after login/OTP verification

**Issue: Screen flickering on login**
- **Cause:** Multiple session updates in quick succession
- **Solution:** Disable auto-refetch on useRefreshToken

**Issue: Always redirects to OTP page**
- **Cause:** `mfa_verified` not set to true
- **Solution:** Verify `updateAuthSession` is called in verifyOTP

**Issue: Session expires too quickly**
- **Cause:** Token expiration set too low
- **Solution:** Adjust JWT expiration in session config

**Issue: Logout doesn't clear session**
- **Cause:** Cookie deletion failing
- **Solution:** Verify `deleteSession()` is called

---

## Configuration

### Environment Variables

```env
# Authentication
AUTH_SECRET=<32+ character secret for JWT encryption>

# API
BASE_URL=https://iams-dev.infratel.co.zm

# Session
SESSION_EXPIRATION=3600  # 1 hour in seconds
```

### Session Configuration

**File:** `lib/session.ts`

```typescript
const sessionExpiration = 60 * 60 * 1000; // 1 hour

export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: sessionExpiration,
  path: "/"
};
```

---

## References

- [Architecture Overview](ARCHITECTURE.md)
- [Features Guide](FEATURES.md)
- [API Integration](API_GUIDE.md)
- [Getting Started](GETTING_STARTED.md)

---

**Last Updated:** November 3, 2025
**Maintained by:** Development Team

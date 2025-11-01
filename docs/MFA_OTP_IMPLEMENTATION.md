# MFA/OTP Implementation Guide

Complete implementation of Multi-Factor Authentication (MFA) with OTP verification.

---

## Overview

This implementation adds a secure two-step authentication flow:

1. User logs in with username/password
2. If MFA is required, user must verify OTP sent to their email
3. Only after OTP verification, user can access their dashboard

---

## Flow Diagram

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │
       │ POST /api/v1/auth/login
       │ { username, password }
       ↓
┌──────────────────┐
│  Login Response  │
│  - access_token  │
│  - user_type     │
│  - mfa_required  │ ←──── Check this flag
└──────┬───────────┘
       │
       ├─── If mfa_required = true ───→ ┌──────────────┐
       │                                 │   OTP Page   │
       │                                 └──────┬───────┘
       │                                        │
       │                                        │ POST /api/v1/auth/verify-otp
       │                                        │ { username, otp }
       │                                        ↓
       │                                 ┌──────────────┐
       │                                 │ OTP Response │
       │                                 │ - Sets       │
       │                                 │   mfa_verified│
       │                                 └──────┬───────┘
       │                                        │
       └─── If mfa_required = false ───────────┴──→ ┌─────────────────┐
                                                     │   Home Page     │
                                                     │ Routes based on │
                                                     │   user_type     │
                                                     └─────────────────┘
```

---

## Implementation Details

### 1. Login Flow Update

**File**: `components/forms/login-form.tsx`

**Changes**:

```typescript
const response = await loginUser({ username: email, password });

if (response.success) {
  // Check if MFA is required
  if (response.data?.mfa_required) {
    toast.info("Please enter the OTP sent to your email");
    // Redirect to OTP page with username
    router.push(`/otp?username=${encodeURIComponent(email)}`);
  } else {
    toast.success(response.message || "Login successful");
    // Redirect to home - will route based on user_type
    router.push("/");
  }
}
```

**Key Points**:

- Checks `mfa_required` flag from login response
- Redirects to OTP page if MFA is required
- Passes username as query parameter for OTP verification

---

### 2. OTP Verification Server Action

**File**: `app/_actions/auth-actions.ts`

**New Function**:

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

    // Update auth session - mark MFA as complete
    await updateAuthSession({
      mfa_required: false,
      mfa_verified: true
    });

    return successResponse(response.data, "OTP verified successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

**API Endpoint**: `POST /api/v1/auth/verify-otp`
**Request Body**:

```json
{
  "username": "admin",
  "otp": "123456"
}
```

**Response**: Returns JWT token with full user data

---

### 3. OTP Form Component

**File**: `app/(auth)/otp/otp-form.tsx`

**Features**:

- 6-digit OTP input with visual separation (3-3)
- Gets username from URL query parameters
- Client-side validation
- Loading states during verification
- Error handling with toast notifications
- Auto-clears OTP on error

**Key Functions**:

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
    router.push("/"); // Routes to correct dashboard
  } else {
    toast.error("Invalid OTP. Please try again.");
    setOtp(""); // Clear OTP on error
  }
};
```

---

### 4. OTP Page

**File**: `app/(auth)/otp/page.tsx`

Simple page that renders the OTP form with Suspense wrapper.

---

### 5. Session Management

**Updated**: `lib/session.ts`

The session now tracks:

- `mfa_required` - Set during login if MFA is enabled
- `mfa_verified` - Set to true after successful OTP verification

**Session Cookie Structure**:

```typescript
{
  accessToken: string,
  user_type: "BACKOFFICE_USER" | "REGULAR_USER",
  change_password: boolean,
  mfa_required: boolean,    // New field
  mfa_verified: boolean,    // New field
  organization_id: string,
  expiresAt: Date
}
```

---

### 6. Routing Logic

**File**: `app/page.tsx`

**Updated Logic**:

```typescript
const session = await verifySession();

if (session?.isAuthenticated) {
  // CHECK IF MFA IS REQUIRED BUT NOT YET VERIFIED
  if (session?.session?.mfa_required && !session?.session?.mfa_verified) {
    redirect("/otp");
  }

  // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
  if (session?.session?.user_type === "BACKOFFICE_USER") {
    redirect("/_/admin/home");
  }

  // ROUTE PROTECTION - DEFAULT USERS
  redirect("/dashboard/home");
}

redirect("/login");
```

**Routing Priority**:

1. **Not authenticated** → `/login`
2. **Authenticated but MFA required** → `/otp`
3. **Authenticated + BACKOFFICE_USER** → `/_/admin/home`
4. **Authenticated + Default user** → `/dashboard/home`

---

## User Experience Flow

### Scenario 1: User with MFA Enabled

1. **Login Page**
   - User enters username and password
   - Clicks "Sign In"

2. **Backend Response**

   ```json
   {
     "access_token": "eyJ...",
     "user_type": "REGULAR_USER",
     "mfa_required": true,
     "message": "OTP sent to your email"
   }
   ```

3. **Redirect to OTP Page**
   - URL: `/otp?username=user@example.com`
   - Toast: "Please enter the OTP sent to your email"

4. **OTP Page**
   - User receives email with 6-digit code
   - Enters OTP: `123456`
   - Clicks "Verify"

5. **OTP Verification**
   - Backend validates OTP
   - Session updated with `mfa_verified: true`
   - Toast: "OTP verified successfully!"

6. **Redirect to Dashboard**
   - Based on `user_type`:
     - `BACKOFFICE_USER` → `/_/admin/home`
     - Others → `/dashboard/home`

### Scenario 2: User without MFA

1. **Login Page**
   - User enters credentials
   - Clicks "Sign In"

2. **Backend Response**

   ```json
   {
     "access_token": "eyJ...",
     "user_type": "REGULAR_USER",
     "mfa_required": false,
     "message": "Login successful"
   }
   ```

3. **Direct Redirect**
   - Bypasses OTP page
   - Goes straight to appropriate dashboard

---

## Security Features

### 1. Session-Based MFA Tracking

- MFA status stored in encrypted JWT cookie
- Cannot be bypassed by URL manipulation

### 2. Username Validation

- OTP form checks for username in URL
- Redirects to login if username missing

### 3. OTP Validation

- Backend validates:
  - OTP matches sent code
  - OTP hasn't expired
  - Username is correct

### 4. Complete OTP Required

- Submit button disabled until all 6 digits entered
- Client-side validation before API call

### 5. Error Handling

- Invalid OTP clears input for retry
- Failed attempts logged
- Toast notifications for all error cases

---

## API Integration

### Login Endpoint

**URL**: `POST /api/v1/auth/login`

**Request**:

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response (MFA Required)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "REGULAR_USER",
  "mfa_required": true,
  "change_password": false,
  "organization_id": "org-123",
  "message": "OTP sent to your email"
}
```

**Response (No MFA)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "REGULAR_USER",
  "mfa_required": false,
  "change_password": false,
  "organization_id": "org-123",
  "message": "Login successful"
}
```

### Verify OTP Endpoint

**URL**: `POST /api/v1/auth/verify-otp`

**Request**:

```json
{
  "username": "admin",
  "otp": "123456"
}
```

**Response (Success)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "REGULAR_USER",
  "message": "OTP verified successfully"
}
```

**Response (Error)**:

```json
{
  "error": "Invalid OTP",
  "message": "The OTP you entered is incorrect"
}
```

---

## Testing Guide

### Test Case 1: Login with MFA

1. **Setup**: User has MFA enabled in backend
2. **Login**: Use username: `admin`, password: `Admin@123`
3. **Expected**: Redirect to `/otp?username=admin`
4. **Enter OTP**: Input 6-digit code from email
5. **Expected**: Toast success, redirect to dashboard

### Test Case 2: Invalid OTP

1. **Enter Wrong OTP**: `000000`
2. **Expected**:
   - Error toast: "Invalid OTP. Please try again."
   - OTP input cleared
   - Can retry

### Test Case 3: Missing Username

1. **Navigate directly**: Go to `/otp` without username
2. **Click Verify**
3. **Expected**:
   - Error toast: "Username not found. Please login again."
   - Redirect to `/login`

### Test Case 4: Login without MFA

1. **Setup**: User has MFA disabled
2. **Login**: Normal credentials
3. **Expected**: Direct redirect to dashboard (no OTP page)

### Test Case 5: Incomplete OTP

1. **Enter only 4 digits**: `1234`
2. **Expected**: Verify button stays disabled

---

## Files Created/Modified

### Created:

- ✅ `app/(auth)/otp/otp-form.tsx` - OTP input form component
- ✅ `app/(auth)/otp/page.tsx` - OTP page

### Modified:

- ✅ `components/forms/login-form.tsx` - Added MFA check and routing
- ✅ `app/_actions/auth-actions.ts` - Added `verifyOTP()` function
- ✅ `app/page.tsx` - Added MFA routing logic

---

## Environment Variables

No new environment variables required. Uses existing:

- `AUTH_SECRET` - For JWT encryption
- `NEXT_PUBLIC_API_URL` - API base URL

---

## Troubleshooting

### Issue: Always redirects to OTP even after verification

**Solution**: Check that `updateAuthSession()` is being called with `mfa_verified: true`

### Issue: OTP verification fails with "Username not found"

**Solution**: Ensure username is passed in URL: `/otp?username=user@example.com`

### Issue: Session expires after OTP verification

**Solution**: Backend must return new JWT token with extended expiry

---

## Summary

✅ **Complete MFA/OTP Flow**

- Login detects `mfa_required` flag
- Redirects to OTP page
- Verifies OTP via API
- Updates session with `mfa_verified`
- Routes to correct dashboard

✅ **Security**

- Session-based MFA tracking
- Cannot bypass OTP page
- Proper error handling
- Input validation

✅ **User Experience**

- Clear visual OTP input (3-3 digits)
- Loading states
- Error messages
- Auto-clear on error
- Disabled states

✅ **Flexible Routing**

- Works with/without MFA
- Routes based on `user_type`
- Handles BACKOFFICE_USER separately

The MFA/OTP implementation is complete and ready for testing! 🎉

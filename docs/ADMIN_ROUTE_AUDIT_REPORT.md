# Admin Route Audit Report

**Date**: November 2, 2025
**Scope**: Complete audit of admin (`/_/admin/**`) routes, authentication, authorization, and API integration
**User Type**: `BACKOFFICE_USER`

---

## Executive Summary

### Critical Issues Found: 🔴 6 Critical | 🟡 4 High | 🟢 3 Medium

| Category | Status | Issues |
|----------|--------|--------|
| **Route Protection** | 🔴 CRITICAL | Inconsistent URL patterns, missing proxy protection |
| **Session Management** | 🟡 HIGH | user_type not tracked in session cookie |
| **API Implementation** | 🔴 CRITICAL | All admin endpoints use MOCK data |
| **URL Consistency** | 🔴 CRITICAL | Routes use `/admin/*` but redirects use `/_/admin/*` |
| **Layout Protection** | 🟢 GOOD | Layout has proper authorization check |
| **Sidebar Navigation** | 🟡 HIGH | Hardcoded routes, potential mismatch |

---

## 1. Route Structure Analysis

### Current Admin Route Structure

```
app/
└── (private)/
    ├── layout.tsx                    ✅ Protected (checks BACKOFFICE_USER)
    └── admin/
        ├── page.tsx                  ✅ Redirects to /_/admin/home
        ├── home/
        │   ├── page.tsx             ⚠️ No protection (relies on layout)
        │   └── home.tsx             📊 Mock data (hardcoded stats)
        ├── users/
        │   ├── page.tsx             ✅ Uses getUsers() API
        │   ├── data-table.tsx
        │   └── data.ts
        ├── companies/
        │   ├── page.tsx             🔴 Mock data only
        │   ├── companies.tsx        🔴 Client-side mock data
        │   └── mapping/
        │       ├── page.tsx         🔴 Mock data only
        │       ├── mapping.tsx      🔴 Client-side mock data
        │       └── _data.ts         🔴 Mock data definitions
        └── configurations/
            ├── page.tsx             ✅ Uses API actions
            └── _components/
                ├── branches-tab.tsx
                ├── provinces-tab.tsx
                ├── towns-tab.tsx
                └── countries-tab.tsx
```

### URL Pattern Inconsistencies

#### Problem: Mixed Route Patterns

| Location | Pattern Used | Expected Pattern | Issue |
|----------|-------------|------------------|-------|
| **File System** | `app/(private)/admin/*` | Maps to `/admin/*` | ✅ Correct |
| **Auth Layout Redirect** | `redirect("/_/admin/home")` | Should be `/admin/home` | 🔴 WRONG |
| **Admin Page Redirect** | `redirect("/_/admin/home")` | Should be `/admin/home` | 🔴 WRONG |
| **Dashboard Layout** | `redirect("/admin/home")` | ✅ Correct | ✅ CORRECT |
| **Nav Config** | `href: "/admin/home"` | ✅ Correct | ✅ CORRECT |

#### Impact

- Users see **404 errors** when redirected from auth layout
- Navigation shows `/admin/*` but redirects to `/_/admin/*` create broken links
- Inconsistent URL structure confuses developers

---

## 2. Authentication & Authorization Audit

### Current Protection Layers

#### Layer 1: Proxy (proxy.ts)
```typescript
❌ NO ADMIN ROUTE PROTECTION
- Only checks cookie existence
- No user_type validation
- No route-specific protection
```

**Issues:**
1. ❌ Proxy doesn't check if user accessing `/admin/*` is `BACKOFFICE_USER`
2. ❌ Regular users can reach admin layout before being redirected
3. ❌ Extra round-trip and server processing

#### Layer 2: Layout Protection ((private)/layout.tsx)
```typescript
✅ WORKING
- Checks user_type === "BACKOFFICE_USER"
- Redirects non-admin users to /dashboard/home
- BUT: Relies on initializeSystemSetup() which is slow
```

**Issues:**
1. 🟡 Runs AFTER page load starts (not at edge)
2. 🟡 Every admin page request calls initializeSystemSetup()
3. ✅ Does properly protect routes

#### Layer 3: Individual Pages
```typescript
⚠️ INCONSISTENT
- admin/page.tsx: Has its own check (redundant)
- Other pages: No checks (rely on layout)
```

### Session Management Issues

#### Current Session Cookie (AUTH_SESSION)
```typescript
type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  change_password?: boolean;
  mfa_required?: boolean;
  organization_id?: string;
  expiresAt?: Date;
  // ❌ MISSING: user_type
  // ❌ MISSING: user_id
}
```

**Problems:**
1. 🔴 **Critical**: `user_type` NOT stored in session cookie
2. 🔴 **Critical**: Proxy can't check user_type (not in cookie)
3. 🟡 Must call `initializeSystemSetup()` on every request to get user_type
4. 🟡 Can't do fast edge-level route protection

#### User Type Flow
```
Login → createAuthSession(user_type) → ✅ Stored in cookie
BUT...
verifySession() → ❌ Returns { session } without user_type
Layouts must call initializeSystemSetup() → 🐢 Slow (API call)
```

---

## 3. API Endpoint Implementation Status

### Backoffice Endpoints (from FRONTEND_API_GUIDE.md)

#### Countries
| Endpoint | Method | Status | Implementation |
|----------|--------|--------|----------------|
| `/backoffice/countries` | GET | 🔴 NOT IMPLEMENTED | No action file |
| `/backoffice/countries` | POST | 🔴 NOT IMPLEMENTED | No action file |
| `/backoffice/countries/update` | PUT | 🔴 NOT IMPLEMENTED | No action file |

#### Provinces
| Endpoint | Method | Status | Implementation |
|----------|--------|--------|----------------|
| `/backoffice/provinces` | POST | 🔴 NOT IMPLEMENTED | No action file |
| `/backoffice/provinces` | GET | 🔴 NOT IMPLEMENTED | No action file |

#### Towns
| Endpoint | Method | Status | Implementation |
|----------|--------|--------|----------------|
| `/backoffice/towns` | POST | 🔴 NOT IMPLEMENTED | No action file |
| `/backoffice/towns` | GET | 🔴 NOT IMPLEMENTED | No action file |

#### Organizations
| Endpoint | Method | Status | Implementation |
|----------|--------|--------|----------------|
| `/backoffice/organizations` | POST | 🔴 NOT IMPLEMENTED | No action file |
| `/backoffice/organizations/stats` | GET | 🔴 NOT IMPLEMENTED | No action file |

### Current Mock Data Usage

#### Files Using Mock Data

1. **app/(private)/admin/home/home.tsx** (Lines 5-10)
   ```typescript
   const stats = {
     companies: 12,        // 🔴 HARDCODED
     users: 45,           // 🔴 HARDCODED
     countries: 3,        // 🔴 HARDCODED
     locations: 28        // 🔴 HARDCODED
   };
   ```

2. **app/(private)/admin/companies/companies.tsx** (Lines 35-54)
   ```typescript
   const mockCompanies: Company[] = [
     {
       id: "comp-1",
       name: "Innovatech Solutions",
       email: "contact@innovatech.com",
       // ... 🔴 HARDCODED MOCK DATA
     }
   ];
   ```

3. **app/(private)/admin/companies/mapping/_data.ts**
   - `mockCompanies` - 🔴 Hardcoded companies
   - `mockCountries` - 🔴 Hardcoded countries
   - `mockProvinces` - 🔴 Hardcoded provinces
   - `mockTowns` - 🔴 Hardcoded towns
   - `initialLocations` - 🔴 Hardcoded location mappings

### Summary: Admin API Status
- **Total Backoffice Endpoints**: 9
- **Implemented**: 0 (0%)
- **Mock Data**: 100%
- **Ready for Production**: ❌ NO

---

## 4. Sidebar Navigation Audit

### Current Admin Navigation (lib/routes-config.tsx)

```typescript
export const adminNavItems: NavGroup[] = [
  {
    title: "Dashboards",
    items: [
      {
        title: "Overview",
        href: "/admin/home",  // ✅ CORRECT pattern
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Global System",
    items: [
      {
        title: "Users",
        href: "/admin/users",  // ✅ CORRECT pattern
        icon: Users
      },
      {
        title: "Companies",
        href: "/admin/companies",  // ✅ CORRECT pattern
        icon: Building
      }
    ]
  },
  {
    title: "System Configurations",
    items: [
      {
        title: "Locations",
        href: "/admin/Configurations",  // 🟡 Capital C (inconsistent)
        icon: MapPin
      }
    ]
  }
];
```

### Issues

1. 🟡 **Capitalization**: `/admin/Configurations` should be `/admin/configurations`
2. ✅ **Route Pattern**: All use `/admin/*` (correct)
3. ⚠️ **Dynamic Loading**: Sidebar correctly checks `user?.user_type === "BACKOFFICE_USER"`

---

## 5. Routing Flow Analysis

### Current Flow for BACKOFFICE_USER

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: User logs in with BACKOFFICE_USER credentials      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ auth-actions.ts: login()                                    │
│ - Calls API /auth/login                                     │
│ - Receives: { user_type: "BACKOFFICE_USER", ... }          │
│ - createAuthSession({ user_type, accessToken, ... })       │
│   ✅ user_type stored in cookie                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ components/forms/login-form.tsx                             │
│ - router.push("/dashboard/home")  ⚠️ WRONG!                │
│   Should be: Check user_type and route accordingly         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ proxy.ts                                                     │
│ - Checks: hasAuthCookie ✅                                  │
│ - Does NOT check user_type ❌                               │
│ - Allows request through                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ app/dashboard/layout.tsx                                    │
│ - Calls initializeSystemSetupCached() 🐢 SLOW              │
│ - Checks: user?.user_type == "BACKOFFICE_USER"             │
│ - redirect("/admin/home") ✅ CORRECT                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ proxy.ts (again)                                            │
│ - Intercepts /admin/home                                    │
│ - No protection ❌                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ app/(private)/layout.tsx                                    │
│ - Calls initializeSystemSetup() AGAIN 🐢                   │
│ - Checks: user_type !== "BACKOFFICE_USER"                  │
│ - Redirects to /dashboard/home if not admin ✅              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ app/(private)/admin/home/page.tsx                           │
│ - Renders with MOCK DATA 🔴                                │
└─────────────────────────────────────────────────────────────┘
```

### Problems in Flow

1. 🔴 **Double API Calls**: `initializeSystemSetup()` called twice (dashboard layout + admin layout)
2. 🔴 **Wrong Initial Redirect**: Login form sends everyone to `/dashboard/home` first
3. 🔴 **No Proxy Protection**: Admin routes not protected at edge
4. 🟡 **Performance**: 2-3 redirects for admin users before reaching correct page

### Current Flow for Regular User Accessing Admin

```
User types: /admin/home
       ↓
proxy.ts: hasAuthCookie? Yes → Allow ❌ SHOULD BLOCK
       ↓
app/(private)/layout.tsx: Checks user_type
       ↓
NOT BACKOFFICE_USER → redirect("/dashboard/home") ✅
```

**Result**: Works but inefficient (should block at proxy level)

---

## 6. Critical Security Issues

### 🔴 Issue 1: No Edge-Level Admin Protection

**Problem**: Proxy doesn't validate user_type before allowing admin route access

**Risk**: Medium
- Authenticated regular users can reach admin layout
- Extra server processing before redirect
- Potential timing attacks to enumerate admin routes

**Current**:
```typescript
// proxy.ts - NO admin route checking
if (hasAuthCookie && !isAuthPage) {
  return response; // ❌ Allows all authenticated users
}
```

**Should be**:
```typescript
// proxy.ts - SHOULD check admin routes
const isAdminRoute = pathname.startsWith("/admin");
if (isAdminRoute && hasAuthCookie) {
  // Can't verify user_type here (not in cookie accessible to proxy)
  // Let layout handle it, OR decode JWT at edge (slow)
}
```

### 🔴 Issue 2: user_type Not in Session Cookie

**Problem**: `user_type` stored in AUTH_SESSION but not accessible in proxy

**Risk**: High
- Can't do fast edge-level authorization
- Must call API on every admin page load
- Performance degradation

**Solution**: Add user_type to session cookie payload

### 🟡 Issue 3: Inconsistent URL Patterns

**Problem**: Code uses both `/admin/*` and `/_/admin/*`

**Risk**: Low (functionality works, but confusing)
- Broken links
- Developer confusion
- SEO issues (if admin exposed)

---

## 7. Performance Issues

### API Call Redundancy

| Page Access | API Calls Made |
|-------------|----------------|
| `/admin/home` | 2x `initializeSystemSetup()` |
| `/admin/users` | 2x `initializeSystemSetup()` + 1x `getUsers()` |
| `/admin/companies` | 2x `initializeSystemSetup()` + Mock data |

**Issue**: `initializeSystemSetup()` called in both:
1. `app/dashboard/layout.tsx` (line 24)
2. `app/(private)/layout.tsx` (line 23)

**Why**: Login redirects to `/dashboard/home`, which checks user_type, then redirects to `/admin/home`

**Impact**:
- 🐢 2x slower initial load
- 💸 2x API calls
- 😵 Poor UX

---

## 8. Mock Data Analysis

### Complete Mock Data Inventory

#### 1. Admin Dashboard Stats (admin/home/home.tsx)
```typescript
const stats = {
  companies: 12,    // Should be: GET /backoffice/organizations/stats
  users: 45,        // Should be: GET /users (count)
  countries: 3,     // Should be: GET /backoffice/countries (count)
  locations: 28     // Should be: GET /backoffice/company-locations (count)
};
```

**Replacement Needed**: Create `getBackofficeStats()` server action

#### 2. Companies Management (admin/companies/companies.tsx)
```typescript
const mockCompanies: Company[] = [
  {
    id: "comp-1",
    name: "Innovatech Solutions",
    email: "contact@innovatech.com",
    phone: "123-456-7890",
    status: "active",
    logo_url: "https://placehold.co/100x100/e2e8f0/475569?text=IS",
    created_at: new Date().toISOString()
  },
  // ...
];
```

**Replacement Needed**: Create `backoffice-actions.ts` with:
- `getOrganizations()`
- `createOrganization()`
- `updateOrganization()`

#### 3. Company Mapping (admin/companies/mapping/_data.ts)
- **mockCompanies**: 2 companies
- **mockCountries**: 3 countries (Canada, USA, Mexico)
- **mockProvinces**: 6 provinces
- **mockTowns**: 12 towns
- **initialLocations**: 5 company-location mappings

**Replacement Needed**: Create actions for:
- `getCountries()`
- `createCountry()`
- `getProvinces()`
- `getTowns()`
- `getCompanyLocations()`
- `createCompanyLocation()`

---

## 9. Recommendations Summary

### Priority 1: Critical Fixes (Do First)

1. ✅ **Fix URL Pattern Inconsistencies**
   - Change `/_/admin/*` redirects to `/admin/*`
   - Files: `app/(auth)/layout.tsx`, `app/(private)/admin/page.tsx`

2. ✅ **Add user_type to Session Cookie**
   - Modify `lib/session.ts` to include user_type in cookie
   - Update `verifySession()` to return user_type

3. ✅ **Update Proxy for Admin Route Protection**
   - Add user_type check in proxy for `/admin/*` routes
   - Fast rejection of non-admin users

4. ✅ **Fix Login Redirect Logic**
   - Update `login-form.tsx` to check user_type and redirect appropriately
   - Admin users → `/admin/home`
   - Regular users → `/dashboard/home`

### Priority 2: API Implementation

5. ✅ **Create backoffice-actions.ts**
   - Implement all `/backoffice/*` endpoints
   - Replace ALL mock data with real API calls

6. ✅ **Implement Missing Endpoints**
   - Countries CRUD
   - Provinces CRUD
   - Towns CRUD
   - Organizations CRUD
   - Company Locations CRUD
   - Dashboard stats

### Priority 3: Performance & UX

7. ✅ **Eliminate Redundant API Calls**
   - Remove duplicate `initializeSystemSetup()` calls
   - Use proper redirect flow to avoid layout chaining

8. ✅ **Add Loading States**
   - Admin pages should show loading skeletons
   - Handle API errors gracefully

### Priority 4: Polish

9. ✅ **Fix Sidebar Capitalization**
   - Change `/admin/Configurations` → `/admin/configurations`

10. ✅ **Add Admin Route Documentation**
    - Document admin-only routes
    - Create admin user guide

---

## 10. Testing Checklist

After fixes are applied, test these scenarios:

### Admin User (BACKOFFICE_USER)
- [ ] Login redirects to `/admin/home`
- [ ] Can access all `/admin/*` routes
- [ ] Cannot access `/dashboard/*` routes
- [ ] Sidebar shows admin navigation
- [ ] All data is from API (no mock data)
- [ ] Logout returns to `/login`

### Regular User (ORGANIZATION_USER)
- [ ] Login redirects to `/dashboard/home`
- [ ] Cannot access `/admin/*` routes (blocked at proxy)
- [ ] Gets 404 or redirect if tries to access `/admin/home`
- [ ] Sidebar shows regular navigation
- [ ] All permissions work correctly

### Edge Cases
- [ ] Direct URL access to `/admin/users` (should block non-admin)
- [ ] Expired session accessing `/admin/*` (should redirect to login)
- [ ] MFA-required admin user (should complete OTP, then go to admin)
- [ ] Session cookie missing user_type (should call API fallback)

---

## Appendix A: File Changes Required

### Files to Modify

1. **app/(auth)/layout.tsx** (Line 49)
   - Change: `redirect("/_/admin/home")` → `redirect("/admin/home")`

2. **app/(private)/admin/page.tsx** (Line 9)
   - Change: `redirect("/_/admin/home")` → `redirect("/admin/home")`

3. **lib/session.ts**
   - Add `user_type` to AuthSession cookie payload
   - Update `verifySession()` to return user_type

4. **proxy.ts**
   - Add admin route protection using user_type from cookie

5. **components/forms/login-form.tsx**
   - Check user_type in response
   - Route admin users to `/admin/home`

6. **lib/routes-config.tsx** (Line 72)
   - Change: `href: "/admin/Configurations"` → `href: "/admin/configurations"`

7. **app/dashboard/layout.tsx** (Line 28)
   - Already correct: `redirect("/admin/home")`

### Files to Create

1. **app/_actions/backoffice-actions.ts**
   - All backoffice API endpoints
   - Countries, Provinces, Towns, Organizations

### Files to Update (Replace Mock Data)

1. **app/(private)/admin/home/home.tsx**
   - Replace hardcoded stats with API call

2. **app/(private)/admin/companies/companies.tsx**
   - Replace mockCompanies with `getOrganizations()`

3. **app/(private)/admin/companies/mapping/mapping.tsx**
   - Replace all mock data imports with API calls

### Files to Delete (After Migration)

1. **app/(private)/admin/companies/mapping/_data.ts**
   - Delete after migrating to real API

---

## Appendix B: Backend Endpoints Needed

If backend doesn't have these endpoints, they need to be implemented:

### Required Backoffice Endpoints

```
GET    /api/v1/backoffice/stats
GET    /api/v1/backoffice/countries
POST   /api/v1/backoffice/countries
PUT    /api/v1/backoffice/countries/update
GET    /api/v1/backoffice/provinces
POST   /api/v1/backoffice/provinces
GET    /api/v1/backoffice/towns
POST   /api/v1/backoffice/towns
GET    /api/v1/backoffice/organizations
POST   /api/v1/backoffice/organizations
GET    /api/v1/backoffice/organizations/stats
GET    /api/v1/backoffice/company-locations
POST   /api/v1/backoffice/company-locations
DELETE /api/v1/backoffice/company-locations/:id
```

Coordinate with backend team to ensure these are ready.

---

**End of Report**

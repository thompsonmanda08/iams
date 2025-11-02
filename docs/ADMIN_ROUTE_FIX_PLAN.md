# Admin Route Fix & Implementation Plan

**Date**: November 2, 2025
**Goal**: Secure and fully implement `/admin/**` routes for BACKOFFICE_USER with production-ready API integration

---

## Phase 1: Critical Security & Routing Fixes

### Task 1.1: Fix URL Pattern Inconsistencies ⏱️ 15 min

**Problem**: Redirects use `/_/admin/*` but routes are `/admin/*`

**Files to Change**:

#### 1. app/(auth)/layout.tsx (Line 49)
```typescript
// BEFORE
if (user?.user_type === "BACKOFFICE_USER") {
  redirect("/_/admin/home");
}

// AFTER
if (user?.user_type === "BACKOFFICE_USER") {
  redirect("/admin/home");
}
```

#### 2. app/(private)/admin/page.tsx (Line 9)
```typescript
// BEFORE
if (session?.isAuthenticated && session?.user?.user_type == "BACKOFFICE_USER") {
  redirect("/_/admin/home");
}

// AFTER
if (session?.isAuthenticated && session?.user?.user_type == "BACKOFFICE_USER") {
  redirect("/admin/home");
}
```

#### 3. lib/routes-config.tsx (Line 72)
```typescript
// BEFORE
{
  title: "Locations",
  href: "/admin/Configurations",
  icon: MapPin
}

// AFTER
{
  title: "Locations",
  href: "/admin/configurations",
  icon: MapPin
}
```

**Test**: Navigate to admin routes, ensure no 404s

---

### Task 1.2: Add user_type to Session Cookie ⏱️ 30 min

**Problem**: `user_type` not accessible at edge/proxy level

**Files to Change**:

#### 1. lib/session.ts

##### Update AuthSession Type (Add to existing)
```typescript
export type AuthSession = JWTPayload & {
  accessToken: string;
  refreshToken?: string;
  screen_locked?: boolean;
  user?: Partial<User> | null;
  change_password?: boolean;
  mfa_required?: boolean;
  mfa_verified?: boolean;      // Add this if missing
  organization_id?: string;
  user_type?: UserType;         // ✅ ADD THIS
  user_id?: string;             // ✅ ADD THIS (helpful for debugging)
  expiresAt?: Date;
  [x: string]: any;
};
```

##### Update createAuthSession Function (Line 108-146)
```typescript
export async function createAuthSession({
  accessToken,
  user_type,
  user_id,                       // ✅ ADD THIS PARAMETER
  change_password,
  mfa_required,
  organization_id
}: {
  accessToken: string;
  user_type: UserType;
  user_id?: string;              // ✅ ADD THIS
  change_password?: boolean;
  mfa_required?: boolean;
  organization_id?: string;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const newSession: AuthSession = {
    accessToken: accessToken || "",
    user_type,                   // ✅ INCLUDE user_type
    user_id,                     // ✅ INCLUDE user_id
    change_password,
    mfa_required,
    organization_id,
    expiresAt
  };

  const token = await encrypt(newSession);

  if (token) {
    (await cookies()).set(AUTH_SESSION, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "strict",
      path: "/"
    });
  } else {
    throw new Error("Failed to create session token.");
  }
}
```

##### Update verifySession to Return user_type (Line 235-288)
```typescript
export async function verifySession(): Promise<{
  isAuthenticated: boolean;
  session: AuthSession | null;
  user?: Partial<User> | null;
  user_type?: UserType;          // ✅ ADD THIS
  permissions?: any[];
  [key: string]: any;
}> {
  try {
    const cookie = (await cookies()).get(AUTH_SESSION)?.value;

    if (!cookie) {
      return { isAuthenticated: false, session: null };
    }

    const decrypted = await decrypt(cookie);

    if (!decrypted || decrypted.success === false) {
      await deleteSession();
      return { isAuthenticated: false, session: null };
    }

    const session = decrypted as AuthSession;

    if (!session?.accessToken) {
      return { isAuthenticated: false, session: null };
    }

    // Check token expiration
    if (session?.expiresAt) {
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();

      if (expiresAt < now) {
        await deleteSession();
        return { isAuthenticated: false, session: null };
      }
    }

    // Session is valid
    return {
      isAuthenticated: true,
      session: session,
      user_type: session.user_type  // ✅ RETURN user_type
    };
  } catch (error) {
    console.error("[verifySession] Error:", error);
    return { isAuthenticated: false, session: null };
  }
}
```

#### 2. app/_actions/auth-actions.ts

##### Update login() to pass user_id (Line 16-47)
```typescript
export async function login({ emailusername, password }: LoginPayload): Promise<APIResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: emailusername,
      password: password
    });

    const session = response?.data?.data;

    // Set authentication cookie with user_type and user_id
    await createAuthSession({
      accessToken: session?.access_token,
      user_type: session?.user_type,
      user_id: session?.user?.id,        // ✅ ADD THIS
      change_password: session?.change_password,
      mfa_required: session?.mfa_required,
      organization_id: session?.organization_id
    });

    return successResponse(session, "Login successful");
  } catch (error: any) {
    return handleError(error, "POST | LOGIN", "/auth/login");
  }
}
```

**Test**:
1. Login as admin user
2. Check cookie contains `user_type` (use browser DevTools)
3. Verify `verifySession()` returns user_type

---

### Task 1.3: Update Proxy for Admin Protection ⏱️ 20 min

**Problem**: Proxy doesn't check if user accessing `/admin/*` is BACKOFFICE_USER

**File to Change**: proxy.ts

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION } from "./lib/constants";
import { decrypt } from "./lib/session"; // ✅ ADD THIS IMPORT

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const response = NextResponse.next();

  // ... existing security headers ...

  // Exclude public assets
  if (
    pathname.startsWith("/web-app-manifest") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/manifest.json")
  ) {
    return response;
  }

  // ✅ FAST: Check cookie existence only
  const hasAuthCookie = request.cookies.has(AUTH_SESSION);

  // Define authentication pages
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/otp");

  // ✅ NEW: Check if accessing admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // If no auth cookie and not on auth page, redirect to login
  if (!hasAuthCookie && !isAuthPage) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If has auth cookie and on auth page, redirect to dashboard
  if (hasAuthCookie && isAuthPage) {
    url.pathname = "/dashboard/home";
    return NextResponse.redirect(url);
  }

  // ✅ NEW: Admin route protection
  // Check user_type for admin routes (requires JWT decode - acceptable here)
  if (isAdminRoute && hasAuthCookie) {
    try {
      const cookie = request.cookies.get(AUTH_SESSION)?.value;
      if (cookie) {
        const decrypted = await decrypt(cookie);
        const session = decrypted as any;

        // If not a BACKOFFICE_USER, redirect to regular dashboard
        if (session?.user_type !== "BACKOFFICE_USER") {
          url.pathname = "/dashboard/home";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // If decryption fails, let it through (layout will handle)
      console.error("[Proxy] Admin route check failed:", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|web-app-manifest-192x192.png|web-app-manifest-512x512.png|manifest.json).*)"
  ]
};
```

**Performance Note**:
- JWT decryption only happens for `/admin/*` routes
- Regular routes still use fast cookie check
- Trade-off: Security > Speed for admin routes

**Test**:
1. Login as regular user
2. Try to access `/admin/home` directly
3. Should be redirected to `/dashboard/home`

---

### Task 1.4: Fix Login Redirect Logic ⏱️ 15 min

**Problem**: All users redirect to `/dashboard/home` after login, then admin users get redirected again

**File to Change**: components/forms/login-form.tsx

```typescript
// Find the login success handler (around line 50-70)

// BEFORE
if (response.success) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (response.data?.mfa_required) {
    router.push(`/otp?username=${encodeURIComponent(email)}`);
  } else {
    router.push("/dashboard/home"); // ❌ Wrong for admin users
  }
}

// AFTER
if (response.success) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (response.data?.mfa_required) {
    router.push(`/otp?username=${encodeURIComponent(email)}`);
  } else {
    // ✅ Route based on user_type
    const userType = response.data?.user_type;

    if (userType === "BACKOFFICE_USER") {
      router.push("/admin/home");
    } else {
      router.push("/dashboard/home");
    }
  }
}
```

**Test**:
1. Login as admin user → should go directly to `/admin/home`
2. Login as regular user → should go to `/dashboard/home`
3. No double redirects

---

## Phase 2: API Implementation & Server Actions

### Task 2.1: Create backoffice-actions.ts ⏱️ 2 hours

**File to Create**: app/_actions/backoffice-actions.ts

```typescript
"use server";

import { authenticatedApiClient } from "@/lib/api-client";
import { APIResponse } from "@/lib/types";
import { handleError, successResponse } from "@/lib/utils";

// ==================== COUNTRIES ====================

export async function getCountries(params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("limit", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `/api/v1/backoffice/countries${queryParams.toString() ? `?${queryParams}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });

    return successResponse(response.data.data, "Countries fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET COUNTRIES", "/api/v1/backoffice/countries");
  }
}

export async function createCountry(data: {
  name: string;
  code: string;
  region?: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/countries",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Country created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE COUNTRY", "/api/v1/backoffice/countries");
  }
}

export async function updateCountry(data: {
  id: string;
  name?: string;
  code?: string;
  region?: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/countries/update",
      method: "PUT",
      data
    });

    return successResponse(response.data.data, "Country updated successfully");
  } catch (error) {
    return handleError(error, "PUT | UPDATE COUNTRY", "/api/v1/backoffice/countries/update");
  }
}

// ==================== PROVINCES ====================

export async function getProvincesByCountry(countryId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/provinces?country_id=${countryId}`,
      method: "GET"
    });

    return successResponse(response.data.data, "Provinces fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET PROVINCES", "/api/v1/backoffice/provinces");
  }
}

export async function createProvince(data: {
  name: string;
  country_id: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/provinces",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Province created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE PROVINCE", "/api/v1/backoffice/provinces");
  }
}

// ==================== TOWNS ====================

export async function getTownsByProvince(provinceId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/towns?province_id=${provinceId}`,
      method: "GET"
    });

    return successResponse(response.data.data, "Towns fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET TOWNS", "/api/v1/backoffice/towns");
  }
}

export async function createTown(data: {
  name: string;
  province_id: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/towns",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Town created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE TOWN", "/api/v1/backoffice/towns");
  }
}

// ==================== ORGANIZATIONS ====================

export async function getOrganizations(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: "active" | "inactive";
}): Promise<APIResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("limit", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const url = `/api/v1/backoffice/organizations${queryParams.toString() ? `?${queryParams}` : ""}`;

    const response = await authenticatedApiClient({
      url,
      method: "GET"
    });

    return successResponse(response.data.data, "Organizations fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET ORGANIZATIONS", "/api/v1/backoffice/organizations");
  }
}

export async function createOrganization(data: {
  name: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  status?: "active" | "inactive";
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/organizations",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Organization created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE ORGANIZATION", "/api/v1/backoffice/organizations");
  }
}

export async function updateOrganization(data: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  status?: "active" | "inactive";
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/organizations/${data.id}`,
      method: "PUT",
      data
    });

    return successResponse(response.data.data, "Organization updated successfully");
  } catch (error) {
    return handleError(error, "PUT | UPDATE ORGANIZATION", "/api/v1/backoffice/organizations");
  }
}

// ==================== COMPANY LOCATIONS ====================

export async function getCompanyLocations(companyId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/company-locations?company_id=${companyId}`,
      method: "GET"
    });

    return successResponse(response.data.data, "Company locations fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET COMPANY LOCATIONS", "/api/v1/backoffice/company-locations");
  }
}

export async function createCompanyLocation(data: {
  company_id: string;
  country_id: string;
  province_id?: string | null;
  town_id?: string | null;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/company-locations",
      method: "POST",
      data
    });

    return successResponse(response.data.data, "Company location created successfully");
  } catch (error) {
    return handleError(error, "POST | CREATE COMPANY LOCATION", "/api/v1/backoffice/company-locations");
  }
}

export async function deleteCompanyLocation(locationId: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/backoffice/company-locations/${locationId}`,
      method: "DELETE"
    });

    return successResponse(null, "Company location deleted successfully");
  } catch (error) {
    return handleError(error, "DELETE | DELETE COMPANY LOCATION", "/api/v1/backoffice/company-locations");
  }
}

// ==================== DASHBOARD STATS ====================

export async function getBackofficeStats(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/organizations/stats",
      method: "GET"
    });

    return successResponse(response.data.data, "Stats fetched successfully");
  } catch (error) {
    return handleError(error, "GET | GET BACKOFFICE STATS", "/api/v1/backoffice/organizations/stats");
  }
}
```

**Test**:
- Run `npm run build` to check for TypeScript errors
- Test each function with Postman first (verify backend endpoints work)

---

### Task 2.2: Replace Mock Data in Admin Pages ⏱️ 1.5 hours

#### 2.2.1: Update Admin Dashboard Home

**File**: app/(private)/admin/home/home.tsx

```typescript
import PageHeader from "@/components/page-header";
import { Building2, Users, MapPin, Globe, LayoutDashboard } from "lucide-react";
import { getBackofficeStats } from "@/app/_actions/backoffice-actions"; // ✅ ADD

export default async function AdminDashboardHome() {
  // ✅ REPLACE mock data with API call
  const statsResponse = await getBackofficeStats();
  const stats = statsResponse.success ? statsResponse.data : {
    companies: 0,
    users: 0,
    countries: 0,
    locations: 0
  };

  const statCards = [
    { label: "Total Companies", value: stats.companies, icon: Building2, color: "bg-blue-500" },
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-green-500" },
    { label: "Countries", value: stats.countries, icon: Globe, color: "bg-purple-500" },
    { label: "Company Locations", value: stats.locations, icon: MapPin, color: "bg-orange-500" }
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">Quick Actions</h3>
        <p className="text-slate-600">
          Use the sidebar to navigate to different management sections. You can manage companies,
          users, configure locations, and map companies to their operating regions.
        </p>
      </div>
    </>
  );
}
```

#### 2.2.2: Update Companies Page

**File**: app/(private)/admin/companies/page.tsx

```typescript
import { Building2, Plus } from "lucide-react";
import Companies from "./companies";
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrganizations } from "@/app/_actions/backoffice-actions"; // ✅ ADD

async function CompaniesPage() {
  // ✅ ADD: Fetch real data
  const response = await getOrganizations();
  const companies = response.success && response.data?.items ? response.data.items : [];

  return (
    <div>
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Companies Management"
              description="Manage organizations and their configurations."
              Icon={Building2}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Companies initialCompanies={companies} /> {/* ✅ Pass real data */}
      </div>
    </div>
  );
}

export default CompaniesPage;
```

**File**: app/(private)/admin/companies/companies.tsx

Update to accept `initialCompanies` prop:

```typescript
"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Building2, Upload, X, Pencil } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Company } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { notify } from "@/lib/utils";
// ... other imports ...

// ✅ REMOVE mockCompanies array

// ✅ ADD initialCompanies prop
export default function Companies({ initialCompanies }: { initialCompanies: Company[] }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies); // ✅ Use prop
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  // ... rest stays the same, but replace mock data operations with actual API calls
  // (we'll implement createOrganization, updateOrganization actions)
}
```

#### 2.2.3: Update Company Mapping Page

**File**: app/(private)/admin/companies/mapping/page.tsx

```typescript
import CompanyMapping from "./mapping";
import { getOrganizations, getCountries } from "@/app/_actions/backoffice-actions"; // ✅ ADD
import { getProvinces, getTowns } from "@/app/_actions/config-actions"; // Existing actions

async function CompanyMappingPage() {
  // ✅ Fetch all required data
  const [companiesRes, countriesRes, provincesRes, townsRes] = await Promise.all([
    getOrganizations(),
    getCountries(),
    getProvinces(),
    getTowns({ page: 1, page_size: 1000 })
  ]);

  const companies = companiesRes.success ? companiesRes.data?.items || [] : [];
  const countries = countriesRes.success ? countriesRes.data?.items || [] : [];
  const provinces = provincesRes.success ? provincesRes.data?.data || [] : [];
  const towns = townsRes.success ? townsRes.data?.data || [] : [];

  return (
    <CompanyMapping
      companies={companies}
      countries={countries}
      provinces={provinces}
      towns={towns}
    />
  );
}

export default CompanyMappingPage;
```

**File**: app/(private)/admin/companies/mapping/mapping.tsx

Update to accept props and remove mock data:

```typescript
"use client";
import { useState, useEffect } from "react";
// ... imports ...

// ✅ REMOVE all mock data imports from _data.ts

export default function CompanyMapping({
  companies: initialCompanies,
  countries: initialCountries,
  provinces: initialProvinces,
  towns: initialTowns
}: {
  companies: Company[];
  countries: Country[];
  provinces: Province[];
  towns: Town[];
}) {
  const [companies] = useState<Company[]>(initialCompanies);
  const [countries] = useState<Country[]>(initialCountries);
  const [provinces] = useState<Province[]>(initialProvinces);
  const [towns] = useState<Town[]>(initialTowns);

  // ... rest of component uses props instead of mock data
}
```

---

### Task 2.3: Backend Coordination ⏱️ 1-2 days (if endpoints don't exist)

**Action Items**:

1. **Verify Backend Endpoints Exist**
   - Test each endpoint from `backoffice-actions.ts` with Postman
   - Create spreadsheet of working vs. missing endpoints

2. **If Endpoints Missing**:
   - Share `ADMIN_ROUTE_AUDIT_REPORT.md` with backend team
   - Use "Appendix B: Backend Endpoints Needed" section
   - Coordinate implementation timeline

3. **Temporary Fallback** (while waiting for backend):
   - Keep mock data in place
   - Wrap API calls with try/catch that falls back to mock data
   - Add `// TODO: Remove mock fallback when backend ready` comments

**Example Temporary Pattern**:
```typescript
export async function getOrganizations() {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/backoffice/organizations",
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error) {
    // TODO: Remove mock fallback when backend ready
    console.warn("Using mock data - backend endpoint not available");
    return successResponse({
      items: mockCompanies,
      pagination: { page: 1, limit: 20, total: 2, pages: 1 }
    });
  }
}
```

---

## Phase 3: Performance Optimization

### Task 3.1: Eliminate Redundant initializeSystemSetup Calls ⏱️ 30 min

**Problem**: Called in both dashboard layout and admin layout

**Solution**: Remove from dashboard layout for admin users

**File**: app/dashboard/layout.tsx (Line 24-29)

```typescript
// BEFORE
const systemInit = await initializeSystemSetupCached();
const user = systemInit?.data?.user as User;

if (user?.user_type == "BACKOFFICE_USER") {
  return redirect("/admin/home");
}

// AFTER
// ✅ Check session user_type first (fast)
const { session, user_type } = await verifySession();

if (user_type === "BACKOFFICE_USER") {
  return redirect("/admin/home");
}

// Only call initializeSystemSetup if user is not admin
const systemInit = await initializeSystemSetupCached();
const user = systemInit?.data?.user as User;
```

**Benefit**: Saves 1 API call for admin users

---

### Task 3.2: Add Loading States ⏱️ 1 hour

Add Suspense boundaries and loading skeletons to admin pages.

**File**: app/(private)/admin/home/page.tsx

```typescript
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

async function AdminDashboardHomePage() {
  return (
    <div>
      <div className="bg-card border-b">
        {/* ... header ... */}
      </div>

      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <AdminDashboardHome />
        </Suspense>
      </div>
    </div>
  );
}
```

Apply similar pattern to:
- Companies page
- Company mapping page
- Users page (already has loading state)

---

## Phase 4: Testing & Validation

### Task 4.1: Unit Tests (Optional) ⏱️ 2 hours

Create test file: `app/_actions/__tests__/backoffice-actions.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getOrganizations, createOrganization } from '../backoffice-actions';

describe('Backoffice Actions', () => {
  it('should fetch organizations', async () => {
    const result = await getOrganizations();
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('items');
  });

  it('should create organization', async () => {
    const data = {
      name: "Test Org",
      email: "test@example.com",
      status: "active" as const
    };
    const result = await createOrganization(data);
    expect(result.success).toBe(true);
  });
});
```

### Task 4.2: Manual Testing Checklist ⏱️ 1 hour

**Admin User Flow**:
- [ ] Login as BACKOFFICE_USER redirects to `/admin/home`
- [ ] Admin dashboard shows real stats (not mock data)
- [ ] Can view companies list (real data)
- [ ] Can create new company (calls API)
- [ ] Can edit company (calls API)
- [ ] Company mapping shows real countries/provinces/towns
- [ ] Can add company location mapping
- [ ] Can delete company location
- [ ] Sidebar navigation works correctly
- [ ] Cannot access `/dashboard/*` routes (redirects to admin)
- [ ] Logout works correctly

**Regular User Flow**:
- [ ] Login as ORGANIZATION_USER redirects to `/dashboard/home`
- [ ] Cannot access `/admin/*` routes (proxy blocks)
- [ ] Typing `/admin/home` redirects to `/dashboard/home`
- [ ] Regular dashboard works normally

**Edge Cases**:
- [ ] Expired session redirects to login
- [ ] Invalid user_type in cookie handled gracefully
- [ ] Backend API errors show user-friendly messages
- [ ] Network timeout handled properly

---

## Phase 5: Cleanup & Documentation

### Task 5.1: Remove Mock Data Files ⏱️ 15 min

Once API integration is complete and tested:

```bash
# Delete mock data file
rm app/(private)/admin/companies/mapping/_data.ts

# Update .gitignore to prevent new mock files
echo "**/admin/**/_data.ts" >> .gitignore
```

### Task 5.2: Update Documentation ⏱️ 30 min

**Create**: docs/ADMIN_USER_GUIDE.md

```markdown
# Admin User Guide

## Overview
Admin users (BACKOFFICE_USER) have access to global system management.

## Access
- Login URL: `/login`
- Admin Dashboard: `/admin/home`

## Features
1. **Dashboard Overview**: View system statistics
2. **Companies**: Manage organizations
3. **Users**: Manage all users across organizations
4. **Locations**: Configure countries, provinces, towns, branches
5. **Company Mapping**: Map companies to locations

## Permissions
Admin users can:
- View and manage all organizations
- Create/edit/delete companies
- Configure global location data
- View all users (across organizations)
```

### Task 5.3: Code Review Checklist ⏱️ 30 min

Before marking complete, verify:

- [ ] No `/_/admin` patterns remain (all use `/admin`)
- [ ] No mock data in production code
- [ ] All API calls use `authenticatedApiClient()`
- [ ] Error handling present for all API calls
- [ ] Loading states added to async components
- [ ] TypeScript has no errors
- [ ] `npm run build` succeeds
- [ ] All tests pass (if written)

---

## Timeline Estimate

| Phase | Tasks | Time | Dependencies |
|-------|-------|------|--------------|
| **Phase 1** | Security & Routing Fixes | 1.5 hours | None |
| **Phase 2** | API Implementation | 3.5 hours | Backend endpoints ready |
| **Phase 3** | Performance | 1.5 hours | Phase 1 complete |
| **Phase 4** | Testing | 3 hours | Phase 2 complete |
| **Phase 5** | Cleanup & Docs | 1.5 hours | Phase 4 complete |
| **TOTAL** | | **11 hours** | (1-2 days if backend ready) |

**If backend endpoints don't exist**: Add 1-2 days for backend implementation

---

## Success Criteria

✅ All admin routes use `/admin/*` pattern (no `/_/`)
✅ Session cookie includes `user_type`
✅ Proxy blocks non-admin users from `/admin/*` routes
✅ Admin users redirect directly to `/admin/home` on login
✅ All mock data replaced with real API calls
✅ No TypeScript errors
✅ Build succeeds
✅ Manual testing checklist completed
✅ Regular users cannot access admin routes
✅ Performance: < 2 API calls per page load

---

## Rollback Plan

If issues arise during deployment:

1. **Quick Rollback**: Git revert to commit before changes
   ```bash
   git revert HEAD~10..HEAD  # Adjust number based on commits
   ```

2. **Partial Rollback**: Keep routing fixes, revert API changes
   - Keep Phase 1 changes
   - Revert Phase 2 (API implementation)
   - Use mock data temporarily

3. **Emergency**: Disable admin routes entirely
   ```typescript
   // proxy.ts
   const isAdminRoute = pathname.startsWith("/admin");
   if (isAdminRoute) {
     url.pathname = "/dashboard/home";
     return NextResponse.redirect(url);
   }
   ```

---

**End of Plan**

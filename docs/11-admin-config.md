# 11 - Admin & Configuration

## Overview

System administration and configuration management:
- User management
- System settings
- Framework configuration
- Branding customization
- Audit settings

## Admin Access

**Location:** `app/dashboard/system-configs/`

**Required role:** `admin`

**Protected route:**
```typescript
// middleware.ts
if (request.url.includes("/system-configs")) {
  const user = await getCurrentUser();
  if (user.role !== "admin") {
    return NextResponse.redirect("/dashboard");
  }
}
```

## Key Admin Sections

### 1. User Management

**Location:** `app/dashboard/system-configs/users/`

**Features:**
- View all users
- Assign roles
- Activate/deactivate accounts
- Reset passwords
- MFA settings

**Roles:**
- `admin` - Full system access
- `auditor` - Audit management
- `risk_manager` - Risk management
- `viewer` - Read-only

```typescript
export async function updateUserRole(userId: string, role: string) {
  const supabase = createClient();

  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role }
  });

  revalidatePath("/dashboard/system-configs/users");
}
```

### 2. System Settings

**Location:** `app/dashboard/system-configs/settings/`

**Configurable settings:**
- Organization name
- Logo
- Primary color
- Session timeout
- MFA enforcement
- Screen lock timeout

**Storage:** `system_settings` table

```typescript
export async function updateSystemSettings(settings: SystemSettings) {
  const supabase = createClient();

  await supabase
    .from("system_settings")
    .upsert({ id: "global", ...settings });

  revalidatePath("/dashboard");
}
```

### 3. Framework Configuration

**Location:** `app/dashboard/system-configs/frameworks/`

**Supported frameworks:**
- ISO 27001:2022
- COSO
- COBIT
- NIST CSF

**Configuration:**
```typescript
{
  framework_id: "ISO27001:2022",
  enabled: true,
  control_sets: ["A.5", "A.6", "A.7", "A.8"],
  custom_controls: [
    {
      id: "CUSTOM-1",
      title: "Custom Control",
      description: "..."
    }
  ]
}
```

### 4. Audit Settings

**Location:** `app/dashboard/system-configs/audit-settings/`

**Settings:**
- Default audit duration
- Findings severity levels
- Workpaper templates
- Report templates
- Approval workflows

```typescript
export const AUDIT_SETTINGS = {
  default_duration_days: 90,
  severity_levels: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
  require_approval: true,
  approval_workflow: "standard"
};
```

### 5. Risk Settings

**Location:** `app/dashboard/system-configs/risk-settings/`

**Settings:**
- Risk appetite
- Risk tolerance
- Assessment scales
- Treatment strategies
- KRI templates

```typescript
export const RISK_SETTINGS = {
  risk_appetite: "MODERATE",
  likelihood_scale: 5,
  impact_scale: 5,
  auto_calculate_score: true,
  heat_map_colors: {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444"
  }
};
```

### 6. Branding

**Location:** `app/dashboard/system-configs/branding/`

**Customizable:**
- Organization logo
- Favicon
- Primary color
- Secondary color
- Font family

```typescript
export async function updateBranding(branding: BrandingSettings) {
  const supabase = createClient();

  // Upload logo
  if (branding.logo) {
    const { data: logoData } = await supabase.storage
      .from("branding")
      .upload("logo.png", branding.logo);

    branding.logo_url = logoData?.path;
  }

  // Save settings
  await supabase
    .from("branding_settings")
    .upsert({ id: "global", ...branding });

  revalidatePath("/dashboard");
}
```

## Configuration Files

### ISO 27001 Controls

**File:** `lib/config/iso27001-clauses.ts`

```typescript
export const ISO27001_CONTROLS = {
  "A.5.1": "Policies for information security",
  "A.5.2": "Information security roles and responsibilities",
  // ... all controls
};
```

### Finding Severity Levels

**File:** `lib/config/finding-framework-fields.ts`

```typescript
export const SEVERITY_LEVELS = [
  { value: "CRITICAL", label: "Critical", color: "red" },
  { value: "HIGH", label: "High", color: "orange" },
  { value: "MEDIUM", label: "Medium", color: "yellow" },
  { value: "LOW", label: "Low", color: "green" }
];
```

### Tick Marks

**File:** `lib/config/tick-marks.ts`

```typescript
export const TICK_MARKS = {
  TESTED: "√",
  NOT_TESTED: "X",
  PARTIAL: "~",
  NOT_APPLICABLE: "N/A"
};
```

## Database Schema

```sql
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  organization_name TEXT,
  logo_url TEXT,
  primary_color TEXT,
  session_timeout_minutes INTEGER DEFAULT 30,
  enforce_mfa BOOLEAN DEFAULT FALSE,
  screen_lock_timeout_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE branding_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  font_family TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE framework_configs (
  id UUID PRIMARY KEY,
  framework_id TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  control_sets JSONB,
  custom_controls JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Server Actions

**File:** `app/_actions/admin-actions.ts`

```typescript
// Get all users
export async function getAllUsers() {
  const supabase = createClient();

  const { data } = await supabase.auth.admin.listUsers();

  return data.users;
}

// Update system settings
export async function updateSystemSettings(settings: SystemSettings) {
  const supabase = createClient();

  await supabase
    .from("system_settings")
    .upsert({ id: "global", ...settings });

  revalidatePath("/dashboard");
}

// Add custom control
export async function addCustomControl(
  frameworkId: string,
  control: CustomControl
) {
  const supabase = createClient();

  const { data: config } = await supabase
    .from("framework_configs")
    .select("custom_controls")
    .eq("framework_id", frameworkId)
    .single();

  const customControls = config.custom_controls || [];
  customControls.push(control);

  await supabase
    .from("framework_configs")
    .update({ custom_controls: customControls })
    .eq("framework_id", frameworkId);

  revalidatePath("/dashboard/system-configs/frameworks");
}
```

## Access Control

Only admins can access system configs:

```typescript
export async function requireAdmin() {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (user?.user_metadata?.role !== "admin") {
    throw new Error("Admin access required");
  }
}
```

## Next Steps

Continue to → [12-ui-components.md](12-ui-components.md)

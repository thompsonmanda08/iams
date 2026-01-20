# 05 - Database

## Overview

INFRATEL IAMS uses **Supabase (PostgreSQL)** with:
- Row-Level Security (RLS)
- Type-safe queries
- Real-time subscriptions
- Automatic timestamps

## Core Tables

### audit_plans
Audit engagement plans and metadata.

```sql
CREATE TABLE audit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  management_standard TEXT, -- ISO27001, COSO, etc.
  status TEXT DEFAULT 'DRAFT',
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### risks
Risk register entries.

```sql
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER CHECK (impact BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  status TEXT DEFAULT 'IDENTIFIED',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### reports
Generated reports linked to entities.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  entity_id UUID NOT NULL, -- audit_plan or risk ID
  entity_type TEXT NOT NULL, -- 'audit_plan' or 'risk'
  report_content JSONB NOT NULL, -- Full report structure
  status TEXT DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### findings
Audit findings from engagements.

```sql
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_plan_id UUID REFERENCES audit_plans(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT, -- Critical, High, Medium, Low
  status TEXT DEFAULT 'OPEN',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### workflows
Workflow instances for approvals.

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  workflow_type TEXT NOT NULL, -- 'approval', 'review', etc.
  status TEXT DEFAULT 'PENDING',
  current_step INTEGER DEFAULT 1,
  steps JSONB, -- Array of workflow steps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Row-Level Security (RLS)

### Enable RLS

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

### Policy Examples

**Read access:**
```sql
CREATE POLICY "Users can read their org's reports"
ON reports FOR SELECT
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

**Write access:**
```sql
CREATE POLICY "Users can update their own reports"
ON reports FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
```

## Supabase Client

### Server-side

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.set(name, "", options)
      }
    }
  );
}
```

### Client-side

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Query Patterns

### Basic Query

```typescript
const { data, error } = await supabase
  .from("reports")
  .select("*")
  .eq("status", "PUBLISHED");
```

### Join Query

```typescript
const { data } = await supabase
  .from("findings")
  .select(`
    *,
    audit_plan:audit_plans(title, status),
    assigned_user:auth.users(email, full_name)
  `)
  .eq("audit_plan_id", planId);
```

### Insert

```typescript
const { data, error } = await supabase
  .from("reports")
  .insert({
    title: "Q1 Audit Report",
    entity_id: auditPlanId,
    entity_type: "audit_plan",
    report_content: reportData
  })
  .select()
  .single();
```

### Update

```typescript
const { error } = await supabase
  .from("reports")
  .update({ status: "PUBLISHED" })
  .eq("id", reportId);
```

### Delete

```typescript
const { error } = await supabase
  .from("findings")
  .delete()
  .eq("id", findingId);
```

## Real-time Subscriptions

```typescript
const channel = supabase
  .channel("reports-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "reports"
    },
    (payload) => {
      console.log("Change detected:", payload);
    }
  )
  .subscribe();
```

## Migrations

Located in `supabase/migrations/`:

```sql
-- 001_initial_schema.sql
CREATE TABLE audit_plans (...);
CREATE TABLE risks (...);

-- 002_add_reports.sql
CREATE TABLE reports (...);
ALTER TABLE audit_plans ADD COLUMN report_id UUID;
```

## Type Generation

```bash
# Generate TypeScript types from database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts
```

## Next Steps

Continue to → [06-api-integration.md](06-api-integration.md)

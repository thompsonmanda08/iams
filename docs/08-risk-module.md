# 08 - Risk Module

## Overview

The Risk Module provides comprehensive risk management:
- Risk identification and assessment
- Risk heat maps
- Treatment plans
- Risk monitoring
- Risk reporting

## Core Features

### 1. Risk Register

**Location:** `app/dashboard/(modules)/risks/`

**Create risk:**
```typescript
const risk = await createRisk({
  title: "Data breach vulnerability",
  description: "Unpatched systems expose sensitive data",
  category: "CYBERSECURITY",
  likelihood: 4,
  impact: 5,
  status: "IDENTIFIED"
});
```

**Key fields:**
- `title` - Risk name
- `category` - Type (Cybersecurity, Operational, Financial, etc.)
- `likelihood` - 1-5 scale
- `impact` - 1-5 scale
- `risk_score` - Auto-calculated (likelihood × impact)
- `status` - IDENTIFIED, ASSESSED, TREATED, MONITORED, CLOSED

### 2. Risk Assessment

**Likelihood Scale (1-5):**
- 1 = Rare (< 5% probability)
- 2 = Unlikely (5-25%)
- 3 = Possible (25-50%)
- 4 = Likely (50-75%)
- 5 = Almost Certain (> 75%)

**Impact Scale (1-5):**
- 1 = Insignificant
- 2 = Minor
- 3 = Moderate
- 4 = Major
- 5 = Catastrophic

**Risk Score Matrix:**
```
Impact
  5 |  5  10  15  20  25
  4 |  4   8  12  16  20
  3 |  3   6   9  12  15
  2 |  2   4   6   8  10
  1 |  1   2   3   4   5
     ─────────────────────
       1   2   3   4   5  Likelihood
```

**Risk Levels:**
- 1-6: Low (Green)
- 7-12: Medium (Yellow)
- 13-25: High (Red)

### 3. Risk Heat Map

**Location:** `app/dashboard/(modules)/risks/_components/risk-heat-map.tsx`

Visual representation of risks plotted by likelihood and impact.

```typescript
<RiskHeatMap risks={risks} />
```

### 4. Risk Treatment

**Treatment strategies:**
- **Avoid** - Eliminate the risk
- **Mitigate** - Reduce likelihood or impact
- **Transfer** - Insurance, outsourcing
- **Accept** - Accept residual risk

```typescript
const treatment = await createRiskTreatment({
  risk_id: riskId,
  strategy: "MITIGATE",
  action_plan: "Implement MFA and security training",
  owner_id: userId,
  due_date: "2026-06-30",
  status: "IN_PROGRESS"
});
```

### 5. Risk Monitoring

**KRIs (Key Risk Indicators):**
Track metrics to detect risk changes.

```typescript
const kri = await createKRI({
  risk_id: riskId,
  name: "Failed login attempts",
  threshold: 100,
  current_value: 45,
  measurement_frequency: "DAILY"
});
```

## Key Components

### Risk Register Table

**File:** `app/dashboard/(modules)/risks/_components/risks-table.tsx`

Features:
- Risk score sorting
- Category filtering
- Status badges
- Quick actions

### Risk Details

**File:** `app/dashboard/(modules)/risks/[id]/page.tsx`

Sections:
- **Overview** - Risk metadata
- **Assessment** - Likelihood, impact, score
- **Treatment** - Mitigation actions
- **History** - Audit trail
- **Documents** - Attachments

### Risk Dashboard

**File:** `app/dashboard/(modules)/risks/dashboard/page.tsx`

Widgets:
- Risk heat map
- Top risks table
- Risk by category chart
- Trend analysis

## Workflows

### Risk Identification

1. Navigate to Risk Register
2. Click "Add Risk"
3. Enter risk details
4. Status: IDENTIFIED
5. Assign owner

### Risk Assessment

1. Open risk
2. Go to Assessment tab
3. Rate likelihood (1-5)
4. Rate impact (1-5)
5. System calculates risk score
6. Status: ASSESSED

### Risk Treatment

1. Open assessed risk
2. Go to Treatment tab
3. Select strategy (Avoid, Mitigate, Transfer, Accept)
4. Create action plan
5. Assign owner and due date
6. Status: TREATED

### Risk Monitoring

1. Define KRIs
2. Set thresholds
3. Monitor regularly
4. Update risk assessment as needed
5. Status: MONITORED

### Risk Closure

1. Verify treatment effectiveness
2. Document residual risk
3. Get approval
4. Status: CLOSED

## Server Actions

**File:** `app/_actions/risk-actions.ts`

```typescript
// Get risk with relations
export async function getRisk(riskId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("risks")
    .select(`
      *,
      treatments(*),
      kris(*),
      owner:auth.users(email, full_name)
    `)
    .eq("id", riskId)
    .single();

  return data;
}

// Update risk score
export async function updateRiskScore(
  riskId: string,
  likelihood: number,
  impact: number
) {
  const riskScore = likelihood * impact;

  const supabase = createClient();
  await supabase
    .from("risks")
    .update({ likelihood, impact, risk_score: riskScore })
    .eq("id", riskId);

  revalidatePath("/dashboard/risks");
}
```

## Hooks

**File:** `hooks/use-risk-queries.ts`

```typescript
export function useRisk(riskId: string) {
  return useQuery({
    queryKey: ["risk", riskId],
    queryFn: () => getRisk(riskId)
  });
}

export function useRisks(filters?: RiskFilters) {
  return useQuery({
    queryKey: ["risks", filters],
    queryFn: () => getRisks(filters)
  });
}
```

## Database Schema

```sql
CREATE TABLE risks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER CHECK (impact BETWEEN 1 AND 5),
  risk_score INTEGER,
  status TEXT DEFAULT 'IDENTIFIED',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE risk_treatments (
  id UUID PRIMARY KEY,
  risk_id UUID REFERENCES risks(id),
  strategy TEXT, -- AVOID, MITIGATE, TRANSFER, ACCEPT
  action_plan TEXT,
  owner_id UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT DEFAULT 'PLANNED',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kris (
  id UUID PRIMARY KEY,
  risk_id UUID REFERENCES risks(id),
  name TEXT NOT NULL,
  threshold NUMERIC,
  current_value NUMERIC,
  measurement_frequency TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Next Steps

Continue to → [09-reports-module.md](09-reports-module.md)

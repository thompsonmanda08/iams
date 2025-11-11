# Risk Management Module

**Status:** ✅ COMPLETE

## Overview

Create, assess, and track organizational risks with comprehensive scoring, controls, and mitigation actions.

## Flow

```
Create Risk → Assess (Inherent & Residual) → Define Controls → Assign Actions → Track Closure
```

## Key Features

- ✅ Risk register management (CRUD)
- ✅ Risk scoring (Inherent & Residual Impact/Likelihood)
- ✅ Risk response strategies (REDUCE, ACCEPT, TRANSFER, AVOID, OPTIMIZE)
- ✅ Control effectiveness tracking
- ✅ Risk mitigation action assignment
- ✅ Key Risk Indicators (KRI) monitoring
- ✅ Status tracking (DRAFT, OPEN, CLOSED, etc.)
- ✅ Department-based ownership
- ✅ Heat map visualization

## Components

**Core:**
- `risks-table.tsx` - List all risks with filtering and status-based actions
- `risk-form.tsx` - Create/edit risks with full assessment
- `risk-detail.tsx` - View detailed risk information

**Actions & Tracking:**
- `assign-action-dialog.tsx` - Assign mitigation actions to open risks
- `kri-list.tsx` - Monitor Key Risk Indicators
- `risk-heat-map.tsx` - Visual risk matrix display

## Server Actions

`app/_actions/risk-actions.ts`:
- `createRisk()` - Create new risk register entry
- `updateRisk()` - Update risk details and assessment
- `deleteRisk()` - Delete risk
- `assignRiskAction()` - Assign action to open risk
- `getRisksByDepartment()` - Filter risks by department
- `getRisksByStatus()` - Filter risks by status

## API Integration

**Endpoints (PocketBase):**
- `POST /api/v1/risks` - Create risk
- `GET /api/v1/risks` - List risks
- `GET /api/v1/risks/:id` - Get risk detail
- `PUT /api/v1/risks/:id` - Update risk
- `DELETE /api/v1/risks/:id` - Delete risk
- `POST /api/v1/risk-actions` - Create action
- `GET /api/v1/risk-actions` - List actions
- `PUT /api/v1/risk-actions/:id` - Update action

## Risk Assessment

### Scoring Scales
| Level | Impact | Likelihood | Score |
|-------|--------|-----------|-------|
| 1 | Minimal | Remote | 1 |
| 2 | Low | Unlikely | 4 |
| 3 | Medium | Possible | 9 |
| 4 | High | Likely | 16 |
| 5 | Critical | Very Likely | 25 |

### Inherent vs Residual Risk
- **Inherent:** Risk without any controls
- **Residual:** Risk after existing controls applied

## Response Strategies

| Strategy | Use Case |
|----------|----------|
| REDUCE | Implement controls to mitigate |
| ACCEPT | Risk within appetite |
| TRANSFER | Transfer to third party (insurance, etc.) |
| AVOID | Eliminate risk exposure |
| OPTIMIZE | Exploit opportunity risks |

## Data Model

```typescript
{
  id: string
  riskId: string                     // Auto-generated ID
  title: string
  description: string
  category: string
  department_id: string

  // Classification
  macro_process: string
  sub_process: string
  strategic_objective: string
  root_cause: string

  // Inherent Risk
  inherentImpact: number             // 1-5
  inherentLikelihood: number         // 1-5
  inherentScore: number              // Impact × Likelihood
  inherent_rating: string            // Low/Medium/High/Critical

  // Residual Risk
  residualImpact: number
  residualLikelihood: number
  residualScore: number
  residual_rating: string

  // Controls
  existing_controls: string
  control_effectiveness: string

  // Response
  risk_response: string              // REDUCE|ACCEPT|TRANSFER|AVOID|OPTIMIZE
  treatment_plan: string
  risk_appetite_status: string

  // Tracking
  status: string                     // DRAFT|OPEN|CLOSED|ESCALATED
  owner: string
  target_closing_date: string
  revised_target_date?: string
  date_closed?: string
  overdue_days: number
}
```

## Action Assignment

When a risk has status "OPEN", users can assign mitigation actions:

**Assignment Form Fields:**
- Action description (required, textarea)
- Action owners (required, multi-select)
- Reviewers (required, multi-select)

**Status Tracking:** OPEN → IN_PROGRESS → PENDING_REVIEW → COMPLETED

## Known Issues

- **Mock user list:** User selectors in action assignment use hardcoded mock data
  - Needs integration with real user management API

## Next Steps

1. **Complete action workflow** - Execute action status transitions
2. **KRI integration** - Connect KRIs to risk monitoring
3. **Heat map enhancements** - Add drill-down capabilities
4. **Email notifications** - Notify owners on action assignment
5. **Risk reporting** - Generate risk status reports

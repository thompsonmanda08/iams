# Features Guide

**INFRATEL IAMS Web Application**
**Last Updated:** November 3, 2025

---

## Overview

INFRATEL IAMS provides comprehensive risk and audit management capabilities with system configuration features for enterprise organizations.

---

## Core Features

### 1. Risk Management Module

**Location:** `/dashboard/(modules)/risks/*`

#### Risk Registers
- Create and manage organizational risk registers
- Track risk ownership and status
- Monitor risk lifecycle from identification to closure

#### Risk Assessment
- **Inherent Risk Scoring**
  - Impact assessment (1-5 scale)
  - Likelihood assessment (1-5 scale)
  - Automatic risk score calculation

- **Residual Risk Scoring**
  - Post-mitigation impact
  - Post-mitigation likelihood
  - Risk reduction tracking

#### Risk Response Strategies
- **REDUCE** - Implement controls to mitigate
- **ACCEPT** - Accept risk within appetite
- **TRANSFER** - Transfer to third party
- **AVOID** - Eliminate risk exposure
- **OPTIMIZE** - Exploit opportunity risks

#### Key Risk Indicators (KRI)
- Define and monitor KRIs
- Status tracking (Green/Amber/Red)
- Threshold management
- Trend analysis

#### Risk Mitigation Actions
- Track risk treatment actions
- Sub-task management
- Progress monitoring
- Deadline tracking

#### Risk Heat Map
- Visual risk distribution matrix
- Impact vs. likelihood visualization
- Filter by department/category
- Drill-down to risk details

#### Risk Appetite Management
- Define organizational risk appetite
- Monitor appetite boundaries
- Track appetite breaches
- Reporting and alerts

#### Incident Tracking
- Record and manage risk incidents
- Link incidents to risks
- Impact assessment
- Lessons learned

---

### 2. Audit Management Module

**Location:** `/dashboard/(modules)/audit/*`

#### Audit Planning
- **Multi-year Audit Plans**
  - Annual audit calendar
  - Resource planning
  - Coverage tracking

- **Audit Universe**
  - Define auditable areas
  - Risk-based prioritization
  - Coverage analysis

#### Audit Execution
- **Workpapers**
  - Template-based documentation
  - Evidence attachment
  - Test procedure tracking
  - Conformity assessment (Conformity/Partial/Non-conformity)

- **Findings Management**
  - Document audit findings
  - Severity classification (Critical/High/Medium/Low)
  - Recommendation tracking
  - Management response
  - Action plan monitoring

#### Audit Administration
- **Budget Management**
  - Audit budget allocation
  - Cost tracking
  - Variance analysis

- **Task Management**
  - Engagement tasks
  - Deliverable tracking
  - Timeline management

#### Audit Reporting
- **Report Types**
  - Summary reports
  - Detailed audit reports
  - Non-conformity reports
  - Management review reports
  - Compliance reports

- **Report Formats**
  - PDF export
  - Excel export
  - CSV export

#### ISO 27001 Support
- Pre-built ISO 27001:2022 audit templates
- Control mapping
- Evidence requirements
- Compliance tracking

---

### 3. System Configuration

**Location:** `/dashboard/system-configs/*`

#### Organization Structure

**Branches Management**
- Create/edit/delete branches
- Assign to provinces and towns
- Address management
- Activation status

**Departments Management**
- Hierarchical department structure
- Parent-child relationships
- Module assignment to departments
- Department activation

**Users Management**
- User creation and assignment
- Branch/department/role assignment
- User activation/deactivation
- Search and filtering
- Bulk operations

#### Role-Based Access Control (RBAC)

**Roles Management**
- Create department-scoped roles
- Role descriptions
- Role activation

**Permissions Management**
- Module-level permissions
- Operation permissions:
  - `can_view` - View access
  - `can_create` - Create new items
  - `can_edit` - Edit existing items
  - `can_delete` - Delete items
  - `can_approve` - Approve actions
  - `can_export` - Export data
  - `can_assign` - Assign tasks
  - `can_configure` - Configure settings
- Custom permissions (JSONB)

**Department-Constrained Permissions**
- Roles belong to specific departments
- Only modules assigned to department are available
- Granular permission control

#### Workflow Administration

**Location:** `/dashboard/workflow/manage/*`

**Workflow Engine**
- State machine implementation
- Entity-based workflows for:
  - RISK
  - AUDIT_PLAN
  - FINDING
  - RECOMMENDATION

**Workflow Components**
- **States** - Define workflow states
- **Transitions** - State change rules
- **Conditions** - Entry/transition conditions
- **Actions** - Automated actions:
  - Send email
  - Create log entry
  - Update fields
  - Trigger webhook

**Role-Based Transitions**
- Permission-based state changes
- Approval workflows
- Multi-level reviews

#### Audit Settings

**Location:** `/dashboard/system-configs/audit-settings/*`

- Workpaper Templates management
- Audit categories configuration
- Finding severity levels
- Compliance frameworks

#### Risk Settings

**Location:** `/dashboard/system-configs/risk-settings/*`

**Risk Matrix Configuration**
- Multiple matrix support
- Impact/likelihood scales
- Risk rating formulas
- Color coding

**Risk Categories**
- Category management
- Category descriptions
- Color assignments

**Response Strategies**
- Define available responses
- Response descriptions
- Usage guidelines

#### Module Management

**Location:** `/dashboard/system-configs/modules/*`

- Enable/disable modules per department
- Module activation status
- Module hierarchy management
- Icon and navigation configuration

---

### 4. Admin Panel

**Location:** `/admin/*` (Backoffice users only)

#### Admin Dashboard
- System overview metrics
- User activity monitoring
- System health indicators

#### User Administration
- Global user management
- Cross-organization user access
- User role assignments

#### Company Management
- Company/organization setup
- Multi-tenant support
- Company-branch mapping

#### Global Configuration
- System-wide settings
- Feature toggles
- Integration configurations

---

## Feature Status

### Fully Implemented ✅

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ Complete | Login, MFA, password change |
| Session Management | ✅ Complete | JWT, cookies, token refresh |
| RBAC | ✅ Complete | Roles, permissions, department-scoped |
| Risk Registers | ✅ Complete | Full CRUD operations |
| Risk Assessment | ✅ Complete | Inherent/residual scoring |
| KRI Management | ✅ Complete | Monitoring and tracking |
| Risk Actions | ✅ Complete | Mitigation tracking |
| Audit Planning | ✅ Complete | Multi-year plans |
| Audit Universe | ✅ Complete | Auditable areas |
| Workpapers | ✅ Complete | Template-based |
| Findings Management | ✅ Complete | Full lifecycle |
| Budget Management | ✅ Complete | Allocation and tracking |
| Workflow Engine | ✅ Complete | State machines |
| Organization Structure | ✅ Complete | Branches, departments, users |
| Dynamic Theming | ✅ Complete | Color, mode, layout |

### Partially Implemented ⚠️

| Feature | Status | Missing |
|---------|--------|---------|
| Audit Settings | ⚠️ Partial | Some tabs commented out |
| Risk Heat Map | ⚠️ Partial | Basic implementation |
| Audit Reporting | ⚠️ Partial | Report generation stubbed |
| Incident Tracking | ⚠️ Partial | Page exists, limited features |

### Planned 📋

| Feature | Priority | Notes |
|---------|----------|-------|
| Advanced Analytics | Medium | Dashboard visualizations |
| Bulk Import/Export | Medium | CSV/Excel operations |
| Real-time Collaboration | Low | WebSocket integration |
| Mobile Optimization | Medium | Responsive improvements |
| Email Notifications | High | Workflow actions |

---

## Data Models

### Risk Model

```typescript
{
  id: string
  riskId: string                     // Auto-generated ID
  title: string
  description: string
  category: string
  department_id: string

  // Risk Classification
  macro_process: string
  sub_process: string
  strategic_objective: string
  root_cause: string
  recurrence: string

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
  risk_response: "REDUCE" | "ACCEPT" | "TRANSFER" | "AVOID" | "OPTIMIZE"
  treatment_plan: string
  risk_appetite_status: string

  // Tracking
  status: string
  owner: string
  target_closing_date: string
  revised_target_date: string
  date_closed: string
  overdue_days: number
}
```

### Audit Plan Model

```typescript
{
  id: string
  title: string
  description: string
  audit_year: number
  start_date: string
  end_date: string
  status: "draft" | "under-review" | "planned" | "in-progress" | "completed" | "cancelled"
  department_id: string
  auditable_areas: string[]
  objectives: string
  scope: string
  methodology: string
  created_by: string
  approved_by: string
  approval_date: string
}
```

### Workflow Model

```typescript
{
  id: string
  name: string
  entity_type: "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION"
  description: string
  status: "draft" | "active" | "inactive" | "archived"
  states: State[]
  transitions: Transition[]

  // State
  {
    id: string
    name: string
    description: string
    is_initial: boolean
    is_final: boolean
    color: string
  }

  // Transition
  {
    id: string
    from_state_id: string
    to_state_id: string
    name: string
    description: string
    conditions: Condition[]
    actions: Action[]
    allowed_roles: string[]
  }
}
```

---

## Usage Examples

### Creating a Risk

```typescript
const risk = await createRisk({
  title: "Data Breach Risk",
  description: "Risk of unauthorized access to customer data",
  category: "Information Security",
  department_id: "dept-uuid",

  inherentImpact: 5,        // Critical
  inherentLikelihood: 4,    // Likely

  residualImpact: 3,        // Medium
  residualLikelihood: 2,    // Unlikely

  existing_controls: "Firewall, encryption, access controls",
  control_effectiveness: "Moderate",

  risk_response: "REDUCE",
  treatment_plan: "Implement MFA and security monitoring",

  owner: "CISO",
  target_closing_date: "2025-12-31"
});
```

### Creating an Audit Plan

```typescript
const plan = await createAuditPlan({
  title: "2025 Information Security Audit",
  description: "Annual audit of information security controls",
  audit_year: 2025,
  start_date: "2025-01-01",
  end_date: "2025-12-31",
  status: "draft",
  department_id: "dept-uuid",
  auditable_areas: ["Access Control", "Encryption", "Network Security"],
  objectives: "Assess ISO 27001 compliance",
  scope: "All IT systems and data centers",
  methodology: "Control testing and documentation review"
});
```

### Assigning Permissions

```typescript
// 1. Assign module to department
await assignModuleToDepartment({
  departmentId: "dept-uuid",
  moduleId: "risk-module-uuid"
});

// 2. Grant permissions to role
await grantOrUpdateRolePermission({
  roleId: "role-uuid",
  moduleId: "risk-module-uuid",
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: false,
  canApprove: true,
  canExport: true
});
```

---

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + K` - Open command palette
- `Ctrl/Cmd + /` - Toggle sidebar
- `Ctrl/Cmd + B` - Toggle sidebar

### Forms
- `Ctrl/Cmd + S` - Save form
- `Esc` - Cancel/close dialog

### Navigation
- `Alt + H` - Go to home
- `Alt + R` - Go to risks
- `Alt + A` - Go to audit
- `Alt + C` - Go to configuration

---

## Tips & Best Practices

### Risk Management
1. **Regular Reviews** - Review risks quarterly
2. **Owner Assignment** - Always assign risk owners
3. **Control Documentation** - Document existing controls thoroughly
4. **Treatment Plans** - Create actionable treatment plans
5. **KRI Monitoring** - Set up KRIs for critical risks

### Audit Management
1. **Plan Early** - Create annual plans in advance
2. **Use Templates** - Leverage ISO 27001 templates
3. **Document Evidence** - Attach all evidence to workpapers
4. **Track Findings** - Monitor finding resolution
5. **Management Response** - Get timely management responses

### RBAC Configuration
1. **Least Privilege** - Grant minimum necessary permissions
2. **Department Scoping** - Use department-scoped roles
3. **Regular Reviews** - Review permissions quarterly
4. **Module Assignment** - Only assign needed modules to departments
5. **Test Permissions** - Test with non-admin accounts

### Workflow Design
1. **Keep Simple** - Avoid overly complex workflows
2. **Clear States** - Use descriptive state names
3. **Role-Based** - Configure role-based transitions
4. **Test Thoroughly** - Test all transition paths
5. **Document** - Document workflow purpose and states

---

## References

- [Architecture Overview](ARCHITECTURE.md)
- [Authentication Guide](AUTHENTICATION.md)
- [API Integration](API_GUIDE.md)
- [Getting Started](GETTING_STARTED.md)
- [Deployment Guide](DEPLOYMENT.md)

---

**Last Updated:** November 3, 2025
**Maintained by:** Development Team

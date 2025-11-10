# AUDIT PLANS MODULE - ARCHITECTURE & DATA FLOW DIAGRAMS

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APPLICATION LAYER                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CLIENT ROUTES (React Components)                                 │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  /dashboard/audit/plans                                         │  │
│  │  ├─ page.tsx (AuditPlansPage) → [AuditPlansTable]              │  │
│  │  │                                                              │  │
│  │  ├─ new/page.tsx (NewAuditPlanPage)                            │  │
│  │  │  ├─ [TemplateSelectorSimple]                                │  │
│  │  │  └─ [CategorySelector]                                      │  │
│  │  │                                                              │  │
│  │  └─ [id]/page.tsx (AuditDetailPage)                            │  │
│  │     ├─ [AuditPlanWorkpaperView]                                │  │
│  │     │  ├─ [WorkpaperCategoryPanel]                             │  │
│  │     │  ├─ [FindingForm]                                        │  │
│  │     │  ├─ [FindingsList]                                       │  │
│  │     │  │  └─ [FindingActionsMenu]                              │  │
│  │     │  └─ [AuditPlanActions]                                   │  │
│  │     └─ [AuditStatusBadge]                                      │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                           ↓                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ SERVER ACTIONS LAYER (Next.js Server Functions)                │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  app/_actions/audit-module-actions.ts                          │  │
│  │  ├─ getAuditPlans() → [GET /api/v1/audit-plans]                │  │
│  │  ├─ getAuditPlan(id) → [GET /api/v1/audit-plans/{id}]          │  │
│  │  ├─ createAuditPlan(data) → [POST /api/v1/audit-plans]        │  │
│  │  ├─ updateAuditPlan(id, data) → [PUT /api/v1/audit-plans/{id}] │  │
│  │  ├─ deleteAuditPlan(id) → [DELETE /api/v1/audit-plans/{id}]    │  │
│  │  ├─ submitAuditPlanForApproval(id) → [POST .../submit]        │  │
│  │  ├─ hiarApproveAuditPlan(id) → [POST .../approve/hiar]        │  │
│  │  ├─ ceoApproveAuditPlan(id) → [POST .../approve/ceo]          │  │
│  │  ├─ auditChairApproveAuditPlan(id) → [POST .../approve/chair] │  │
│  │  ├─ rejectAuditPlan(id) → [POST .../reject]                    │  │
│  │  ├─ activateAuditPlan(id) → [POST .../activate]                │  │
│  │  ├─ completeAuditPlan(id) → [POST .../complete]                │  │
│  │  ├─ getWorkpapers(id, filters) → [GET /api/v1/working-papers] │  │
│  │  ├─ getFindings(filters) → [GET /api/v1/working-paper-findings]│  │
│  │  ├─ getFinding(id) → [GET /api/v1/working-paper-findings/{id}] │  │
│  │  ├─ updateFindings(data) → [POST /api/v1/working-paper-findings]│  │
│  │  ├─ updateFinding(id, data) → [PUT .../{id}]                   │  │
│  │  ├─ updateFindingStatus(id, status) → [PATCH .../{id}/status]  │  │
│  │  ├─ deleteFinding(id) → [DELETE /api/v1/working-paper-findings]│  │
│  │  ├─ getWorkpaperTemplateCategories(id) → [GET .../categories]  │  │
│  │  ├─ getTemplateSummary(template) → Helper function             │  │
│  │  └─ getRecommendedCategories(template) → Helper function       │  │
│  │                                                                  │  │
│  │  app/_actions/finding-actions.ts                               │  │
│  │  ├─ handleSaveFinding() → Wrapper around updateFindings()       │  │
│  │  ├─ handleUpdateFinding() → Wrapper around updateFinding()     │  │
│  │  ├─ handleUpdateFindingStatus() → Wrapper around updateStatus()│  │
│  │  ├─ handleDeleteFinding() → Wrapper around deleteFinding()     │  │
│  │  ├─ handleGetFinding() → Wrapper around getFinding()           │  │
│  │  ├─ handleGetFindingsByCategory() → Wrapper around getFByCat() │  │
│  │  └─ formatDate() → Helper for date conversion                  │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                           ↓                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ HTTP CLIENT LAYER (API Calls)                                   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  authenticatedApiClient()                                       │  │
│  │  └─ Axios instance with:                                        │  │
│  │     ├─ Base URL: Environment variable                           │  │
│  │     ├─ Authentication headers (JWT/Cookie)                      │  │
│  │     ├─ Request/Response interceptors                            │  │
│  │     └─ Error handling                                           │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                           ↓                                             │
└─────────────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │   BACKEND API SERVER                  │
        ├───────────────────────────────────────┤
        │                                       │
        │  /api/v1/audit-plans                  │
        │  /api/v1/working-papers               │
        │  /api/v1/working-paper-findings       │
        │  /api/v1/working-paper-templates      │
        │                                       │
        └───────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────────┐
        │    DATABASE                           │
        ├───────────────────────────────────────┤
        │                                       │
        │  audit_plans                          │
        │  working_papers                       │
        │  working_paper_findings               │
        │  working_paper_templates              │
        │  template_categories                  │
        │                                       │
        └───────────────────────────────────────┘
```

---

## 2. Component Hierarchy Tree

```
AuditDetailPage ([id]/page.tsx)
│
├─ Header Section
│  ├─ AuditStatusBadge
│  ├─ Export Button
│  └─ Status-based Action Buttons (via AuditPlanActions)
│
└─ AuditPlanWorkpaperView
   ├─ Metadata Cards (4 columns)
   │  ├─ Timeline Card
   │  ├─ Standard Card
   │  ├─ Team Card
   │  └─ Ref No Card
   │
   └─ Tabs Container
      ├─ Tab: Plan Details
      │  ├─ Audit Scope Card
      │  ├─ Audit Objective Card
      │  ├─ Audit Criteria Card
      │  └─ Audit Area Card
      │
      ├─ Tab: Workpaper
      │  ├─ LEFT SIDEBAR
      │  │  └─ Category Panel
      │  │     ├─ Progress Card
      │  │     │  ├─ Progress Bar
      │  │     │  └─ Completion Counter
      │  │     │
      │  │     └─ Category List
      │  │        └─ CategoryListItem (repeating)
      │  │           ├─ Status Icon
      │  │           ├─ Clause Name
      │  │           └─ Clause Title
      │  │
      │  └─ RIGHT WORKSPACE
      │     ├─ WorkpaperCategoryPanel
      │     │  ├─ Clause Number + Name
      │     │  ├─ Range Badge
      │     │  ├─ Description
      │     │  ├─ Objectives List
      │     │  ├─ Scope
      │     │  └─ Requirements List
      │     │
      │     └─ FindingForm
      │        ├─ Existing Finding Alert (if exists)
      │        ├─ Form Sections
      │        │  ├─ Workings & Test Results (textarea)
      │        │  ├─ Audit Conclusion (textarea)
      │        │  ├─ Severity + Status (select dropdowns)
      │        │  ├─ Recommendation (textarea)
      │        │  ├─ Management Response (textarea)
      │        │  ├─ Corrective Action Plan (textarea)
      │        │  ├─ Responsible Person (input)
      │        │  ├─ Due Date (date picker)
      │        │  └─ Evidence Links (dynamic list)
      │        │
      │        └─ Form Actions
      │           ├─ Cancel Button
      │           └─ Save Finding Button
      │
      ├─ Tab: Findings
      │  └─ FindingsList
      │     └─ FindingCard (repeating)
      │        ├─ Status Icon
      │        ├─ Category Name + Finding Number
      │        ├─ Severity Badge
      │        ├─ Status Badge
      │        ├─ Conclusion Preview
      │        ├─ Workings Summary
      │        ├─ Recommendation
      │        ├─ Responsible Person + Due Date
      │        │
      │        └─ FindingActionsMenu
      │           ├─ Edit Finding (TBD)
      │           ├─ Update Status Dropdown
      │           │  ├─ OPEN
      │           │  ├─ IN_PROGRESS
      │           │  ├─ RESOLVED
      │           │  └─ CLOSED
      │           │
      │           └─ Delete Finding
      │              └─ AlertDialog (confirmation)
      │
      └─ Tab: Approvals
         └─ Approval Status Table
            ├─ HIAR Approval Row
            ├─ CEO Approval Row
            └─ Audit Chair Approval Row


NewAuditPlanPage (new/page.tsx)
│
├─ Header Section
│  ├─ Page Title
│  └─ Progress Indicator
│
├─ Step 1: Basic Details
│  ├─ Year (number input)
│  ├─ Reference Number (input)
│  ├─ Department Selection (SearchSelectField)
│  ├─ Title (input)
│  ├─ Description (textarea)
│  ├─ Management Standard (input)
│  ├─ Audit Area (textarea)
│  ├─ Audit Scope (textarea)
│  ├─ Audit Criteria (textarea)
│  ├─ Audit Objective (textarea)
│  ├─ Audit Plan Date (date picker)
│  ├─ Start Date (date picker)
│  ├─ End Date (date picker)
│  ├─ Opening Meeting DateTime (datetime picker)
│  ├─ Closing Meeting DateTime (datetime picker)
│  ├─ Universe Selection (SearchSelectField)
│  ├─ Universe Items (MultiSelectField)
│  ├─ Budget Selection (SearchSelectField)
│  ├─ Budget Items (MultiSelectField)
│  ├─ Team Lead (SearchSelectField)
│  ├─ Team Members (MultiSelectField)
│  ├─ Client Representative (input)
│  ├─ Audit Language (input)
│  │
│  └─ Navigation: [Cancel] [Next]
│
├─ Step 2: Template Selection
│  └─ TemplateSelectorSimple
│     ├─ Description
│     └─ RadioGroup
│        └─ TemplateCard (repeating)
│           ├─ Radio Button
│           ├─ Template Icon
│           ├─ Template Name + Version
│           ├─ Description
│           ├─ Category Count Badges (when selected)
│           └─ Selected Checkmark
│
│  └─ Navigation: [Cancel] [Previous] [Next]
│
└─ Step 3: Category Selection
   └─ CategorySelector
      ├─ Description
      ├─ Action Buttons
      │  ├─ Select All
      │  ├─ Select Recommended
      │  └─ Clear All
      │
      ├─ Category Groups
      │  ├─ Main Clauses Group
      │  │  └─ CategoryItem (repeating)
      │  │     ├─ Checkbox
      │  │     ├─ Clause Number
      │  │     ├─ Category Name
      │  │     ├─ Required Badge (if applicable)
      │  │     └─ Expandable Details
      │  │        ├─ Description
      │  │        ├─ Scope
      │  │        ├─ Objectives
      │  │        ├─ Audit Procedure
      │  │        └─ Requirements
      │  │
      │  └─ Annex A Controls Group
      │     └─ CategoryItem (repeating)
      │        └─ (same as above)
      │
      └─ Navigation: [Cancel] [Previous] [Create Plan]


AuditPlansPage (page.tsx)
│
├─ Header Section
│  ├─ Page Title
│  └─ Create Audit Plan Button
│
└─ AuditPlansTable
   ├─ Table Header
   │  ├─ Title Column
   │  ├─ Standard Column
   │  ├─ Team Leader Column
   │  ├─ Date Range Column
   │  ├─ Progress Column
   │  ├─ Status Column
   │  └─ Actions Column
   │
   └─ Table Rows (repeating)
      ├─ Plan Title
      ├─ ISO Standard
      ├─ Team Lead Name
      ├─ Date Range (Jan 15 - Mar 31, 2025)
      ├─ Progress Bar + Percentage
      ├─ Status Badge (Draft/Submitted/Active/etc)
      │
      └─ Row Actions
         ├─ View Button
         ├─ Edit Button (Draft only)
         └─ Delete Button (Draft only)
            └─ AlertDialog (confirmation)
```

---

## 3. Data Flow Diagrams

### 3.1 Creating an Audit Plan

```
USER INTERACTION                         COMPONENT STATE                  SERVER STATE
──────────────────────────────────────────────────────────────────────────────────────

[User fills Step 1 fields]
              │
              ↓
        formData = {...}
        currentStep = 1
              │
              ↓
    [User clicks NEXT]
              │
              ↓
     handleNext() validates
        currentStep = 2
              │
              ↓
  [Fetch templates via hook]
   └─ useWorkpaperTemplates()
              │
              ↓
    Templates loaded, displayed
   as radio group cards
              │
              ↓
    [User selects template]
              │
              ↓
   handleTemplateChange()
   └─ formData.working_paper_template_id = X
   └─ Fetch categories for template
              │
              ↓
  [User clicks NEXT]
              │
              ↓
    currentStep = 3
              │
              ↓
  [Categories displayed]
   └─ User selects required categories
              │
              ↓
  formData.selectedCategories = [...]
              │
              ↓
  [User clicks CREATE PLAN]
              │
              ↓
  handleSubmit()
  └─ Validate all fields & categories
              │
              ├─────────────────────────────────────────┐
              │                                          │
              ↓                                          ↓
       isSubmitting = true                   POST /api/v1/audit-plans
              │                               {
              │                                 year, title, ref_no,
              │                                 start_date, end_date,
              │                                 department_id,
              │                                 working_paper_template_id,
              │                                 selectedCategories,
              │                                 ...other fields
              │                               }
              │                                          │
              │                                          ↓
              │                                   Backend validates
              │                                   & creates plan
              │                                          │
              │                                          ↓
              │                                   Database INSERT
              │                                   audit_plans table
              │                                          │
              │                                          ↓
              │                                   Returns {
              │                                     id: "plan-123",
              │                                     status: "Draft",
              │                                     ...
              │                                   }
              │                                          │
              ├──────────────────────────────────────────┤
              │                                          │
              ↓                                          │
       isSubmitting = false                             │
       showToast("Plan created")                        │
              │                                          │
              ↓                                          │
       Router.push("/dashboard/audit/plans")
              │
              ↓
    [New plan appears in list]
```

### 3.2 Finding Creation & Status Update Flow

```
USER INTERACTION               FINDING FORM STATE        SERVER ACTION           DATABASE
──────────────────────────────────────────────────────────────────────────────────────

[User selects category]
       │
       ↓
selectedCategoryId = "cat-001"
       │
       ↓
Load existing findings for category
       │
       ↓
formData = {
  workings_and_test_results: "",
  conclusion: "",
  severity: "MEDIUM",
  ...
}
       │
       ↓
[User fills all fields]
       │
       ├─ conclusion: "Policies outdated..."
       ├─ severity: "HIGH"
       ├─ due_date: Date(2025-02-28)
       ├─ evidence_links: ["file1.pdf", "file2.xlsx"]
       └─ ...other fields
       │
       ↓
[User clicks SAVE FINDING]
       │
       ├─────────────────────────────────────────┐
       │                                          │
       ↓                                          ↓
isSaving = true                   handleSaveFinding()
       │                           {
       │                             audit_plan_id,
       │                             working_paper_id,
       │                             category_name,
       │                             finding_number (auto-gen),
       │                             due_date (converted to YYYY-MM-DD),
       │                             evidence_links (joined ";"),
       │                             ...
       │                           }
       │                                          │
       │                                          ↓
       │                                  POST /api/v1/
       │                                  working-paper-findings
       │                                          │
       │                                          ↓
       │                                  Backend creates
       │                                  finding record
       │                                          │
       │                                          ↓
       │                                  INSERT INTO
       │                                  working_paper_findings
       │                                  VALUES (...)
       │                                          │
       │                                          ↓
       │                                  REVALIDATE cache:
       │                                  • /dashboard/audit/findings
       │                                  • /dashboard/audit/plans/{id}
       │                                  • /dashboard/audit/workpapers
       │                                          │
       │                                          ↓
       │                                  Returns 201 Created
       │
       ├───────────────────────────────────────────┤
       │                                            │
       ↓                                            │
isSaving = false                                   │
Toast: "Finding saved"                             │
findingsRefreshKey++                               │
       │                                            │
       ├──[If UPDATE STATUS]──┐                    │
       │                      │                    │
       │                      ↓                    │
       │            handleUpdateFindingStatus()    │
       │                      │                    │
       │            PATCH /api/v1/.../            │
       │            {id}/status                   │
       │                      │                    │
       │                      ↓                    │
       │            UPDATE findings                │
       │            SET status = X                 │
       │                      │                    │
       │                      ↓                    │
       │            Status updates in UI           │
       │                                            │
       └────────────────────────────────────────────┤
                                                   │
                                                   ↓
                                          Category progress updates
                                          (memoized computation)
```

### 3.3 Category Progress Calculation

```
WHEN: Component mounts or findings change

┌────────────────────────────────────────────────────────────────┐
│ useMemo(() => {                                                │
│   const total = workpaperCategories.length                    │
│                                                                │
│   const completed = workpaperCategories.filter(cat => {       │
│     const catFindings = findings.filter(                      │
│       f => f.clause === cat.clause                            │
│     )                                                          │
│                                                                │
│     // All findings must have conclusion                      │
│     return catFindings.length > 0 &&                          │
│            catFindings.every(f => f.conclusion)               │
│   }).length                                                    │
│                                                                │
│   return {                                                     │
│     completed,                                                │
│     total,                                                    │
│     percentage: (completed / total) * 100                     │
│   }                                                            │
│ }, [workpaperCategories, findings])                           │
└────────────────────────────────────────────────────────────────┘

EXAMPLE:
─────────────────────────────────────────────────────────────────

Categories: [A.5, A.6, A.7, A.8, A.9, A.10]  (total = 6)

Findings:
A.5: [Finding 1] (has conclusion ✓) → COMPLETE
A.6: [Finding 1] (has conclusion ✓) → COMPLETE
A.7: [Finding 1] (NO conclusion ✗) → INCOMPLETE
A.8: [] (no findings) → NOT STARTED
A.9: [Finding 1, Finding 2] (both have conclusion ✓) → COMPLETE
A.10: Not selected

completed = 3 (A.5, A.6, A.9)
total = 6
percentage = (3 / 6) * 100 = 50%

UI DISPLAY:
Progress Bar: ████████░░░░░░░░░░░  50%
Completed: 3 of 6 categories

Category List Icons:
A.5: ✓ (Green checkmark)
A.6: ✓ (Green checkmark)
A.7: ⚠ (Orange warning - incomplete)
A.8: ○ (Empty circle - not started)
A.9: ✓ (Green checkmark)
A.10: (not in list - not selected)
```

---

## 4. Approval Workflow State Machine

```
                    ┌─────────────────────┐
                    │   DRAFT             │
                    │ (Initial state)     │
                    └──────────┬──────────┘
                               │
                    [Submit for Approval]
                               │
                               ↓
                    ┌─────────────────────┐
                    │   SUBMITTED         │
                    │ (Awaiting HIAR)     │
                    └──────┬──────────┬───┘
                           │          │
                    [APPROVE]    [REJECT]
                           │          │
                           ↓          ↓
                    ┌──────────┐  ┌─────────┐
                    │ HIAR_    │  │ REJECTED│
                    │ APPROVED │  │         │
                    └────┬─────┘  └─────────┘
                         │              △
                    [APPROVE]           │
                         │              │
                         ↓          [Re-submit]
                    ┌──────────┐        │
                    │  CEO_    │────────┘
                    │ APPROVED │
                    └────┬─────┘
                         │
                    [APPROVE]
                         │
                         ↓
                    ┌──────────────┐
                    │  AUDIT_CHAIR │
                    │  _APPROVED   │
                    └────┬─────────┘
                         │
                    [ACTIVATE]
                         │
                         ↓
                    ┌──────────┐
                    │  ACTIVE  │
                    └────┬─────┘
                         │
                    [COMPLETE]
                         │
                         ↓
                    ┌──────────┐
                    │ COMPLETED│
                    └──────────┘

ROLE-BASED VISIBILITY:
─────────────────────────

DRAFT:
  └─ All users see: [Submit for Approval]

SUBMITTED:
  └─ HIAR role sees: [Approve Dialog] [Reject Dialog]
  └─ Other roles: Read-only

HIAR_APPROVED:
  └─ CEO role sees: [Approve Dialog] [Reject Dialog]
  └─ Other roles: Read-only

CEO_APPROVED:
  └─ AUDIT_CHAIR role sees: [Approve Dialog] [Reject Dialog]
  └─ Other roles: Read-only

AUDIT_CHAIR_APPROVED:
  └─ AUDITOR role sees: [Activate Audit Plan]

ACTIVE:
  └─ AUDITOR role sees: [Complete Audit]

COMPLETED:
  └─ All users: Read-only (history view)
```

---

## 5. Component Communication Patterns

```
PARENT → CHILD (Props)
──────────────────────────

AuditDetailPage
    ↓ Props
AuditPlanWorkpaperView
    ├─ Props: {auditPlan, workpaperCategories, findings, onSaveFinding}
    │
    ├─ WorkpaperCategoryPanel
    │   └─ Props: {category}
    │
    ├─ FindingForm
    │   └─ Props: {category, auditPlan, existingFindings, onSave, isSaving}
    │
    └─ FindingsList
        └─ Props: {findings, onRefresh, onEditFinding}
            │
            └─ FindingActionsMenu
                └─ Props: {findingId, currentStatus, onEdit, onRefresh}

NewAuditPlanPage
    ├─ TemplateSelectorSimple
    │   └─ Props: {value, onChange, disabled, loadingTemplateDetails}
    │
    └─ CategorySelector
        └─ Props: {templateId, selectedCategories, onCategoriesChange, selectedTemplate}


CHILD → PARENT (Callbacks)
──────────────────────────

FindingForm
    └─ onSave(finding)  ←  Called when user submits
                           └─ (data) => {
                              setIsSaving(true)
                              POST /api/v1/working-paper-findings
                              setIsSaving(false)
                           }

FindingActionsMenu
    ├─ onEdit(finding)    ←  Called when edit clicked
    │                        (not fully implemented)
    │
    └─ onRefresh()        ←  Called after delete/status change
                             └─ setFindingsRefreshKey(prev => prev + 1)

TemplateSelectorSimple
    └─ onChange(template)  ←  Called when template selected
                              └─ setFormData({...template...})
                              └─ setSelectedTemplateWithCategories(template)

CategorySelector
    └─ onCategoriesChange(categoryIds)  ←  Called when categories selected
                                           └─ setFormData({selectedCategories: [...]})


DATA FLOW PATTERNS
──────────────────

1. UNIDIRECTIONAL DOWN (Props)
   Parent state → Child props → Render

2. EVENT UP (Callbacks)
   User action → Child handler → Call parent callback → Parent updates state

3. SERVER ACTION PATTERN
   Component → handleFunctionName() → "use server" → API call → Response → Toast/UI update

4. MEMOIZATION
   useMemo([dependencies]) → Recompute only when deps change → Prevent unnecessary renders
```

---

## 6. API Request/Response Examples

### Create Finding Request

```javascript
POST /api/v1/working-paper-findings

HEADERS:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {jwt-token}"
}

BODY:
{
  "audit_plan_id": "ap-123",
  "working_paper_id": "wp-456",
  "category_name": "A.5 Information Security Policies",
  "finding_number": "F-A.5-1704899200000",
  "workings_and_test_results": "Reviewed policy documents dated 2021...",
  "conclusion": "Policies are outdated and do not cover recent amendments...",
  "severity": "HIGH",
  "recommendation": "Update policies to reflect current standard...",
  "management_response": "We will conduct a full policy review...",
  "action_plan": "Review committee to meet on 2025-02-01...",
  "responsible_person": "John Smith",
  "due_date": "2025-02-28",
  "status": "OPEN",
  "evidence_links": "audit_procedure.pdf;risk_register.xlsx"
}

RESPONSE (201 Created):
{
  "success": true,
  "message": "Finding created successfully",
  "data": {
    "id": "finding-789",
    "audit_plan_id": "ap-123",
    "working_paper_id": "wp-456",
    "category_name": "A.5 Information Security Policies",
    "finding_number": "F-A.5-1704899200000",
    "conclusion": "Policies are outdated...",
    "severity": "HIGH",
    "status": "OPEN",
    "createdAt": "2025-01-10T10:30:00Z"
  }
}
```

### Update Finding Status Request

```javascript
PATCH /api/v1/working-paper-findings/{id}/status

HEADERS:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {jwt-token}"
}

BODY:
{
  "status": "IN_PROGRESS"
}

RESPONSE (200 OK):
{
  "success": true,
  "message": "Finding status updated successfully",
  "data": {
    "id": "finding-789",
    "status": "IN_PROGRESS",
    "updatedAt": "2025-01-10T10:35:00Z"
  }
}
```

### Delete Finding Request

```javascript
DELETE /api/v1/working-paper-findings/{id}

HEADERS:
{
  "Authorization": "Bearer {jwt-token}"
}

RESPONSE (200 OK):
{
  "success": true,
  "message": "Finding deleted successfully"
}
```

---

## 7. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                             │
│ └─ Server Action called                                      │
│    └─ API request sent                                       │
│       └─ Response received                                   │
└──────────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴────────┐
                │                  │
                ↓                  ↓
         [SUCCESS]          [ERROR]
             │                │
             │                ├─ Network error
             │                ├─ Validation error (400)
             │                ├─ Unauthorized (401)
             │                ├─ Forbidden (403)
             │                ├─ Not found (404)
             │                ├─ Server error (500)
             │                └─ Timeout
             │                │
             │                ↓
             │        catch (error: any)
             │        └─ throw new Error(message)
             │                │
             │        (Re-thrown to component)
             │                │
             ↓                ↓
         showToast()    try-catch in component
         {              └─ catch (error)
           title: "Success",    │
           desc: "...",         └─ showToast()
           variant: "default"       {
         }                        title: "Error",
             │                    desc: error.message,
             ↓                    variant: "destructive"
         UI updates          }
         (refresh list)           │
                                  ↓
                         User sees error message

EXAMPLE ERROR FLOW:
──────────────────

1. User deletes finding without network

   deleteFinding(id)
   └─ DELETE /api/v1/.../findings/123
   └─ Network timeout
   └─ catch (error: Network error)
   └─ throw new Error("Error deleting finding")

2. Component catches and shows toast

   catch (error: any) {
     toast({
       title: "Error",
       description: "Error deleting finding",
       variant: "destructive"
     })
   }

3. UI shows:
   ┌─────────────────────────────────────────┐
   │ ✕ Error                                  │
   │   Error deleting finding                │
   └─────────────────────────────────────────┘
   (Auto-dismisses after 5 seconds)
```

---

## 8. Performance Optimization Techniques

```
MEMOIZATION:
────────────

useMemo(() => {
  // Expensive calculation: Progress percentage
  return calculations
}, [dependencies])  // Only recalculates when deps change


PARALLEL FETCHING:
──────────────────

await Promise.all([
  getAuditPlan(id),              // Fetches in parallel
  getWorkpapers(id),             // ↓
  getFindings(id),               // ↓
  getWorkpaperTemplateCategories(id)  // ↓
])

Total time: Max(individual times) instead of Sum


CONDITIONAL RENDERING:
──────────────────────

{activeTab === "workpaper" && (
  <WorkpaperView>  // Only renders when tab active
</WorkpaperView>
)}


LAZY LOADING:
─────────────

Evidence links loaded on demand
Category details expanded on click


DEBOUNCING:
───────────

Date picker changes → Debounce API calls → Reduce server load
```

---

## Summary

This architecture document outlines:

✅ **System Architecture** - How components layer on top of each other
✅ **Component Hierarchy** - Full tree of parent-child relationships
✅ **Data Flows** - Step-by-step diagrams for major operations
✅ **API Patterns** - Request/response examples
✅ **Error Handling** - Error flow and user feedback
✅ **Performance** - Optimization techniques used

**Key Architectural Principles:**

1. **Separation of Concerns** - Components → Actions → API
2. **Server-First** - Server actions handle all API calls
3. **Type Safety** - Full TypeScript throughout
4. **Memoization** - Prevent unnecessary re-renders
5. **Error Handling** - Try-catch with user feedback
6. **State Management** - Lift state to highest needed component

---

_Last Updated: 2025-01-10_
_Architecture Version: 1.0_

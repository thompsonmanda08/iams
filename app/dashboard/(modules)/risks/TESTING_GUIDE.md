# Action Findings Testing Guide

## Overview

This guide provides instructions for testing the action findings submission workflow using mock data. The system is designed to allow action owners to submit evidence of risk mitigation actions.

## Key Changes

### 1. New Field: `risk_action_owner_id`

- **Purpose**: Identifies the user responsible for submitting action findings
- **Different from**: `risk_owner_id` (the original risk owner/manager)
- **Location**: Added to Risk interface in `app/_actions/risk-module-actions.ts`

### 2. Updated Filtering

The `/dashboard/risks/actions` page now filters risks by **`risk_action_owner_id`** instead of `risk_owner_id`.

```typescript
// Before
const response = await getAllRisks{ risk_owner_id: user?.id });

// After
const response = await getAllRisks{ risk_action_owner_id: user?.id });
```

This means:

- Users see risks **assigned to them for action submission**
- Not risks they created or own

## Mock Data Users

For testing purposes, we have two action owner IDs:

### User 1: `user-action-owner-1`

**Assigned Risks**:

- Risk ID 1: Cyber Security Breach Risk
- Risk ID 3: Data Privacy Incident Risk

**Action Items**:

- Submit findings for cybersecurity controls
- Submit findings for data protection measures

### User 2: `user-action-owner-2`

**Assigned Risks**:

- Risk ID 2: Regulatory Compliance Risk
- Risk ID 4: Business Continuity Risk

**Action Items**:

- Submit findings for GDPR compliance
- Submit findings for disaster recovery procedures

## Mock Risks Structure

### Risk 1: Cyber Security Breach Risk

```
ID: 1
Risk ID: RSK-2024-001
Status: OPEN
Severity: HIGH
Risk Owner: IT Security Manager (user-sec-mgr-1)
Action Owner: user-action-owner-1
Treatment Plan: Implement MFA and enhance network security
Target Date: 2024-12-31
Control Effectiveness: 3/5
```

### Risk 2: Regulatory Compliance Risk

```
ID: 2
Risk ID: RSK-2024-002
Status: OPEN
Severity: MEDIUM
Risk Owner: Compliance Officer (user-comp-officer-1)
Action Owner: user-action-owner-2
Treatment Plan: Update policies to align with GDPR
Target Date: 2024-12-15
Control Effectiveness: 2/5
```

### Risk 3: Data Privacy Incident Risk

```
ID: 3
Risk ID: RSK-2024-003
Status: OPEN
Severity: HIGH
Risk Owner: Data Protection Officer (user-dpo-1)
Action Owner: user-action-owner-1
Treatment Plan: Implement data encryption and access controls
Target Date: 2025-01-15
Control Effectiveness: 2/5
```

### Risk 4: Business Continuity Risk

```
ID: 4
Risk ID: RSK-2024-004
Status: OPEN
Severity: MEDIUM
Risk Owner: Operations Manager (user-ops-mgr-1)
Action Owner: user-action-owner-2
Treatment Plan: Implement backup and disaster recovery
Target Date: 2024-12-20
Control Effectiveness: 2/5
```

## Testing Instructions

### Step 1: Access Actions Page

Navigate to `/dashboard/risks/actions`

**Expected Result:**

- Page shows "My Actions" with risks filtered by current user's `risk_action_owner_id`
- If logged in as `user-action-owner-1`: See Risks 1 & 3
- If logged in as `user-action-owner-2`: See Risks 2 & 4

### Step 2: View Actions Table

The actions table displays:

- ✅ Risk title and description
- ✅ Category with color indicator
- ✅ Department
- ✅ Risk Level (calculated from likelihood × impact)
- ✅ Response type (REDUCE, ACCEPT, etc.)
- ✅ Risk Owner
- ✅ Due Date (with overdue indicator)
- ✅ Status badge
- ✅ **"Submit Findings" button** (for OPEN risks)

### Step 3: Submit Action Findings

1. Click "Submit Findings" button on any OPEN risk
2. ActionFindingsDialog opens with:
   - Read-only risk information (title & description)
   - **Action Taken / Description** field (required)
   - **Evidence / Supporting Notes** field (optional)
   - **Attach Evidence** file upload (optional)
3. Fill in the form:
   ```
   Description: "Implemented MFA for all 150 users. Completed Oct 30, 2024."
   Notes: "Configuration completed using Okta. All users passed validation."
   File: mfa-implementation-report.pdf
   ```
4. Click "Submit Findings"
5. Dialog closes and page refreshes

**Expected Result:**

- Toast notification: "Action findings submitted successfully"
- Finding status: **PENDING_REVIEW**
- Finding appears in demo page

### Step 4: View Demo Page

Navigate to `/dashboard/risks/actions-demo`

**Expected Result:**

- Shows all mock action findings with different statuses:
  - **OPEN**: Risks waiting for action submission (Risks 1, 2, 3, 4)
  - **PENDING_REVIEW**: Findings submitted, awaiting reviewer assessment
  - **COMPLETED**: Approved findings with scores
  - **NEEDS_REVISION**: Findings requiring more action
- Tabbed interface to filter by status
- Complete workflow examples and feedback

### Step 5: Test Status Filtering

In the actions table:

1. Filter by status using search/filter controls
2. See only relevant actions
3. Submit findings to change status from OPEN to PENDING_REVIEW

## Data Flow for Testing

### User Story: Action Owner submits findings

```
1. Action Owner logs in with user-action-owner-1
        ↓
2. Navigates to /dashboard/risks/actions
        ↓
3. Sees "Cyber Security Breach Risk" and "Data Privacy Incident Risk"
        ↓
4. Clicks "Submit Findings" on first risk
        ↓
5. Fills in ActionFindingsDialog
        ↓
6. Clicks "Submit Findings"
        ↓
7. Server action submitActionFindings() called
        ↓
8. ActionFindings record created with status PENDING_REVIEW
        ↓
9. Page refreshes
        ↓
10. Findings visible in /dashboard/risks/actions-demo
```

### User Story: Reviewer assesses findings

```
1. Reviewer logs in (any user, reviewer assigned by system)
        ↓
2. Navigates to /dashboard/risks/actions-demo
        ↓
3. Clicks on PENDING_REVIEW finding
        ↓
4. ActionAssessmentForm displayed
        ↓
5. Sets score (0-10) and provides feedback
        ↓
6. Chooses decision: APPROVE or REQUEST_CHANGES
        ↓
7. Clicks "Submit Assessment"
        ↓
8. Server action assessActionFindings() called
        ↓
9. Finding status updated:
   - APPROVE → COMPLETED
   - REQUEST_CHANGES → NEEDS_REVISION
        ↓
10. Risk mitigation tracked
```

## Key Testing Scenarios

### Scenario 1: Multiple Actions by Same Owner

**Objective**: Test filtering for one action owner

1. Log in as `user-action-owner-1`
2. See 2 risks: Cyber Security (1) & Data Privacy (3)
3. Submit findings for both risks
4. Both should appear in demo page as PENDING_REVIEW

### Scenario 2: Different Owners, Same Risk

**Objective**: Verify each user sees only their assigned risks

1. Log in as `user-action-owner-1`
   - See: Risks 1, 3
   - Don't see: Risks 2, 4
2. Simulate login as `user-action-owner-2`
   - See: Risks 2, 4
   - Don't see: Risks 1, 3

### Scenario 3: Submit and Review Workflow

**Objective**: Complete full workflow

1. Action owner submits findings
2. Status changes to PENDING_REVIEW
3. Reviewer assesses (APPROVE/REQUEST_CHANGES)
4. Status updated accordingly

### Scenario 4: Search and Filter

**Objective**: Test search functionality

1. Search for "Security" → Should find "Cyber Security Breach Risk"
2. Search for "RSK-2024-002" → Should find "Regulatory Compliance Risk"
3. Filter by status → See only matching risks

## Testing Checklist

- [ ] Actions page filters by `risk_action_owner_id`
- [ ] Correct risks shown for each user
- [ ] "Submit Findings" button appears on OPEN risks
- [ ] ActionFindingsDialog opens with correct risk data
- [ ] Form validation works (description required)
- [ ] File upload shows in dialog
- [ ] Submission updates status to PENDING_REVIEW
- [ ] Demo page shows all findings with correct statuses
- [ ] Tabbed interface filters findings correctly
- [ ] Status legends display correct colors
- [ ] API endpoints documentation visible
- [ ] Search functionality works
- [ ] Pagination works with mock data
- [ ] Multiple actions per user supported
- [ ] Assessment form shows all fields

## Mock Data Summary

| Risk ID | Title                 | Owner User          | Action Owner        | Status |
| ------- | --------------------- | ------------------- | ------------------- | ------ |
| 1       | Cyber Security Breach | user-sec-mgr-1      | user-action-owner-1 | OPEN   |
| 2       | Regulatory Compliance | user-comp-officer-1 | user-action-owner-2 | OPEN   |
| 3       | Data Privacy Incident | user-dpo-1          | user-action-owner-1 | OPEN   |
| 4       | Business Continuity   | user-ops-mgr-1      | user-action-owner-2 | OPEN   |

## Common Issues & Solutions

### Issue: Don't see expected risks on actions page

**Solution**: Check you're logged in with correct action owner ID:

- `user-action-owner-1` → Should see risks 1, 3
- `user-action-owner-2` → Should see risks 2, 4

### Issue: "Submit Findings" button not showing

**Solution**:

- Only shows for OPEN risks
- Risk status must be "OPEN" in mock data
- Check browser console for errors

### Issue: Findings not appearing in demo page

**Solution**:

- Refresh page after submission
- Check mock data in risk-module-actions.ts
- Verify risk_id matches between risk and findings

## Next Steps

When connecting to real API:

1. Replace mock data filtering in `getAllRisks)` with real API calls
2. Update `submitActionFindings()` to call `/api/v1/action-findings`
3. Update `getActionFindings()` to call `/api/v1/risks/{id}/findings`
4. Update `assessActionFindings()` to call `/api/v1/action-findings/{id}/assess`
5. Add real user authentication with actual user IDs
6. Implement real file upload to S3/Cloud Storage
7. Add notification system for status changes

## Related Files

- **Main Page**: `/dashboard/risks/actions/page.tsx`
- **Actions Table**: `/dashboard/risks/actions/actions-table.tsx`
- **Findings Dialog**: `/dashboard/risks/_components/action-findings-dialog.tsx`
- **Findings Display**: `/dashboard/risks/_components/action-findings-display.tsx`
- **Assessment Form**: `/dashboard/risks/_components/action-assessment-form.tsx`
- **Demo Page**: `/dashboard/risks/actions-demo/page.tsx`
- **Demo Component**: `/dashboard/risks/_components/action-findings-demo.tsx`
- **Server Actions**: `/app/_actions/risk-module-actions.ts`

## Questions?

Refer to the inline code comments in the components and server actions for additional implementation details.

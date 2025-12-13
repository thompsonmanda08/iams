# Mock Data Reference Guide

## Quick Overview

This document provides a quick reference for all mock data used in testing the action findings feature.

## Test User IDs

### Action Owner 1

- **ID**: `user-action-owner-1`
- **Type**: Action Owner (responsible for submitting findings)
- **Assigned Risks**: Risk 1, Risk 3
- **Responsibilities**:
  - Submit findings for Cyber Security Breach Risk
  - Submit findings for Data Privacy Incident Risk

### Action Owner 2

- **ID**: `user-action-owner-2`
- **Type**: Action Owner (responsible for submitting findings)
- **Assigned Risks**: Risk 2, Risk 4
- **Responsibilities**:
  - Submit findings for Regulatory Compliance Risk
  - Submit findings for Business Continuity Risk

## Mock Risks

### Risk 1: Cyber Security Breach Risk

```json
{
  "id": "1",
  "riskId": "RSK-2024-001",
  "title": "Cyber Security Breach Risk",
  "description": "Risk of unauthorized access to systems and data theft. Potential for significant system downtime and data loss.",
  "category": "Technology",
  "category_id": "cat-tech-1",
  "department_id": "dept-it-1",
  "inherentScore": 20,
  "inherentImpact": 5,
  "inherentLikelihood": 4,
  "residualScore": 8,
  "residualImpact": 4,
  "residualLikelihood": 2,
  "riskMagnitude": "high",
  "status": "OPEN",
  "owner": "IT Security Manager",
  "risk_owner_id": "user-sec-mgr-1",
  "risk_action_owner_id": "user-action-owner-1",
  "treatment_plan": "Implement multi-factor authentication and enhance network security",
  "risk_response": "REDUCE",
  "target_closing_date": "2024-12-31",
  "control_effectiveness": 3
}
```

**Expected Actions**:

- Submit MFA implementation details
- Upload deployment report
- Document user enrollment

---

### Risk 2: Regulatory Compliance Risk

```json
{
  "id": "2",
  "riskId": "RSK-2024-002",
  "title": "Regulatory Compliance Risk",
  "description": "Risk of non-compliance with GDPR and other regulatory requirements. Potential for significant fines and reputational damage.",
  "category": "Compliance",
  "category_id": "cat-comp-1",
  "department_id": "dept-legal-1",
  "inherentScore": 15,
  "inherentImpact": 5,
  "inherentLikelihood": 3,
  "residualScore": 6,
  "residualImpact": 3,
  "residualLikelihood": 2,
  "riskMagnitude": "medium",
  "status": "OPEN",
  "owner": "Compliance Officer",
  "risk_owner_id": "user-comp-officer-1",
  "risk_action_owner_id": "user-action-owner-2",
  "treatment_plan": "Update policies and procedures to align with GDPR requirements",
  "risk_response": "REDUCE",
  "target_closing_date": "2024-12-15",
  "control_effectiveness": 2
}
```

**Expected Actions**:

- Document policy updates
- Upload GDPR compliance checklist
- Evidence of stakeholder review

---

### Risk 3: Data Privacy Incident Risk

```json
{
  "id": "3",
  "riskId": "RSK-2024-003",
  "title": "Data Privacy Incident Risk",
  "description": "Risk of unauthorized data disclosure and privacy breaches. Impact on customer trust and brand reputation.",
  "category": "Data Protection",
  "category_id": "cat-dp-1",
  "department_id": "dept-it-1",
  "inherentScore": 18,
  "inherentImpact": 5,
  "inherentLikelihood": 3,
  "residualScore": 7,
  "residualImpact": 4,
  "residualLikelihood": 2,
  "riskMagnitude": "high",
  "status": "OPEN",
  "owner": "Data Protection Officer",
  "risk_owner_id": "user-dpo-1",
  "risk_action_owner_id": "user-action-owner-1",
  "treatment_plan": "Implement data encryption and access controls",
  "risk_response": "REDUCE",
  "target_closing_date": "2025-01-15",
  "control_effectiveness": 2
}
```

**Expected Actions**:

- Document encryption implementation
- Demonstrate access control configuration
- Upload audit logs

---

### Risk 4: Business Continuity Risk

```json
{
  "id": "4",
  "riskId": "RSK-2024-004",
  "title": "Business Continuity Risk",
  "description": "Risk of system downtime and inability to continue operations. Could impact service delivery to customers.",
  "category": "Operations",
  "category_id": "cat-ops-1",
  "department_id": "dept-ops-1",
  "inherentScore": 12,
  "inherentImpact": 4,
  "inherentLikelihood": 3,
  "residualScore": 6,
  "residualImpact": 3,
  "residualLikelihood": 2,
  "riskMagnitude": "medium",
  "status": "OPEN",
  "owner": "Operations Manager",
  "risk_owner_id": "user-ops-mgr-1",
  "risk_action_owner_id": "user-action-owner-2",
  "treatment_plan": "Implement backup and disaster recovery procedures",
  "risk_response": "REDUCE",
  "target_closing_date": "2024-12-20",
  "control_effectiveness": 2
}
```

**Expected Actions**:

- Document backup procedures
- Upload disaster recovery plan
- Evidence of recovery testing

---

## Mock Action Findings

### Completed Findings Examples

#### AF-2024-001 (Status: COMPLETED)

```json
{
  "id": "AF-2024-001",
  "risk_id": "1",
  "action_owner_id": "user-action-owner-1",
  "description": "Implemented multi-factor authentication (MFA) for all system access points. Updated authentication framework to require OTP verification in addition to password.",
  "evidence_notes": "MFA implementation completed on 2024-11-01. All 150 users have been enrolled. Configuration screenshots and deployment logs available. Zero failed authentications reported in first week.",
  "evidence_file_name": "mfa-deployment-report.pdf",
  "submission_date": "2024-11-05",
  "status": "COMPLETED",
  "reviewer_id": "user-reviewer-1",
  "reviewer_feedback": "Excellent implementation of MFA across all systems. The deployment was executed flawlessly with comprehensive user training. Control effectiveness has increased from 2/5 to 4.5/5. This significantly reduces the risk of unauthorized access.",
  "assessment_score": 9,
  "assessment_date": "2024-11-06"
}
```

#### AF-2024-004 (Status: COMPLETED - Perfect Score)

```json
{
  "id": "AF-2024-004",
  "risk_id": "1",
  "action_owner_id": "user-action-owner-1",
  "description": "Implemented comprehensive security awareness training program for all employees. Mandatory training includes phishing simulation, password management, and social engineering tactics.",
  "evidence_notes": "Training rollout completed on 2024-10-10. 98% of employees (147/150) completed the mandatory 2-hour training module. Average test score: 87%. Three low performers scheduled for follow-up training. Monthly simulated phishing tests show 12% click rate (industry average: 20%).",
  "evidence_file_name": "security-training-completion-report.xlsx",
  "submission_date": "2024-10-15",
  "status": "COMPLETED",
  "reviewer_id": "user-reviewer-1",
  "reviewer_feedback": "Outstanding security awareness program execution. The 98% completion rate and 87% average test score demonstrate strong engagement. The phishing click rate of 12% (well below industry average) shows the training is effective. This significantly improves the human security posture.",
  "assessment_score": 10,
  "assessment_date": "2024-10-18"
}
```

### Pending Review Example

#### AF-2024-002 (Status: PENDING_REVIEW)

```json
{
  "id": "AF-2024-002",
  "risk_id": "1",
  "action_owner_id": "user-action-owner-1",
  "description": "Conducted security vulnerability assessment using automated scanning tools. Identified and patched 12 critical vulnerabilities, 35 high-severity issues, and 89 medium-severity issues.",
  "evidence_notes": "Vulnerability scan performed on 2024-11-03 using Nessus and Qualys tools. All identified vulnerabilities have been patched and re-scanned for confirmation. Patches successfully applied to 98% of systems. Remaining 2% scheduled for next maintenance window.",
  "evidence_file_name": "vulnerability-assessment-report.pdf",
  "submission_date": "2024-11-04",
  "status": "PENDING_REVIEW"
}
```

### Needs Revision Example

#### AF-2024-003 (Status: NEEDS_REVISION)

```json
{
  "id": "AF-2024-003",
  "risk_id": "2",
  "action_owner_id": "user-action-owner-2",
  "description": "Updated data protection policy documentation to align with GDPR requirements. Added new sections on data handling procedures.",
  "evidence_notes": "Policy document updated and circulated to stakeholders. Version 2.1 released on 2024-10-15. Initial feedback from legal team received.",
  "evidence_file_name": "gdpr-policy-v2.1.docx",
  "submission_date": "2024-10-20",
  "status": "NEEDS_REVISION",
  "reviewer_id": "user-reviewer-2",
  "reviewer_feedback": "The policy update covers basic GDPR requirements but lacks comprehensive data processing agreements (DPAs) with third-party vendors. Additionally, incident response procedures need to be more detailed. Please provide: (1) DPA templates, (2) Enhanced incident response plan, (3) Evidence of staff training completion. Once these items are addressed, this can be approved.",
  "assessment_score": 5,
  "assessment_date": "2024-10-25"
}
```

---

## Database Relationships

```
Risk (1) ──has many──> ActionFindings (many)
  |
  ├─ risk_action_owner_id → User (Action Owner)
  └─ risk_owner_id → User (Risk Owner)

ActionFindings
  |
  ├─ action_owner_id → User (Submission)
  └─ reviewer_id → User (Assessment)
```

---

## Status Progression

```
OPEN
  ↓
[Action Owner submits findings]
  ↓
PENDING_REVIEW
  ↓
[Reviewer assesses]
  ├─ APPROVE
  │   ↓
  │ COMPLETED
  │   ↓
  │ [Risk Mitigated]
  │
  └─ REQUEST_CHANGES
      ↓
    NEEDS_REVISION
      ↓
    [Action Owner resubmits]
```

---

## Risk Level Calculation

```
Risk Level = Likelihood × Impact

Score ≥ 15: CRITICAL (Red)
Score ≥ 10: HIGH (Orange)
Score ≥ 5:  MEDIUM (Yellow)
Score < 5:  LOW (Green)

Mock Risk Scores:
- Risk 1: 4 × 5 = 20 (CRITICAL/HIGH)
- Risk 2: 3 × 5 = 15 (HIGH)
- Risk 3: 3 × 5 = 15 (HIGH)
- Risk 4: 3 × 4 = 12 (HIGH)
```

---

## Quick Test Scenarios

### Test 1: Login as user-action-owner-1

```
Expected Risks: 1, 3
Actions to Complete:
- Cyber Security Breach Risk
- Data Privacy Incident Risk
```

### Test 2: Login as user-action-owner-2

```
Expected Risks: 2, 4
Actions to Complete:
- Regulatory Compliance Risk
- Business Continuity Risk
```

### Test 3: Submit Findings

```
1. Click "Submit Findings" on Risk 1
2. Fill ActionFindingsDialog
3. See status change to PENDING_REVIEW
4. Check /dashboard/actions/risk-demo
```

### Test 4: View Complete Workflow

```
1. Go to /dashboard/actions/risk-demo
2. See all findings across all statuses
3. View completed examples with assessments
4. View pending review waiting for assessment
5. View revision needed with detailed feedback
```

---

## File Locations

**Mock Data Definition**:

- Location: `app/_actions/risk-module-actions.ts`
- Lines: 357-453 (mockRisks) and 456-556 (mockActionFindings)

**Actions Page with New Filter**:

- Location: `app/dashboard/(modules)/risks/actions/page.tsx`
- Line: 16 (risk_action_owner_id filter)

**getRisks with Mock Filtering**:

- Location: `app/_actions/risk-module-actions.ts`
- Lines: 935-989 (getRisks function with filtering)

**Type Definitions**:

- Location: `app/_actions/risk-module-actions.ts`
- Lines: 87 (risk_action_owner_id field) and 150 (RiskQueryParams)

## Working Paper Flow

### ISO 27001:2022 Audit Flow

```
1. Create Audit Plan
         │
         ├──> Select Working Paper Template
         │    (e.g., ISO 27001:2022)
         │
         ├──> Define Audit Details:
         │    - Ref No
         │    - Audit Date
         │    - Audit Area
         │    - Audit Scope
         │    - Audit Team
         │
         ▼
2. Submit for Review ────> Auto-create Working Paper
         │                  from selected template
         │
         │ POST /working-papers/from-template
         │ {audit_plan_id, template_id}
         │
         ▼
3. Working Paper Created: Users will link the created workpapers to the audit plan
         │
         ├──> Includes all categories from template:
         │    - Context of the Organisation
         │    - Leadership
         │    - Planning
         │    - Support
         │    - Operation
         │    - Performance Evaluation
         │    - Improvement
         │    - Organisational Controls
         │    - People Controls
         │    - Physical Controls
         │    - Technological Controls
         │
         ▼
4. Conduct Audit per Category
         │
         └──> For each category:
              │
              ├──> Review Objectives
              │
              ├──> Check Scope
              │
              ├──> Obtain Documents
              │
              ├──> Apply Sampling Methodology
              │
              ├──> Execute Audit Procedure
              │
              └──> Record Findings
         │
         ▼
5. Record Findings
         │
         ├──> Finding Number
         │
         ├──> Workings and Test Results
         │
         ├──> Conclusion
         │
         └──> Report (Yes/No) ──> Include in final report?
         │
         ▼
6. Review and Approve
         │
         ├──> Prepared By: Auditor
         │
         └──> Reviewed By: Lead Auditor
         │
         ▼
7. Generate Audit Report
         │
         └──> Filter findings marked for Report
              and compile final audit report
```

### Working Paper Category Structure

```
Category: "Context of the Organisation"
│
├─> Objectives:
│   "Review organisation's determination of external and
│    internal issues relevant to ISMS"
│
├─> Scope:
│   "ISO 27001:2022 clauses 4.1, 4.2, 4.3, and 4.4"
│
├─> Documents Obtained:
│   "From: Infratel Management
│    Title: ISMS Policy Documents"
│
├─> Source Documents:
│   "Title: ISO 27001:2022 Standard
│    Date: 2022
│    Format: Hard copy / Electronic"
│
├─> Sample Size:
│   "All relevant documentation"
│
├─> Frequency of Control:
│   "Annual review"
│
├─> Sampling Methodology:
│   "Document review and interviews"
│
└─> Audit Procedure:
    "1. Review context documentation
     2. Interview management
     3. Verify scope definition
     4. Assess interested parties analysis"
```

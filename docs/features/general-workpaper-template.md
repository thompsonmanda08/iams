# General Work Paper Template (B.1.1.2)

## Overview

The General Work Paper (B.1.1.2) template provides a comprehensive, flexible format for documenting detailed audit procedures, transaction testing, and evidence collection. This template features a dynamic evidence grid with customizable tick marks for systematic audit testing procedures.

## Feature Implementation Date

January 2025

## Template Structure

### Header Information
- **Company**: INFRATEL INTERNAL AUDIT (pre-filled)
- **Process Under Review**: Text input describing the process being audited
- **Prepared By**: Team member selector
- **Preparation Date**: Date picker
- **Reviewed By**: Optional reviewer selector
- **Review Date**: Optional date picker

### Work Documentation Sections

1. **Work Done** (Required)
   - Rich text area for documenting audit procedures performed
   - Evidence examination details
   - Testing methodology description

2. **Matters Arising** (Optional)
   - Issues and concerns identified
   - Follow-up items
   - Areas requiring attention

3. **Conclusion** (Optional)
   - Summary of findings
   - Audit opinion
   - Key takeaways

### Evidence & Testing Grid

Dynamic table with the following structure:

**Standard Columns:**
- Row number
- Source (e.g., Invoice, Contract)
- Document Date
- Description/Reference
- Posting Sequence
- Batch-Entry
- Debits (numeric with auto-totals)
- Credits (numeric with auto-totals)
- Audit Observation
- Audit Comment
- Actions (duplicate/delete row)

**Dynamic Tick Mark Columns:**
- Configurable selection from 26 predefined tick marks
- Checkboxes for each selected tick mark
- Tooltip descriptions on hover
- Grouped by category

## Tick Mark System

### Available Tick Marks (26 Total)

#### Contract Management
- **A**: Valid signed contract verification
- **K**: Contract terms and conditions compliance review

#### Authorization
- **B**: Service Provisioning Form (SPF) authorization check
- **P**: Approval and authorization workflow validation

#### Order Processing
- **C**: Legitimate order review and validation

#### Period Validation
- **D**: Cut-off testing for period-end transactions

#### Service Delivery
- **E**: Service specification verification against delivery

#### System Controls
- **F**: System log validation and audit trail review

#### Financial Accuracy
- **G**: Invoice recomputation and mathematical accuracy check
- **L**: Payment status and collection verification
- **Q**: Reconciliation to general ledger
- **R**: Recalculation of amounts and rates

#### Process Controls
- **H**: Walk-through testing of process flow

#### Compliance
- **I**: IFRS 15 revenue recognition compliance testing

#### Evidence Verification
- **J**: Vouching to supporting documentation
- **X**: Cross-reference to other audit evidence

#### Adjustments
- **M**: Credit notes evaluation and authorization

#### Tax Compliance
- **N**: Credit notes VAT impact assessment
- **W**: Withholding tax calculation verification

#### Access Controls
- **O**: Segregation of duties verification

#### Sampling
- **S**: Sample selection for testing

#### Transaction Flow
- **T**: Tracing transaction from source to final record

#### Exception Testing
- **U**: Unusual or exceptional items investigation

#### External Verification
- **V**: Verification with third-party confirmation

#### Analytical Review
- **Y**: Year-over-year comparison and trend analysis

#### Data Validation
- **Z**: Zero balance or null transaction verification

### Pre-configured Tick Mark Sets

**Revenue Testing (Default)**
- A, B, C, D, E, F, G, H, I, K, L, M, N

**Expenditure Testing**
- A, B, F, G, J, O, P, Q, R

**Financial Testing**
- G, J, Q, R, T, V

## Key Features

### 1. **Dynamic Evidence Grid**
- **Add/Delete Rows**: Unlimited row capacity
- **Duplicate Rows**: Quick copying of existing entries
- **Inline Editing**: All fields editable directly in grid
- **Auto-calculations**: Automatic totals for Debits, Credits, and Difference

### 2. **Tick Mark Configuration**
- **Modal Configuration Dialog**: Select which tick marks to display
- **Category Grouping**: Tick marks organized by audit category
- **Dynamic Columns**: Grid adjusts based on selected tick marks
- **Tooltip Descriptions**: Hover over tick mark codes for full descriptions

### 3. **Financial Tracking**
- **Debits Column**: Numeric input with decimal support
- **Credits Column**: Numeric input with decimal support
- **Real-time Totals**: Automatic calculation and display
- **Difference Calculation**: Visual indicator with color coding

### 4. **Evidence Management**
- **Source Documentation**: Track evidence source
- **Date Tracking**: Document date recording
- **Reference Numbers**: Posting sequence and batch entry fields
- **Observations**: Per-row audit observations
- **Comments**: Detailed audit comments per row

### 5. **Form Validation**
- Required Fields:
  - Process Under Review
  - Prepared By
  - Work Done
  - At least one evidence row

## Technical Architecture

### Components

#### Main Components
1. **`GeneralWorkpaperForm`** ([general-workpaper-form.tsx](../../components/audit/general-workpaper-form.tsx))
   - Main form orchestrator
   - Handles header information
   - Manages work documentation sections
   - Coordinates with evidence grid

2. **`EvidenceGrid`** ([evidence-grid.tsx](../../components/audit/evidence-grid.tsx))
   - Dynamic table management
   - Tick mark configuration
   - Row CRUD operations
   - Calculations and totals

3. **`TickMarkConfigDialog`** (within evidence-grid.tsx)
   - Modal for tick mark selection
   - Category-based display
   - Multi-select functionality

### Data Structures

#### Type Definitions
```typescript
interface EvidenceRow {
  id: string;
  source: string;
  documentDate?: Date;
  description: string;
  postingSequence?: string;
  batchEntry?: string;
  debits?: number;
  credits?: number;
  tickMarks: Record<string, boolean>;
  auditObservation?: string;
  auditComment?: string;
  attachments?: EvidenceInput[];
}

interface GeneralWorkpaper {
  id: string;
  auditId: string;
  auditTitle: string;
  processUnderReview: string;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  workDone: string;
  mattersArising?: string;
  conclusion?: string;
  evidenceRows: EvidenceRow[];
  selectedTickMarks: string[];
  status: 'draft' | 'in-review' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Tick Marks Data
**Location**: [lib/data/tick-marks.ts](../../lib/data/tick-marks.ts)

Comprehensive library of 26 standardized audit tick marks with:
- Code (A-Z)
- Description
- Category classification
- Helper functions for filtering and selection

## User Workflow

### Creating a General Workpaper

1. **Navigate to Workpapers**
   - Go to `/dashboard/audit/workpapers`
   - Click "Create Workpaper"

2. **Select Audit Plan**
   - Choose the target audit from dropdown

3. **Choose Template**
   - Select "General Work Paper (B.1.1.2)" template
   - View template features and benefits

4. **Fill Header Information**
   - Enter process under review
   - Confirm prepared by (auto-filled)
   - Set preparation date
   - Optional: Select reviewer and review date

5. **Document Work Performed**
   - **Work Done**: Describe all audit procedures executed
   - **Matters Arising**: Note any issues or concerns
   - **Conclusion**: Summarize findings and opinion

6. **Configure Tick Marks**
   - Click "Configure Tick Marks" button
   - Select relevant tick marks for your testing
   - Apply changes to update grid columns

7. **Add Evidence Rows**
   - Click "Add Row" to create entries
   - Fill in source, date, and description
   - Enter financial amounts (debits/credits)
   - Check applicable tick marks
   - Add observations and comments
   - Duplicate rows for similar entries

8. **Review Totals**
   - Check auto-calculated debits total
   - Verify credits total
   - Review difference calculation

9. **Submit or Save Draft**
   - Click "Create General Workpaper" to submit
   - Or "Save Draft" to save progress

### Configuring Tick Marks

1. **Open Configuration**
   - Click "Configure Tick Marks" in evidence grid header
   - View current selection count

2. **Select Tick Marks**
   - Browse by category
   - Check/uncheck desired tick marks
   - View full descriptions

3. **Apply Changes**
   - Click "Apply Changes"
   - Grid columns update automatically
   - All rows updated with new tick mark fields

## Use Cases

### 1. Revenue Transaction Testing
**Process**: Revenue Recognition Process

**Selected Tick Marks**: A, B, C, D, E, F, G, H, I, K, L, M, N

**Evidence Rows Example**:
- Source: Customer Invoice
- Document Date: 2025-01-15
- Description: Service Invoice #INV-2025-001
- Debits: 5,000.00
- Tick Marks: A (✓), B (✓), G (✓), I (✓), L (✓)
- Observation: Contract verified, SPF authorized
- Comment: Revenue recognition criteria met

### 2. Expenditure Testing
**Process**: Purchase and Payments Process

**Selected Tick Marks**: A, B, F, G, J, O, P, Q, R

**Evidence Rows Example**:
- Source: Supplier Invoice
- Document Date: 2025-01-10
- Description: Equipment Purchase PO-2025-045
- Credits: 12,500.00
- Tick Marks: J (✓), P (✓), Q (✓), R (✓)
- Observation: Properly authorized and vouched
- Comment: Amounts reconcile to GL

### 3. Financial Statement Testing
**Process**: Year-End Financial Close

**Selected Tick Marks**: G, J, Q, R, T, V

**Evidence Rows Example**:
- Source: Bank Statement
- Document Date: 2024-12-31
- Description: Cash balance reconciliation
- Debits: 150,000.00
- Tick Marks: Q (✓), V (✓)
- Observation: Bank confirmation received
- Comment: Reconciling items immaterial

## Integration with Workpaper System

### Template Selection Flow

```
Create Workpaper
    ↓
Select Audit Plan
    ↓
Choose Template:
    ├─→ ISO 27001 Clause Template
    └─→ General Work Paper (B.1.1.2) ← This template
           ↓
    Fill Header Information
           ↓
    Document Work Performed
           ↓
    Configure Tick Marks
           ↓
    Add Evidence Rows
           ↓
    Submit/Save
```

### Data Flow

```
User Input → Form State → Validation → Backend API
                ↓
        Evidence Grid State
                ↓
        Auto-calculations
                ↓
        Real-time Totals
```

## Responsive Design

### Desktop (>1024px)
- Full-width evidence grid
- All columns visible
- Horizontal scrolling if many tick marks selected

### Tablet (768-1023px)
- Responsive table with horizontal scroll
- Sticky row numbers and actions
- Touch-optimized controls

### Mobile (<768px)
- Vertical stacking of form sections
- Evidence grid with horizontal scroll
- Mobile-optimized tick mark selection
- Touch-friendly row actions

## Accessibility

- **Keyboard Navigation**: Full keyboard support for grid navigation
- **Screen Readers**: ARIA labels on all grid cells and controls
- **Focus Management**: Proper focus indicators and tab order
- **Tooltips**: Accessible tick mark descriptions
- **Error Announcements**: Screen reader announcements for validation

## Performance Optimizations

- **Virtual Scrolling**: Planned for grids with 100+ rows
- **Debounced Input**: Auto-save debouncing for large evidence sets
- **Memoization**: React.memo for row components
- **Lazy Loading**: Load tick mark descriptions on demand

## Future Enhancements

### Planned Features
1. **File Attachments**: Per-row evidence file uploads
2. **Formulaic Calculations**: Custom formulas for complex calculations
3. **Template Presets**: Save tick mark configurations as templates
4. **Bulk Operations**: Mass update tick marks across rows
5. **Export to Excel**: Export grid maintaining format
6. **Import from Excel**: Bulk import evidence rows
7. **Audit Trail**: Track all changes to evidence rows
8. **Comments Thread**: Collaborative commenting on rows
9. **Row Grouping**: Group related evidence rows
10. **Advanced Filters**: Filter and sort evidence grid

### Backend Integration Checklist
- [ ] Create `general_workpapers` table
- [ ] Create `evidence_rows` table
- [ ] Create `evidence_tick_marks` junction table
- [ ] Implement CRUD API endpoints
- [ ] Add file upload support for row attachments
- [ ] Implement audit trail logging
- [ ] Add export to Excel endpoint
- [ ] Add import from Excel endpoint

## Comparison: ISO 27001 vs General Template

| Feature | ISO 27001 Template | General Template (B.1.1.2) |
|---------|-------------------|---------------------------|
| **Use Case** | Compliance audits | Transaction testing |
| **Structure** | Clause-based | Evidence grid-based |
| **Templates** | Pre-configured clauses | Customizable tick marks |
| **Evidence** | File uploads | Detailed grid entries |
| **Financial Data** | No | Yes (debits/credits) |
| **Test Results** | Conformity levels | Tick mark checks |
| **Flexibility** | Template-driven | Highly customizable |
| **Best For** | ISO 27001 audits | Financial/operational audits |

## Best Practices

### 1. **Tick Mark Selection**
- Choose only relevant tick marks for your audit
- Keep selection under 10 marks for readability
- Use category-based grouping for organization

### 2. **Evidence Documentation**
- Be specific in descriptions
- Include complete reference numbers
- Document source clearly
- Add observations inline

### 3. **Work Documentation**
- Write clear, concise procedures
- Use bullet points for readability
- Reference evidence rows by number
- Document exceptions thoroughly

### 4. **Grid Management**
- Add rows progressively
- Use duplicate for similar entries
- Review totals regularly
- Validate before submission

### 5. **Review Process**
- Assign reviewers promptly
- Document review comments
- Track resolution of matters arising
- Maintain audit trail

## Troubleshooting

### Common Issues

**Issue**: Grid columns too narrow
- **Solution**: Adjust browser zoom or use horizontal scroll
- **Check**: Reduce number of selected tick marks

**Issue**: Totals not calculating
- **Solution**: Ensure numeric values in debits/credits
- **Check**: Remove any non-numeric characters

**Issue**: Can't add more rows
- **Solution**: Scroll to bottom and click "Add Row"
- **Check**: Browser console for any errors

**Issue**: Tick marks not saving
- **Solution**: Apply changes in configuration dialog
- **Check**: Refresh page to verify persistence

## Security Considerations

- **Input Validation**: All grid inputs sanitized
- **XSS Prevention**: Textarea content escaped
- **Numeric Validation**: Debits/credits validated as numbers
- **File Upload**: (Future) Size and type restrictions
- **Access Control**: Only authorized users can edit

## Success Metrics

### Usage Metrics
- Number of general workpapers created per month
- Average evidence rows per workpaper
- Most commonly used tick marks
- Average completion time

### Quality Metrics
- Validation error rate
- Review completion rate
- Evidence comprehensiveness score
- User satisfaction rating

## Support & Maintenance

### Monitoring
- Track grid performance with many rows
- Monitor calculation accuracy
- Log tick mark usage patterns
- Track user feedback

### Maintenance Tasks
- Regular review of tick mark library
- Performance optimization for large grids
- User feedback incorporation
- Template updates and improvements

---

**Last Updated**: January 2025
**Template ID**: B.1.1.2
**Feature Status**: ✅ Implemented
**Version**: 1.0.0

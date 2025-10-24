# Custom Workpaper Template System

## Overview

The Custom Template System allows users to create their own reusable workpaper templates tailored to specific audit processes, industries, or organizational needs. This provides maximum flexibility alongside the standard ISO 27001 and General Work Paper templates.

## Feature Implementation Date

January 2025

## Key Capabilities

### 1. **Template Creation**
- Build custom templates with unlimited sections
- Add various field types to each section
- Configure optional evidence grid integration
- Share templates with team members
- Reuse across multiple audits

### 2. **Flexible Field Types**

**Supported Field Types:**
1. **Text** - Single-line text input
2. **Textarea** - Multi-line text input
3. **Number** - Numeric input with decimal support
4. **Date** - Date picker
5. **Select** - Dropdown with custom options
6. **Checkbox** - Boolean on/off toggle
7. **File** - File upload input

### 3. **Template Configuration**

**Core Metadata:**
- Template Name
- Description
- Visibility (Private or Team-shared)

**Optional Features:**
- Include Evidence Grid (with debits/credits tracking)
- Include Tick Marks (26 predefined marks)
- Default Tick Mark Selection

### 4. **Section-Based Structure**

Each template consists of multiple sections:
- Section Title
- Section Description (optional)
- Ordered list of fields
- Drag-and-drop reordering

## Template Builder Interface

### Main Form

```
┌─────────────────────────────────────────────────────────┐
│ Create Custom Template                                  │
├─────────────────────────────────────────────────────────┤
│ Template Information                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Name: * [IT Security Assessment Template      ]    │ │
│ │ Description: * [Comprehensive IT security...]  │ │
│ │ Share with Team: [Toggle]                          │ │
│ │                                                     │ │
│ │ Additional Features:                                │ │
│ │ Include Evidence Grid: [Toggle]                     │ │
│ │  └─ Include Tick Marks: [Toggle]                   │ │
│ │      └─ Default Marks: [A][B][C][G]...             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Template Sections                [+ Add Section]        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [≡] Section 1: Scope & Objectives          [×]     │ │
│ │     Fields (2)                    [+ Add Field]     │ │
│ │     ┌───────────────────────────────────────────┐   │ │
│ │     │ Label: Assessment Scope                   │   │ │
│ │     │ Type: [Textarea ▼]  Placeholder: Describe...│ │
│ │     │ Required: [*]                      [×]    │   │ │
│ │     └───────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                             [Cancel] [Create Template]  │
└─────────────────────────────────────────────────────────┘
```

## User Workflows

### Creating a Custom Template

1. **Access Template Builder**
   - Navigate to Workpapers
   - Click "Create Workpaper"
   - Select "Create Custom Template"

2. **Configure Template Metadata**
   - Enter template name (e.g., "IT Security Assessment")
   - Write description
   - Choose sharing options (private or team-shared)

3. **Add Optional Features**
   - Toggle "Include Evidence Grid" if needed
   - If enabled, toggle "Include Tick Marks"
   - Select default tick marks (optional)

4. **Build Template Structure**
   - Click "Add Section"
   - Enter section title and description
   - Click "Add Field" within section
   - Configure each field:
     - Label (display name)
     - Type (text, textarea, number, etc.)
     - Placeholder text
     - Required/Optional toggle
     - Options (for select fields)

5. **Save Template**
   - Review all sections and fields
   - Click "Create Template"
   - Template becomes immediately available

### Using a Custom Template

1. **Select Template**
   - Navigate to Workpapers
   - Click "Create Workpaper"
   - Choose audit plan
   - Select custom template from "Your Custom Templates"

2. **Fill Template Form**
   - Complete assignment (Prepared By/Date, Reviewed By/Date)
   - Fill all custom fields in each section
   - If evidence grid included, add evidence rows
   - Configure tick marks if enabled

3. **Submit Workpaper**
   - Validate all required fields
   - Click "Create Workpaper"

## Use Cases & Examples

### Example 1: IT Security Assessment Template

**Template Configuration:**
- **Name**: IT Security Assessment
- **Description**: Comprehensive IT security controls testing
- **Evidence Grid**: No
- **Sections**: 3

**Section 1: Scope & Objectives**
- Assessment Scope (textarea, required)
- Risk Level (select: Low/Medium/High/Critical, required)
- Assessment Date (date, required)

**Section 2: Controls Testing**
- Access Control Review (textarea, required)
- Authentication Mechanisms (text, optional)
- Encryption Standards (select, required)
- Vulnerability Scan Completed (checkbox, required)

**Section 3: Findings & Recommendations**
- Key Findings (textarea, required)
- Risk Rating (select: Low/Medium/High/Critical, required)
- Recommendations (textarea, required)
- Follow-up Required (checkbox, optional)

### Example 2: Vendor Risk Assessment Template

**Template Configuration:**
- **Name**: Vendor Risk Assessment
- **Description**: Third-party vendor risk evaluation
- **Evidence Grid**: Yes (with tick marks)
- **Default Tick Marks**: A, B, J, P, V

**Section 1: Vendor Information**
- Vendor Name (text, required)
- Service Type (select: Cloud/SaaS/Consulting/Other, required)
- Contract Value (number, required)
- Contract Start Date (date, required)

**Section 2: Risk Evaluation**
- Data Access Level (select: None/Limited/Moderate/Extensive, required)
- Compliance Certifications (textarea, optional)
- Security Posture (select: Strong/Adequate/Weak, required)
- Previous Issues (textarea, optional)

**Section 3: Due Diligence Evidence**
- Evidence Grid (included)
- Document reviews, certifications, audit reports tracked in grid

### Example 3: Compliance Checklist Template

**Template Configuration:**
- **Name**: GDPR Compliance Checklist
- **Description**: Data protection compliance verification
- **Evidence Grid**: No

**Section 1: Data Processing**
- Lawful Basis Documented (checkbox, required)
- Data Minimization Applied (checkbox, required)
- Purpose Limitation Defined (checkbox, required)
- Data Retention Policy (textarea, required)

**Section 2: Rights Management**
- Right to Access Implemented (checkbox, required)
- Right to Erasure Implemented (checkbox, required)
- Right to Portability Implemented (checkbox, required)
- Consent Management (textarea, required)

**Section 3: Security Measures**
- Encryption in Transit (checkbox, required)
- Encryption at Rest (checkbox, required)
- Access Controls (textarea, required)
- Incident Response Plan (text, required)

## Technical Architecture

### Type Definitions

```typescript
interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  type: CustomTemplateType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;

  includeEvidenceGrid?: boolean;
  includeTickMarks?: boolean;
  defaultTickMarks?: string[];

  sections: CustomTemplateSection[];

  usageCount?: number;
  lastUsed?: Date;
}

interface CustomTemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: CustomField[];
  order: number;
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  defaultValue?: string | number | boolean;
  order: number;
}

interface CustomWorkpaper {
  id: string;
  auditId: string;
  templateId: string;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;

  fieldValues: Record<string, any>; // Dynamic field values
  evidenceRows?: EvidenceRow[];
  selectedTickMarks?: string[];

  status: 'draft' | 'in-review' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Components

**1. CustomTemplateBuilder** ([custom-template-builder.tsx](../../components/audit/custom-template-builder.tsx))
- Template metadata form
- Section management (add/edit/delete)
- Field management (add/edit/delete/reorder)
- Evidence grid configuration
- Tick mark selection
- Validation and submission

**2. CustomWorkpaperForm** ([custom-workpaper-form.tsx](../../components/audit/custom-workpaper-form.tsx))
- Dynamic form rendering from template
- Field type rendering (text, textarea, number, date, select, checkbox, file)
- Assignment fields (Prepared By/Date, Reviewed By/Date)
- Optional evidence grid integration
- Validation based on field requirements
- Form submission

**3. Template Selection Integration** ([workpapers-page-client.tsx](../../components/audit/workpapers-page-client.tsx))
- Template library display
- "Create Custom Template" option
- Template usage statistics
- Team/private badge display

## Template Library Features

### Template Management

**View Templates:**
- Grid/list view of all custom templates
- Filter by creator, visibility, usage
- Search by name or description
- Sort by name, date, usage count

**Template Actions:**
- Edit template
- Duplicate template
- Delete template
- Share/unshare with team
- View usage history

### Template Statistics

**Usage Metrics:**
- Number of times used
- Last used date
- Users who have used template
- Average completion time

**Template Health:**
- Field completion rate
- Error/validation failure rate
- User feedback/ratings

## Best Practices

### Template Design

1. **Clear Naming**
   - Use descriptive, specific names
   - Include audit type or process in name
   - Avoid generic terms

2. **Organized Sections**
   - Group related fields together
   - Use logical ordering
   - Add section descriptions for clarity

3. **Field Configuration**
   - Make only essential fields required
   - Provide helpful placeholders
   - Use appropriate field types

4. **Select Field Options**
   - Keep option lists concise (3-7 items ideal)
   - Use clear, mutually exclusive options
   - Order by frequency or importance

5. **Evidence Grid Usage**
   - Include only for transaction/financial testing
   - Pre-select relevant tick marks
   - Keep tick mark count reasonable (5-10)

### Template Maintenance

1. **Regular Review**
   - Update based on user feedback
   - Remove unused templates
   - Consolidate similar templates

2. **Version Control**
   - Document template changes
   - Notify users of updates
   - Maintain backward compatibility

3. **Governance**
   - Establish approval process for team templates
   - Define naming conventions
   - Set retention policies

## Validation & Error Handling

### Template Builder Validation

**Required Validations:**
- Template name must not be empty
- Description must not be empty
- At least one section required
- Each section must have a title
- Each section must have at least one field
- Each field must have a label
- Select fields must have options

**Warnings:**
- Too many sections (>10)
- Too many fields per section (>15)
- Very long field labels
- Missing placeholders for text fields

### Workpaper Form Validation

**Validation Rules:**
- All required fields must be filled
- Number fields must contain valid numbers
- Date fields must contain valid dates
- Select fields must have a selected value
- If evidence grid included, at least one row required

**Error Display:**
- Inline field errors
- Summary error at top
- Scroll to first error
- Disable submit until resolved

## Data Flow

```
Template Creation
    ↓
Template Builder Form
    ↓
Validation
    ↓
Save to Database
    ↓
Add to Template Library


Template Usage
    ↓
Select Custom Template
    ↓
Render Dynamic Form
    ↓
User Fills Fields
    ↓
Validation
    ↓
Create Custom Workpaper
    ↓
Save with Field Values
```

## Integration Points

### With ISO 27001 Templates
- Users can switch between template types
- Custom templates can complement ISO clauses
- Evidence can reference ISO controls

### With General Work Paper
- Custom templates can include evidence grid
- Tick mark system fully integrated
- Financial testing capabilities available

### With Audit Plans
- Templates filter by audit type
- Usage tracked per audit
- Templates can be audit-specific

## Future Enhancements

### Planned Features
1. **Template Marketplace** - Share templates across organizations
2. **Template Versioning** - Track changes and rollback
3. **Conditional Logic** - Show/hide fields based on other values
4. **Calculated Fields** - Auto-calculate values from other fields
5. **Field Groups** - Repeatable field sets
6. **Template Import/Export** - JSON format for backup/sharing
7. **Template Analytics** - Advanced usage analytics
8. **AI Suggestions** - AI-assisted template building
9. **Template Categories** - Organize by industry/process
10. **Template Preview** - See template without creating workpaper

### Backend Integration Checklist
- [ ] Create `custom_templates` table
- [ ] Create `custom_template_sections` table
- [ ] Create `custom_template_fields` table
- [ ] Create `custom_workpapers` table
- [ ] Create `custom_workpaper_field_values` table
- [ ] Implement template CRUD APIs
- [ ] Implement workpaper creation from template API
- [ ] Add template sharing/permissions logic
- [ ] Implement template usage tracking
- [ ] Add template search and filtering

## Security Considerations

**Access Control:**
- Private templates visible only to creator
- Team templates visible to all team members
- Admin can view/edit all templates
- Workpapers inherit template permissions

**Data Validation:**
- Server-side validation of all field values
- Sanitize user input (especially textarea)
- File upload size and type restrictions
- XSS prevention in dynamic form rendering

**Audit Trail:**
- Log template creation/modification
- Track who uses which templates
- Record field value changes
- Monitor template sharing events

## Performance Considerations

**Template Rendering:**
- Lazy load template sections
- Virtualize long field lists
- Debounce field value updates
- Cache rendered forms

**Template Library:**
- Paginate template list
- Index by name, creator, date
- Cache template metadata
- Lazy load full template data

## Success Metrics

### Adoption Metrics
- Number of custom templates created
- Percentage of workpapers using custom templates
- Number of team-shared templates
- Average template reuse count

### Quality Metrics
- Template completion rate
- Field completion rate
- Error rate per template
- User satisfaction score

### Usage Metrics
- Most used templates
- Most active template creators
- Templates per user
- Template update frequency

---

**Last Updated**: January 2025
**Feature Status**: ✅ Implemented
**Version**: 1.0.0

# Audit Flow Update - Implementation Log

## Overview
This document tracks the implementation of the updated audit flow as specified in `audit_flow_update.md`. The new flow introduces template-driven workpaper generation with dynamic category selection.

**Implementation Date**: Started 2025-10-25
**Status**: In Progress

---

## Changes Implemented

### 1. Data Model Updates ✅

**File**: `lib/types/audit-types.ts`

#### New Type Definitions Added:

- **`TemplateCategoryGroup`**: Enum for category grouping
  ```typescript
  type TemplateCategoryGroup = 'main-clauses' | 'annex-a-controls';
  ```

- **`WorkpaperStatus`**: Enum for workpaper lifecycle
  ```typescript
  type WorkpaperStatus = 'unlinked' | 'linked' | 'in-progress' | 'completed';
  ```

- **`TemplateCategory`**: Interface defining a template category
  - Contains: id, name, displayName, clauses, clauseRange, group, objectives, scope, auditProcedure, description, isRequired

- **`WorkpaperTemplateDefinition`**: Interface for complete template definition
  - Contains: id, name, description, categories[], version, timestamps

#### Updated Interfaces:

**`AuditStatus`**:
- Added: `'draft'` and `'under-review'` status types
- Now: `'draft' | 'under-review' | 'planned' | 'in-progress' | 'completed' | 'cancelled'`

**`AuditPlan`**:
- Added fields:
  - `templateId?: string` - Reference to selected template
  - `templateName?: string` - Display name of template
  - `selectedCategories?: string[]` - Array of selected category IDs
  - `workpaperIds?: string[]` - Array of auto-generated workpaper IDs

**`AuditPlanInput`**:
- Added fields:
  - `templateId?: string`
  - `selectedCategories?: string[]`

**`Workpaper`**:
- Added fields:
  - `categoryId?: string` - Reference to template category
  - `category?: string` - Category name
  - `scope?: string` - Audit scope from template
  - `documentsObtained?: string` - Documents obtained during audit
  - `sourceDocuments?: string` - Source documents reviewed
  - `sampleSize?: string` - Sample size for testing
  - `controlFrequency?: string` - Frequency of control execution
  - `samplingMethodology?: string` - Sampling methodology used
  - `status?: WorkpaperStatus` - Workpaper status

**`WorkpaperInput`**:
- Added same fields as `Workpaper` above

**`Finding`**:
- Added fields:
  - `findingNumber?: string` - Auto-generated finding number
  - `includeInReport: boolean` - Flag for report inclusion
  - `workingsAndTestResults?: string` - Detailed test results
  - `conclusion?: string` - Finding conclusion

**`FindingInput`**:
- Added fields:
  - `includeInReport?: boolean`
  - `findingNumber?: string`
  - `workingsAndTestResults?: string`
  - `conclusion?: string`

---

### 2. ISO 27001:2022 Template Definition ✅

**File**: `lib/templates/iso27001-2022-template.ts` (NEW)

Created comprehensive template definition with **11 categories**:

#### Main Clauses (7 categories):
1. **Context of the Organisation** (4.1-4.4)
2. **Leadership** (5.1-5.3)
3. **Planning** (6.1-6.3)
4. **Support** (7.1-7.5)
5. **Operation** (8.1-8.3)
6. **Performance Evaluation** (9.1-9.3)
7. **Improvement** (10.1-10.2)

#### Annex A Controls (4 categories):
8. **Organisational Controls** (A.5.1-5.37) - 37 controls
9. **People Controls** (A.6.1-6.8) - 8 controls
10. **Physical Controls** (A.7.1-7.14) - 14 controls
11. **Technological Controls** (A.8.1-8.34) - 34 controls

Each category includes:
- Unique ID
- Display name with clause range
- Objectives
- Scope (detailed ISO clause references)
- Pre-defined audit procedures
- Description
- Group classification (main-clauses or annex-a-controls)

**Utility Functions Provided**:
- `getAvailableTemplates()` - Get all templates
- `getTemplateById(id)` - Get specific template
- `getTemplateCategoriesById(templateId)` - Get categories for template
- `getCategoryById(templateId, categoryId)` - Get specific category

---

### 3. Template Service ✅

**File**: `lib/services/template-service.ts` (NEW)

Created centralized service for template management with the following methods:

#### Core Methods:
- `getAvailableTemplates()` - Returns all available templates
- `getTemplate(templateId)` - Get specific template by ID
- `getTemplateCategories(templateId)` - Get all categories for a template
- `getCategoryById(templateId, categoryId)` - Get specific category
- `getCategoriesByIds(templateId, categoryIds[])` - Get multiple categories

#### Validation:
- `validateCategorySelection(templateId, selectedCategories[])` - Validates:
  - Template exists
  - At least one category selected
  - All selected categories exist in template
  - Required categories are included
  - Returns: `{ valid: boolean, errors: string[] }`

#### Utility Methods:
- `getTemplateSummary(templateId)` - Returns summary statistics
- `getCategoriesGrouped(templateId)` - Groups categories by type
- `searchCategories(templateId, searchTerm)` - Search categories
- `getRecommendedCategories(templateId)` - Get recommended selection
- `getCategoryCountByGroup(templateId, group)` - Count by group
- `hasRequiredCategories(templateId)` - Check if template has required categories
- `getISO27001Template()` - Direct access to ISO 27001 template

#### Helper Functions:
- `formatCategoryDisplayName(category)` - Format display name
- `getCategoryClauseDisplay(category)` - Format clause range
- `getGroupDisplayName(group)` - Get group display name

---

### 4. Category Selector Component ✅

**File**: `components/audit/category-selector.tsx` (NEW)

Interactive component for selecting template categories with features:

#### Features:
- **Select All/Deselect All** toggle
- **Select Recommended** button
- **Category Grouping** by main clauses and Annex A controls
- **Selection Counter** badge showing X of Y selected
- **Expandable Category Details** with:
  - Description
  - Scope
  - Objectives
  - Audit Procedures
  - ISO Clause references
- **Required Category Protection** - Cannot deselect required categories
- **Visual Feedback** - Selected categories highlighted with border
- **Responsive Design** - Mobile-friendly layout

#### Props:
```typescript
{
  templateId: string;
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  disabled?: boolean;
  showRecommended?: boolean;
}
```

---

### 5. Template Selector Component ✅

**File**: `components/audit/template-selector-simple.tsx` (NEW)

Simple radio group selector for choosing audit template:

#### Features:
- **Radio Group Selection** - Single template selection
- **Template Cards** with:
  - Template name and version badge
  - Description
  - Statistics (total categories, main clauses, control groups)
  - Visual selection indicator (checkmark)
- **Auto-selection** - Automatically selects first template if none chosen
- **Hover Effects** - Interactive card highlighting

#### Props:
```typescript
{
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
}
```

---

### 6. Audit Plan Creation Page Update ✅

**File**: `app/dashboard/(modules)/audit/plans/new/page.tsx`

Completely refactored to multi-step form with 3 steps:

#### Step 1: Basic Details
- Audit title, standard, scope, objectives
- Start date, end date
- Team leader, team members
- Validation before proceeding to next step

#### Step 2: Template Selection
- Uses `TemplateSelectorSimple` component
- Shows available templates (currently ISO 27001:2022)
- Auto-selects first template
- Resets category selection when template changes

#### Step 3: Category Selection
- Uses `CategorySelector` component
- Dynamic based on selected template
- Select All / Select Recommended options
- Shows selection count
- Validates minimum one category selected

#### UI Enhancements:
- **Progress Indicator** - Visual stepper showing current step
- **Step Icons** - Calendar, FileText, CheckCircle2
- **Completed Step Indicators** - Checkmarks for completed steps
- **Progress Bar** - Connecting line between steps
- **Navigation Buttons**:
  - Previous (appears from step 2 onwards)
  - Next (for steps 1-2)
  - Create Audit Plan (final step)
  - Cancel (all steps)

#### Form State Management:
```typescript
{
  title, standard, scope, objectives,
  startDate, endDate,
  teamLeader, teamMembers,
  templateId, selectedCategories[]
}
```

#### Validation:
- Step 1: All required fields must be filled
- Step 2: Template must be selected
- Step 3: At least one category must be selected
- Toast notifications for validation errors

#### Submission:
- Creates audit plan with template and category data
- Shows success message with workpaper count
- Redirects to audit plans list

---

## Files Created

1. `lib/templates/iso27001-2022-template.ts` - ISO 27001:2022 template definition
2. `lib/services/template-service.ts` - Template management service
3. `components/audit/category-selector.tsx` - Category selection UI component
4. `components/audit/template-selector-simple.tsx` - Template selection UI component
5. `docs/features/audit/implementation_log.md` - This file

---

## Files Modified

1. `lib/types/audit-types.ts` - Added new types and updated existing interfaces
2. `app/dashboard/(modules)/audit/plans/new/page.tsx` - Converted to multi-step form

---

## Next Steps (Pending Implementation)

### 7. Server Actions Update
**File**: `app/_actions/audit-module-actions.ts`

Need to implement:
- `submitAuditPlanForReview(auditPlanId)` - Submit audit plan for review
- `createWorkpapersFromTemplate(auditPlanId, templateId, selectedCategoryIds[])` - Auto-create workpapers
- Update `createAuditPlan()` to accept templateId and selectedCategories
- Update `getAuditPlan()` to return template and category data

### 8. Audit Plan Detail Page Update
**File**: `app/dashboard/(modules)/audit/plans/[id]/page.tsx`

Need to add:
- Display selected template name
- Show selected categories as badges
- "Submit for Review" button (visible when status is 'draft')
- "Linked Workpapers" section showing auto-created workpapers
- Workpaper count display

### 9. Workpaper Forms Update
**Files**:
- `components/audit/create-workpaper-form.tsx`
- `components/audit/general-workpaper-form.tsx`

Need to add fields for:
- Documents Obtained (textarea)
- Source Documents (textarea)
- Sample Size (text input)
- Frequency of Control (text input)
- Sampling Methodology (textarea)
- Display category information (read-only)

### 10. Finding Dialog Update
**File**: `components/audit/finding-dialog.tsx`

Need to add:
- "Include in Report" checkbox/toggle
- Finding Number field
- Workings and Test Results textarea
- Conclusion textarea

### 11. Report Generation
**New File**: `app/dashboard/(modules)/audit/plans/[id]/report/page.tsx`

Need to create:
- Report preview UI
- Filter findings by `includeInReport` flag
- Export to PDF functionality
- Print functionality

---

## Testing Checklist

- [ ] Create new audit plan with template selection
- [ ] Select all categories and verify
- [ ] Select individual categories and verify
- [ ] Use "Select Recommended" button
- [ ] Navigate between steps (Previous/Next)
- [ ] Validation errors display correctly
- [ ] Form submission creates audit plan with correct data
- [ ] Template service methods return correct data
- [ ] Category selector expands/collapses correctly
- [ ] Multi-step progress indicator updates correctly

---

## Dependencies

### New Dependencies:
None - All components use existing UI library components

### UI Components Used:
- `components/ui/button`
- `components/ui/card`
- `components/ui/checkbox`
- `components/ui/label`
- `components/ui/badge`
- `components/ui/radio-group`
- `components/ui/separator`
- `components/ui/alert`
- `components/ui/input`
- `components/ui/textarea`
- `components/ui/select`

### Icons Used (lucide-react):
- `Calendar`, `Users`, `FileText`, `CheckCircle2`
- `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ChevronUp`
- `ArrowLeft`, `Info`

---

## Breaking Changes

### Backward Compatibility:
- Existing audit plans without `templateId` will continue to work
- Existing workpapers without category fields will function normally
- The system gracefully handles missing template data

### Migration Notes:
- No database migration required (all new fields are optional)
- Existing forms will need to be updated to pass new fields
- Consider adding default template for existing audit plans if needed

---

## Performance Considerations

- Template data is loaded from static imports (no API calls)
- Category selection uses controlled components (React state)
- Form validation is synchronous (no async calls during validation)
- Template service methods are pure functions (no side effects)

---

## Known Issues/Limitations

None at this stage.

---

## Future Enhancements

1. **Custom Templates**: Allow users to create custom templates
2. **Template Versioning**: Support multiple versions of same template
3. **Category Dependencies**: Define relationships between categories
4. **Bulk Category Actions**: Add/remove categories to existing audit plans
5. **Template Import/Export**: Share templates between systems
6. **Category Recommendations**: AI-based category suggestions based on audit scope
7. **Template Analytics**: Track which categories are most commonly used

---

## References

- [Audit Flow Update Documentation](./audit_flow_update.md)
- [ISO 27001:2022 Standard](https://www.iso.org/standard/27001)
- [Audit Types Documentation](../../lib/types/audit-types.ts)

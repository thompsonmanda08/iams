# Memo Feature Documentation

## Overview

The memo feature is a comprehensive system for creating, managing, and exporting audit memos within the IAMS application. It includes both backend template management and client-side fallback templates to ensure users can always create memos, even when the backend is unavailable.

The feature uses a **backend-first, client-side fallback** approach:
1. The system attempts to load templates from the backend
2. If the backend fails or returns no templates, it falls back to client-side templates
3. Users can select from available templates to quickly create professionally formatted memos

## Architecture

### Frontend Components

#### 1. **TipTapEditor Component** (`components/tiptap-editor.tsx`)
Rich text editor component built on TipTap 2.27.1 with the following features:

**Supported Extensions:**
- `StarterKit` - Basic text formatting (Bold, Italic, Headings 2-4, Lists)
- `Placeholder` - Placeholder text when editor is empty
- `TextAlign` - Text alignment (left, center, right)
- `Image` - Image insertion with base64 support for self-contained content

**Image Configuration:**
```typescript
Image.configure({
  inline: false,
  allowBase64: true,
  HTMLAttributes: {
    class: 'tiptap-image',
    draggable: true,
    contenteditable: false
  }
})
```

**Toolbar Features:**
- Text formatting: Bold, Italic, Heading 2, Heading 3
- Lists: Bullet list, Ordered list
- Alignment: Left, Center, Right
- Image insertion: From file upload or URL
- Image sizing:
  - Preset buttons: Full (100%), 75%, 50%
  - Custom percentage input field
  - All images capped at max-width: 300px

**HTML Content Handling:**
- Uses `editor.commands.setContent()` for proper HTML parsing
- Content updates via `initialContent` prop trigger useEffect to parse HTML
- Supports inline styles for:
  - Margins and indentation (`margin-left`)
  - Text alignment (`text-align: center`)
  - Custom sizing

**CSS Styling:**
- Custom typography without Tailwind prose classes to avoid specificity conflicts
- Supports inline margin-left for indentation (20px, 40px, 60px levels)
- Enforces center alignment on elements with `text-align: center`
- Image hover effects with blue highlight border

#### 2. **CreateOrUpdateMemo Component** (`app/dashboard/(modules)/audit/plans/_components/create-a-memo.tsx`)

Main component managing the memo creation and editing workflow.

**State Management:**
```typescript
const [memoTitle, setMemoTitle] = useState("");           // Memo subject
const [memoContent, setMemoContent] = useState("");       // HTML content
const [isEditing, setIsEditing] = useState(false);        // Edit mode toggle
const [selectedTemplateId, setSelectedTemplateId] = useState("");
const [showTemplateSelector, setShowTemplateSelector] = useState(false);
const [templateLoadError, setTemplateLoadError] = useState(false);  // Backend fallback flag
const [showValidation, setShowValidation] = useState(false);        // Validation on save
```

**Key Functions:**

1. **handleUseTemplate()** - Attempts to load template from backend, falls back to client templates
```typescript
const handleUseTemplate = async () => {
  try {
    // Attempt backend template load
    const response = await fetch(`/api/audit-plans/${auditPlanId}/memo-template`);
    if (!response.ok) throw new Error("No backend template");
    // Use backend template...
  } catch (error) {
    // Fall back to client-side templates
    setTemplateLoadError(true);
    setShowTemplateSelector(true);
  }
};
```

2. **handleLoadClientTemplate(templateId)** - Loads template from `lib/memo-templates.ts`
```typescript
const handleLoadClientTemplate = (templateId: string) => {
  const template = getTemplateById(templateId);
  if (template) {
    setMemoContent(template.html);
    setShowTemplateSelector(false);
  }
};
```

3. **handleSave()** - Saves memo with validation
- Sets `showValidation = true` to display field errors
- Validates memo subject is not empty
- Validates memo content is not empty
- Calls mutation to save to backend

**Validation:**
- Memo Subject: Required field with real-time error display
- Memo Content: Required, validated on save attempt
- Shows error messages below subject field
- Persists validation state until fields are filled

**Dialog Flow:**
- Uses Dialog component for modal presentation
- Close button closes the entire modal
- Cancel button in editor (TipTapEditor) closes both editor and modal
- Edit button (on draft memos) toggles editing mode

#### 3. **Memo Templates Library** (`lib/memo-templates.ts`)

Client-side template system with 4 professional templates.

**Template Structure:**
```typescript
export interface MemoTemplate {
  id: string;                                    // Unique identifier
  name: string;                                  // Display name
  description: string;                           // Brief description
  category: "opening" | "interim" | "closing";   // Template category
  html: string;                                  // Full HTML content
}
```

**Available Templates:**

1. **Opening Memorandum - ISMS Audit** (`opening_isms_audit`)
   - Category: opening
   - Purpose: Initial audit notification
   - Sections: Objectives, Scope, Access Control, Authentication & Authorization, Data Protection, Security Configuration, Code Review, Logging & Monitoring, Incident Response, Physical Security, Asset Management, Vendor Management, Audit Team

2. **Interim Memorandum - Findings Summary** (`interim_findings`)
   - Category: interim
   - Purpose: Mid-audit findings communication
   - Sections: Executive Summary, Key Findings, Risk Assessment, Recommendations, Next Steps

3. **Closing Memorandum - Final Audit Report** (`closing_audit`)
   - Category: closing
   - Purpose: Final audit results
   - Sections: Executive Summary, Detailed Findings, Risk Summary, Management Responses, Conclusion

4. **Generic Professional Memo** (`generic_memo`)
   - Category: interim (flexible use)
   - Purpose: General purpose memo
   - Sections: TO/CC/FROM/DATE/SUBJECT header, customizable content areas

**Template Features (All Templates):**

**Header Section:**
```html
<div style="text-align: center; margin-bottom: 30px;">
  <img src="/images/infratel-logo.png" alt="Company Logo"
       style="width: 5%; height: auto; display: block; margin: 0 auto; max-width: 300px;">
</div>

<div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #333; padding-bottom: 15px;">
  <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">ORGANIZATION NAME</p>
  <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">INTERNAL AUDIT AND RISK</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 1</p>
  <p style="margin: 5px 0; font-size: 11px;">Address Line 2</p>
</div>
```

**Memo Header:**
- TO field with placeholder: `[RECIPIENT NAME/TITLE]`
- CC field with placeholders for multiple recipients
- FROM field: `[AUDIT TEAM HEAD - TITLE]`
- DATE field: `[DATE]`
- SUBJECT field with specific audit type

**Indentation Levels:**
- Level 1: `margin-left: 20px;` - Primary sub-items
- Level 2: `margin-left: 40px;` - Secondary items
- Level 3: `margin-left: 60px;` - Tertiary items

**Section Headings:**
- Style: Bold, underlined with `text-decoration: underline`
- Always center-aligned with `text-align: center !important;`

**Tables (where applicable):**
```html
<table style="width: 100%; border-collapse: collapse; margin: 15px 40px;">
  <tr style="background-color: #f5f5f5;">
    <th style="border: 1px solid #ddd; padding: 8px;">Header</th>
    <th style="border: 1px solid #ddd; padding: 8px;">Header</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">Data</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Data</td>
  </tr>
</table>
```

**Logo Image:**
- Source: `/images/infratel-logo.png`
- Default width: 5% of container
- Max-width constraint: 300px
- Users can resize using editor's image sizing controls
- Resizable to: Full (100%), 75%, 50%, or custom percentage

**Helper Functions:**
```typescript
export function getAllTemplates(): MemoTemplate[]          // Get all templates
export function getTemplateById(id: string): MemoTemplate  // Get by ID
export function getTemplatesByCategory(category: string)   // Get by category
export function getTemplateOptionsGrouped(): GroupedOption[] // Grouped for UI
```

## Memo Export Functionality (`lib/utils/memo-export.ts`)

The memo feature supports exporting in multiple formats:

**Supported Formats:**
1. **HTML** - Copy to clipboard as raw HTML
2. **HTML File** - Download as .html file
3. **PDF** - Generate PDF using `@react-pdf/renderer`
4. **Word Document** - Generate .docx using `html-docx-js`

**Export Functions:**
```typescript
export async function copyHtmlToClipboard(html: string): Promise<void>
export async function downloadHtmlAsFile(html: string, filename: string): Promise<void>
export async function generateMemoPdf(html: string, filename: string): Promise<void>
export async function generateMemoDocx(html: string, filename: string): Promise<void>
```

## API Integration

### Backend Template Endpoint

**Endpoint:** `GET /api/audit-plans/{auditPlanId}/memo-template`

**Response Format (Expected):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "opening" | "interim" | "closing",
  "html": "string (full HTML content)"
}
```

**Success Handling:**
- If backend returns a template, it is used
- Alert shown: "Template loaded successfully from audit plan. Customize it as needed."

**Failure Handling (Fallback to Client Templates):**
- If HTTP request fails (network error, timeout, 500 error)
- If response is not OK (404, 403, etc.)
- If response body is empty/null
- Alert shown: "Backend template unavailable. Choose from pre-built templates instead."
- Template selector appears with client-side templates

**No Template Handling:**
- If backend succeeds but returns no template data
- Template selector appears with client-side templates

### Save Memo Endpoint

**Endpoint:** `POST/PUT /api/audit-plans/{auditPlanId}/memos`

**Request Format:**
```json
{
  "subject": "string",
  "content": "string (HTML)",
  "status": "DRAFT" | "SENT" | "other",
  "use_template": boolean
}
```

**Response Format (Expected):**
```json
{
  "id": "string",
  "subject": "string",
  "content": "string",
  "status": "string",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## Data Flow

### Creating a New Memo

```
User clicks "Create Memo" button
  ↓
Dialog opens
  ↓
User can optionally "Load Template from Audit Plan"
  ↓
System attempts backend template load
  ├─→ Success: Display template content in editor
  │
  └─→ Failure: Show client-side template selector
      ↓
      User selects from grouped templates:
      - Opening (opening_isms_audit)
      - Interim (interim_findings, generic_memo)
      - Closing (closing_audit)
  ↓
Template HTML loaded into TipTapEditor
  ↓
User edits memo:
  - Changes placeholders (RECIPIENT, DATE, etc.)
  - Adds/removes content
  - Inserts images (file or URL)
  - Resizes images (preset or custom %)
  ↓
User enters memo subject
  ↓
User clicks "Save Changes"
  ↓
Validation:
  - Subject required ✓
  - Content required ✓
  ↓
API POST/PUT to backend with HTML content
  ↓
Memo saved to database
```

### Editing an Existing Memo

```
User clicks "Edit Memo" on existing draft
  ↓
Dialog opens with memo data
  ↓
User clicks "Edit" button in dialog footer
  ↓
TipTapEditor becomes editable
  ↓
User makes changes
  ↓
User clicks "Save Changes"
  ↓
Validation runs
  ↓
API PUT to update memo
  ↓
Memo updated
```

### Exporting a Memo

```
User clicks "Export" dropdown (on sent memos)
  ├─→ Copy HTML - Copies raw HTML to clipboard
  ├─→ Download HTML - Downloads as .html file
  ├─→ Download PDF - Generates PDF with styling
  └─→ Download Word - Generates .docx with formatting
```

## Styling & Formatting

### Editor CSS Rules

The TipTapEditor applies the following CSS rules to preserve template formatting:

**Base Styling:**
- Font: System fonts (Arial, Segoe UI, etc.)
- Line height: 1.6
- Paragraph margin: 1em 0
- Heading 2: 1.5em, bold
- Heading 3: 1.17em, bold
- Lists: 1em margin, 2em padding-left

**Indentation Support:**
- Elements with `margin-left` inline styles respect the value
- CSS rule: `.tiptap p[style*="margin-left"]` uses `margin-left: unset` to allow inline values
- Supports 20px, 40px, 60px indentation from templates

**Center Alignment:**
- All elements with `text-align: center` style are forced to remain centered
- CSS rule: `.tiptap [style*="text-align: center"]` with `!important` flag
- Ensures headers stay centered even with selection

**Image Styling:**
- Max-width: 300px (enforced globally)
- Height: auto (maintains aspect ratio)
- Margin: 1rem auto (centered with spacing)
- Border: 2px transparent (shown on hover)
- Hover effect: Blue border and shadow
- Cursor changes to grab/grabbing on interact

## Template Placeholders

All templates include placeholder text that users should customize:

**Common Placeholders:**
- `[RECIPIENT NAME/TITLE]` - Audit recipient
- `[CC LIST - Name/Title]` - CC recipients
- `[Additional CC Recipients]` - More CC entries
- `[AUDIT TEAM HEAD - TITLE]` - From field
- `[DATE]` - Date of memo
- `[START DATE]` and `[END DATE]` - Audit period
- `[AUDITOR NAME]` - Individual auditor names
- `[ORGANIZATION NAME]` - Company name
- `INTERNAL AUDIT AND RISK` - Department (customizable)
- `Address Line 1` and `Address Line 2` - Location info

**Template-Specific Placeholders:**
- In opening memo: Audit scope and objectives are pre-filled
- In interim memo: Finding categories and risk levels
- In closing memo: Management response areas

## File Structure

```
infratel-iams-web-app/
├── components/
│   └── tiptap-editor.tsx                    # Rich text editor component
│
├── lib/
│   ├── memo-templates.ts                    # Client-side templates
│   └── utils/
│       └── memo-export.ts                   # Export utilities
│
├── app/dashboard/(modules)/audit/plans/
│   └── _components/
│       └── create-a-memo.tsx                # Main memo component
│
├── hooks/
│   ├── use-audit-queries.ts                 # Fetch hooks (useAuditMemo, useMemoTemplate)
│   └── use-audit-mutations.ts               # Mutation hooks (useMemoCreateOrUpdateMutation, etc.)
│
└── public/images/
    └── infratel-logo.png                    # Company logo
```

## Package Dependencies

**Required npm packages:**
- `@tiptap/react@^2.27.1` - React TipTap wrapper
- `@tiptap/core@^2.27.1` - Core editor
- `@tiptap/starter-kit@^2.27.1` - Basic extensions
- `@tiptap/extension-placeholder@^2.27.1` - Placeholder support
- `@tiptap/extension-text-align@^2.27.1` - Text alignment
- `@tiptap/extension-image@^2.27.1` - Image support
- `@react-pdf/renderer@^3.x` - PDF generation
- `html-docx-js@^0.3.x` - Word document generation

## Error Handling

### Template Loading Errors
- Network failures silently trigger fallback
- Validation error on save shows notification
- User-friendly alert messages in toast notifications

### Image Insertion Errors
- File upload validation (images only)
- URL validation (user-entered URLs)
- Base64 conversion for file uploads

### Save Errors
- Validation errors show field-specific messages
- Network errors show toast notification
- Mutation loading states prevent double-submit

## Testing Checklist

### Backend Integration Tests
- [ ] Verify GET `/api/audit-plans/{id}/memo-template` returns correct format
- [ ] Test fallback when backend template endpoint fails
- [ ] Test fallback when backend returns null/empty
- [ ] Verify POST/PUT memo save endpoint works with HTML content
- [ ] Test memo retrieval shows saved HTML correctly

### Frontend Feature Tests
- [ ] Load template from backend successfully
- [ ] Fallback to client templates on backend failure
- [ ] Select and load each of 4 client templates
- [ ] Edit template placeholders
- [ ] Insert images from file
- [ ] Insert images from URL
- [ ] Resize images with preset buttons
- [ ] Resize images with custom percentage
- [ ] Save memo with validation
- [ ] Export memo as HTML, PDF, Word
- [ ] Edit existing memo
- [ ] Cancel button closes modal
- [ ] Memo formatting preserved after save/load

## Backend Implementation Notes

### For Backend Developers

1. **Template Endpoint Requirements:**
   - Must return HTML as string (not escaped)
   - HTML should be valid and parseable by TipTap
   - Support multiple templates per audit plan if needed
   - Consider caching to avoid repeated queries

2. **Memo Save/Update:**
   - Accept raw HTML in content field
   - Sanitize/validate HTML before storage (XSS prevention)
   - Store subject and content separately
   - Maintain audit trail of memo changes
   - Support memo status tracking (DRAFT, SENT, etc.)

3. **Memo Retrieval:**
   - Return stored HTML as-is (unsanitized, ready for editor)
   - Include metadata (status, created date, updated date)
   - Support pagination if listing multiple memos

4. **Security Considerations:**
   - Validate user has access to audit plan
   - Validate user can create/edit memos
   - Sanitize HTML on storage or display layer
   - Consider CSP policies for base64 images
   - Audit log memo creation/modification events

## Future Enhancements

Potential features for future development:
- [ ] Memo templates management UI (create custom templates)
- [ ] Collaboration/comments on memos
- [ ] Memo versioning/revision history
- [ ] Email memo directly to recipients
- [ ] Scheduled memo sending
- [ ] Memo templates with conditional sections
- [ ] Auto-fill from audit data (auditor names, dates, etc.)
- [ ] Memo signatures/approvals workflow
- [ ] Template variables/macros system
- [ ] RTL language support

# Audit Module Documentation

**Version**: 2.0
**Last Updated**: January 2025
**Status**: Production Ready (Mock Data)

---

## Quick Links

- **[📘 Complete Implementation Guide](./audit-module-complete-guide.md)** - Comprehensive end-to-end documentation
- **[📊 Implementation Gap Analysis](./IMPLEMENTATION-GAP-ANALYSIS.md)** - Current vs. Expected state

---

## Overview

The Audit Module is a comprehensive ISO 27001:2022 compliant internal audit management system for INFRATEL IAMS. It manages the complete audit lifecycle from planning through execution, findings tracking, and reporting.

### Core Features

✅ **Audit Plans** - Create and manage audit engagements
✅ **Workpapers** - Three template types (ISO 27001, General B.1.1.2, Custom)
✅ **Findings** - Track non-conformities with workpaper linkage
✅ **Evidence Management** - File upload and attachment support
✅ **Draft Auto-Save** - 30-second intervals with localStorage persistence
✅ **Analytics & Reporting** - Real-time metrics and conformity tracking

### Recent Updates (v2.0)

🆕 **Workpaper-Finding Linkage** - Complete audit trail from workpaper to finding
🆕 **Evidence Row Tracking** - Link findings to specific evidence rows in general workpapers
🆕 **Source Type Tracking** - Identify finding source (workpaper, manual, external)
🆕 **Auto-Finding Creation** - Prompt when non-conformity detected in workpapers
🆕 **Enhanced Tables** - Workpapers show finding count, findings show source

---

## Documentation Structure

### Primary Documentation

**[audit-module-complete-guide.md](./audit-module-complete-guide.md)**
*The single source of truth for the audit module*

Covers:
1. Overview & Architecture
2. Data Model & Type Definitions
3. API Endpoints Reference (Expected)
4. Frontend Structure
5. Feature Workflows (with workpaper-finding integration)
6. Component Library
7. State Management (TanStack Query + Zustand)
8. Integration Guide (Backend migration)
9. Deployment & Production

---

## Quick Start

### For Developers

1. **Read the Complete Guide**: Start with [audit-module-complete-guide.md](./audit-module-complete-guide.md)
2. **Check Implementation Status**: Review [IMPLEMENTATION-GAP-ANALYSIS.md](./IMPLEMENTATION-GAP-ANALYSIS.md)
3. **Run the Application**:
   ```bash
   npm install
   npm run dev
   ```
4. **Navigate to**: `http://localhost:3000/dashboard/audit`

### For Backend Integration

The module is currently using mock data in server actions (`app/_actions/audit-module-actions.ts`).

**To integrate with a real backend:**
1. Review **Section 9 (Integration Guide)** in the complete guide
2. Implement the API endpoints listed in **Section 4**
3. Replace mock data calls with actual API calls
4. Configure file storage (AWS S3 / Azure Blob)
5. Update environment variables

See: [Complete Guide - Section 9: Integration Guide](./audit-module-complete-guide.md#9-integration-guide)

---

## Current Implementation Status

### ✅ Completed Features

- [x] Audit Plans (CRUD operations)
- [x] ISO 27001 Workpapers with clause templates
- [x] General Work Paper (B.1.1.2) with evidence grid and 26 tick marks
- [x] Custom Template System (builder + usage)
- [x] Findings Management with workpaper linkage
- [x] Evidence Upload (file handling)
- [x] Draft Auto-Save (Zustand + localStorage)
- [x] TanStack Query integration
- [x] Complete type definitions
- [x] Responsive UI with shadcn/ui

### 🚧 Pending Backend Integration

- [ ] Real API endpoints (currently mock data)
- [ ] File storage (S3/Azure Blob)
- [ ] Authentication & Authorization
- [ ] Database persistence
- [ ] Email notifications
- [ ] Report generation (PDF)

### 📋 Known Gaps

See [IMPLEMENTATION-GAP-ANALYSIS.md](./IMPLEMENTATION-GAP-ANALYSIS.md) for detailed gap analysis.

---

## File Locations

### Pages
```
app/dashboard/
├── audit/
│   ├── page.tsx                      # Dashboard overview
│   ├── plans/
│   │   ├── page.tsx                  # Plans list
│   │   ├── new/page.tsx              # Create plan
│   │   └── [id]/page.tsx             # Plan details (tabs)
│   ├── workpapers/
│   │   └── page.tsx                  # Workpapers list
│   ├── findings/
│   │   └── page.tsx                  # Findings list
│   └── reports/
│       └── page.tsx                  # Reports & analytics
```

### Components
```
components/audit/
├── audit-plans-table.tsx             # Plans table
├── audit-metrics-cards.tsx           # Dashboard metrics
├── create-workpaper-form.tsx         # ISO 27001 form ✨
├── general-workpaper-form.tsx        # General B.1.1.2 form ✨
├── custom-workpaper-form.tsx         # Custom template instance
├── custom-template-builder.tsx       # Template builder ✨
├── evidence-grid.tsx                 # Testing grid with tick marks ✨
├── evidence-upload.tsx               # File upload
├── create-finding-modal.tsx          # Finding creation ✨
├── findings-table.tsx                # Findings display ✨
├── workpapers-table.tsx              # Workpapers display ✨
└── workpapers-page-client.tsx        # Main workpaper orchestration
```
✨ = Includes workpaper-finding integration

### Core Files
```
lib/
├── types/audit-types.ts              # All TypeScript interfaces
├── data/tick-marks.ts                # 26 audit tick marks
├── utils/audit-utils.ts              # Utility functions
hooks/
└── use-audit-query-data.ts           # TanStack Query hooks
store/
└── useWorkpaperDraftStore.ts         # Zustand draft store
app/_actions/
└── audit-module-actions.ts           # Server actions (mock data)
```

---

## Key Workflows

### 1. Audit Lifecycle

```
Create Audit Plan
    ↓
Create Workpapers (choose template)
    ↓
Execute Testing (upload evidence, apply tick marks)
    ↓
Detect Non-Conformity
    ↓
Create Finding (auto-linked to workpaper) ✨ NEW
    ↓
Assign Corrective Actions
    ↓
Track Remediation
    ↓
Generate Reports
```

### 2. Workpaper → Finding Flow ✨ NEW

```
User creates workpaper with non-conformity result
    ↓
Yellow alert: "Non-Conformity Detected"
    ↓
Submit workpaper (saves with ID: wp-123)
    ↓
Modal opens: "Create Finding from Workpaper"
    ↓
Form pre-filled with:
  - Clause (auto)
  - Severity (auto-set based on result)
  - Description (from conclusion/results)
  - Workpaper ID (wp-123)
    ↓
Finding created with linkage
    ↓
Workpaper shows "1 Finding" badge
Finding shows workpaper source link
```

See: [Complete Guide - Section 6.2: Workpaper → Finding Workflow](./audit-module-complete-guide.md#62-workpaper--finding-workflow-new)

---

## Technology Stack

- **Framework**: Next.js 15.3 (App Router)
- **Language**: TypeScript 5
- **UI**: React 18 + shadcn/ui + Tailwind CSS
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Data Fetching**: Server Actions (→ API)
- **File Upload**: Multipart form data (→ S3/Azure)

---

## Support & Resources

### Documentation
- [Complete Implementation Guide](./audit-module-complete-guide.md)
- [Gap Analysis](./IMPLEMENTATION-GAP-ANALYSIS.md)

### External Resources
- [ISO 27001:2022 Standard](https://www.iso.org/standard/27001)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)

### Previous Documentation (Archived)
All previous documentation has been consolidated into the complete guide:
- ~~01-architecture.md~~ → Sections 1-2 of complete guide
- ~~02-implementation-guide.md~~ → Sections 5-7 of complete guide
- ~~03-development-patterns.md~~ → Section 7 of complete guide
- ~~04-api-integration.md~~ → Section 4 of complete guide
- ~~05-component-library.md~~ → Section 8 of complete guide
- ~~audit-workpaper-creation.md~~ → Section 6.1 of complete guide
- ~~general-workpaper-template.md~~ → Section 6.1 of complete guide
- ~~custom-template-system.md~~ → Section 6.3 of complete guide

---

**Last Documentation Update**: January 2025
**Module Version**: 2.0 (Workpaper-Finding Integration)
**Production Status**: Ready for Backend Integration

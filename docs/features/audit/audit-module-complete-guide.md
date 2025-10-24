# Audit Module - Frontend Implementation Guide

**Version**: 1.0  
**Last Updated**: January 2025  
**Target**: Next.js 15.3 with App Router

---

## Table of Contents

1. [Overview](#overview)
2. [Core Entities](#core-entities)
3. [Technology Stack](#technology-stack)
4. [File Structure](#file-structure)
5. [Type Definitions](#type-definitions)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Component Architecture](#component-architecture)
9. [Features Implementation](#features-implementation)
10. [Production Readiness Checklist](#production-readiness-checklist)

---

## Overview

The Audit Module manages the complete audit lifecycle for ISO 27001 compliance audits. It consists of three interconnected entities:

- **Audit Plans**: Top-level containers for audit engagements
- **Workpapers**: Detailed testing documentation linked to audit plans
- **Findings**: Issues discovered during audits, tracked for remediation

### Key Features
- Dashboard with real-time metrics
- Multiple workpaper templates (ISO 27001, General, Custom)
- Dynamic evidence grids with 26 tick marks
- Findings management with severity tracking
- Draft auto-save (30-second intervals)
- Real-time validation
- Responsive design (desktop/tablet/mobile)

---

## Core Entities

### Audit Plan
**Purpose**: Represents a complete audit engagement

**Key Attributes**:
- Title, Scope, Objectives
- Start/End Dates
- Status (Planning, In Progress, Completed, Cancelled)
- Assigned Auditor(s)
- Progress tracking

**Relationships**: 
- One Audit Plan → Many Workpapers
- One Audit Plan → Many Findings

### Workpaper
**Purpose**: Document testing procedures, evidence, and results

**Types**:
1. **ISO 27001 Clause Template**: Standard compliance testing
2. **General Work Paper (B.1.1.2)**: Transaction testing with evidence grid
3. **Custom Template**: User-defined reusable templates

**Key Attributes**:
- Linked Audit Plan
- Clause/Process information
- Objectives, Test Procedures, Results
- Evidence attachments
- Test Result (Conformity/Partial/Non-Conformity)
- Prepared By/Reviewed By

**Relationships**:
- Each Workpaper → One Audit Plan
- One Workpaper → Many Findings

### Finding
**Purpose**: Document issues for remediation tracking

**Key Attributes**:
- Title, Description, Reference Code
- Risk Level (High, Medium, Low)
- Severity (Critical, High, Medium, Low)
- Status (Open, In Remediation, Closed)
- Due Date, Assigned Owner
- Linked Workpaper

---

## Technology Stack

### Core Dependencies
```json
{
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "zod": "^3.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "lucide-react": "^0.x",
  "date-fns": "^3.x",
  "recharts": "^2.x"
}
```

### UI Components
- **Radix UI**: Accessible primitives
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library

### State Management Strategy
- **TanStack Query**: Server state (data fetching, caching)
- **Zustand**: UI state (drafts, filters, modals)
- **React Hook Form**: Form state
- **localStorage**: Draft persistence

---

## File Structure

```
app/
├── dashboard/
│   ├── audit/
│   │   ├── _components/          # Shared audit components
│   │   │   ├── audit-card.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── conformity-badge.tsx
│   │   │   ├── severity-badge.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── ...
│   │   ├── plans/
│   │   │   ├── page.tsx          # Plans list page
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Plan detail page with tabs
│   │   │   │   └── _components/
│   │   │   │       ├── overview-tab.tsx
│   │   │   │       ├── workpapers-tab.tsx
│   │   │   │       ├── findings-tab.tsx
│   │   │   │       ├── create-finding-dialog.tsx
│   │   │   │       ├── findings-list.tsx
│   │   │   │       └── finding-card.tsx
│   │   │   └── _components/
│   │   │       ├── plans-page-client.tsx
│   │   │       ├── create-audit-plan-form.tsx
│   │   │       ├── audit-plans-table.tsx
│   │   │       └── ...
│   │   └── workpapers/
│   │       ├── page.tsx          # Workpapers list page
│   │       ├── [id]/
│   │       │   └── page.tsx      # Workpaper detail page
│   │       └── _components/
│   │           ├── workpapers-page-client.tsx
│   │           ├── create-workpaper-form.tsx
│   │           ├── general-workpaper-form.tsx
│   │           ├── custom-template-builder.tsx
│   │           ├── custom-workpaper-form.tsx
│   │           ├── template-selector.tsx
│   │           ├── evidence-grid.tsx
│   │           ├── evidence-upload.tsx
│   │           └── workpapers-table.tsx
│   └── home/
│       └── audit/
│           ├── page.tsx          # Audit dashboard
│           └── _components/
│               ├── dashboard-client.tsx
│               ├── metrics-cards.tsx
│               ├── charts.tsx
│               └── ...
├── _actions/
│   └── audit-module-actions.ts   # Server actions
└── api/
    └── audit/                    # Optional API routes (if needed)
├── _actions/
│   └── audit-module-actions.ts   # Server actions
└── api/
    └── audit/                    # Optional API routes (if needed)

lib/
├── types/
│   └── audit-types.ts            # All TypeScript types
├── utils/
│   └── audit-utils.ts            # Utility functions
├── stores/
│   └── audit-store.ts            # Zustand store
├── hooks/
│   └── use-audit-query-data.ts   # TanStack Query hooks
└── data/
    └── tick-marks.ts             # Tick mark definitions

public/
└── audit/
    └── templates/                # Template JSON files
        ├── iso-27001-clauses.json
        └── ...
```

---

## Type Definitions

### Core Types (`lib/types/audit-types.ts`)

```typescript
// ============================================
// ENUMS & UNIONS
// ============================================

export type AuditStatus = 'planning' | 'in-progress' | 'completed' | 'cancelled';
export type WorkpaperStatus = 'draft' | 'in-review' | 'completed';
export type FindingStatus = 'open' | 'in-remediation' | 'closed';
export type TestResult = 'conformity' | 'partial-conformity' | 'non-conformity';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type ClauseCategory = 
  | 'context' 
  | 'leadership' 
  | 'planning' 
  | 'support' 
  | 'operation' 
  | 'evaluation' 
  | 'improvement' 
  | 'annex-a';

export type EvidenceType = 
  | 'policy' 
  | 'screenshot' 
  | 'minutes' 
  | 'report' 
  | 'other';

export type TickMarkCategory = 
  | 'contract' 
  | 'authorization' 
  | 'order' 
  | 'period' 
  | 'service' 
  | 'system' 
  | 'financial' 
  | 'process' 
  | 'compliance' 
  | 'evidence' 
  | 'adjustment' 
  | 'tax' 
  | 'access' 
  | 'sampling' 
  | 'transaction' 
  | 'exception' 
  | 'external' 
  | 'analytical' 
  | 'data';

// ============================================
// AUDIT PLAN
// ============================================

export interface AuditPlan {
  id: string;
  title: string;
  scope: string;
  objectives: string;
  startDate: Date;
  endDate: Date;
  status: AuditStatus;
  assignedTo: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  progress?: number;
  workpaperCount?: number;
  findingsCount?: number;
  conformityRate?: number;
}

export interface AuditPlanInput {
  title: string;
  scope: string;
  objectives: string;
  startDate: Date;
  endDate: Date;
  assignedTo: string[];
}

// ============================================
// WORKPAPER
// ============================================

export interface Workpaper {
  id: string;
  auditId: string;
  auditTitle: string;
  templateType: 'iso27001' | 'general' | 'custom';
  
  // Common fields
  clause: string;
  clauseTitle?: string;
  objectives: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  conclusion?: string;
  
  // Evidence
  evidence: Evidence[];
  
  // Assignment
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  
  status: WorkpaperStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkpaperInput {
  auditId: string;
  templateType: 'iso27001' | 'general' | 'custom';
  clause: string;
  clauseTitle?: string;
  objectives: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  conclusion?: string;
  evidence?: EvidenceInput[];
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: EvidenceType;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface EvidenceInput {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: EvidenceType;
  file?: File;
}

// ============================================
// GENERAL WORKPAPER (B.1.1.2)
// ============================================

export interface GeneralWorkpaper extends Omit<Workpaper, 'templateType'> {
  templateType: 'general';
  processUnderReview: string;
  workDone: string;
  mattersArising?: string;
  evidenceRows: EvidenceRow[];
  selectedTickMarks: string[];
}

export interface EvidenceRow {
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

export interface TickMark {
  code: string;
  description: string;
  category: TickMarkCategory;
}

// ============================================
// CUSTOM TEMPLATE
// ============================================

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  type: 'custom';
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

export interface CustomTemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: CustomField[];
  order: number;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
  order: number;
}

export interface CustomWorkpaper extends Omit<Workpaper, 'templateType'> {
  templateType: 'custom';
  templateId: string;
  fieldValues: Record<string, any>;
  evidenceRows?: EvidenceRow[];
  selectedTickMarks?: string[];
}

// ============================================
// CLAUSE TEMPLATE
// ============================================

export interface ClauseTemplate {
  id: string;
  clause: string;
  clauseTitle: string;
  category: ClauseCategory;
  objective: string;
  testProcedure: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClauseTemplateInput {
  clause: string;
  clauseTitle: string;
  category: ClauseCategory;
  objective: string;
  testProcedure: string;
}

// ============================================
// FINDING
// ============================================

export interface Finding {
  id: string;
  referenceCode: string;
  auditId: string;
  auditTitle: string;
  workpaperId: string;
  
  title: string;
  description: string;
  severity: Severity;
  riskLevel: 'high' | 'medium' | 'low';
  status: FindingStatus;
  
  recommendation?: string;
  assignedTo?: string;
  dueDate?: Date;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  closedDate?: Date;
  
  // Relationships
  evidence?: Evidence[];
  comments?: Comment[];
}

export interface FindingInput {
  auditId: string;
  workpaperId: string;
  title: string;
  description: string;
  severity: Severity;
  riskLevel: 'high' | 'medium' | 'low';
  recommendation?: string;
  assignedTo?: string;
  dueDate?: Date;
}

// ============================================
// DRAFT STATE
// ============================================

export interface WorkpaperDraft {
  auditId: string;
  clause?: string;
  clauseTitle?: string;
  objectives?: string;
  testProcedures?: string;
  testResults?: string;
  testResult?: TestResult;
  conclusion?: string;
  evidence?: EvidenceInput[];
  preparedBy?: string;
  reviewedBy?: string;
  lastSaved?: Date;
}

// ============================================
// API RESPONSE
// ============================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export interface DashboardMetrics {
  totalAudits: number;
  activeAudits: number;
  completedAudits: number;
  totalWorkpapers: number;
  openFindings: number;
  criticalFindings: number;
  avgConformityRate: number;
  overdueFindings: number;
}

// ============================================
// FILTERS & SORTING
// ============================================

export interface AuditFilters {
  status?: AuditStatus[];
  assignedTo?: string[];
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface WorkpaperFilters {
  auditId?: string;
  status?: WorkpaperStatus[];
  testResult?: TestResult[];
  preparedBy?: string[];
  reviewedBy?: string[];
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface FindingFilters {
  auditId?: string;
  severity?: Severity[];
  status?: FindingStatus[];
  assignedTo?: string[];
  overdue?: boolean;
  dateRange?: { start: Date; end: Date };
  search?: string;
}
```

---

## State Management

### Zustand Store (`lib/stores/audit-store.ts`)

```typescript
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  WorkpaperDraft, 
  AuditFilters, 
  WorkpaperFilters, 
  FindingFilters 
} from '@/lib/types/audit-types';

interface AuditStore {
  // Draft Management
  workpaperDrafts: Record<string, WorkpaperDraft>;
  saveWorkpaperDraft: (auditId: string, draft: WorkpaperDraft) => void;
  getWorkpaperDraft: (auditId: string) => WorkpaperDraft | undefined;
  clearWorkpaperDraft: (auditId: string) => void;
  clearAllDrafts: () => void;
  
  // Filters
  auditFilters: AuditFilters;
  workpaperFilters: WorkpaperFilters;
  findingFilters: FindingFilters;
  setAuditFilters: (filters: AuditFilters) => void;
  setWorkpaperFilters: (filters: WorkpaperFilters) => void;
  setFindingFilters: (filters: FindingFilters) => void;
  clearFilters: () => void;
  
  // UI State
  selectedAuditId: string | null;
  setSelectedAuditId: (id: string | null) => void;
  
  // Dialog State
  isCreateAuditDialogOpen: boolean;
  isCreateWorkpaperDialogOpen: boolean;
  isCreateFindingDialogOpen: boolean;
  setCreateAuditDialogOpen: (open: boolean) => void;
  setCreateWorkpaperDialogOpen: (open: boolean) => void;
  setCreateFindingDialogOpen: (open: boolean) => void;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      // Initial State
      workpaperDrafts: {},
      auditFilters: {},
      workpaperFilters: {},
      findingFilters: {},
      selectedAuditId: null,
      isCreateAuditDialogOpen: false,
      isCreateWorkpaperDialogOpen: false,
      isCreateFindingDialogOpen: false,
      
      // Draft Actions
      saveWorkpaperDraft: (auditId, draft) => {
        set((state) => ({
          workpaperDrafts: {
            ...state.workpaperDrafts,
            [auditId]: { ...draft, lastSaved: new Date() }
          }
        }));
      },
      
      getWorkpaperDraft: (auditId) => {
        return get().workpaperDrafts[auditId];
      },
      
      clearWorkpaperDraft: (auditId) => {
        set((state) => {
          const { [auditId]: _, ...rest } = state.workpaperDrafts;
          return { workpaperDrafts: rest };
        });
      },
      
      clearAllDrafts: () => {
        set({ workpaperDrafts: {} });
      },
      
      // Filter Actions
      setAuditFilters: (filters) => {
        set({ auditFilters: filters });
      },
      
      setWorkpaperFilters: (filters) => {
        set({ workpaperFilters: filters });
      },
      
      setFindingFilters: (filters) => {
        set({ findingFilters: filters });
      },
      
      clearFilters: () => {
        set({
          auditFilters: {},
          workpaperFilters: {},
          findingFilters: {}
        });
      },
      
      // UI Actions
      setSelectedAuditId: (id) => {
        set({ selectedAuditId: id });
      },
      
      setCreateAuditDialogOpen: (open) => {
        set({ isCreateAuditDialogOpen: open });
      },
      
      setCreateWorkpaperDialogOpen: (open) => {
        set({ isCreateWorkpaperDialogOpen: open });
      },
      
      setCreateFindingDialogOpen: (open) => {
        set({ isCreateFindingDialogOpen: open });
      }
    }),
    {
      name: 'audit-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workpaperDrafts: state.workpaperDrafts,
        auditFilters: state.auditFilters,
        workpaperFilters: state.workpaperFilters,
        findingFilters: state.findingFilters
      })
    }
  )
);
```

---

## API Integration

### Server Actions (`app/_actions/audit-module-actions.ts`)

```typescript
'use server';

import type { APIResponse } from '@/lib/types/audit-types';

// ============================================
// AUDIT PLANS
// ============================================

export async function getAuditPlans(filters?: any): Promise<APIResponse> {
  // API: GET /api/audit-plans
  // Query Params: ?status=in-progress&assignedTo=userId&search=text
  return { success: true, data: [] };
}

export async function getAuditPlan(id: string): Promise<APIResponse> {
  // API: GET /api/audit-plans/[id]
  return { success: true, data: null };
}

export async function createAuditPlan(input: any): Promise<APIResponse> {
  // API: POST /api/audit-plans
  // Payload: { title, scope, objectives, startDate, endDate, assignedTo[] }
  return { success: true, data: null };
}

export async function updateAuditPlan(
  id: string, 
  data: Partial<any>
): Promise<APIResponse> {
  // API: PUT /api/audit-plans/[id]
  // Payload: { field: value }
  return { success: true, data: null };
}

export async function deleteAuditPlan(id: string): Promise<APIResponse> {
  // API: DELETE /api/audit-plans/[id]
  return { success: true, message: 'Audit plan deleted' };
}

// ============================================
// WORKPAPERS
// ============================================

export async function getWorkpapers(filters?: any): Promise<APIResponse> {
  // API: GET /api/workpapers
  // Query Params: ?auditId=id&status=draft&page=1&limit=20
  return { success: true, data: [] };
}

export async function getWorkpaper(id: string): Promise<APIResponse> {
  // API: GET /api/workpapers/[id]
  return { success: true, data: null };
}

export async function createWorkpaper(input: any): Promise<APIResponse> {
  // API: POST /api/workpapers
  // Payload: {
  //   auditId, templateType, clause, clauseTitle,
  //   objectives, testProcedures, testResults, testResult,
  //   conclusion, evidence[], preparedBy, preparedDate,
  //   reviewedBy?, reviewedDate?
  // }
  return { success: true, data: null };
}

export async function updateWorkpaper(
  id: string, 
  data: Partial<any>
): Promise<APIResponse> {
  // API: PUT /api/workpapers/[id]
  return { success: true, data: null };
}

export async function deleteWorkpaper(id: string): Promise<APIResponse> {
  // API: DELETE /api/workpapers/[id]
  return { success: true, message: 'Workpaper deleted' };
}

// ============================================
// CLAUSE TEMPLATES
// ============================================

export async function getClauseTemplates(
  category?: string
): Promise<APIResponse> {
  // API: GET /api/workpapers/clause-templates
  // Query Params: ?category=leadership
  return { success: true, data: [] };
}

export async function getClauseTemplate(id: string): Promise<APIResponse> {
  // API: GET /api/workpapers/clause-templates/[id]
  return { success: true, data: null };
}

export async function createClauseTemplate(input: any): Promise<APIResponse> {
  // API: POST /api/workpapers/clause-templates
  // Payload: { clause, clauseTitle, category, objective, testProcedure }
  return { success: true, data: null };
}

export async function updateClauseTemplate(
  id: string,
  data: Partial<any>
): Promise<APIResponse> {
  // API: PUT /api/workpapers/clause-templates/[id]
  return { success: true, data: null };
}

export async function deleteClauseTemplate(id: string): Promise<APIResponse> {
  // API: DELETE /api/workpapers/clause-templates/[id]
  return { success: true, message: 'Template deleted' };
}

// ============================================
// CUSTOM TEMPLATES
// ============================================

export async function getCustomTemplates(): Promise<APIResponse> {
  // API: GET /api/workpapers/custom-templates
  return { success: true, data: [] };
}

export async function getCustomTemplate(id: string): Promise<APIResponse> {
  // API: GET /api/workpapers/custom-templates/[id]
  return { success: true, data: null };
}

export async function createCustomTemplate(input: any): Promise<APIResponse> {
  // API: POST /api/workpapers/custom-templates
  // Payload: {
  //   name, description, isPublic,
  //   includeEvidenceGrid, includeTickMarks, defaultTickMarks[],
  //   sections: [{
  //     title, description, order,
  //     fields: [{ label, type, required, placeholder, options[], order }]
  //   }]
  // }
  return { success: true, data: null };
}

export async function updateCustomTemplate(
  id: string,
  data: Partial<any>
): Promise<APIResponse> {
  // API: PUT /api/workpapers/custom-templates/[id]
  return { success: true, data: null };
}

export async function deleteCustomTemplate(id: string): Promise<APIResponse> {
  // API: DELETE /api/workpapers/custom-templates/[id]
  return { success: true, message: 'Template deleted' };
}

// ============================================
// FINDINGS
// ============================================

export async function getFindings(
  auditId: string,
  filters?: any
): Promise<APIResponse> {
  // API: GET /api/audit-plans/[auditId]/findings
  // Query Params: ?severity=critical&status=open
  // Returns only findings for the specific audit plan
  return { success: true, data: [] };
}

export async function getFinding(
  auditId: string,
  id: string
): Promise<APIResponse> {
  // API: GET /api/audit-plans/[auditId]/findings/[id]
  return { success: true, data: null };
}

export async function createFinding(
  auditId: string,
  input: any
): Promise<APIResponse> {
  // API: POST /api/audit-plans/[auditId]/findings
  // auditId comes from URL path, not payload
  // Payload: {
  //   workpaperId, title, description,
  //   severity, riskLevel, recommendation,
  //   assignedTo?, dueDate?
  // }
  return { success: true, data: null };
}

export async function updateFinding(
  auditId: string,
  id: string,
  data: Partial<any>
): Promise<APIResponse> {
  // API: PUT /api/audit-plans/[auditId]/findings/[id]
  return { success: true, data: null };
}

export async function deleteFinding(
  auditId: string,
  id: string
): Promise<APIResponse> {
  // API: DELETE /api/audit-plans/[auditId]/findings/[id]
  return { success: true, message: 'Finding deleted' };
}

// ============================================
// EVIDENCE
// ============================================

export async function uploadEvidence(
  workpaperId: string,
  files: File[]
): Promise<APIResponse> {
  // API: POST /api/evidence/upload
  // Content-Type: multipart/form-data
  // Payload: { workpaperId, files[] }
  return { success: true, data: [] };
}

export async function deleteEvidence(
  evidenceId: string
): Promise<APIResponse> {
  // API: DELETE /api/evidence/[id]
  return { success: true, message: 'Evidence deleted' };
}

// ============================================
// DASHBOARD
// ============================================

export async function getDashboardMetrics(): Promise<APIResponse> {
  // API: GET /api/audit/dashboard/metrics
  return { success: true, data: null };
}

// ============================================
// TEAM MEMBERS
// ============================================

export async function getTeamMembers(): Promise<APIResponse> {
  // API: GET /api/team/members
  return { success: true, data: [] };
}
```

### TanStack Query Hooks (`lib/hooks/use-audit-query-data.ts`)

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as actions from '@/app/_actions/audit-module-actions';
import { toast } from 'sonner';

// ============================================
// AUDIT PLANS
// ============================================

export function useAuditPlans(filters?: any) {
  return useQuery({
    queryKey: ['audit-plans', filters],
    queryFn: () => actions.getAuditPlans(filters),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useAuditPlan(id: string) {
  return useQuery({
    queryKey: ['audit-plan', id],
    queryFn: () => actions.getAuditPlan(id),
    enabled: !!id
  });
}

export function useCreateAuditPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actions.createAuditPlan,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['audit-plans'] });
      toast.success('Audit plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create audit plan');
    }
  });
}

export function useUpdateAuditPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      actions.updateAuditPlan(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audit-plans'] });
      queryClient.invalidateQueries({ queryKey: ['audit-plan', variables.id] });
      toast.success('Audit plan updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update audit plan');
    }
  });
}

export function useDeleteAuditPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actions.deleteAuditPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-plans'] });
      toast.success('Audit plan deleted');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete audit plan');
    }
  });
}

// ============================================
// WORKPAPERS
// ============================================

export function useWorkpapers(filters?: any) {
  return useQuery({
    queryKey: ['workpapers', filters],
    queryFn: () => actions.getWorkpapers(filters),
    staleTime: 5 * 60 * 1000
  });
}

export function useWorkpaper(id: string) {
  return useQuery({
    queryKey: ['workpaper', id],
    queryFn: () => actions.getWorkpaper(id),
    enabled: !!id
  });
}

export function useCreateWorkpaper() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actions.createWorkpaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workpapers'] });
      toast.success('Workpaper created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create workpaper');
    }
  });
}

export function useUpdateWorkpaper() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      actions.updateWorkpaper(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workpapers'] });
      queryClient.invalidateQueries({ queryKey: ['workpaper', variables.id] });
      toast.success('Workpaper updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update workpaper');
    }
  });
}

export function useDeleteWorkpaper() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actions.deleteWorkpaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workpapers'] });
      toast.success('Workpaper deleted');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete workpaper');
    }
  });
}

// ============================================
// CLAUSE TEMPLATES
// ============================================

export function useClauseTemplates(category?: string) {
  return useQuery({
    queryKey: ['clause-templates', category],
    queryFn: () => actions.getClauseTemplates(category),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useCreateClauseTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actions.createClauseTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clause-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create template');
    }
  });
}

// ============================================
// CUSTOM TEMPLATES
// ============================================

export function useCustomTemplates() {
  return useQuery({
    queryKey: ['custom-templates'],
    queryFn: actions.getCustomTemplates,
    staleTime: 10 * 60 * 1000
  });
}

export function useCreateCustomTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actions.createCustomTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates'] });
      toast.success('Custom template created');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create template');
    }
  });
}

// ============================================
// FINDINGS (Scoped to Audit Plan)
// ============================================

export function useFindings(auditId: string, filters?: any) {
  return useQuery({
    queryKey: ['findings', auditId, filters],
    queryFn: () => actions.getFindings(auditId, filters),
    enabled: !!auditId,
    staleTime: 5 * 60 * 1000
  });
}

export function useFinding(auditId: string, id: string) {
  return useQuery({
    queryKey: ['finding', auditId, id],
    queryFn: () => actions.getFinding(auditId, id),
    enabled: !!auditId && !!id
  });
}

export function useCreateFinding(auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: any) => actions.createFinding(auditId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit-plan', auditId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Finding created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create finding');
    }
  });
}

export function useUpdateFinding(auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      actions.updateFinding(auditId, id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['findings', auditId] });
      queryClient.invalidateQueries({ queryKey: ['finding', auditId, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['audit-plan', auditId] });
      toast.success('Finding updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update finding');
    }
  });
}

export function useDeleteFinding(auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => actions.deleteFinding(auditId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit-plan', auditId] });
      toast.success('Finding deleted');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete finding');
    }
  });
}

// ============================================
// DASHBOARD
// ============================================

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: actions.getDashboardMetrics,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

// ============================================
// TEAM MEMBERS
// ============================================

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: actions.getTeamMembers,
    staleTime: 15 * 60 * 1000 // 15 minutes
  });
}
```

---

## Component Architecture

### Component Patterns

#### 1. **Page Component (Server Component)**
```typescript
// app/dashboard/audit/plans/page.tsx
import { PlansPageClient } from './_components/plans-page-client';

export default async function PlansPage() {
  // Optional: Fetch initial data server-side
  // const initialData = await getAuditPlans();
  
  return <PlansPageClient />;
}
```

#### 2. **Page Client Component**
```typescript
'use client';

import { useState } from 'react';
import { useAuditPlans } from '@/lib/hooks/use-audit-query-data';
import { useAuditStore } from '@/lib/stores/audit-store';

export function PlansPageClient() {
  const { data, isLoading } = useAuditPlans();
  const { isCreateDialogOpen, setCreateDialogOpen } = useAuditStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Audit Plans</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Create Plan
        </Button>
      </div>
      
      {isLoading ? <Loading /> : <AuditPlansTable data={data} />}
      
      <CreateAuditDialog 
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
```

#### 3. **Form Component with Auto-Save**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useCallback } from 'react';
import { useAuditStore } from '@/lib/stores/audit-store';
import { debounce } from 'lodash';

export function CreateWorkpaperForm({ auditId }: { auditId: string }) {
  const form = useForm({
    resolver: zodResolver(workpaperSchema),
    defaultValues: { /* ... */ }
  });
  
  const { saveWorkpaperDraft, getWorkpaperDraft } = useAuditStore();
  
  // Restore draft on mount
  useEffect(() => {
    const draft = getWorkpaperDraft(auditId);
    if (draft) {
      form.reset(draft);
    }
  }, [auditId]);
  
  // Auto-save draft (debounced)
  const saveDraft = useCallback(
    debounce((values) => {
      saveWorkpaperDraft(auditId, values);
    }, 30000), // 30 seconds
    [auditId]
  );
  
  // Watch form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveDraft(values);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, saveDraft]);
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  );
}
```

### Key Shared Components

#### Status Badge
```typescript
// app/dashboard/audit/_components/status-badge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AuditStatus } from '@/lib/types/audit-types';

interface StatusBadgeProps {
  status: AuditStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700' },
    'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' }
  };
  
  const variant = variants[status];
  
  return (
    <Badge className={cn(variant.color, className)}>
      {variant.label}
    </Badge>
  );
}
```

#### Conformity Badge
```typescript
// app/dashboard/audit/_components/conformity-badge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TestResult } from '@/lib/types/audit-types';

interface ConformityBadgeProps {
  result: TestResult;
  showIcon?: boolean;
  className?: string;
}

export function ConformityBadge({ 
  result, 
  showIcon = true,
  className 
}: ConformityBadgeProps) {
  const variants = {
    conformity: {
      label: 'Conformity',
      color: 'bg-emerald-100 text-emerald-700',
      icon: CheckCircle2
    },
    'partial-conformity': {
      label: 'Partial Conformity',
      color: 'bg-amber-100 text-amber-700',
      icon: AlertCircle
    },
    'non-conformity': {
      label: 'Non-Conformity',
      color: 'bg-red-100 text-red-700',
      icon: XCircle
    }
  };
  
  const variant = variants[result];
  const Icon = variant.icon;
  
  return (
    <Badge className={cn(variant.color, 'gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {variant.label}
    </Badge>
  );
}
```

#### Empty State
```typescript
// app/dashboard/audit/_components/empty-state.tsx
'use client';

import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FileQuestion
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
```

---

## Features Implementation

### 1. Dashboard

**Components**:
- `app/dashboard/home/audit/page.tsx` - Server page
- `app/dashboard/home/audit/_components/dashboard-client.tsx` - Main client
- `app/dashboard/home/audit/_components/metrics-cards.tsx` - Metric cards
- `app/dashboard/home/audit/_components/charts.tsx` - Charts

**Key Features**:
- Real-time metrics (total/active/completed audits, findings, conformity rate)
- Status distribution chart (pie/donut chart)
- Recent audits list
- Critical findings list
- Quick actions

**API Requirements**:
- `GET /api/audit/dashboard/metrics`
  ```typescript
  Response: {
    totalAudits: number;
    activeAudits: number;
    completedAudits: number;
    totalWorkpapers: number;
    openFindings: number;
    criticalFindings: number;
    avgConformityRate: number;
    overdueFindings: number;
  }
  ```

### 2. Audit Plans

**Components**:
- `app/dashboard/audit/plans/page.tsx` - List page
- `app/dashboard/audit/plans/_components/plans-page-client.tsx` - Main client
- `app/dashboard/audit/plans/_components/create-audit-plan-form.tsx` - Create form
- `app/dashboard/audit/plans/_components/audit-plans-table.tsx` - Data table
- `app/dashboard/audit/plans/[id]/page.tsx` - Detail page with tabs

**Audit Plan Detail Page Structure**:
```typescript
// app/dashboard/audit/plans/[id]/page.tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="workpapers">Workpapers</TabsTrigger>
    <TabsTrigger value="findings">Findings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    {/* Audit details, team, timeline, progress */}
  </TabsContent>
  
  <TabsContent value="workpapers">
    {/* Workpapers list filtered by this audit */}
  </TabsContent>
  
  <TabsContent value="findings">
    {/* Findings list filtered by this audit */}
  </TabsContent>
</Tabs>
```

**Key Features**:
- Filterable/sortable plans table
- Create/edit/delete plans
- Status tracking
- Progress visualization
- Quick stats per plan
- **Tabbed detail view**:
  - **Overview Tab**: Audit info, team, timeline, metrics
  - **Workpapers Tab**: All workpapers for this audit
  - **Findings Tab**: All findings for this audit

**API Requirements**:
- `GET /api/audit-plans?status=in-progress&assignedTo=userId&search=text`
- `GET /api/audit-plans/[id]` - Returns full audit details
- `POST /api/audit-plans` - Payload: `{ title, scope, objectives, startDate, endDate, assignedTo[] }`
- `PUT /api/audit-plans/[id]` - Payload: `{ field: value }`
- `DELETE /api/audit-plans/[id]`
- `GET /api/audit-plans/[id]/workpapers` - Workpapers for this audit only
- `GET /api/audit-plans/[id]/findings` - Findings for this audit only

### 3. Workpapers - ISO 27001 Template

**Components**:
- `app/dashboard/audit/workpapers/page.tsx` - List page
- `app/dashboard/audit/workpapers/_components/workpapers-page-client.tsx` - Main client
- `app/dashboard/audit/workpapers/_components/create-workpaper-form.tsx` - ISO form
- `app/dashboard/audit/workpapers/_components/template-selector.tsx` - Template selection
- `app/dashboard/audit/workpapers/_components/evidence-upload.tsx` - File upload

**Key Features**:
- Two-tab template selector (use existing / create new)
- Searchable clause template dropdown (grouped by category)
- Inline template creation
- Auto-population of objective and test procedures
- Evidence upload (drag-drop, 10MB limit, 10 files max)
- Test result selection (conformity/partial/non-conformity)
- Assignment (Prepared By, Reviewed By)
- Draft auto-save (30s interval)

**API Requirements**:
- `GET /api/workpapers/clause-templates?category=leadership`
- `POST /api/workpapers/clause-templates` - Payload: `{ clause, clauseTitle, category, objective, testProcedure }`
- `POST /api/workpapers` - Payload:
  ```typescript
  {
    auditId: string;
    templateType: 'iso27001';
    clause: string;
    clauseTitle?: string;
    objectives: string;
    testProcedures: string;
    testResults?: string;
    testResult?: TestResult;
    conclusion?: string;
    evidence?: EvidenceInput[];
    preparedBy: string;
    preparedDate: Date;
    reviewedBy?: string;
    reviewedDate?: Date;
  }
  ```

### 4. Workpapers - General Template (B.1.1.2)

**Components**:
- `app/dashboard/audit/workpapers/_components/general-workpaper-form.tsx` - Main form
- `app/dashboard/audit/workpapers/_components/evidence-grid.tsx` - Dynamic grid

**Key Features**:
- Process under review field
- Work done, matters arising, conclusion sections
- Dynamic evidence grid with:
  - Row CRUD operations
  - Source, date, description, posting sequence, batch entry
  - Debits/credits with auto-totals
  - Configurable tick marks (26 available)
  - Audit observations and comments per row
- Tick mark configuration dialog (category-based selection)
- Real-time financial calculations

**Tick Marks** (`lib/data/tick-marks.ts`):
- 26 standardized marks (A-Z)
- Grouped by category (contract, authorization, financial, etc.)
- Full descriptions on hover

**API Requirements**:
- `POST /api/workpapers` - Payload:
  ```typescript
  {
    auditId: string;
    templateType: 'general';
    processUnderReview: string;
    workDone: string;
    mattersArising?: string;
    conclusion?: string;
    evidenceRows: [{
      id, source, documentDate?, description,
      postingSequence?, batchEntry?,
      debits?, credits?,
      tickMarks: Record<string, boolean>,
      auditObservation?, auditComment?
    }];
    selectedTickMarks: string[];
    preparedBy: string;
    preparedDate: Date;
    reviewedBy?: string;
    reviewedDate?: Date;
  }
  ```

### 5. Workpapers - Custom Template

**Components**:
- `app/dashboard/audit/workpapers/_components/custom-template-builder.tsx` - Builder
- `app/dashboard/audit/workpapers/_components/custom-workpaper-form.tsx` - Dynamic form

**Key Features**:
- Template builder with:
  - Name, description, visibility (private/team)
  - Multiple sections
  - Flexible field types (text, textarea, number, date, select, checkbox, file)
  - Field configuration (label, placeholder, required, options)
  - Optional evidence grid integration
  - Optional tick marks
- Dynamic form rendering from template structure
- Template library display
- Template usage statistics

**API Requirements**:
- `GET /api/workpapers/custom-templates`
- `POST /api/workpapers/custom-templates` - Payload:
  ```typescript
  {
    name: string;
    description: string;
    isPublic: boolean;
    includeEvidenceGrid?: boolean;
    includeTickMarks?: boolean;
    defaultTickMarks?: string[];
    sections: [{
      title: string;
      description?: string;
      order: number;
      fields: [{
        label: string;
        type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
        required: boolean;
        placeholder?: string;
        options?: string[];
        order: number;
      }]
    }]
  }
  ```
- `POST /api/workpapers` - Payload:
  ```typescript
  {
    auditId: string;
    templateType: 'custom';
    templateId: string;
    fieldValues: Record<string, any>;
    evidenceRows?: EvidenceRow[];
    selectedTickMarks?: string[];
    preparedBy: string;
    preparedDate: Date;
  }
  ```

### 6. Findings (Audit Plan Tab)

**Components**:
- `app/dashboard/audit/plans/[id]/_components/findings-tab.tsx` - Findings tab content
- `app/dashboard/audit/plans/[id]/_components/create-finding-dialog.tsx` - Create form
- `app/dashboard/audit/plans/[id]/_components/findings-list.tsx` - Findings list
- `app/dashboard/audit/plans/[id]/_components/finding-card.tsx` - Individual finding card

**Key Features**:
- Integrated as tab in Audit Plan detail page
- Automatically filtered by current audit plan
- Severity badges (critical, high, medium, low)
- Status tracking (open, in-remediation, closed)
- Assignment and due date tracking
- Reference code generation (FND-2025-001)
- Linked to workpaper within same audit
- Quick stats (total, open, critical)
- Comments/activity timeline per finding

**Tab Structure** in Audit Plan Detail:
```
Audit Plan Detail Page
├── Overview Tab (default)
├── Workpapers Tab
└── Findings Tab ← New
    ├── Quick Stats
    ├── Create Finding Button
    ├── Filter/Sort Controls
    └── Findings List
```

**API Requirements**:
- `GET /api/audit-plans/[auditId]/findings?severity=critical&status=open`
  - Returns only findings for specific audit plan
  - Query params for filtering within the audit
- `POST /api/audit-plans/[auditId]/findings` - Payload:
  ```typescript
  {
    // auditId is from URL path, not payload
    workpaperId: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    riskLevel: 'high' | 'medium' | 'low';
    recommendation?: string;
    assignedTo?: string;
    dueDate?: Date;
  }
  ```
- `PUT /api/audit-plans/[auditId]/findings/[id]` - Payload: `{ field: value }`
- `DELETE /api/audit-plans/[auditId]/findings/[id]`

**Note**: No standalone `/audit/findings` page - findings are only accessible through audit plan details

---

## Production Readiness Checklist

### Frontend Implementation

#### Phase 1: Foundation ✅
- [ ] Create `lib/types/audit-types.ts` with all type definitions
- [ ] Create `lib/utils/audit-utils.ts` with utility functions
- [ ] Create `lib/stores/audit-store.ts` with Zustand store + localStorage persistence
- [ ] Create `app/_actions/audit-module-actions.ts` with all server actions (mock data)
- [ ] Create `lib/hooks/use-audit-query-data.ts` with TanStack Query hooks
- [ ] Create `lib/data/tick-marks.ts` with 26 tick mark definitions

#### Phase 2: Dashboard ✅
- [ ] Create shared components:
  - [ ] `status-badge.tsx`
  - [ ] `conformity-badge.tsx`
  - [ ] `severity-badge.tsx`
  - [ ] `empty-state.tsx`
  - [ ] `audit-card.tsx`
- [ ] Create `app/dashboard/home/audit/page.tsx`
- [ ] Create `app/dashboard/home/audit/_components/dashboard-client.tsx`
- [ ] Create `app/dashboard/home/audit/_components/metrics-cards.tsx`
- [ ] Create `app/dashboard/home/audit/_components/charts.tsx` (Recharts)
- [ ] Implement real-time metric calculations
- [ ] Add loading states and error handling

#### Phase 3: Audit Plans ✅
- [ ] Create `app/dashboard/audit/plans/page.tsx`
- [ ] Create `app/dashboard/audit/plans/_components/plans-page-client.tsx`
- [ ] Create `app/dashboard/audit/plans/_components/create-audit-plan-form.tsx`
- [ ] Create `app/dashboard/audit/plans/_components/audit-plans-table.tsx`
- [ ] Create `app/dashboard/audit/plans/[id]/page.tsx` (detail view)
- [ ] Implement filtering and sorting
- [ ] Add form validation (Zod + React Hook Form)
- [ ] Implement CRUD operations with optimistic updates

#### Phase 4: Workpapers - ISO 27001 ✅
- [ ] Create `app/dashboard/audit/workpapers/page.tsx`
- [ ] Create `app/dashboard/audit/workpapers/_components/workpapers-page-client.tsx`
- [ ] Create `app/dashboard/audit/workpapers/_components/template-selector.tsx`
  - [ ] Two-tab interface (use existing / create new)
  - [ ] Searchable dropdown grouped by category
  - [ ] Inline template creation
- [ ] Create `app/dashboard/audit/workpapers/_components/create-workpaper-form.tsx`
  - [ ] Auto-population from template
  - [ ] Editable fields
  - [ ] Test result selection
- [ ] Create `app/dashboard/audit/workpapers/_components/evidence-upload.tsx`
  - [ ] Drag-drop file upload
  - [ ] File type validation (PDF, DOCX, XLSX, PNG, JPG, ZIP)
  - [ ] Size validation (10MB per file, 10 files max)
  - [ ] Evidence type selection
- [ ] Implement draft auto-save (30s interval, debounced)
- [ ] Implement draft restoration on mount
- [ ] Add form validation

#### Phase 5: Workpapers - General Template ✅
- [ ] Create `app/dashboard/audit/workpapers/_components/general-workpaper-form.tsx`
- [ ] Create `app/dashboard/audit/workpapers/_components/evidence-grid.tsx`
  - [ ] Dynamic row CRUD
  - [ ] Debits/credits columns with auto-totals
  - [ ] Configurable tick mark columns
  - [ ] Inline editing
- [ ] Create tick mark configuration dialog
  - [ ] Category-based display
  - [ ] Multi-select functionality
  - [ ] Dynamic column updates
- [ ] Implement real-time calculations (debits, credits, difference)
- [ ] Add row duplication
- [ ] Implement form validation

#### Phase 6: Workpapers - Custom Templates ✅
- [ ] Create `app/dashboard/audit/workpapers/_components/custom-template-builder.tsx`
  - [ ] Template metadata form
  - [ ] Section management (add/edit/delete)
  - [ ] Field management (add/edit/delete/reorder)
  - [ ] Evidence grid configuration
  - [ ] Tick mark selection
- [ ] Create `app/dashboard/audit/workpapers/_components/custom-workpaper-form.tsx`
  - [ ] Dynamic field rendering
  - [ ] Field type handlers (text, textarea, number, date, select, checkbox, file)
  - [ ] Conditional evidence grid rendering
- [ ] Create template library display
- [ ] Implement template validation
- [ ] Add template usage tracking

#### Phase 7: Findings (as Audit Plan Tab) ✅
- [ ] Create `app/dashboard/audit/plans/[id]/_components/findings-tab.tsx`
  - [ ] Quick stats (total, open, critical)
  - [ ] Filter/sort controls (severity, status, assignee)
  - [ ] Findings list view
- [ ] Create `app/dashboard/audit/plans/[id]/_components/create-finding-dialog.tsx`
  - [ ] Workpaper selection (filtered to current audit)
  - [ ] Severity and risk level selection
  - [ ] Assignment and due date
- [ ] Create `app/dashboard/audit/plans/[id]/_components/findings-list.tsx`
  - [ ] Card/list view toggle
  - [ ] Severity and status badges
  - [ ] Overdue indicators
- [ ] Create `app/dashboard/audit/plans/[id]/_components/finding-card.tsx`
  - [ ] Compact finding display
  - [ ] Quick actions (edit, delete, update status)
- [ ] Update `app/dashboard/audit/plans/[id]/page.tsx`
  - [ ] Add "Findings" tab to tabs list
  - [ ] Render findings-tab component
- [ ] Implement reference code generation
- [ ] Add overdue calculations
- [ ] Implement status change workflows

#### Phase 8: Polish & Testing ✅
- [ ] Implement responsive design (mobile/tablet/desktop)
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications (sonner)
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels for accessibility
- [ ] Test all CRUD operations
- [ ] Test draft save/restore
- [ ] Test file uploads
- [ ] Test form validations
- [ ] Test responsive breakpoints
- [ ] Browser testing (Chrome, Firefox, Safari, Edge)

### Backend Integration

#### API Endpoints Required

**Audit Plans**:
- [ ] `GET /api/audit-plans` with query params
- [ ] `GET /api/audit-plans/[id]`
- [ ] `POST /api/audit-plans`
- [ ] `PUT /api/audit-plans/[id]`
- [ ] `DELETE /api/audit-plans/[id]`

**Workpapers**:
- [ ] `GET /api/workpapers` with query params
- [ ] `GET /api/workpapers/[id]`
- [ ] `POST /api/workpapers`
- [ ] `PUT /api/workpapers/[id]`
- [ ] `DELETE /api/workpapers/[id]`

**Clause Templates**:
- [ ] `GET /api/workpapers/clause-templates`
- [ ] `GET /api/workpapers/clause-templates/[id]`
- [ ] `POST /api/workpapers/clause-templates`
- [ ] `PUT /api/workpapers/clause-templates/[id]`
- [ ] `DELETE /api/workpapers/clause-templates/[id]`

**Custom Templates**:
- [ ] `GET /api/workpapers/custom-templates`
- [ ] `GET /api/workpapers/custom-templates/[id]`
- [ ] `POST /api/workpapers/custom-templates`
- [ ] `PUT /api/workpapers/custom-templates/[id]`
- [ ] `DELETE /api/workpapers/custom-templates/[id]`

**Findings**:
- [ ] `GET /api/audit-plans/[auditId]/findings` with query params
- [ ] `GET /api/audit-plans/[auditId]/findings/[id]`
- [ ] `POST /api/audit-plans/[auditId]/findings`
- [ ] `PUT /api/audit-plans/[auditId]/findings/[id]`
- [ ] `DELETE /api/audit-plans/[auditId]/findings/[id]`

**Evidence**:
- [ ] `POST /api/evidence/upload` (multipart/form-data)
- [ ] `DELETE /api/evidence/[id]`

**Dashboard**:
- [ ] `GET /api/audit/dashboard/metrics`

**Team**:
- [ ] `GET /api/team/members`

#### Integration Steps
- [ ] Replace mock data in `audit-module-actions.ts` with real API calls
- [ ] Add authentication headers to all API calls
- [ ] Implement proper error handling
- [ ] Add retry logic for failed requests
- [ ] Implement file upload to cloud storage (S3/Azure Blob)
- [ ] Add server-side validation
- [ ] Implement rate limiting
- [ ] Add audit logging

### Deployment

#### Pre-deployment
- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolved

#### Performance
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Lazy loading for heavy components
- [ ] TanStack Query cache configured
- [ ] Debouncing on auto-save
- [ ] Virtual scrolling for large tables (if needed)

#### Security
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection
- [ ] File upload validation (client + server)
- [ ] Authentication checks on all routes
- [ ] Authorization checks on data access
- [ ] Secure file storage URLs

#### Monitoring
- [ ] Error tracking setup (Sentry/similar)
- [ ] Analytics configured
- [ ] Performance monitoring
- [ ] User behavior tracking

---

## Utility Functions

### Audit Utils (`lib/utils/audit-utils.ts`)

```typescript
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import type { 
  AuditStatus, 
  TestResult, 
  Severity,
  FindingStatus 
} from '@/lib/types/audit-types';

// ============================================
// DATE UTILITIES
// ============================================

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

export function isOverdue(dueDate: Date | string): boolean {
  return isAfter(new Date(), new Date(dueDate));
}

export function getDaysUntilDue(dueDate: Date | string): number {
  return differenceInDays(new Date(dueDate), new Date());
}

export function getAuditDuration(startDate: Date, endDate: Date): number {
  return differenceInDays(new Date(endDate), new Date(startDate));
}

// ============================================
// STATUS UTILITIES
// ============================================

export function getStatusColor(status: AuditStatus): string {
  const colors = {
    planning: 'blue',
    'in-progress': 'amber',
    completed: 'emerald',
    cancelled: 'gray'
  };
  return colors[status];
}

export function getTestResultColor(result: TestResult): string {
  const colors = {
    conformity: 'emerald',
    'partial-conformity': 'amber',
    'non-conformity': 'red'
  };
  return colors[result];
}

export function getSeverityColor(severity: Severity): string {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'amber',
    low: 'blue'
  };
  return colors[severity];
}

// ============================================
// CALCULATION UTILITIES
// ============================================

export function calculateProgress(
  completed: number, 
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function calculateConformityRate(
  conformity: number,
  partialConformity: number,
  nonConformity: number
): number {
  const total = conformity + partialConformity + nonConformity;
  if (total === 0) return 0;
  
  // Full weight for conformity, half weight for partial
  const weightedScore = conformity + (partialConformity * 0.5);
  return Math.round((weightedScore / total) * 100);
}

export function calculateEvidenceTotals(rows: Array<{
  debits?: number;
  credits?: number;
}>) {
  const debits = rows.reduce((sum, row) => sum + (row.debits || 0), 0);
  const credits = rows.reduce((sum, row) => sum + (row.credits || 0), 0);
  const difference = debits - credits;
  
  return {
    debits: debits.toFixed(2),
    credits: credits.toFixed(2),
    difference: difference.toFixed(2),
    isBalanced: Math.abs(difference) < 0.01
  };
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

export function isValidFileSize(
  fileSize: number,
  maxSizeMB: number
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

export function validateEvidenceFiles(
  files: File[],
  maxFiles: number = 10,
  maxSizeMB: number = 10
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allowedTypes = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'zip'];
  
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }
  
  files.forEach((file, index) => {
    if (!isValidFileType(file.name, allowedTypes)) {
      errors.push(`File ${index + 1}: Invalid file type`);
    }
    if (!isValidFileSize(file.size, maxSizeMB)) {
      errors.push(`File ${index + 1}: File size exceeds ${maxSizeMB}MB`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function generateReferenceCode(
  prefix: string,
  year: number,
  sequence: number
): string {
  return `${prefix}-${year}-${String(sequence).padStart(3, '0')}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ============================================
// SEARCH & FILTER UTILITIES
// ============================================

export function searchItems<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    })
  );
}

export function sortItems<T>(
  items: T[],
  sortBy: keyof T,
  order: 'asc' | 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  });
}

// ============================================
// EXPORT UTILITIES
// ============================================

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
): void {
  // CSV headers
  const headers = columns.map(col => col.label).join(',');
  
  // CSV rows
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      // Escape commas and quotes
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    }).join(',')
  );
  
  // Combine and create blob
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  
  // Download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ============================================
// TICK MARK UTILITIES
// ============================================

export function getSelectedTickMarks(
  tickMarks: Record<string, boolean>
): string[] {
  return Object.entries(tickMarks)
    .filter(([_, selected]) => selected)
    .map(([code, _]) => code);
}

export function createTickMarkRecord(
  availableMarks: string[]
): Record<string, boolean> {
  return availableMarks.reduce((acc, mark) => {
    acc[mark] = false;
    return acc;
  }, {} as Record<string, boolean>);
}
```

---

## Tick Marks Data

### Tick Marks Definitions (`lib/data/tick-marks.ts`)

```typescript
import type { TickMark, TickMarkCategory } from '@/lib/types/audit-types';

export const TICK_MARKS: TickMark[] = [
  // Contract Management
  {
    code: 'A',
    description: 'Valid signed contract verification',
    category: 'contract'
  },
  {
    code: 'K',
    description: 'Contract terms and conditions compliance review',
    category: 'contract'
  },
  
  // Authorization
  {
    code: 'B',
    description: 'Service Provisioning Form (SPF) authorization check',
    category: 'authorization'
  },
  {
    code: 'P',
    description: 'Approval and authorization workflow validation',
    category: 'authorization'
  },
  
  // Order Processing
  {
    code: 'C',
    description: 'Legitimate order review and validation',
    category: 'order'
  },
  
  // Period Validation
  {
    code: 'D',
    description: 'Cut-off testing for period-end transactions',
    category: 'period'
  },
  
  // Service Delivery
  {
    code: 'E',
    description: 'Service specification verification against delivery',
    category: 'service'
  },
  
  // System Controls
  {
    code: 'F',
    description: 'System log validation and audit trail review',
    category: 'system'
  },
  
  // Financial Accuracy
  {
    code: 'G',
    description: 'Invoice recomputation and mathematical accuracy check',
    category: 'financial'
  },
  {
    code: 'L',
    description: 'Payment status and collection verification',
    category: 'financial'
  },
  {
    code: 'Q',
    description: 'Reconciliation to general ledger',
    category: 'financial'
  },
  {
    code: 'R',
    description: 'Recalculation of amounts and rates',
    category: 'financial'
  },
  
  // Process Controls
  {
    code: 'H',
    description: 'Walk-through testing of process flow',
    category: 'process'
  },
  
  // Compliance
  {
    code: 'I',
    description: 'IFRS 15 revenue recognition compliance testing',
    category: 'compliance'
  },
  
  // Evidence Verification
  {
    code: 'J',
    description: 'Vouching to supporting documentation',
    category: 'evidence'
  },
  {
    code: 'X',
    description: 'Cross-reference to other audit evidence',
    category: 'evidence'
  },
  
  // Adjustments
  {
    code: 'M',
    description: 'Credit notes evaluation and authorization',
    category: 'adjustment'
  },
  
  // Tax Compliance
  {
    code: 'N',
    description: 'Credit notes VAT impact assessment',
    category: 'tax'
  },
  {
    code: 'W',
    description: 'Withholding tax calculation verification',
    category: 'tax'
  },
  
  // Access Controls
  {
    code: 'O',
    description: 'Segregation of duties verification',
    category: 'access'
  },
  
  // Sampling
  {
    code: 'S',
    description: 'Sample selection for testing',
    category: 'sampling'
  },
  
  // Transaction Flow
  {
    code: 'T',
    description: 'Tracing transaction from source to final record',
    category: 'transaction'
  },
  
  // Exception Testing
  {
    code: 'U',
    description: 'Unusual or exceptional items investigation',
    category: 'exception'
  },
  
  // External Verification
  {
    code: 'V',
    description: 'Verification with third-party confirmation',
    category: 'external'
  },
  
  // Analytical Review
  {
    code: 'Y',
    description: 'Year-over-year comparison and trend analysis',
    category: 'analytical'
  },
  
  // Data Validation
  {
    code: 'Z',
    description: 'Zero balance or null transaction verification',
    category: 'data'
  }
];

// Pre-configured sets for common audit types
export const TICK_MARK_PRESETS = {
  revenue: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N'],
  expenditure: ['A', 'B', 'F', 'G', 'J', 'O', 'P', 'Q', 'R'],
  financial: ['G', 'J', 'Q', 'R', 'T', 'V'],
  compliance: ['A', 'B', 'I', 'K', 'P'],
  all: TICK_MARKS.map(tm => tm.code)
};

// Utility functions
export function getTickMarksByCategory(
  category: TickMarkCategory
): TickMark[] {
  return TICK_MARKS.filter(tm => tm.category === category);
}

export function getTickMarkByCode(code: string): TickMark | undefined {
  return TICK_MARKS.find(tm => tm.code === code);
}

export function getTickMarkCategories(): TickMarkCategory[] {
  return Array.from(new Set(TICK_MARKS.map(tm => tm.category)));
}

export function groupTickMarksByCategory(): Record<TickMarkCategory, TickMark[]> {
  return TICK_MARKS.reduce((acc, tm) => {
    if (!acc[tm.category]) {
      acc[tm.category] = [];
    }
    acc[tm.category].push(tm);
    return acc;
  }, {} as Record<TickMarkCategory, TickMark[]>);
}
```

---

## Form Validation Schemas

### Zod Schemas (`lib/schemas/audit-schemas.ts`)

```typescript
import { z } from 'zod';

// ============================================
// AUDIT PLAN SCHEMA
// ============================================

export const auditPlanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  scope: z.string().min(10, 'Scope must be at least 10 characters'),
  objectives: z.string().min(10, 'Objectives must be at least 10 characters'),
  startDate: z.date({
    required_error: 'Start date is required'
  }),
  endDate: z.date({
    required_error: 'End date is required'
  }),
  assignedTo: z.array(z.string()).min(1, 'At least one auditor required')
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export type AuditPlanFormData = z.infer<typeof auditPlanSchema>;

// ============================================
// WORKPAPER SCHEMA (ISO 27001)
// ============================================

export const workpaperSchema = z.object({
  auditId: z.string().min(1, 'Audit plan is required'),
  clause: z.string().min(1, 'Clause is required'),
  clauseTitle: z.string().optional(),
  objectives: z.string().min(10, 'Objectives must be at least 10 characters'),
  testProcedures: z.string().min(10, 'Test procedures must be at least 10 characters'),
  testResults: z.string().optional(),
  testResult: z.enum(['conformity', 'partial-conformity', 'non-conformity']).optional(),
  conclusion: z.string().optional(),
  evidence: z.array(z.object({
    id: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    evidenceType: z.enum(['policy', 'screenshot', 'minutes', 'report', 'other'])
  })).optional(),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  preparedDate: z.date({
    required_error: 'Preparation date is required'
  }),
  reviewedBy: z.string().optional(),
  reviewedDate: z.date().optional()
});

export type WorkpaperFormData = z.infer<typeof workpaperSchema>;

// ============================================
// CLAUSE TEMPLATE SCHEMA
// ============================================

export const clauseTemplateSchema = z.object({
  clause: z.string().min(1, 'Clause code is required (e.g., 4.1, 5.1)'),
  clauseTitle: z.string().min(3, 'Clause title is required'),
  category: z.enum([
    'context',
    'leadership',
    'planning',
    'support',
    'operation',
    'evaluation',
    'improvement',
    'annex-a'
  ]),
  objective: z.string().min(10, 'Objective must be at least 10 characters'),
  testProcedure: z.string().min(10, 'Test procedure must be at least 10 characters')
});

export type ClauseTemplateFormData = z.infer<typeof clauseTemplateSchema>;

// ============================================
// GENERAL WORKPAPER SCHEMA
// ============================================

export const generalWorkpaperSchema = z.object({
  auditId: z.string().min(1, 'Audit plan is required'),
  processUnderReview: z.string().min(3, 'Process under review is required'),
  workDone: z.string().min(10, 'Work done must be at least 10 characters'),
  mattersArising: z.string().optional(),
  conclusion: z.string().optional(),
  evidenceRows: z.array(z.object({
    id: z.string(),
    source: z.string().min(1, 'Source is required'),
    documentDate: z.date().optional(),
    description: z.string().min(1, 'Description is required'),
    postingSequence: z.string().optional(),
    batchEntry: z.string().optional(),
    debits: z.number().nonnegative().optional(),
    credits: z.number().nonnegative().optional(),
    tickMarks: z.record(z.boolean()),
    auditObservation: z.string().optional(),
    auditComment: z.string().optional()
  })).min(1, 'At least one evidence row is required'),
  selectedTickMarks: z.array(z.string()),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  preparedDate: z.date({
    required_error: 'Preparation date is required'
  }),
  reviewedBy: z.string().optional(),
  reviewedDate: z.date().optional()
});

export type GeneralWorkpaperFormData = z.infer<typeof generalWorkpaperSchema>;

// ============================================
// CUSTOM TEMPLATE SCHEMA
// ============================================

export const customTemplateSchema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  isPublic: z.boolean(),
  includeEvidenceGrid: z.boolean().optional(),
  includeTickMarks: z.boolean().optional(),
  defaultTickMarks: z.array(z.string()).optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Section title is required'),
    description: z.string().optional(),
    order: z.number(),
    fields: z.array(z.object({
      id: z.string(),
      label: z.string().min(1, 'Field label is required'),
      type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'file']),
      required: z.boolean(),
      placeholder: z.string().optional(),
      options: z.array(z.string()).optional(),
      defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
      order: z.number()
    }))
  })).min(1, 'At least one section is required')
});

export type CustomTemplateFormData = z.infer<typeof customTemplateSchema>;

// ============================================
// FINDING SCHEMA
// ============================================

export const findingSchema = z.object({
  auditId: z.string().min(1, 'Audit plan is required'),
  workpaperId: z.string().min(1, 'Workpaper is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  riskLevel: z.enum(['high', 'medium', 'low']),
  recommendation: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional()
}).refine(
  (data) => {
    if (data.dueDate) {
      return data.dueDate > new Date();
    }
    return true;
  },
  {
    message: 'Due date must be in the future',
    path: ['dueDate']
  }
);

export type FindingFormData = z.infer<typeof findingSchema>;
```

---

## Design System

### Color Palette

```typescript
// Tailwind classes for consistent styling

// Status Colors
export const STATUS_COLORS = {
  planning: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'in-progress': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  completed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200'
  }
};

// Test Result Colors
export const TEST_RESULT_COLORS = {
  conformity: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: 'text-emerald-600'
  },
  'partial-conformity': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: 'text-amber-600'
  },
  'non-conformity': {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: 'text-red-600'
  }
};

// Severity Colors
export const SEVERITY_COLORS = {
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  low: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200'
  }
};
```

### Icon Usage (Lucide React)

```typescript
// Standard icon sizes
const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
};

// Common icons
import {
  // Status
  CheckCircle2,      // Success, Conformity
  AlertCircle,       // Warning, Partial
  XCircle,           // Error, Non-conformity
  Clock,             // In Progress, Pending
  
  // Actions
  Plus,              // Create/Add
  Edit,              // Edit
  Trash2,            // Delete
  Download,          // Export
  Upload,            // Upload
  Copy,              // Duplicate
  
  // Navigation
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  
  // Data
  FileText,          // Document/Workpaper
  FolderOpen,        // Audit Plan
  AlertTriangle,     // Finding
  BarChart3,         // Analytics
  TrendingUp,        // Progress
  
  // UI
  Search,
  Filter,
  MoreVertical,
  Settings,
  Calendar,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const EvidenceGrid = dynamic(
  () => import('./_components/evidence-grid'),
  { loading: () => <GridSkeleton /> }
);

const CustomTemplateBuilder = dynamic(
  () => import('./_components/custom-template-builder'),
  { loading: () => <FormSkeleton /> }
);
```

### Memoization

```typescript
'use client';

import { useMemo, useCallback } from 'react';

export function WorkpapersTable({ data }: { data: Workpaper[] }) {
  // Memoize expensive calculations
  const sortedData = useMemo(() => {
    return data.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);
  
  // Memoize callbacks
  const handleDelete = useCallback((id: string) => {
    // Delete logic
  }, []);
  
  return (
    <Table>
      {sortedData.map(item => (
        <TableRow key={item.id} onDelete={() => handleDelete(item.id)} />
      ))}
    </Table>
  );
}
```

### Debouncing

```typescript
import { useCallback } from 'react';
import { debounce } from 'lodash';

export function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term);
    }, 500),
    [onSearch]
  );
  
  return (
    <Input 
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Example: audit-utils.test.ts
import { calculateConformityRate, isOverdue } from '@/lib/utils/audit-utils';

describe('calculateConformityRate', () => {
  it('should return 100% for all conformity', () => {
    expect(calculateConformityRate(10, 0, 0)).toBe(100);
  });
  
  it('should return 50% for half partial conformity', () => {
    expect(calculateConformityRate(0, 10, 0)).toBe(50);
  });
  
  it('should return 0% for all non-conformity', () => {
    expect(calculateConformityRate(0, 0, 10)).toBe(0);
  });
});

describe('isOverdue', () => {
  it('should return true for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(isOverdue(pastDate)).toBe(true);
  });
  
  it('should return false for future dates', () => {
    const futureDate = new Date('2030-01-01');
    expect(isOverdue(futureDate)).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Example: create-workpaper.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateWorkpaperForm } from './create-workpaper-form';

describe('CreateWorkpaperForm', () => {
  it('should render form fields', () => {
    render(<CreateWorkpaperForm auditId="123" />);
    
    expect(screen.getByLabelText(/clause/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/objectives/i)).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<CreateWorkpaperForm auditId="123" />);
    
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/clause is required/i)).toBeInTheDocument();
    });
  });
  
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    
    render(<CreateWorkpaperForm auditId="123" onSuccess={onSuccess} />);
    
    await user.type(screen.getByLabelText(/clause/i), '4.1');
    await user.type(screen.getByLabelText(/objectives/i), 'Test objective content');
    
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## Troubleshooting Guide

### Common Issues

#### Issue: Draft not saving
**Symptoms**: Auto-save indicator not updating, drafts lost on page refresh

**Solutions**:
1. Check browser localStorage is enabled
2. Verify `useAuditStore` is properly configured
3. Check console for Zustand errors
4. Ensure debounce function is called correctly

```typescript
// Debug draft save
const { saveWorkpaperDraft } = useAuditStore();

useEffect(() => {
  console.log('Saving draft:', draftData);
  saveWorkpaperDraft(auditId, draftData);
}, [draftData]);
```

#### Issue: TanStack Query not updating
**Symptoms**: UI shows stale data after mutations

**Solutions**:
1. Verify `queryClient.invalidateQueries` is called
2. Check query keys match exactly
3. Ensure mutations have `onSuccess` callbacks

```typescript
const { mutate } = useCreateWorkpaper();

mutate(data, {
  onSuccess: () => {
    // Force refetch
    queryClient.invalidateQueries({ queryKey: ['workpapers'] });
  }
});
```

#### Issue: File upload failing
**Symptoms**: Files not uploading, size/type errors

**Solutions**:
1. Check file size limit (10MB default)
2. Verify allowed file types
3. Test with different file formats
4. Check browser console for errors

```typescript
// Debug file validation
const { valid, errors } = validateEvidenceFiles(files);
console.log('Validation:', { valid, errors });
```

#### Issue: Form validation not working
**Symptoms**: Form submits with invalid data

**Solutions**:
1. Verify Zod schema is correct
2. Check `zodResolver` is configured
3. Test validation rules individually

```typescript
// Debug validation
const result = workpaperSchema.safeParse(formData);
console.log('Validation result:', result);
```

---

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible
- [ ] Modal dialogs trap focus
- [ ] Escape key closes dialogs
- [ ] Enter key submits forms

### Screen Readers
- [ ] ARIA labels on all form inputs
- [ ] ARIA live regions for dynamic content
- [ ] Semantic HTML (button, nav, main, etc.)
- [ ] Alt text on images/icons
- [ ] Form error announcements

### Color Contrast
- [ ] Text meets WCAG AA standards (4.5:1)
- [ ] Status indicators don't rely solely on color
- [ ] Focus indicators have sufficient contrast

### Responsive Design
- [ ] Touch targets minimum 44x44px
- [ ] Content reflows on zoom (up to 200%)
- [ ] No horizontal scrolling at 320px width
- [ ] Forms usable on mobile devices

---

## Environment Variables

```bash
# .env.local

# API Base URL
NEXT_PUBLIC_API_URL=https://api.example.com

# Authentication
NEXT_PUBLIC_AUTH_URL=https://auth.example.com
AUTH_SECRET=your-secret-key

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB in bytes
NEXT_PUBLIC_MAX_FILES=10

# Feature Flags
NEXT_PUBLIC_ENABLE_CUSTOM_TEMPLATES=true
NEXT_PUBLIC_ENABLE_EVIDENCE_GRID=true

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

---

## Final Production Checklist

### Code Quality
- [ ] All TypeScript types defined
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code formatted consistently (`npm run format`)
- [ ] All imports resolved
- [ ] No console.log statements in production code
- [ ] Proper error boundaries implemented
- [ ] Loading states for all async operations

### Component Implementation
- [ ] All shared components created and tested
- [ ] Status badges rendering correctly
- [ ] Empty states displaying appropriately
- [ ] Loading skeletons implemented
- [ ] Error states handled gracefully
- [ ] Success/error toasts working

### State Management
- [ ] Zustand store configured with persistence
- [ ] Draft auto-save working (30s interval)
- [ ] Draft restoration on mount working
- [ ] Filter state persisting correctly
- [ ] Dialog state management working
- [ ] TanStack Query cache configured properly

### Forms & Validation
- [ ] All forms using React Hook Form
- [ ] Zod schemas defined for all forms
- [ ] Form validation working correctly
- [ ] Required fields marked clearly
- [ ] Error messages displaying inline
- [ ] Form submission handling errors
- [ ] Success callbacks triggering correctly
- [ ] Form reset after successful submission

### Data Fetching
- [ ] TanStack Query hooks implemented
- [ ] Query keys consistent and unique
- [ ] Stale time configured appropriately
- [ ] Cache invalidation working on mutations
- [ ] Optimistic updates implemented where appropriate
- [ ] Loading states during fetch
- [ ] Error states during fetch failures
- [ ] Retry logic configured

### API Integration
- [ ] All server actions created
- [ ] Server actions return APIResponse type
- [ ] Error handling in server actions
- [ ] Authentication headers included
- [ ] Request/response logging (dev only)
- [ ] API endpoint mappings documented

### File Upload
- [ ] File type validation (client-side)
- [ ] File size validation (10MB limit)
- [ ] Multiple file upload (max 10 files)
- [ ] Drag-and-drop working
- [ ] File preview displaying
- [ ] Evidence type selection
- [ ] File removal working
- [ ] Upload progress indication
- [ ] Error handling for failed uploads

### Routing & Navigation
- [ ] All pages accessible via routes
- [ ] Dynamic routes working ([id] pages)
- [ ] Navigation between pages smooth
- [ ] Back button working correctly
- [ ] Breadcrumbs implemented (if applicable)
- [ ] Active route highlighting
- [ ] Protected routes (authentication check)

### UI/UX
- [ ] Consistent spacing and layout
- [ ] Proper use of Tailwind utilities
- [ ] Color scheme consistent
- [ ] Typography hierarchy clear
- [ ] Icons sized appropriately
- [ ] Hover states on interactive elements
- [ ] Focus states visible
- [ ] Disabled states clear
- [ ] Loading indicators during operations
- [ ] Empty states with helpful messages
- [ ] Confirmation dialogs for destructive actions

### Responsive Design
- [ ] Mobile layout (320px - 767px)
- [ ] Tablet layout (768px - 1023px)
- [ ] Desktop layout (1024px+)
- [ ] Touch targets minimum 44x44px
- [ ] Horizontal scrolling handled properly
- [ ] Tables responsive (horizontal scroll or cards)
- [ ] Modals/dialogs responsive
- [ ] Forms usable on mobile

### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA labels on interactive elements
- [ ] ARIA live regions for dynamic content
- [ ] Keyboard navigation working
- [ ] Tab order logical
- [ ] Focus trap in modals
- [ ] Escape key closes dialogs
- [ ] Enter key submits forms
- [ ] Alt text on images/icons
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Form errors announced to screen readers
- [ ] Status changes announced

### Performance
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components
- [ ] Images optimized
- [ ] Debouncing on search/auto-save
- [ ] Memoization for expensive calculations
- [ ] Virtual scrolling (if large lists)
- [ ] Bundle size analyzed
- [ ] Lighthouse score > 90
- [ ] First contentful paint < 2s
- [ ] Time to interactive < 3s

### Security
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection configured
- [ ] File upload validation (client + server)
- [ ] Authentication checks on all routes
- [ ] Authorization checks on data access
- [ ] Secure file storage URLs
- [ ] No sensitive data in localStorage
- [ ] API keys in environment variables
- [ ] HTTPS enforced in production

### Testing
- [ ] Unit tests for utility functions
- [ ] Unit tests for validation schemas
- [ ] Component tests for key components
- [ ] Integration tests for forms
- [ ] E2E tests for critical flows
- [ ] Test coverage > 70%
- [ ] All tests passing
- [ ] Edge cases tested
- [ ] Error scenarios tested

### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Environment Setup
- [ ] `.env.local` configured
- [ ] `.env.example` documented
- [ ] Environment variables validated
- [ ] API URLs configured correctly
- [ ] Feature flags working (if applicable)
- [ ] Analytics configured
- [ ] Error tracking configured

### Documentation
- [ ] README.md updated
- [ ] Component documentation
- [ ] API integration guide
- [ ] Deployment guide
- [ ] Environment variables documented
- [ ] Known issues documented
- [ ] Code comments for complex logic

### Pre-Deployment
- [ ] Build succeeds without errors (`npm run build`)
- [ ] Production build tested locally
- [ ] No warnings in console
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Environment variables set in hosting platform
- [ ] Database migrations ready (if applicable)
- [ ] API endpoints available
- [ ] Authentication service configured

### Backend Integration Verification
- [ ] All API endpoints implemented
- [ ] Request/response formats match frontend expectations
- [ ] Authentication working
- [ ] Authorization working
- [ ] File upload to cloud storage working
- [ ] Data validation on backend
- [ ] Error responses standardized
- [ ] Rate limiting configured
- [ ] Audit logging implemented

### Audit Plans Module
- [ ] List page rendering correctly
- [ ] Create form working
- [ ] Edit functionality working
- [ ] Delete with confirmation
- [ ] Detail page with tabs
- [ ] Overview tab showing metrics
- [ ] Workpapers tab filtered correctly
- [ ] Findings tab filtered correctly
- [ ] Status updates working
- [ ] Progress calculations correct
- [ ] Date range validation

### Workpapers Module
- [ ] List page rendering
- [ ] Template selector working
- [ ] ISO 27001 form working
  - [ ] Template selection
  - [ ] Auto-population
  - [ ] Evidence upload
  - [ ] Test result selection
- [ ] General workpaper form working
  - [ ] Evidence grid
  - [ ] Tick mark configuration
  - [ ] Row CRUD operations
  - [ ] Calculations (debits/credits)
- [ ] Custom template builder working
  - [ ] Section management
  - [ ] Field management
  - [ ] Evidence grid option
  - [ ] Template save/load
- [ ] Custom workpaper form working
  - [ ] Dynamic field rendering
  - [ ] Field type handlers
- [ ] Draft auto-save working
- [ ] Draft restoration working

### Findings Module (Audit Plan Tab)
- [ ] Findings tab displaying
- [ ] Quick stats showing
- [ ] Create finding dialog working
- [ ] Workpaper selection filtered
- [ ] Severity selection working
- [ ] Status updates working
- [ ] Assignment working
- [ ] Due date tracking
- [ ] Overdue indicators showing
- [ ] Reference code generation
- [ ] Filtering by severity/status
- [ ] Sorting working

### Dashboard
- [ ] Metrics cards displaying
- [ ] Real-time data updates
- [ ] Charts rendering (Recharts)
- [ ] Recent audits list
- [ ] Critical findings list
- [ ] Quick actions working
- [ ] Navigation to detail pages
- [ ] Loading states
- [ ] Empty states

### Data Integrity
- [ ] Relationships maintained (audit → workpaper → finding)
- [ ] Cascade deletes handled properly
- [ ] Required fields enforced
- [ ] Date validations (start < end)
- [ ] Numeric validations (debits/credits)
- [ ] Reference codes unique
- [ ] No orphaned records

### Error Handling
- [ ] Network errors handled
- [ ] API errors displayed clearly
- [ ] Validation errors shown inline
- [ ] Form submission errors handled
- [ ] File upload errors handled
- [ ] 404 pages for invalid routes
- [ ] 500 pages for server errors
- [ ] Retry mechanisms in place
- [ ] Fallback UI for errors

### User Feedback
- [ ] Success toasts on create/update/delete
- [ ] Error toasts on failures
- [ ] Loading indicators during operations
- [ ] Confirmation dialogs for destructive actions
- [ ] Progress indicators for multi-step flows
- [ ] Validation feedback immediate
- [ ] Auto-save indicators
- [ ] Last saved timestamp

### Monitoring & Analytics
- [ ] Error tracking configured (Sentry/similar)
- [ ] Analytics events tracked
- [ ] User behavior monitored
- [ ] Performance metrics tracked
- [ ] API response times monitored
- [ ] Error rates monitored

### Deployment
- [ ] Hosting platform configured
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Build pipeline working
- [ ] Auto-deploy on merge (if applicable)
- [ ] Rollback strategy defined
- [ ] Health checks configured
- [ ] Monitoring alerts set up

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Critical flows tested in production
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Analytics tracking
- [ ] Error tracking working
- [ ] User feedback collected
- [ ] Bug reports monitored

### Optional Enhancements
- [ ] Export functionality (CSV/PDF)
- [ ] Import functionality (Excel)
- [ ] Bulk operations
- [ ] Advanced search
- [ ] Saved filters
- [ ] Report generation
- [ ] Email notifications
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Audit trail
- [ ] Comments/annotations
- [ ] File preview in browser
- [ ] Template marketplace
- [ ] AI-assisted features

---

## Sign-Off Checklist

### Development Team
- [ ] Code review completed
- [ ] All acceptance criteria met
- [ ] Technical debt documented
- [ ] Handover documentation complete

### QA Team
- [ ] Test plan executed
- [ ] All critical bugs fixed
- [ ] Regression testing passed
- [ ] Performance testing passed
- [ ] Security testing passed

### Product Owner
- [ ] Features match requirements
- [ ] User acceptance testing passed
- [ ] Documentation reviewed
- [ ] Ready for production

### DevOps Team
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Deployment plan reviewed

---

**Production Go-Live Date**: _______________

**Deployed By**: _______________

**Version**: _______________
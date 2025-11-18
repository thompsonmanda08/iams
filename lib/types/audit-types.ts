/**
 * Audit Management Module Type Definitions
 *
 * This file contains all TypeScript types and interfaces for the Audit Management Module.
 * Following the consolidated file structure pattern to minimize file sprawl.
 *
 * @module audit-types
 */

// ============================================================================
// ENUMS AND LITERAL TYPES
// ============================================================================

/**
 * Audit status types representing the lifecycle of an audit
 * Uses standardized status values from lib/statuses.ts
 *
 * Allowed statuses:
 * - DRAFT: Audit being prepared
 * - SUBMITTED: Audit submitted for review
 * - IN_REVIEW: Audit under review
 * - APPROVED: Audit approved
 * - COMPLETED: Audit execution complete
 * - REJECTED: Audit rejected
 * - ARCHIVED: Audit archived
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type AuditStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED"
  | "ARCHIVED"
  | "draft" // Legacy kebab-case support
  | "under-review"
  | "planned"
  | "in-progress"
  | "cancelled";

/**
 * Test result types for workpaper testing
 */
export type TestResult = "conformity" | "partial-conformity" | "non-conformity";

/**
 * Finding severity levels
 */
export type FindingSeverity = "critical" | "high" | "medium" | "low";

/**
 * Finding status types representing the lifecycle of a finding
 * Uses standardized status values from lib/statuses.ts
 *
 * Allowed statuses:
 * - OPEN: Finding is open
 * - PENDING: Finding is pending
 * - IN_REVIEW: Finding under review
 * - COMPLETED: Finding completed
 * - CLOSED: Finding closed
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type FindingStatus = "OPEN" | "PENDING" | "IN_REVIEW" | "COMPLETED" | "CLOSED" | "open" | "in-progress" | "resolved" | "closed";

/**
 * Report types available for generation
 */
export type ReportType =
  | "summary"
  | "detailed"
  | "non-conformity"
  | "management-review"
  | "compliance";

/**
 * Export formats for reports
 */
export type ReportFormat = "pdf" | "excel" | "csv";

/**
 * View mode options for lists
 */
export type ViewMode = "list" | "grid" | "timeline";

/**
 * Template category group types
 */
export type TemplateCategoryGroup = "main-clauses" | "annex-a-controls";

/**
 * Workpaper status types
 * Uses standardized status values from lib/statuses.ts
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type WorkpaperStatus = "PENDING" | "IN_REVIEW" | "COMPLETED" | "unlinked" | "linked" | "in-progress";

/**
 * Audit Plan status types representing the lifecycle of an audit plan
 * Uses standardized status values from lib/statuses.ts
 *
 * Allowed statuses:
 * - DRAFT: Audit plan being prepared
 * - SUBMITTED: Audit plan submitted for approval
 * - IN_REVIEW: Audit plan under review
 * - APPROVED: Audit plan approved
 * - COMPLETED: Audit plan execution complete
 * - REJECTED: Audit plan rejected
 * - ARCHIVED: Audit plan archived
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type AuditPlanStatus = "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "COMPLETED" | "REJECTED" | "ARCHIVED";

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Template category definition for ISO standards
 */
export interface TemplateCategory {
  id?: string;
  name: string;
  display_name: string;
  clauses: string[];
  clause_range?: string;
  group: TemplateCategoryGroup;
  objectives: string;
  scope: string;
  audit_procedure: string;
  description?: string;
  is_required?: boolean;
  [key: string]: any;
}

/**
 * Workpaper template definition (e.g., ISO 27001:2022)
 */
export interface WorkpaperTemplateDefinition {
  id: string;
  name: string;
  description: string;
  standard: ManagementStandard;
  categories: TemplateCategory[];
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ManagementStandard = "ISO IEC 27001" | "ISO 9001" | "ISO 14001";

// ============================================================================
// AUDIT PLAN TYPES
// ============================================================================

/**
 * Audit Plan interface representing a complete audit plan
 */
export interface AuditPlan {
  id: string;
  organization_id: string;
  year: number;
  title: string;
  description: string;
  start_date: string; // ISO 8601 datetime string
  end_date: string; // ISO 8601 datetime string
  status: AuditPlanStatus;
  department_id: string | null;
  audit_universe_id: string | null;
  audit_universe_item_id: string | null;
  audit_universe_item_ids?: string[]; // Array of universe item IDs
  working_paper_template_id: string;
  working_paper_id: string | null;
  ref_no: string;
  audit_plan_date: string | null;
  audit_date: string | null;
  audit_area: string;
  audit_scope: string;
  audit_criteria: string;
  audit_objective: string;
  management_standard: ManagementStandard | string; // Consider using: 'ISO IEC 27001' | 'ISO 9001' | etc.
  audit_team_leader: string; // UUID
  audit_team_members: string[] | null; // Likely an array of UUIDs
  client_representative: string;
  audit_language: string;
  opening_meeting_datetime: string; // ISO 8601 datetime string
  closing_meeting_datetime: string; // ISO 8601 datetime string
  submitted_by: string | null;
  submitted_at: string | null;
  hiar_approved_by: User | null;
  hiar_approved_at: string | null;
  hiar_comments: string | null;
  ceo_approved_by: User | null;
  ceo_approved_at: string | null;
  ceo_comments: string | null;
  audit_chair_approved_by: User | null;
  audit_chair_approved_at: string | null;
  audit_chair_comments: string | null;
  rejected_by: User | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_by: string; // UUID
  updated_by: string; // UUID
  created_at?: string; // ISO 8601 datetime string
  updated_at?: string; // ISO 8601 datetime string
  // Related data
  audit_universe_items?: AuditUniverseEntry[];
  budget_item_ids?: string[];
  budget_items?: BudgetItem[];
  working_paper?: Workpaper;
  audit_team_leader_user?: User;
  audit_team_members_users?: User[];
  client_representative_user?: User;
  submitted_by_user?: User;
  hiar_approved_by_user?: User;
  ceo_approved_by_user?: User;
  audit_chair_approved_by_user?: User;
  rejected_by_user?: User;
  created_by_user?: User;
  updated_by_user?: User;
  // Team details (enriched from API)
  team_leader?: {
    name: string;
    email: string;
    role: string;
  };
  team_members?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

type User = {
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  [key: string]: any;
};

/**
 * Input type for creating or updating an audit plan
 */
export interface AuditPlanInput {
  title: string;
  standard?: string;
  scope: string[];
  objectives: string;
  teamLeader: string;
  teamMembers: string[];
  startDate: Date;
  endDate: Date;
  status?: AuditStatus;

  // Template and category selection
  templateId?: string;
  selectedCategories?: string[];
}

export type WorkpaperBuilderTemplateId = "ISO27001" | "GENERAL" | "CUSTOM";

/**
 * Filters for querying audit plans
 */
export interface AuditFilters {
  status?: AuditStatus[];
  dateRange?: [Date, Date] | null;
  teamLeader?: string;
  search?: string;
}

// ============================================================================
// WORKPAPER TYPES
// ============================================================================

/**
 * Workpaper interface representing audit testing documentation
 */
export interface Workpaper {
  id: string;
  auditId?: string; // Optional - can be attached to audit plan later
  auditTitle?: string; // Optional - only present when attached to audit

  // Category information (from template)
  categoryId?: string;
  category?: string;

  clause: string;
  clauseTitle: string;
  objectives: string;
  scope?: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  conclusion?: string;

  // New fields for comprehensive audit documentation
  documentsObtained?: string;
  sourceDocuments?: string;
  sampleSize?: string;
  controlFrequency?: string;
  samplingMethodology?: string;

  evidence: Evidence[];
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;

  status?: WorkpaperStatus;
  createdAt: Date;
  updatedAt: Date;

  // Findings relationship
  findingIds?: string[];
  findingsCount?: number;
}

/**
 * Input type for creating or updating a workpaper
 */
export interface WorkpaperInput {
  auditId?: string; // Optional - can be attached to audit plan later

  // Category information (from template)
  categoryId?: string;
  category?: string;

  clause: string;
  clauseTitle?: string;
  objectives: string;
  scope?: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  conclusion?: string;

  // New fields for comprehensive audit documentation
  documentsObtained?: string;
  sourceDocuments?: string;
  sampleSize?: string;
  controlFrequency?: string;
  samplingMethodology?: string;

  evidence?: EvidenceInput[];
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;

  status?: WorkpaperStatus;
}

/**
 * Draft workpaper for auto-save functionality
 */
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

/**
 * Clause template category types
 */
export type ClauseCategory =
  | "Context"
  | "Leadership"
  | "Planning"
  | "Support"
  | "Operation"
  | "Evaluation"
  | "Improvement"
  | "Annex A";

/**
 * Clause template for workpaper creation
 */
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

/**
 * Input type for creating a clause template
 */
export interface ClauseTemplateInput {
  clause: string;
  clauseTitle: string;
  category: ClauseCategory;
  objective: string;
  testProcedure: string;
}

/**
 * Workpaper template for pre-filled testing procedures (deprecated - use ClauseTemplate)
 */
export type WorkpaperTemplate = {
  id: string;
  name: string;
  standard: string;
  description: string;
  version: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
};

/**
 * Evidence type categories
 */
export type EvidenceType = "Policy" | "Screenshot" | "Minutes" | "Report" | "Other";

/**
 * Evidence input for uploading
 */
export interface EvidenceInput {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: EvidenceType;
  file?: File;
}

/**
 * Evidence file attached to workpapers or findings
 */
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

// ============================================================================
// GENERAL WORKPAPER TYPES (B.1.1.2 Template)
// ============================================================================

/**
 * Tick mark for audit testing
 */
export interface TickMark {
  code: string;
  description: string;
  category?: string;
}

/**
 * Evidence row in general workpaper testing grid
 */
export interface EvidenceRow {
  id: string;
  source: string;
  documentDate?: Date;
  description: string;
  postingSequence?: string;
  batchEntry?: string;
  debits?: number;
  credits?: number;
  tickMarks: Record<string, boolean>; // Key is tick mark code, value is checked status
  auditObservation?: string;
  auditComment?: string;
  attachments?: EvidenceInput[];
}

/**
 * General workpaper (B.1.1.2 template)
 */
export interface GeneralWorkpaper {
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
  selectedTickMarks: string[]; // Array of tick mark codes to display
  status: "draft" | "in-review" | "completed";
  createdAt: Date;
  updatedAt: Date;

  // Findings relationship
  findingIds?: string[];
  findingsCount?: number;
}

/**
 * Input type for creating general workpaper
 */
export interface GeneralWorkpaperInput {
  auditId?: string; // Optional - can be attached to audit plan later
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
}

// ============================================================================
// CUSTOM TEMPLATE TYPES
// ============================================================================

/**
 * Custom workpaper template type
 */
export type CustomTemplateType = "standard" | "iso27001" | "general" | "custom";

/**
 * Custom field definition for flexible templates
 */
export interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "file";
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  defaultValue?: string | number | boolean;
  order: number;
}

/**
 * Section in custom template
 */
export interface CustomTemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: CustomField[];
  order: number;
}

/**
 * Custom workpaper template created by users
 */
export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  type: CustomTemplateType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean; // Can be shared with team

  // Template configuration
  includeEvidenceGrid?: boolean;
  includeTickMarks?: boolean;
  defaultTickMarks?: string[];

  // Custom sections and fields
  sections: CustomTemplateSection[];

  // Usage statistics
  usageCount?: number;
  lastUsed?: Date;
}

/**
 * Input type for creating custom template
 */
export interface CustomTemplateInput {
  name: string;
  description: string;
  type?: CustomTemplateType;
  isPublic?: boolean;
  includeEvidenceGrid?: boolean;
  includeTickMarks?: boolean;
  defaultTickMarks?: string[];
  sections: Omit<CustomTemplateSection, "id">[];
}

/**
 * Workpaper created from custom template
 */
export interface CustomWorkpaper {
  id: string;
  auditId: string;
  auditTitle: string;
  templateId: string;
  templateName: string;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;

  // Dynamic field values
  fieldValues: Record<string, any>; // Key is field ID, value is user input

  // Optional evidence grid (if template includes it)
  evidenceRows?: EvidenceRow[];
  selectedTickMarks?: string[];

  status: "draft" | "in-review" | "completed";
  createdAt: Date;
  updatedAt: Date;

  // Findings relationship
  findingIds?: string[];
  findingsCount?: number;
}

/**
 * Input type for creating custom workpaper from template
 */
export interface CustomWorkpaperInput {
  auditId?: string; // Optional - can be attached to audit plan later
  templateId: string;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  fieldValues: Record<string, any>;
  evidenceRows?: EvidenceRow[];
  selectedTickMarks?: string[];
}

// ============================================================================
// FINDING TYPES
// ============================================================================

/**
 * Finding interface representing an audit finding or non-conformity
 */
export interface Finding {
  id: string;
  referenceCode: string;
  findingNumber?: string; // Auto-generated or manual finding number
  auditId: string;
  auditTitle: string;
  clause: string;
  clauseTitle: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  recommendation: string;
  correctiveAction?: string;
  assignedTo?: string;
  dueDate?: Date;
  resolvedDate?: Date;
  attachments: Attachment[];

  // Report inclusion
  includeInReport: boolean; // Whether to include in final audit report

  // Additional fields for report
  workingsAndTestResults?: string;
  conclusion?: string;

  createdAt: Date;
  updatedAt: Date;

  // Workpaper relationship
  workpaperId?: string;
  workpaperReference?: string;
  evidenceRowId?: string; // For general workpapers - links to specific row
  sourceType?: "workpaper" | "manual" | "external"; // How the finding was created
}

/**
 * Input type for creating or updating a finding
 */
export interface FindingInput {
  auditId: string;
  clause: string;
  description: string;
  severity: FindingSeverity;
  recommendation: string;
  correctiveAction?: string;
  assignedTo?: string;
  dueDate?: Date;

  // Report inclusion
  includeInReport?: boolean;
  findingNumber?: string;
  workingsAndTestResults?: string;
  conclusion?: string;

  // Workpaper relationship
  workpaperId?: string;
  evidenceRowId?: string;
  sourceType?: "workpaper" | "manual" | "external";
}

/**
 * Filters for querying findings
 */
export interface FindingFilters {
  severity?: FindingSeverity[];
  status?: FindingStatus[];
  clause?: string;
  assignedTo?: string;
  search?: string;
}

/**
 * Timeline event for finding lifecycle tracking
 */
export interface FindingTimelineEvent {
  id: string;
  type: "created" | "updated" | "status_change" | "comment" | "resolved";
  description: string;
  user: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Attachment file for findings
 */
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/**
 * Report template configuration
 */
export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  parameters: string[];
}

/**
 * Parameters for generating a report
 */
export interface ReportParams {
  templateId: string;
  format: ReportFormat;
  auditId?: string;
  dateRange?: [Date, Date];
  includeFindings?: boolean;
  includeWorkpapers?: boolean;
}

/**
 * Scheduled report configuration
 */
export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: "daily" | "weekly" | "monthly";
  format: ReportFormat;
  recipients: string[];
  lastGenerated?: Date;
  nextScheduled: Date;
  isActive: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Key audit metrics for dashboard
 */
export interface AuditMetrics {
  totalAudits: number;
  activeAudits: number;
  completedAudits: number;
  conformityRate: number;
  openFindings: number;
  criticalFindings: number;
  overdueFindings: number;
  upcomingAudits: number;
}

/**
 * Parameters for analytics queries
 */
export interface AnalyticsParams {
  dateRange?: [Date, Date];
  auditId?: string;
}

/**
 * Conformity trend data point
 */
export interface ConformityTrend {
  date: Date;
  conformityRate: number;
  partialConformityRate: number;
  nonConformityRate: number;
}

/**
 * Findings grouped by ISO 27001 clause
 */
export interface FindingsByClause {
  clause: string;
  clauseTitle: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export type AuditUniverseStatus = "UNDER_REVIEW" | "UNIVERSE_CREATION" | "APPROVED";

export interface AuditUniverseEntry {
  id: string;
  entryName: string;
  functionalArea: string;
  strategicPillar: string;
  auditableArea: string;
  associatedRisk: string;
  indicativeTarget: string;
  strategicInitiative: string;
  processActivity: string;
}

export interface AuditUniverse {
  id: string;
  universeName: string;
  functionalAreas: string[];
  auditableAreas: string[];
  status: AuditUniverseStatus;
  dateCreated: string;
  startDate?: string;
  endDate?: string;
  entries: AuditUniverseEntry[];
}

/**
 * API Payload Types for Audit Universe
 */
export interface CreateUniversePayload {
  universe_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface CreateUniverseItemPayload {
  audit_universe_id: number;
  name: string;
  department_id: string;
  strategic_pillar_id?: string | null;
  auditable_area_id?: string | null;
  indicative_target_id?: string | null;
  strategic_initiative_id?: string | null;
  risk_id?: string | null;
  process_activity_id: string;
  audit_frequency: string;
  is_active: boolean;
}

/**
 * Complete analytics data
 */
export interface AuditAnalytics {
  conformityTrends: ConformityTrend[];
  findingsByClause: FindingsByClause[];
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  statusDistribution: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

/**
 * Audit module settings
 */
export interface AuditSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  dueDateReminderDays: number;
  autoSaveInterval: number;
  defaultStandard: string;
  requireApproval: boolean;
  allowDraftWorkpapers: boolean;
}

/**
 * Input type for updating settings
 */
export interface SettingsInput extends Partial<AuditSettings> {}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Date range for filters
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Activity feed item
 */
export interface ActivityItem {
  id: string;
  type: "audit_created" | "audit_updated" | "finding_created" | "workpaper_submitted";
  title: string;
  description: string;
  user: string;
  date: Date;
  metadata?: Record<string, any>;
}

/**
 * ISO 27001 clause information
 */
export interface ClauseInfo {
  code: string;
  title: string;
  category: string;
  description?: string;
}

export type BudgetStatus = "BUDGET_CREATION" | "UNDER_REVIEW" | "APPROVED" | "DRAFT";

export interface BudgetLine {
  id?: string;
  name?: string;
  description?: string;
  allocated_amount?: number;
  spent_amount?: number;
  currency?: string;
  category?: string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface Budget {
  id: string;
  title: string;
  total_amount: number;
  currency: string;
  description: string;
  year: number;
  department_id?: string | null;
  status: BudgetStatus;
  start_date: string | null;
  end_date: string | null;
  budget_lines?: BudgetLine[];
  created_at?: string;
  updated_at?: string;
}

export interface BudgetItem {
  id: string;
  budget_line_id: string;
  name: string;
  amount: number;
  description: string;
  date: string | null;
}

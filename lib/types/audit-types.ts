/**
 * Audit Management Module Type Definitions
 *
 * This file contains all TypeScript types and interfaces for the Audit Management Module.
 * Following the consolidated file structure pattern to minimize file sprawl.
 *
 * @module audit-types
 */

import { FrameworkType } from "../config/finding-framework-fields";
import { StandardStatus } from "../statuses";

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
export type FindingStatus =
  | "OPEN"
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "CLOSED"
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

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
export type WorkpaperStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "unlinked"
  | "linked"
  | "in-progress";

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
export type AuditPlanStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED"
  | "ARCHIVED";

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Clause/Item definition for framework-specific standards
 * Supports different frameworks with different field structures
 */
export interface TemplateClause {
  [key: string]: string | number | boolean | undefined;
  // ISO frameworks
  clause_number?: string;
  clause_description?: string;
  // COSO framework
  component?: string;
  control_type?: string;
  principle?: string;
  // COBIT framework
  domain?: string;
  process_code?: string;
  process_name?: string;
  // NIST framework
  function?: string;
  category?: string;
  subcategory?: string;
}

/**
 * Template category definition for ISO standards
 * Now supports dynamic metadata with framework-specific clauses
 */
export interface TemplateCategory {
  id?: string;
  name: string;
  display_name?: string;
  sort_order?: number;
  clauses?: string[]; // Legacy support
  clause_range?: string;
  group?: TemplateCategoryGroup;
  objectives?: string;
  scope?: string;
  audit_procedure?: string;
  description?: string;
  is_required?: boolean;
  // New metadata structure: { framework_type: [items with framework-specific fields] }
  metadata?: Record<string, Array<Record<string, any>>>;
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
  status: StandardStatus;
  department_id: string | null;
  audit_universe_id: string | null;
  audit_universe_item_id: string | null;
  audit_universe_item_ids?: string[]; // Array of universe item IDs
  working_paper_template_id: string;
  general_work_paper_template_id?: string | null;
  working_paper_id: string | null;
  ref_no: string;
  audit_plan_date: string | null;
  audit_date: string | null;
  audit_area: string;
  audit_scope: string;
  audit_criteria: string;
  audit_objective: string;
  management_standard: FrameworkType | string;
  framework_type: FrameworkType | string;
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
  sign_off_comments?: string | null;
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
  framework_type: string;
  description: string;
  version: string;
  is_active: boolean;
  categories?: TemplateCategory[];
  created_at?: Date;
  updated_at?: Date;
};

/**
 * Evidence type categories
 */
export type EvidenceType = FindingEvidenceType;

export type ConformityStatus = "conformity" | "partial-conformity" | "non-conformity";

export type ComplianceStatus = "Compliant" | "Non-Compliant" | "Partial";

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

/**
 * Framework-aware finding with framework-specific fields
 * This represents findings as they are stored in the database with all framework types supported
 */
export interface WorkpaperFinding {
  id: string;
  organization_id: string;
  audit_plan_id: string;
  working_paper_id: string;
  audit_plan_name: string;

  // Base finding information
  category_name: string;
  finding_number: string;
  report: boolean;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  status_code?: string;
  status_name?: string;
  status_color?: string;

  // Standard finding fields
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  recommendation: string | null;
  management_response: string | null;
  action_plan: string | null;
  responsible_person: string | null;
  due_date: string | null;

  // Audit working papers fields
  workings_and_test_results: string | null;
  conclusion: string | null;
  evidence_links: string | null;
  evidence_summary: string | null;

  // Framework type and framework-specific fields
  framework: string; // ISO27001, COSO, COBIT, NIST, GENERAL, CUSTOM

  // Conformity assessment (applies to all frameworks)
  conformity_status?: "CONFORMITY" | "NON_CONFORMITY" | "PARTIAL_CONFORMITY" | null;
  is_conformity?: boolean; // Simple checkbox: true = Conformity, false = Non-Conformity

  // ISO27001 specific
  clause_number?: string;
  clause_description?: string;
  compliance_status?: string;
  compliance_percentage?: number;

  // COSO specific
  coso_component?: string;
  coso_principle?: string;
  control_type?: string;
  entity_level_control?: string;
  control_deficiency_type?: string;

  // COBIT specific
  cobit_domain?: string;
  cobit_process?: string;
  cobit_process_name?: string;
  capability_level?: string;
  target_capability_level?: string;

  // NIST specific
  nist_function?: string;
  nist_category?: string;
  nist_subcategory?: string;
  control_number?: string;
  control_enhancement?: string;
  assessment_type?: string;

  // General/Custom fields
  finding_category?: string;

  // Metadata
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;

  // Relationships
  category?: {
    id: string;
    working_paper_id: string;
    template_category_id: string;
    name: string;
    sort_order: number;
    organization_id: string | null;
    objectives: string | null;
    is_required: boolean;
    created_at: string;
    updated_at: string;
  };
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
  total_audit_count: number;
  activeAudits: number;
  completedAudits: number;
  in_progress_audit_count: number;
  openFindings: number;
  approved_audit_count: number;
  overdueFindings: number;
  upcoming_audit_count: number;
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
  kri_id?: string | null;
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
// ANNUAL PLAN ITEM TYPES
// ============================================================================

/**
 * KRI Color indicator for Key Risk Indicators
 */
export type KRIColor = "Red" | "Amber" | "Green";

/**
 * Audit frequency options
 */
export type AuditFrequency = "ANNUALLY" | "SEMI_ANNUALLY" | "QUARTERLY" | "MONTHLY";

/**
 * KRI Measurement type
 */
export type KRIMeasurementType = "CURRENCY" | "PERCENTAGE" | "COUNT" | "SCORE";

/**
 * Universe Item - detailed audit universe item with all relationships
 * Contains KRI information, strategic planning, and audit area details
 */
export interface UniverseItem {
  id: string;
  organization_id: string;
  audit_universe_id: number;
  department_id: string;
  department_name: string;

  // Strategic planning
  strategic_pillar_id: string;
  strategic_pillar_name: string;
  strategic_initiative_id: string;
  strategic_initiative_name: string;

  // Audit areas
  auditable_area_id: string;
  auditable_area_name: string;
  process_activity_id: string;
  process_activity_name: string;

  // Targets and indicators
  indicative_target_id: string;
  indicative_target_name: string;

  // KRI (Key Risk Indicator) information
  kri_id: string;
  kri_name: string;
  kri_average_score: number;
  kri_measurement_type: KRIMeasurementType;
  kri_color: KRIColor; // Red, Amber, or Green

  // Configuration
  audit_frequency: AuditFrequency;
  include_amber_kris: boolean;
  include_red_kris: boolean;
  is_active: boolean;
  sort_order: number;

  // Metadata
  created_by: string;
  updated_by: string;
  created_by_name: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Annual Plan Item - complete structure with nested universe items
 * Represents an audit plan item within an annual audit plan
 */
export interface AnnualPlanItemWithDetails {
  id: string;
  organization_id: string;
  register_id: string;
  department_id: string;
  department_name: string;

  audit_area?: string;
  audit_criteria?: string;
  audit_objective?: string;

  // Universe item relationships
  universe_item_ids: string[];
  universe_items: UniverseItem[];

  // Engagement details
  engagement_date: string; // ISO 8601 datetime
  engagement_end_date: string | null; // ISO 8601 datetime
  total_days: number | null;

  // Assignment
  responsible_person: string; // User ID
  responsible_person_name: string;

  // Generation tracking
  is_generated: boolean;
  generated_audit_plan_id: string | null;
  date_generated: string | null;

  // Status tracking
  is_overdue: boolean;
  last_reminder_sent_at: string | null;

  // Standard audit fields
  status?: StandardStatus;
  title?: string;
  audit_scope?: string;
  management_standard?: string;
  start_date?: string;
  end_date?: string;
  team_leader?: {
    name: string;
    email?: string;
  };
  audit_team_members?: Array<{
    name: string;
    email?: string;
  }>;

  // Metadata
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
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

// ============================================================================
// FINDING EVIDENCE TYPES
// ============================================================================

/**
 * Evidence type for finding evidence objects
 */
export type FindingEvidenceType = "Document" | "Observation" | "Testing" | "Interview";

/**
 * Finding evidence interface - evidence attached to findings
 */
export interface FindingEvidence {
  id: string;
  finding_id: string;
  evidence_type: FindingEvidenceType;
  title: string;
  description?: string;
  file_link?: string; // File URL from PocketBase
  external_link?: string; // External URL/reference
  collection_date?: string; // ISO 8601 date string
  notes?: string;
  created_by: string; // UUID
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

/**
 * Input type for creating finding evidence
 */
export interface CreateFindingEvidenceInput {
  finding_id: string;
  evidence_type: FindingEvidenceType;
  title: string;
  description?: string;
  file?: File; // File to upload (optional)
  external_link?: string;
  collection_date?: string;
  notes?: string;
}

/**
 * Input type for updating finding evidence
 */
export interface UpdateFindingEvidenceInput {
  evidence_type?: FindingEvidenceType;
  title?: string;
  description?: string;
  file?: File; // New file to upload (optional)
  external_link?: string;
  collection_date?: string;
  notes?: string;
}

/**
 * Finding evidence response from API
 */
export interface FindingEvidenceResponse {
  success: boolean;
  data?: FindingEvidence;
  message?: string;
}

/**
 * Multiple finding evidence response from API
 */
export interface FindingEvidenceListResponse {
  success: boolean;
  data?: FindingEvidence[];
  message?: string;
}

// ============================================================================
// FINDING ACTION TYPES
// ============================================================================

/**
 * Finding Action status types
 */
export type FindingActionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

/**
 * Finding Action interface - actions assigned to findings for remediation
 */
export interface FindingAction {
  id: string;
  organization_id: string;
  finding_id: string;
  action_description: string;
  assigned_to: string; // User ID
  reviewer_id: string; // User ID
  auditor_id: string; // User ID
  due_date: string; // ISO 8601 date string
  status: FindingActionStatus;
  iteration_number: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  engagement_name: string;
  // Relationships (populated by API)
  finding?: WorkpaperFinding;
  assigned_to_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_to_name?: string; // Display name for assigned user
  audit_plan?: {
    id: string;
    title: string;
    description: string;
    ref_no: string;
    year: number;
    status: string;
  };
  reviewer_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewer_name?: string; // Display name for reviewer
  auditor_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  auditor_name?: string; // Display name for auditor

  // Finding details (from WorkpaperFinding)
  clause_number?: string;
  clause_description?: string;
  framework_type?: string;

  evidence_count?: number;
  reviews_count?: number;
}

/**
 * Input type for creating finding action
 */
export interface CreateFindingActionInput {
  finding_id: string;
  action_description: string;
  assigned_to: string;
  reviewer_id: string;
  due_date: string;
  framework_type?: string;
}

/**
 * Input type for updating finding action
 */
export interface UpdateFindingActionInput {
  action_description?: string;
  assigned_to?: string;
  reviewer_id?: string;
  due_date?: string;
  status?: FindingActionStatus;
}

// ============================================================================
// FINDING ACTION EVIDENCE TYPES
// ============================================================================

/**
 * Finding Action Evidence interface
 */
export interface FindingActionEvidence {
  id: string;
  organization_id: string;
  finding_action_id: string;
  evidence_summary?: string;
  evidence_file_url?: string;
  evidence_file_name?: string;
  evidence_file_type?: string;
  evidence_file_size?: number;
  submitted_by: string;
  submitted_at: string;
  status?: string;
  created_at: string;
  updated_at: string;

  // Relationships
  submitted_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  reviews?: FindingActionReview[];
}

/**
 * Input type for creating finding action evidence
 */
export interface CreateFindingActionEvidenceInput {
  finding_action_id: string;
  title: string;
  evidence_summary: string;
  evidence_file_url: string;
}

/**
 * Input type for updating finding action evidence
 */
export type UpdateFindingActionEvidenceInput = Partial<CreateFindingActionEvidenceInput>;

// ============================================================================
// FINDING ACTION REVIEW TYPES
// ============================================================================

/**
 * Finding Action Review status
 */
export type FindingActionReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Finding Action Review interface
 */
export interface FindingActionReview {
  id: string;
  finding_action_evidence_id: string;
  reviewer_id: string;
  review_status: FindingActionReviewStatus;
  review_comments?: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;

  // Relationships
  reviewer_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

/**
 * Input type for creating finding action review
 */
export interface CreateFindingActionReviewInput {
  finding_action_evidence_id: string;
  review_status: FindingActionReviewStatus;
  review_comments?: string;
}

// ============================================================================
// FINDING REASSESSMENT TYPES
// ============================================================================

/**
 * Finding Reassessment Compliance Status
 */
export type ReassessmentComplianceStatus = "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";

/**
 * Finding Reassessment interface
 */
export interface FindingReassessment {
  id: string;
  finding_id: string;
  finding_action_id: string;
  compliance_status: ReassessmentComplianceStatus;
  auditor_comments: string;
  new_severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  new_recommendation?: string;
  compliance_percentage?: number;
  reassessed_by: string;
  reassessed_at: string;
  created_at: string;
  updated_at: string;

  // Relationships
  reassessed_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  finding_action?: FindingAction;
}

/**
 * Input type for creating finding reassessment
 */
export interface CreateFindingReassessmentInput {
  finding_id: string;
  finding_action_id: string;
  compliance_status: ReassessmentComplianceStatus;
  auditor_comments: string;
  new_severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  new_recommendation?: string;
  compliance_percentage?: number;
}

/**
 * Input type for updating finding reassessment
 */
export interface UpdateFindingReassessmentInput {
  compliance_status?: ReassessmentComplianceStatus;
  auditor_comments?: string;
  new_severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  new_recommendation?: string;
  compliance_percentage?: number;
}

// ============================================================================
// AUDIT MEMO TYPES
// ============================================================================

export type MemoStatus = "DRAFT" | "SENT";

export interface AuditMemo {
  id: string;
  organization_id: string;
  audit_plan_id: string;
  memo_number?: string;
  to_recipients?: string[];
  cc_recipients?: string[];
  from_sender?: string;
  subject: string;
  content: string; // HTML string from TipTap editor
  audit_objectives?: string;
  audit_scope_items?: string[];
  key_contacts?: string[];
  entrance_meeting_datetime?: string;
  exit_meeting_datetime?: string;
  field_audit_start_date?: string;
  field_audit_end_date?: string;
  audit_staff?: Array<{
    name: string;
    title: string;
    role?: string;
  }>;
  requested_information?: string[];
  signature_name?: string;
  signature_title?: string;
  acknowledged_by?: string | null;
  acknowledged_title?: string | null;
  acknowledged_date?: string | null;
  use_template: boolean;
  status: MemoStatus;
  sent_at: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  // Relationships
  created_by_user?: User;
  updated_by_user?: User;
}

export interface CreateOrUpdateAuditMemoInput {
  memo_number?: string;
  to_recipients?: string[];
  cc_recipients?: string[];
  from_sender?: string;
  subject: string;
  content: string; // HTML
  audit_objectives?: string;
  audit_scope_items?: string[];
  key_contacts?: string[];
  entrance_meeting_datetime?: string;
  exit_meeting_datetime?: string;
  field_audit_start_date?: string;
  field_audit_end_date?: string;
  audit_staff?: Array<{
    name: string;
    title: string;
    role?: string;
  }>;
  requested_information?: string[];
  signature_name?: string;
  signature_title?: string;
  acknowledged_by?: string;
  acknowledged_title?: string;
  acknowledged_date?: string;
  use_template?: boolean;
  status?: MemoStatus;
}

export interface SendMemoInput {
  recipient_email?: string;
  cc_emails?: string[];
  subject?: string;
}

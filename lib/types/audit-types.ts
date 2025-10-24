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
 */
export type AuditStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Test result types for workpaper testing
 */
export type TestResult = 'conformity' | 'partial-conformity' | 'non-conformity';

/**
 * Finding severity levels
 */
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Finding status types representing the lifecycle of a finding
 */
export type FindingStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

/**
 * Report types available for generation
 */
export type ReportType = 'summary' | 'detailed' | 'non-conformity' | 'management-review' | 'compliance';

/**
 * Export formats for reports
 */
export type ReportFormat = 'pdf' | 'excel' | 'csv';

/**
 * View mode options for lists
 */
export type ViewMode = 'list' | 'grid' | 'timeline';

// ============================================================================
// AUDIT PLAN TYPES
// ============================================================================

/**
 * Audit Plan interface representing a complete audit plan
 */
export interface AuditPlan {
  id: string;
  title: string;
  standard: string;
  scope: string[];
  objectives: string;
  teamLeader: string;
  teamMembers: string[];
  startDate: Date;
  endDate: Date;
  status: AuditStatus;
  progress: number;
  conformityRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

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
}

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
  clause: string;
  clauseTitle: string;
  objectives: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  conclusion?: string;
  evidence: Evidence[];
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
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
export type ClauseCategory = 'Context' | 'Leadership' | 'Planning' | 'Support' | 'Operation' | 'Evaluation' | 'Improvement' | 'Annex A';

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
export interface WorkpaperTemplate {
  id: string;
  clause: string;
  clauseTitle: string;
  category: string;
  objectives: string[];
  testProcedures: string[];
}

/**
 * Evidence type categories
 */
export type EvidenceType = 'Policy' | 'Screenshot' | 'Minutes' | 'Report' | 'Other';

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
  status: 'draft' | 'in-review' | 'completed';
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
export type CustomTemplateType = 'standard' | 'iso27001' | 'general' | 'custom';

/**
 * Custom field definition for flexible templates
 */
export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
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
  sections: Omit<CustomTemplateSection, 'id'>[];
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

  status: 'draft' | 'in-review' | 'completed';
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
  createdAt: Date;
  updatedAt: Date;

  // Workpaper relationship
  workpaperId?: string;
  workpaperReference?: string;
  evidenceRowId?: string; // For general workpapers - links to specific row
  sourceType?: 'workpaper' | 'manual' | 'external'; // How the finding was created
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

  // Workpaper relationship
  workpaperId?: string;
  evidenceRowId?: string;
  sourceType?: 'workpaper' | 'manual' | 'external';
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
  type: 'created' | 'updated' | 'status_change' | 'comment' | 'resolved';
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
  frequency: 'daily' | 'weekly' | 'monthly';
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
 * Team member information
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

/**
 * Input type for adding a team member
 */
export interface TeamMemberInput {
  name: string;
  email: string;
  role: string;
  department: string;
}

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
  type: 'audit_created' | 'audit_updated' | 'finding_created' | 'workpaper_submitted';
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

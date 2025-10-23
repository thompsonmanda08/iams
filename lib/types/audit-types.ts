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
  auditId: string;
  auditTitle: string;
  clause: string;
  clauseTitle: string;
  objectives: string;
  testProcedures: string;
  testResults: string;
  testResult: TestResult;
  evidence: Evidence[];
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating or updating a workpaper
 */
export interface WorkpaperInput {
  auditId: string;
  clause: string;
  objectives: string;
  testProcedures: string;
  testResults: string;
  testResult: TestResult;
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
  clause: string;
  objectives: string;
  testProcedures: string;
  testResults?: string;
  testResult?: TestResult;
  lastSaved?: Date;
}

/**
 * Workpaper template for pre-filled testing procedures
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
 * Evidence file attached to workpapers or findings
 */
export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
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

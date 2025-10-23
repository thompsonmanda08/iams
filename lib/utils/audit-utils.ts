/**
 * Audit Management Module Utility Functions
 *
 * This file contains all utility functions for the Audit Management Module.
 * Organized by category for easy navigation and maintenance.
 *
 * @module audit-utils
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, isAfter, isBefore, isWithinInterval, addDays } from 'date-fns';
import type {
  AuditStatus,
  FindingSeverity,
  FindingStatus,
  TestResult,
  AuditPlan,
  Workpaper,
  Finding,
  ConformityTrend,
  FindingsByClause,
  ClauseInfo,
} from '@/lib/types/audit-types';

// ============================================================================
// GENERAL UTILITIES
// ============================================================================

/**
 * Merge className strings with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(date, formatStr);
}

/**
 * Format a date range
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(date: Date, range: [Date, Date]): boolean {
  return isWithinInterval(date, { start: range[0], end: range[1] });
}

/**
 * Check if a date is due soon (within threshold days)
 */
export function isDueSoon(date: Date, daysThreshold: number = 7): boolean {
  const today = new Date();
  const diffDays = differenceInDays(date, today);
  return diffDays >= 0 && diffDays <= daysThreshold;
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date): boolean {
  return isBefore(date, new Date());
}

// ============================================================================
// STATUS UTILITIES
// ============================================================================

/**
 * Get color class for audit status
 */
export function getAuditStatusColor(status: AuditStatus): string {
  const colors: Record<AuditStatus, string> = {
    planned: 'blue',
    'in-progress': 'amber',
    completed: 'emerald',
    cancelled: 'slate',
  };
  return colors[status];
}

/**
 * Get label for audit status
 */
export function getAuditStatusLabel(status: AuditStatus): string {
  const labels: Record<AuditStatus, string> = {
    planned: 'Planned',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

/**
 * Get color class for finding severity
 */
export function getSeverityColor(severity: FindingSeverity): string {
  const colors: Record<FindingSeverity, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
  };
  return colors[severity];
}

/**
 * Get label for finding severity
 */
export function getSeverityLabel(severity: FindingSeverity): string {
  const labels: Record<FindingSeverity, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[severity];
}

/**
 * Get color class for finding status
 */
export function getFindingStatusColor(status: FindingStatus): string {
  const colors: Record<FindingStatus, string> = {
    open: 'red',
    'in-progress': 'amber',
    resolved: 'emerald',
    closed: 'slate',
  };
  return colors[status];
}

/**
 * Get label for finding status
 */
export function getFindingStatusLabel(status: FindingStatus): string {
  const labels: Record<FindingStatus, string> = {
    open: 'Open',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return labels[status];
}

/**
 * Get color class for test result
 */
export function getTestResultColor(result: TestResult): string {
  const colors: Record<TestResult, string> = {
    conformity: 'emerald',
    'partial-conformity': 'amber',
    'non-conformity': 'red',
  };
  return colors[result];
}

/**
 * Get label for test result
 */
export function getTestResultLabel(result: TestResult): string {
  const labels: Record<TestResult, string> = {
    conformity: 'Conformity',
    'partial-conformity': 'Partial Conformity',
    'non-conformity': 'Non-Conformity',
  };
  return labels[result];
}

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate conformity rate from workpapers
 */
export function calculateConformityRate(workpapers: Workpaper[]): number {
  if (workpapers.length === 0) return 0;
  const conforming = workpapers.filter((w) => w.testResult === 'conformity').length;
  return Math.round((conforming / workpapers.length) * 100);
}

/**
 * Calculate audit progress based on workpapers
 */
export function calculateAuditProgress(workpapers: Workpaper[]): number {
  if (workpapers.length === 0) return 0;
  const completed = workpapers.filter((w) => w.reviewedBy && w.reviewedDate).length;
  return Math.round((completed / workpapers.length) * 100);
}

/**
 * Calculate findings summary
 */
export function calculateFindingsSummary(findings: Finding[]) {
  return {
    total: findings.length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    open: findings.filter((f) => f.status === 'open').length,
    inProgress: findings.filter((f) => f.status === 'in-progress').length,
    resolved: findings.filter((f) => f.status === 'resolved').length,
    closed: findings.filter((f) => f.status === 'closed').length,
    overdue: findings.filter((f) => f.dueDate && isOverdue(f.dueDate) && f.status !== 'resolved' && f.status !== 'closed').length,
  };
}

// ============================================================================
// REFERENCE CODE GENERATION
// ============================================================================

/**
 * Generate finding reference code
 */
export function generateFindingReferenceCode(year: number, sequence: number): string {
  return `FND-${year}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Generate next reference code from existing findings
 */
export function generateNextReferenceCode(findings: Finding[]): string {
  const currentYear = new Date().getFullYear();
  const thisYearFindings = findings.filter((f) => f.referenceCode.startsWith(`FND-${currentYear}`));
  const nextSequence = thisYearFindings.length + 1;
  return generateFindingReferenceCode(currentYear, nextSequence);
}

// ============================================================================
// FILTERING UTILITIES
// ============================================================================

/**
 * Filter audits by status
 */
export function filterAuditsByStatus(audits: AuditPlan[], statuses: AuditStatus[]): AuditPlan[] {
  if (statuses.length === 0) return audits;
  return audits.filter((audit) => statuses.includes(audit.status));
}

/**
 * Filter audits by date range
 */
export function filterAuditsByDateRange(audits: AuditPlan[], dateRange: [Date, Date]): AuditPlan[] {
  return audits.filter((audit) => {
    const auditStart = audit.startDate;
    const auditEnd = audit.endDate;
    return (
      isWithinInterval(auditStart, { start: dateRange[0], end: dateRange[1] }) ||
      isWithinInterval(auditEnd, { start: dateRange[0], end: dateRange[1] })
    );
  });
}

/**
 * Filter findings by severity
 */
export function filterFindingsBySeverity(findings: Finding[], severities: FindingSeverity[]): Finding[] {
  if (severities.length === 0) return findings;
  return findings.filter((finding) => severities.includes(finding.severity));
}

/**
 * Filter findings by status
 */
export function filterFindingsByStatus(findings: Finding[], statuses: FindingStatus[]): Finding[] {
  if (statuses.length === 0) return findings;
  return findings.filter((finding) => statuses.includes(finding.status));
}

// ============================================================================
// SORTING UTILITIES
// ============================================================================

/**
 * Sort audits by date
 */
export function sortAuditsByDate(audits: AuditPlan[], order: 'asc' | 'desc' = 'desc'): AuditPlan[] {
  return [...audits].sort((a, b) => {
    const comparison = a.startDate.getTime() - b.startDate.getTime();
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Sort findings by severity
 */
export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  const severityOrder: Record<FindingSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate audit plan data
 */
export function validateAuditPlan(data: Partial<AuditPlan>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.scope || data.scope.length === 0) {
    errors.push('At least one scope item is required');
  }

  if (!data.objectives || data.objectives.trim().length === 0) {
    errors.push('Objectives are required');
  }

  if (!data.teamLeader || data.teamLeader.trim().length === 0) {
    errors.push('Team leader is required');
  }

  if (data.startDate && data.endDate && isAfter(data.startDate, data.endDate)) {
    errors.push('End date must be after start date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate finding data
 */
export function validateFinding(data: Partial<Finding>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!data.recommendation || data.recommendation.trim().length === 0) {
    errors.push('Recommendation is required');
  }

  if (!data.clause) {
    errors.push('Clause is required');
  }

  if (!data.severity) {
    errors.push('Severity is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate workpaper data
 */
export function validateWorkpaper(data: Partial<Workpaper>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.clause) {
    errors.push('Clause is required');
  }

  if (!data.objectives || data.objectives.trim().length === 0) {
    errors.push('Objectives are required');
  }

  if (!data.testProcedures || data.testProcedures.trim().length === 0) {
    errors.push('Test procedures are required');
  }

  if (!data.testResults || data.testResults.trim().length === 0) {
    errors.push('Test results are required');
  }

  if (!data.testResult) {
    errors.push('Test result selection is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        const stringValue = value instanceof Date ? formatDate(value) : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ============================================================================
// SEARCH UTILITIES
// ============================================================================

/**
 * Search audits by text
 */
export function searchAudits(audits: AuditPlan[], searchText: string): AuditPlan[] {
  if (!searchText || searchText.trim().length === 0) return audits;

  const lowerSearch = searchText.toLowerCase();
  return audits.filter(
    (audit) =>
      audit.title.toLowerCase().includes(lowerSearch) ||
      audit.objectives.toLowerCase().includes(lowerSearch) ||
      audit.standard.toLowerCase().includes(lowerSearch) ||
      audit.teamLeader.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Search findings by text
 */
export function searchFindings(findings: Finding[], searchText: string): Finding[] {
  if (!searchText || searchText.trim().length === 0) return findings;

  const lowerSearch = searchText.toLowerCase();
  return findings.filter(
    (finding) =>
      finding.referenceCode.toLowerCase().includes(lowerSearch) ||
      finding.description.toLowerCase().includes(lowerSearch) ||
      finding.recommendation.toLowerCase().includes(lowerSearch) ||
      finding.clauseTitle.toLowerCase().includes(lowerSearch)
  );
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare conformity trend data for charts
 */
export function prepareConformityTrendData(workpapers: Workpaper[]): ConformityTrend[] {
  // Group workpapers by month
  const monthlyData = new Map<string, { conformity: number; partial: number; nonConformity: number; total: number }>();

  workpapers.forEach((wp) => {
    const monthKey = format(wp.createdAt, 'yyyy-MM');
    const existing = monthlyData.get(monthKey) || { conformity: 0, partial: 0, nonConformity: 0, total: 0 };

    if (wp.testResult === 'conformity') existing.conformity++;
    else if (wp.testResult === 'partial-conformity') existing.partial++;
    else if (wp.testResult === 'non-conformity') existing.nonConformity++;

    existing.total++;
    monthlyData.set(monthKey, existing);
  });

  // Convert to trend data
  return Array.from(monthlyData.entries())
    .map(([dateStr, data]) => ({
      date: new Date(dateStr + '-01'),
      conformityRate: data.total > 0 ? Math.round((data.conformity / data.total) * 100) : 0,
      partialConformityRate: data.total > 0 ? Math.round((data.partial / data.total) * 100) : 0,
      nonConformityRate: data.total > 0 ? Math.round((data.nonConformity / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Prepare findings by clause data for charts
 */
export function prepareFindingsByClauseData(findings: Finding[]): FindingsByClause[] {
  const clauseMap = new Map<string, FindingsByClause>();

  findings.forEach((finding) => {
    const existing = clauseMap.get(finding.clause) || {
      clause: finding.clause,
      clauseTitle: finding.clauseTitle,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    existing[finding.severity]++;
    existing.total++;
    clauseMap.set(finding.clause, existing);
  });

  return Array.from(clauseMap.values()).sort((a, b) => a.clause.localeCompare(b.clause));
}

/**
 * Prepare severity distribution data
 */
export function prepareSeverityDistribution(findings: Finding[]) {
  return {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
  };
}

// ============================================================================
// ISO 27001 UTILITIES
// ============================================================================

/**
 * ISO 27001:2022 Clauses
 */
export const ISO_27001_CLAUSES: Record<string, ClauseInfo> = {
  '4': { code: '4', title: 'Context of the Organization', category: 'Context' },
  '4.1': { code: '4.1', title: 'Understanding the Organization and its Context', category: 'Context' },
  '4.2': { code: '4.2', title: 'Understanding the Needs and Expectations of Interested Parties', category: 'Context' },
  '4.3': { code: '4.3', title: 'Determining the Scope of the ISMS', category: 'Context' },
  '4.4': { code: '4.4', title: 'Information Security Management System', category: 'Context' },

  '5': { code: '5', title: 'Leadership', category: 'Leadership' },
  '5.1': { code: '5.1', title: 'Leadership and Commitment', category: 'Leadership' },
  '5.2': { code: '5.2', title: 'Policy', category: 'Leadership' },
  '5.3': { code: '5.3', title: 'Organizational Roles, Responsibilities and Authorities', category: 'Leadership' },

  '6': { code: '6', title: 'Planning', category: 'Planning' },
  '6.1': { code: '6.1', title: 'Actions to Address Risks and Opportunities', category: 'Planning' },
  '6.1.1': { code: '6.1.1', title: 'General', category: 'Planning' },
  '6.1.2': { code: '6.1.2', title: 'Information Security Risk Assessment', category: 'Planning' },
  '6.1.3': { code: '6.1.3', title: 'Information Security Risk Treatment', category: 'Planning' },
  '6.2': { code: '6.2', title: 'Information Security Objectives and Planning to Achieve Them', category: 'Planning' },
  '6.3': { code: '6.3', title: 'Planning of Changes', category: 'Planning' },

  '7': { code: '7', title: 'Support', category: 'Support' },
  '7.1': { code: '7.1', title: 'Resources', category: 'Support' },
  '7.2': { code: '7.2', title: 'Competence', category: 'Support' },
  '7.3': { code: '7.3', title: 'Awareness', category: 'Support' },
  '7.4': { code: '7.4', title: 'Communication', category: 'Support' },
  '7.5': { code: '7.5', title: 'Documented Information', category: 'Support' },

  '8': { code: '8', title: 'Operation', category: 'Operation' },
  '8.1': { code: '8.1', title: 'Operational Planning and Control', category: 'Operation' },
  '8.2': { code: '8.2', title: 'Information Security Risk Assessment', category: 'Operation' },
  '8.3': { code: '8.3', title: 'Information Security Risk Treatment', category: 'Operation' },

  '9': { code: '9', title: 'Performance Evaluation', category: 'Evaluation' },
  '9.1': { code: '9.1', title: 'Monitoring, Measurement, Analysis and Evaluation', category: 'Evaluation' },
  '9.2': { code: '9.2', title: 'Internal Audit', category: 'Evaluation' },
  '9.3': { code: '9.3', title: 'Management Review', category: 'Evaluation' },

  '10': { code: '10', title: 'Improvement', category: 'Improvement' },
  '10.1': { code: '10.1', title: 'Continual Improvement', category: 'Improvement' },
  '10.2': { code: '10.2', title: 'Nonconformity and Corrective Action', category: 'Improvement' },
};

/**
 * Get clause title by code
 */
export function getClauseTitle(code: string): string {
  return ISO_27001_CLAUSES[code]?.title || code;
}

/**
 * Get clause category by code
 */
export function getClauseCategory(code: string): string {
  return ISO_27001_CLAUSES[code]?.category || 'Unknown';
}

/**
 * Get all clauses
 */
export function getAllClauses(category?: string): ClauseInfo[] {
  const clauses = Object.values(ISO_27001_CLAUSES);
  return category ? clauses.filter((c) => c.category === category) : clauses;
}

// ============================================================================
// NOTIFICATION UTILITIES
// ============================================================================

/**
 * Check if notification should be sent for approaching due date
 */
export function shouldNotifyDueDateApproaching(dueDate: Date, reminderDays: number = 7): boolean {
  return isDueSoon(dueDate, reminderDays);
}

/**
 * Check if notification should be sent for overdue item
 */
export function shouldNotifyOverdue(dueDate: Date): boolean {
  return isOverdue(dueDate);
}

/**
 * Get upcoming audits within specified days
 */
export function getUpcomingAudits(audits: AuditPlan[], days: number = 30): AuditPlan[] {
  const today = new Date();
  const futureDate = addDays(today, days);

  return audits
    .filter((audit) => {
      return (
        audit.status === 'planned' &&
        isAfter(audit.startDate, today) &&
        isBefore(audit.startDate, futureDate)
      );
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

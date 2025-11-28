/**
 * CENTRALIZED STATUS CONFIGURATION
 *
 * This file serves as the single source of truth for all status definitions
 * across the IAMS platform. All status displays, validations, and transitions
 * should reference this configuration.
 *
 * Convention: All status values use UPPER_SNAKE_CASE
 *
 * @see STATUS_STANDARDIZATION_PLAN.md for full implementation details
 */

// ============================================================================
// STATUS TYPE DEFINITIONS
// ============================================================================

/** Core status values used across all entities */
export const STATUS_VALUES = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ON_HOLD: 'ON_HOLD',
  OPEN: 'OPEN',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
  HIGH:'HIGH',
  MEDIUM : 'MEDIUM',
  LOW: 'LOW',
  ABOVE: 'ABOVE',
  BELOW: 'BELOW',
  CRITICAL: 'CRITICAL'
} as const;

export type StandardStatus = typeof STATUS_VALUES[keyof typeof STATUS_VALUES];

// ============================================================================
// COLOR & STYLE CONFIGURATION
// ============================================================================

export type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeStyle = 'solid' | 'outline';

interface StatusConfig {
  id: StandardStatus;
  label: string;
  description: string;
  color: BadgeColor;
  style: BadgeStyle;
  hexColor: string;
  sortOrder: number;
}

/** Comprehensive status configuration with display properties */
export const STANDARD_STATUSES: Record<StandardStatus, StatusConfig> = {
  DRAFT: {
    id: 'DRAFT',
    label: 'Draft',
    description: 'Entity is being prepared and not yet submitted for review',
    color: 'default',
    style: 'outline',
    hexColor: '#6C757D',
    sortOrder: 1
  },
  PENDING: {
    id: 'PENDING',
    label: 'Pending',
    description: 'Awaiting action or approval',
    color: 'warning',
    style: 'outline',
    hexColor: '#FFC107',
    sortOrder: 2
  },
  SUBMITTED: {
    id: 'SUBMITTED',
    label: 'Submitted',
    description: 'Entity has been submitted for approval',
    color: 'info',
    style: 'outline',
    hexColor: '#0D6EFD',
    sortOrder: 3
  },
  IN_REVIEW: {
    id: 'IN_REVIEW',
    label: 'In Review',
    description: 'Entity is under review by the approval team',
    color: 'info',
    style: 'outline',
    hexColor: '#0DCAF0',
    sortOrder: 4
  },
  APPROVED: {
    id: 'APPROVED',
    label: 'Approved',
    description: 'Entity has been approved and is active',
    color: 'success',
    style: 'solid',
    hexColor: '#198754',
    sortOrder: 5
  },
  REJECTED: {
    id: 'REJECTED',
    label: 'Rejected',
    description: 'Entity was rejected and needs revision',
    color: 'danger',
    style: 'solid',
    hexColor: '#DC3545',
    sortOrder: 6
  },
  ON_HOLD: {
    id: 'ON_HOLD',
    label: 'On Hold',
    description: 'Entity is paused pending other conditions',
    color: 'warning',
    style: 'outline',
    hexColor: '#FFC107',
    sortOrder: 7
  },
  OPEN: {
    id: 'OPEN',
    label: 'Open',
    description: 'Entity is active and open (legacy status)',
    color: 'success',
    style: 'solid',
    hexColor: '#28A745',
    sortOrder: 8
  },
  COMPLETED: {
    id: 'COMPLETED',
    label: 'Completed',
    description: 'Entity execution is complete',
    color: 'success',
    style: 'solid',
    hexColor: '#20C997',
    sortOrder: 9
  },
  CLOSED: {
    id: 'CLOSED',
    label: 'Closed',
    description: 'Entity is closed and no longer active (legacy status)',
    color: 'default',
    style: 'outline',
    hexColor: '#6C757D',
    sortOrder: 10
  },
  ARCHIVED: {
    id: 'ARCHIVED',
    label: 'Archived',
    description: 'Entity has been archived and is read-only',
    color: 'default',
    style: 'outline',
    hexColor: '#495057',
    sortOrder: 11
  },
  HIGH: {
    id: 'HIGH',
    label: 'High',
    description: 'Rating High and is read-only',
    color: 'danger',
    style: 'solid',
    hexColor: '#DC3545',
    sortOrder: 12
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'Medium',
    description: 'Rating Medium and is read-only',
    color: 'warning',
    style: 'solid',
    hexColor: '#FFC107',
    sortOrder: 13
  },
  LOW: {
    id: 'LOW',
    label: 'Low',
    description: 'Rating Low and is read-only',
    color: 'success',
    style: 'solid',
    hexColor: '#28A745',
    sortOrder: 14
  },
  BELOW: {
    id: 'BELOW',
    label: 'Below',
    description: 'Risk Appetite Status Below and is read-only',
    color: 'success',
    style: 'solid',
    hexColor: '#28A745',
    sortOrder: 14
  },
  ABOVE: {
    id: 'ABOVE',
    label: 'Above',
    description: 'Risk Appetite Status Above and is read-only',
    color: 'danger',
    style: 'solid',
    hexColor: '#DC3545',
    sortOrder: 12
  },
  CRITICAL: {
    id: 'CRITICAL',
    label: 'Critical',
    description: 'Incident severity level Critical and is read-only',
    color: 'danger',
    style: 'solid',
    hexColor: '#DC3545',
    sortOrder: 13
  },
  
};

// ============================================================================
// ENTITY-SPECIFIC STATUS RULES & TRANSITIONS
// ============================================================================

interface EntityStatusRules {
  allowedStatuses: StandardStatus[];
  defaultStatus: StandardStatus;
  transitions: Record<StandardStatus, StandardStatus[]>;
}

/** Status rules and valid transitions for each entity type */
export const ENTITY_STATUS_RULES: Record<string, EntityStatusRules> = {
  // ========== AUDIT STATUSES ==========
  audit: {
    allowedStatuses: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'ARCHIVED'],
    defaultStatus: 'DRAFT',
    transitions: {
      DRAFT: ['SUBMITTED', 'REJECTED'],
      PENDING: ['SUBMITTED'],
      SUBMITTED: ['IN_REVIEW', 'DRAFT'],
      IN_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['COMPLETED', 'ARCHIVED'],
      REJECTED: ['DRAFT'],
      ON_HOLD: [],
      OPEN: [],
      COMPLETED: ['ARCHIVED'],
      CLOSED: [],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },

  // ========== AUDIT PLAN STATUSES ==========
  auditPlan: {
    allowedStatuses: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'ARCHIVED'],
    defaultStatus: 'DRAFT',
    transitions: {
      DRAFT: ['SUBMITTED', 'REJECTED'],
      PENDING: ['SUBMITTED'],
      SUBMITTED: ['IN_REVIEW', 'DRAFT'],
      IN_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['COMPLETED', 'ARCHIVED'],
      REJECTED: ['DRAFT'],
      ON_HOLD: [],
      OPEN: [],
      COMPLETED: ['ARCHIVED'],
      CLOSED: [],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]

    }
  },

  // ========== FINDING STATUSES ==========
  finding: {
    allowedStatuses: ['OPEN', 'PENDING', 'IN_REVIEW', 'COMPLETED', 'CLOSED', 'ARCHIVED'],
    defaultStatus: 'OPEN',
    transitions: {
      DRAFT: [],
      PENDING: ['IN_REVIEW', 'CLOSED'],
      SUBMITTED: [],
      IN_REVIEW: ['COMPLETED', 'REJECTED'],
      APPROVED: [],
      REJECTED: [],
      ON_HOLD: ['COMPLETED'],
      OPEN: ['PENDING', 'COMPLETED', 'CLOSED'],
      COMPLETED: ['CLOSED', 'ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },

  // ========== RISK STATUSES ==========
  risk: {
    allowedStatuses: ['DRAFT', 'OPEN', 'PENDING', 'APPROVED', 'CLOSED', 'ON_HOLD'],
    defaultStatus: 'DRAFT',
    transitions: {
      DRAFT: ['OPEN', 'REJECTED'],
      PENDING: ['OPEN', 'APPROVED'],
      SUBMITTED: ['OPEN'],
      IN_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['OPEN', 'ON_HOLD', 'CLOSED'],
      REJECTED: ['DRAFT'],
      ON_HOLD: ['OPEN', 'CLOSED'],
      OPEN: ['PENDING', 'ON_HOLD', 'CLOSED'],
      COMPLETED: [],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },

  // ========== RISK ACTION STATUSES ==========
  riskAction: {
    allowedStatuses: ['DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'COMPLETED', 'CLOSED', 'REJECTED'],
    defaultStatus: 'DRAFT',
    transitions: {
      DRAFT: ['PENDING', 'REJECTED'],
      PENDING: ['IN_REVIEW', 'DRAFT'],
      SUBMITTED: ['IN_REVIEW'],
      IN_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['COMPLETED', 'ON_HOLD'],
      REJECTED: ['DRAFT'],
      ON_HOLD: ['APPROVED', 'COMPLETED'],
      OPEN: [],
      COMPLETED: ['CLOSED', 'ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },

  // ========== TASK STATUSES ==========
  task: {
    allowedStatuses: ['PENDING', 'IN_REVIEW', 'COMPLETED', 'REJECTED', 'ON_HOLD'],
    defaultStatus: 'PENDING',
    transitions: {
      DRAFT: [],
      PENDING: ['IN_REVIEW', 'COMPLETED', 'REJECTED'],
      SUBMITTED: [],
      IN_REVIEW: ['COMPLETED', 'REJECTED'],
      APPROVED: [],
      REJECTED: ['PENDING'],
      ON_HOLD: ['PENDING', 'COMPLETED'],
      OPEN: [],
      COMPLETED: ['ARCHIVED'],
      CLOSED: [],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },

  // ========== WORKFLOW STATUSES ==========
  workflow: {
    allowedStatuses: ['DRAFT', 'PENDING', 'OPEN', 'COMPLETED', 'CLOSED', 'ARCHIVED'],
    defaultStatus: 'DRAFT',
    transitions: {
      DRAFT: ['PENDING'],
      PENDING: ['OPEN'],
      SUBMITTED: [],
      IN_REVIEW: [],
      APPROVED: [],
      REJECTED: ['DRAFT'],
      ON_HOLD: ['OPEN'],
      OPEN: ['COMPLETED', 'ON_HOLD', 'CLOSED'],
      COMPLETED: ['CLOSED', 'ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },

  // ========== INCIDENT STATUSES ==========
  incident: {
    allowedStatuses: ['PENDING', 'IN_REVIEW', 'OPEN', 'COMPLETED', 'CLOSED'],
    defaultStatus: 'PENDING',
    transitions: {
      DRAFT: [],
      PENDING: ['OPEN'],
      SUBMITTED: [],
      IN_REVIEW: ['OPEN', 'CLOSED'],
      APPROVED: [],
      REJECTED: [],
      ON_HOLD: [],
      OPEN: ['IN_REVIEW', 'COMPLETED', 'CLOSED'],
      COMPLETED: ['CLOSED', 'ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  },
   // ========== RISK MATRIX STATUSES ==========
  matrix: {
    allowedStatuses: ['PENDING', 'IN_REVIEW', 'OPEN', 'COMPLETED', 'CLOSED'],
    defaultStatus: 'PENDING',
    transitions: {
      DRAFT: [],
      PENDING: ['OPEN'],
      SUBMITTED: [],
      IN_REVIEW: ['OPEN', 'CLOSED'],
      APPROVED: [],
      REJECTED: [],
      ON_HOLD: [],
      OPEN: ['IN_REVIEW', 'COMPLETED', 'CLOSED'],
      COMPLETED: ['CLOSED', 'ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      ABOVE: [],
      BELOW:[],
      CRITICAL:[]
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status configuration by status value
 * @param status - The status value
 * @returns Status configuration object
 */
export function getStatusConfig(status: string): StatusConfig | null {
  const normalizedStatus = status.toUpperCase() as StandardStatus;
  return STANDARD_STATUSES[normalizedStatus] || null;
}

/**
 * Get display label for a status
 * @param status - The status value
 * @returns Human-readable label
 */
export function getStatusLabel(status: string): string {
  const config = getStatusConfig(status);
  return config?.label || status;
}

/**
 * Get display description for a status
 * @param status - The status value
 * @returns Status description
 */
export function getStatusDescription(status: string): string {
  const config = getStatusConfig(status);
  return config?.description || '';
}

/**
 * Get badge color for a status
 * @param status - The status value
 * @returns BadgeColor type
 */
export function getStatusColor(status: string): BadgeColor {
  const config = getStatusConfig(status);
  return config?.color || 'default';
}

/**
 * Get badge style for a status
 * @param status - The status value
 * @returns BadgeStyle type
 */
export function getStatusStyle(status: string): BadgeStyle {
  const config = getStatusConfig(status);
  return config?.style || 'outline';
}

/**
 * Get hex color code for a status
 * @param status - The status value
 * @returns Hex color string
 */
export function getStatusHexColor(status: string): string {
  const config = getStatusConfig(status);
  return config?.hexColor || '#6C757D';
}

/**
 * Check if a status exists in the standard set
 * @param status - The status value to check
 * @returns true if valid status, false otherwise
 */
export function isValidStatus(status: string): status is StandardStatus {
  const normalizedStatus = status.toUpperCase();
  return normalizedStatus in STATUS_VALUES;
}

/**
 * Validate if a status is allowed for a specific entity type
 * @param status - The status value
 * @param entityType - The entity type (e.g., 'audit', 'risk', 'task')
 * @returns true if status is allowed for entity, false otherwise
 */
export function isValidStatusForEntity(status: string, entityType: string): boolean {
  const rules = ENTITY_STATUS_RULES[entityType];
  if (!rules) return false;

  const normalizedStatus = status.toUpperCase() as StandardStatus;
  return rules.allowedStatuses.includes(normalizedStatus);
}

/**
 * Get default status for an entity type
 * @param entityType - The entity type (e.g., 'audit', 'risk', 'task')
 * @returns Default status for the entity
 */
export function getDefaultStatusForEntity(entityType: string): StandardStatus | null {
  const rules = ENTITY_STATUS_RULES[entityType];
  return rules?.defaultStatus || null;
}

/**
 * Get valid transition targets from a current status
 * @param currentStatus - The current status
 * @param entityType - The entity type (e.g., 'audit', 'risk', 'task')
 * @returns Array of valid next statuses
 */
export function getValidTransitions(
  currentStatus: string,
  entityType: string
): StandardStatus[] {
  const rules = ENTITY_STATUS_RULES[entityType];
  if (!rules) return [];

  const normalizedStatus = currentStatus.toUpperCase() as StandardStatus;
  return rules.transitions[normalizedStatus] || [];
}

/**
 * Check if a status transition is valid
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @param entityType - The entity type (e.g., 'audit', 'risk', 'task')
 * @returns Object with validation result and reason if invalid
 */
export function validateStatusTransition(
  fromStatus: string,
  toStatus: string,
  entityType: string
): { valid: boolean; reason?: string } {
  const rules = ENTITY_STATUS_RULES[entityType];

  if (!rules) {
    return { valid: false, reason: `Unknown entity type: ${entityType}` };
  }

  const normalizedFrom = fromStatus.toUpperCase() as StandardStatus;
  const normalizedTo = toStatus.toUpperCase() as StandardStatus;

  // Check if target status is allowed for entity
  if (!rules.allowedStatuses.includes(normalizedTo)) {
    return {
      valid: false,
      reason: `Status ${normalizedTo} is not allowed for ${entityType}`
    };
  }

  // Check if transition is valid
  const validTransitions = rules.transitions[normalizedFrom] || [];
  if (!validTransitions.includes(normalizedTo)) {
    return {
      valid: false,
      reason: `Cannot transition from ${normalizedFrom} to ${normalizedTo} for ${entityType}`
    };
  }

  return { valid: true };
}

/**
 * Normalize status string to standard format (UPPER_SNAKE_CASE)
 * Handles kebab-case, camelCase, and other variations
 * @param status - Status string in any format
 * @returns Normalized UPPER_SNAKE_CASE status
 */
export function normalizeStatus(status: string): StandardStatus | null {
  // Convert various formats to UPPER_SNAKE_CASE
  let normalized = status
    .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase to snake_case
    .replace(/-/g, '_') // kebab-case to snake_case
    .toUpperCase();

  return isValidStatus(normalized) ? (normalized as StandardStatus) : null;
}

/**
 * Get all standard statuses sorted by sort order
 * @returns Array of status configurations sorted
 */
export function getAllStatusesSorted(): StatusConfig[] {
  return Object.values(STANDARD_STATUSES).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all statuses allowed for a specific entity type
 * @param entityType - The entity type
 * @returns Array of allowed statuses
 */
export function getAllowedStatusesForEntity(entityType: string): StandardStatus[] {
  const rules = ENTITY_STATUS_RULES[entityType];
  return rules?.allowedStatuses || [];
}

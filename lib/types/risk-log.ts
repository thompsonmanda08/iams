export interface RiskLogResponse {
  status: string;
  message: string;
  data: {
    data: RiskActionLog[];
    pagination: PaginationInfo;
  };
}

export interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Event Categories (matches backend)
export const EventCategory = {
  RISK: "RISK",
  ACTION: "ACTION",
  ASSESSMENT: "ASSESSMENT",
  CONTROL: "CONTROL",
  REVIEW: "REVIEW",
} as const;

// Event Types (matches backend)
export const EventType = {
  // Risk Events
  RISK_CREATED: "RISK_CREATED",
  RISK_UPDATED: "RISK_UPDATED",
  RISK_ASSESSED: "RISK_ASSESSED",
  RISK_RATING_CHANGED: "RISK_RATING_CHANGED",
  RISK_APPETITE_STATUS_CHANGED: "RISK_APPETITE_STATUS_CHANGED",
  RISK_STATUS_CHANGED: "RISK_STATUS_CHANGED",
  RISK_OWNER_CHANGED: "RISK_OWNER_CHANGED",
  RISK_CLOSED: "RISK_CLOSED",

  // Action Events
  ACTION_ASSIGNED: "ACTION_ASSIGNED",
  ACTION_STATUS_CHANGED: "ACTION_STATUS_CHANGED",
  ACTION_DUE_DATE_CHANGED: "ACTION_DUE_DATE_CHANGED",
  EVIDENCE_SUBMITTED: "EVIDENCE_SUBMITTED",
  EVIDENCE_UPDATED: "EVIDENCE_UPDATED",
  REVIEW_SUBMITTED: "REVIEW_SUBMITTED",
  REVIEW_APPROVED: "REVIEW_APPROVED",
  REVIEW_REJECTED: "REVIEW_REJECTED",

  // Control Events
  CONTROL_ADDED: "CONTROL_ADDED",
  CONTROL_UPDATED: "CONTROL_UPDATED",
  CONTROL_EFFECTIVENESS_CHANGED: "CONTROL_EFFECTIVENESS_CHANGED",
  CONTROL_REMOVED: "CONTROL_REMOVED",

  // Assessment Events
  LIKELIHOOD_CHANGED: "LIKELIHOOD_CHANGED",
  IMPACT_CHANGED: "IMPACT_CHANGED",
  INHERENT_RATING_CHANGED: "INHERENT_RATING_CHANGED",
  RESIDUAL_RATING_CHANGED: "RESIDUAL_RATING_CHANGED",
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];
export type EventType = typeof EventType[keyof typeof EventType];

// Main log interface matching backend structure
export interface RiskActionLog {
  id: string;
  organization_id: string;
  risk_id?: string;
  action_id?: string;
  event_type: EventType;
  event_category: EventCategory;
  user_id: string;
  username: string;
  metadata: Record<string, any>;
  description: string;
  created_at: string;
}

// For UI display with enriched data
export interface EnrichedLog extends RiskActionLog {
  risk_name?: string;
  action_name?: string;
  formatted_time?: string;
}

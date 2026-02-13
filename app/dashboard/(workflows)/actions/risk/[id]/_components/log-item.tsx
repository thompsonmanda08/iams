// components/risk-log/log-item.tsx
import {
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  Edit,
  BarChart,
  TrendingUp,
  Gauge,
  RefreshCw,
  UserCircle,
  UserPlus,
  RefreshCcw,
  Calendar,
  FileText,
  FileEdit,
  Send,
  ThumbsUp,
  ThumbsDown,
  Shield,
  ShieldPlus,
  ShieldCheck,
  ShieldOff,
  Percent,
  Target,
  TrendingDown,
  Activity,
  ChevronRight
} from "lucide-react";
import { EnrichedLog, EventType, EventCategory } from "@/lib/types/risk-log";
import { format, formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/status-badge";

interface LogItemProps {
  log: EnrichedLog;
  variant?: "default" | "compact";
}

const eventIcons = {
  // Risk Events
  [EventType.RISK_CREATED]: PlusCircle,
  [EventType.RISK_UPDATED]: Edit,
  [EventType.RISK_ASSESSED]: BarChart,
  [EventType.RISK_RATING_CHANGED]: TrendingUp,
  [EventType.RISK_APPETITE_STATUS_CHANGED]: Gauge,
  [EventType.RISK_STATUS_CHANGED]: RefreshCw,
  [EventType.RISK_OWNER_CHANGED]: UserCircle,
  [EventType.RISK_CLOSED]: CheckCircle,

  // Action Events
  [EventType.ACTION_ASSIGNED]: UserPlus,
  [EventType.ACTION_STATUS_CHANGED]: RefreshCcw,
  [EventType.ACTION_DUE_DATE_CHANGED]: Calendar,
  [EventType.EVIDENCE_SUBMITTED]: FileText,
  [EventType.EVIDENCE_UPDATED]: FileEdit,
  [EventType.REVIEW_SUBMITTED]: Send,
  [EventType.REVIEW_APPROVED]: ThumbsUp,
  [EventType.REVIEW_REJECTED]: ThumbsDown,

  // Control Events
  [EventType.CONTROL_ADDED]: ShieldPlus,
  [EventType.CONTROL_UPDATED]: Shield,
  [EventType.CONTROL_EFFECTIVENESS_CHANGED]: ShieldCheck,
  [EventType.CONTROL_REMOVED]: ShieldOff,

  // Assessment Events
  [EventType.LIKELIHOOD_CHANGED]: Percent,
  [EventType.IMPACT_CHANGED]: Target,
  [EventType.INHERENT_RATING_CHANGED]: TrendingDown,
  [EventType.RESIDUAL_RATING_CHANGED]: Activity
};

// Color mapping for event types
const eventColors = {
  // Risk Events - Blue
  [EventType.RISK_CREATED]: "bg-blue-500",
  [EventType.RISK_UPDATED]: "bg-blue-500",
  [EventType.RISK_ASSESSED]: "bg-blue-500",
  [EventType.RISK_RATING_CHANGED]: "bg-blue-500",
  [EventType.RISK_APPETITE_STATUS_CHANGED]: "bg-blue-500",
  [EventType.RISK_STATUS_CHANGED]: "bg-blue-500",
  [EventType.RISK_OWNER_CHANGED]: "bg-blue-500",
  [EventType.RISK_CLOSED]: "bg-green-500",

  // Action Events - Purple
  [EventType.ACTION_ASSIGNED]: "bg-purple-500",
  [EventType.ACTION_STATUS_CHANGED]: "bg-purple-500",
  [EventType.ACTION_DUE_DATE_CHANGED]: "bg-purple-500",
  [EventType.EVIDENCE_SUBMITTED]: "bg-purple-500",
  [EventType.EVIDENCE_UPDATED]: "bg-purple-500",
  [EventType.REVIEW_SUBMITTED]: "bg-purple-500",
  [EventType.REVIEW_APPROVED]: "bg-green-500",
  [EventType.REVIEW_REJECTED]: "bg-red-500",

  // Control Events - Orange
  [EventType.CONTROL_ADDED]: "bg-orange-500",
  [EventType.CONTROL_UPDATED]: "bg-orange-500",
  [EventType.CONTROL_EFFECTIVENESS_CHANGED]: "bg-orange-500",
  [EventType.CONTROL_REMOVED]: "bg-orange-500",

  // Assessment Events - Teal
  [EventType.LIKELIHOOD_CHANGED]: "bg-teal-500",
  [EventType.IMPACT_CHANGED]: "bg-teal-500",
  [EventType.INHERENT_RATING_CHANGED]: "bg-teal-500",
  [EventType.RESIDUAL_RATING_CHANGED]: "bg-teal-500"
};

// Helper to format time like "07:23"
const formatLogTime = (timestamp: string) => {
  return format(new Date(timestamp), "HH:mm");
};

// Helper to determine if an activity is scheduled or manual
const getActivityType = (log: EnrichedLog): "scheduled" | "manual" | "system" => {
  if (
    log.event_type === EventType.RISK_CREATED ||
    log.event_type === EventType.ACTION_ASSIGNED ||
    log.event_type === EventType.REVIEW_APPROVED
  ) {
    return "manual";
  }
  if (log.event_type === EventType.RISK_ASSESSED) {
    return "scheduled";
  }
  return "system";
};

export function LogItem({ log, variant = "default" }: LogItemProps) {
  const Icon = eventIcons[log.event_type] || AlertCircle;
  const activityType = getActivityType(log);
  const logTime = formatLogTime(log.created_at);

  // Get the main action text
  const getMainText = () => {
    switch (log.event_type) {
      case EventType.EVIDENCE_SUBMITTED:
        return "Evidence submitted for review";
      case EventType.REVIEW_APPROVED:
        return "Review approved";
      case EventType.ACTION_ASSIGNED:
        return "Action item assigned";
      case EventType.RISK_ASSESSED:
        return "Risk assessment completed";
      case EventType.RISK_CREATED:
        return "New risk registered";
      case EventType.RISK_OWNER_CHANGED:
        return "Risk owner updated";
      case EventType.RISK_CLOSED:
        return "Risk closed";
      default:
        return log.description || log.event_type.toLowerCase().replace(/_/g, " ");
    }
  };

  // Get secondary details
  const getDetails = () => {
    const details = [];

    if (log.risk_name) {
      details.push(log.risk_name);
    }

    return details.join(" · ");
  };

  // Render event-specific metadata cards
  const renderMetadataDetails = () => {
    if (!log.metadata) return null;

    switch (log.event_type) {
      case EventType.ACTION_ASSIGNED:
        return (
          <div className="bg-secondary mt-4 space-y-2 rounded-lg p-3 text-sm">
            {log.metadata.executer_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium text-white">{log.metadata.executer_name}</span>
              </div>
            )}
            {log.metadata.reviewer_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewer:</span>
                <span className="font-medium text-white">{log.metadata.reviewer_name}</span>
              </div>
            )}
            {log.metadata.due_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due date:</span>
                <span className="font-medium text-white">
                  {format(new Date(log.metadata.due_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {log.metadata.status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={log.metadata.status} />
              </div>
            )}
            {log.metadata.instructions && (
              <div className="border-border mt-2 border-t pt-2">
                <span className="text-muted-foreground text-xs">Instructions:</span>
                <p className="mt-1 text-white">{log.metadata.instructions}</p>
              </div>
            )}
          </div>
        );

      case EventType.EVIDENCE_SUBMITTED:
        return (
          <div className="bg-secondary mt-4 space-y-2 rounded-lg p-3 text-sm">
            {log.metadata.evidence_description && (
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1 font-medium text-white">{log.metadata.evidence_description}</p>
              </div>
            )}
            {log.metadata.evidence_file_url && (
              <div className="border-border border-t pt-2">
                <a
                  href={log.metadata.evidence_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-white hover:underline">
                  View Evidence File →
                </a>
              </div>
            )}
          </div>
        );

      case EventType.REVIEW_APPROVED:
      case EventType.REVIEW_REJECTED:
        return (
          <div className="bg-secondary mt-4 space-y-2 rounded-lg p-3 text-sm">
            {log.metadata.approval_status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={log.metadata.approval_status} />
              </div>
            )}
            {log.metadata.remarks && (
              <div className="border-border mt-2 border-t pt-2">
                <span className="text-muted-foreground">Remarks:</span>
                <p className="mt-1 text-white italic">"{log.metadata.remarks}"</p>
              </div>
            )}
          </div>
        );

      case EventType.RISK_ASSESSED:
        return (
          <div className="bg-secondary mt-4 space-y-3 rounded-lg p-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {log.metadata.inherent_rating && (
                <div>
                  <span className="text-muted-foreground text-xs">Inherent Rating</span>
                  <p className="font-semibold text-white">{log.metadata.inherent_rating}</p>
                </div>
              )}
              {log.metadata.residual_rating && (
                <div>
                  <span className="text-muted-foreground text-xs">Residual Rating</span>
                  <p className="font-semibold text-white">{log.metadata.residual_rating}</p>
                </div>
              )}
            </div>
            {log.metadata.control_effectiveness && (
              <div>
                <span className="text-muted-foreground">Control Effectiveness:</span>
                <p className="font-medium text-white">{log.metadata.control_effectiveness}/5</p>
              </div>
            )}
            {log.metadata.risk_appetite_status && (
              <div className="border-border mt-2 space-x-4 border-t pt-2">
                <span className="text-muted-foreground">Risk Appetite Status:</span>
                <StatusBadge status={log.metadata.risk_appetite_status} className="text-white" />
              </div>
            )}
          </div>
        );

      case EventType.RISK_CLOSED:
        return (
          <div className="bg-secondary mt-4 space-y-2 rounded-lg p-3 text-sm">
            {log.metadata.previous_status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous Status:</span>
                <StatusBadge status={log.metadata.previous_status} />
              </div>
            )}
            {log.metadata.residual_rating && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Final Rating:</span>
                <span className="font-medium text-white">{log.metadata.residual_rating}</span>
              </div>
            )}
          </div>
        );

      case EventType.RISK_OWNER_CHANGED:
        return (
          <div className="bg-secondary mt-4 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">New Risk Owner:</span>
              <span className="font-semibold text-white">
                {log.metadata.risk_owner_name || "Unassigned"}
              </span>
            </div>
          </div>
        );

      default:
        // Display all metadata fields for unknown event types (excluding IDs)
        if (Object.keys(log.metadata).length === 0) return null;

        return (
          <div className="bg-secondary mt-4 space-y-2 rounded-lg p-3 text-sm">
            {Object.entries(log.metadata).map(([key, value]) => {
              // Skip ID fields
              if (key.endsWith("_id") || !value) return null;

              // Format the key for display
              const displayKey = key
                .replace(/_/g, " ")
                .replace(/([A-Z])/g, " $1")
                .trim()
                .split(" ")
                .map((word, index) =>
                  index === 0
                    ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    : word.toLowerCase()
                )
                .join(" ");

              // Handle different value types
              let displayValue = value;
              if (typeof value === "boolean") {
                displayValue = value ? "Yes" : "No";
              } else if (typeof value === "object" && value !== null) {
                displayValue = JSON.stringify(value);
              }

              return (
                <div key={key} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground capitalize">{displayKey}:</span>
                  <span className="max-w-xs text-right font-medium break-words text-white">
                    {displayKey === "Status" ? (
                      <StatusBadge status={value} className="text-white" />
                    ) : (
                      String(displayValue)
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        );
    }
  };

  if (variant === "compact") {
    return (
      <div className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50">
        <div className="w-10 flex-shrink-0 text-xs font-medium text-gray-400">{logTime}</div>

        <div className="mt-0.5 flex-shrink-0">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-900">{getMainText()}</span>
            {log.username && <span className="text-xs text-gray-500">{log.username}</span>}
          </div>

          {getDetails() && <div className="mt-0.5 text-xs text-gray-400">{getDetails()}</div>}
        </div>

        <div className="flex-shrink-0 text-xs text-gray-400">
          {activityType === "scheduled" && "Scheduled Activity"}
          {activityType === "manual" && "Manually Set"}
        </div>
      </div>
    );
  }

  // Default variant (timeline view)
  const colorBg = eventColors[log.event_type] || "bg-muted";

  return (
    <div className="group flex gap-6 pb-10 transition-opacity hover:opacity-80">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        {/* Icon badge */}
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${colorBg} shadow-lg transition-transform hover:scale-110`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        {/* Connecting line */}
        <div className="from-border via-border mt-4 h-20 w-0.5 bg-gradient-to-b to-transparent"></div>
      </div>

      {/* Content column */}
      <div className="min-w-0 flex-1 pt-1.5">
        <div className="flex flex-col gap-2.5">
          {/* Time */}
          <span className="text-muted-foreground text-sm font-medium">{logTime}</span>

          {/* Title */}
          <h3 className="text-foreground text-lg leading-snug font-semibold">{getMainText()}</h3>

          {/* Details row */}
          {(log.username || getDetails()) && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {log.username && (
                <div className="flex items-center gap-2.5">
                  <div className="from-accent h-6 w-6 rounded-full bg-gradient-to-br to-orange-400" />
                  <span className="text-foreground font-medium">{log.username}</span>
                </div>
              )}
              {getDetails() && <span className="text-muted-foreground">@ {getDetails()}</span>}
            </div>
          )}

          {/* Activity type badge */}
          <div className="bg-secondary mt-1 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-white">
            <div className="bg-muted-foreground h-2 w-2 rounded-full"></div>
            {activityType === "scheduled" && "Scheduled Activity"}
            {activityType === "manual" && "Manually Set"}
            {activityType === "system" && "System Event"}
          </div>

          {/* Event-specific metadata */}
          {renderMetadataDetails()}
        </div>
      </div>
    </div>
  );
}

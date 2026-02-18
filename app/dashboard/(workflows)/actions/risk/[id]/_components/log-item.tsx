// components/risk-log/log-item.tsx
import {
  Clock,
  CheckCircle,
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
  Pen,
  Ban,
  ExternalLink
} from "lucide-react";
import { EnrichedLog, EventType } from "@/lib/types/risk-log";
import { format } from "date-fns";
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
  [EventType.RESIDUAL_RATING_CHANGED]: Activity,

  // Signature Events
  [EventType.SIGNATURE_SUBMITTED]: Pen,
  [EventType.SIGNATURE_REJECTED]: Ban
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
  [EventType.RESIDUAL_RATING_CHANGED]: "bg-teal-500",

  // Signature Events - Green for submitted, Red for rejected
  [EventType.SIGNATURE_SUBMITTED]: "bg-green-500",
  [EventType.SIGNATURE_REJECTED]: "bg-red-500"
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
      case EventType.REVIEW_REJECTED:
        return "Review rejected";
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
      case EventType.SIGNATURE_SUBMITTED:
        return "Signature submitted";
      case EventType.SIGNATURE_REJECTED:
        return "Signature rejected";
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
    switch (log.event_type) {
      case EventType.ACTION_ASSIGNED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {log.metadata.executer_name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Assigned to</span>
                <span className="text-foreground font-semibold">{log.metadata.executer_name}</span>
              </div>
            )}
            {log.metadata.reviewer_name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Reviewer</span>
                <span className="text-foreground font-semibold">{log.metadata.reviewer_name}</span>
              </div>
            )}
            {log.metadata.due_date && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Due date</span>
                <span className="text-foreground font-semibold">
                  {format(new Date(log.metadata.due_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {log.metadata.status && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Status</span>
                <StatusBadge status={log.metadata.status} />
              </div>
            )}
            {log.metadata.instructions && (
              <div className="border-border/30 mt-3 border-t pt-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Instructions
                </span>
                <p className="text-foreground mt-2 leading-relaxed">{log.metadata.instructions}</p>
              </div>
            )}
          </div>
        );

      case EventType.EVIDENCE_SUBMITTED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {log.metadata.evidence_description && (
              <div>
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Description
                </span>
                <p className="text-foreground mt-2 leading-relaxed">
                  {log.metadata.evidence_description}
                </p>
              </div>
            )}
            {log.metadata.evidence_file_url && (
              <div className="border-border/30 border-t pt-3">
                <a
                  href={log.metadata.evidence_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 transition-colors hover:text-blue-600">
                  View Evidence File <span>→</span>
                </a>
              </div>
            )}
          </div>
        );

      case EventType.REVIEW_APPROVED:
      case EventType.REVIEW_REJECTED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {log.metadata.approval_status && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Status</span>
                <StatusBadge status={log.metadata.approval_status} />
              </div>
            )}
            {log.metadata.remarks && (
              <div className="border-border/30 mt-3 border-t pt-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Remarks
                </span>
                <p className="text-foreground mt-2 leading-relaxed italic">
                  "{log.metadata.remarks}"
                </p>
              </div>
            )}
          </div>
        );

      case EventType.RISK_ASSESSED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {/* Rating Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              {log.metadata.inherent_rating && (
                <div className="border-border/30 bg-secondary/10 rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Inherent Rating
                  </span>
                  <p className="text-foreground mt-2 text-lg font-bold">
                    {log.metadata.inherent_rating}
                  </p>
                </div>
              )}
              {log.metadata.residual_rating && (
                <div className="border-border/30 bg-secondary/10 rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Residual Rating
                  </span>
                  <p className="text-foreground mt-2 text-lg font-bold">
                    {log.metadata.residual_rating}
                  </p>
                </div>
              )}
            </div>

            {/* Scores Row */}
            <div className="grid grid-cols-2 gap-4">
              {log.metadata.inherent_score && (
                <div className="border-border/30 bg-secondary/10 flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    Inherent Score
                  </span>
                  <span className="text-foreground font-bold">{log.metadata.inherent_score}</span>
                </div>
              )}
              {log.metadata.residual_score && (
                <div className="border-border/30 bg-secondary/10 flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    Residual Score
                  </span>
                  <span className="text-foreground font-bold">{log.metadata.residual_score}</span>
                </div>
              )}
            </div>

            {/* Impact & Likelihood Row */}
            <div className="grid grid-cols-2 gap-4">
              {log.metadata.inherent_impact && (
                <div className="border-border/30 bg-secondary/10 flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    Impact
                  </span>
                  <span className="text-foreground font-bold">{log.metadata.inherent_impact}</span>
                </div>
              )}
              {log.metadata.inherent_likelihood && (
                <div className="border-border/30 bg-secondary/10 flex items-center justify-between rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    Likelihood
                  </span>
                  <span className="text-foreground font-bold">
                    {log.metadata.inherent_likelihood}
                  </span>
                </div>
              )}
            </div>

            {log.metadata.control_effectiveness && (
              <div className="border-border/30 bg-secondary/10 flex items-center justify-between rounded-lg border p-3">
                <span className="text-muted-foreground font-medium">Control Effectiveness</span>
                <span className="text-foreground font-bold">
                  {log.metadata.control_effectiveness}
                </span>
              </div>
            )}
            {log.metadata.risk_appetite_status && (
              <div className="border-border/30 mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground font-medium">Risk Appetite</span>
                <StatusBadge status={log.metadata.risk_appetite_status} />
              </div>
            )}
          </div>
        );

      case EventType.RISK_CLOSED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {log.metadata.previous_status && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Previous Status</span>
                <StatusBadge status={log.metadata.previous_status} />
              </div>
            )}
            {log.metadata.residual_rating && (
              <div className="border-border/30 bg-secondary/10 flex items-center justify-between rounded-lg border p-3">
                <span className="text-muted-foreground font-medium">Final Rating</span>
                <span className="text-foreground font-bold">{log.metadata.residual_rating}</span>
              </div>
            )}
          </div>
        );

      case EventType.RISK_OWNER_CHANGED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 rounded-xl border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">New Risk Owner</span>
              <span className="text-foreground font-bold">
                {log.metadata.risk_owner_name || "Unassigned"}
              </span>
            </div>
          </div>
        );

      case EventType.SIGNATURE_SUBMITTED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {log.metadata.designation && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Designation</span>
                <span className="text-foreground font-semibold">{log.metadata.designation}</span>
              </div>
            )}
            {log.metadata.name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Signer</span>
                <span className="text-foreground font-semibold">{log.metadata.name}</span>
              </div>
            )}

            {log.metadata.signature && (
              <div className="space-y-2 border-t border-border/30 pt-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Signature
                </span>
                <div className="border-border/30 flex items-center justify-center rounded-lg border bg-gray-50 p-3">
                  <img
                    src={log.metadata.signature}
                    alt={`Signature of ${log.metadata.name || "signer"}`}
                    className="max-h-20 max-w-full object-contain"
                  />
                </div>
                <a
                  href={log.metadata.signature}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                  View Full Size
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="border-border/30 mt-3 border-t pt-3">
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Description
              </span>
              <p className="text-foreground mt-2 leading-relaxed">{log.description}</p>
            </div>

            {log.metadata.signed_at && (
              <div className="border-border/30 mt-3 border-t pt-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Signed at
                </span>
                <p className="text-foreground mt-2 font-medium">
                  {format(new Date(log.metadata.signed_at), "PPP p")}
                </p>
              </div>
            )}
          </div>
        );
      case EventType.SIGNATURE_REJECTED:
        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-3 rounded-xl border p-4 text-sm">
            {log.metadata?.designation && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Designation</span>
                <span className="text-foreground font-semibold">{log.metadata.designation}</span>
              </div>
            )}

            {log.metadata?.name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Signer</span>
                <span className="text-foreground font-semibold">{log.metadata.name}</span>
              </div>
            )}

            <div className="border-border/30 mt-3 border-t pt-3">
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Description
              </span>
              <p className="text-foreground mt-2 leading-relaxed">{log.description}</p>
            </div>

            {log.metadata?.signed_at && (
              <div className="border-border/30 mt-3 border-t pt-3">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Signed at
                </span>
                <p className="text-foreground mt-2 font-medium">
                  {format(new Date(log.metadata.signed_at), "PPP p")}
                </p>
              </div>
            )}
          </div>
        );

      default:
        // Display all metadata fields for unknown event types (excluding IDs)
        if (Object.keys(log.metadata).length === 0) return null;

        return (
          <div className="bg-secondary/5 border-border/30 mt-4 space-y-2 rounded-xl border p-4 text-sm">
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
                  <span className="text-muted-foreground font-medium capitalize">{displayKey}</span>
                  <span className="text-foreground max-w-xs text-right font-semibold break-words">
                    {displayKey === "Status" ? (
                      <StatusBadge status={value} />
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

  // Default variant (timeline view) - Modern design
  const colorBg = eventColors[log.event_type] || "bg-muted";
  // Create consistent light versions using a standardized approach
  const lightBg = colorBg.replace("500", "100");
  const darkText = colorBg.replace("bg-", "text-").replace("-500", "-700");

  // Activity type dot colors - more visible
  let activityDotColor = "bg-amber-500";
  if (activityType === "scheduled") activityDotColor = "bg-blue-300";
  if (activityType === "manual") activityDotColor = "bg-purple-300";
  if (activityType === "system") activityDotColor = "bg-slate-300";

  return (
    <div className="group relative flex gap-6 pb-8">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        {/* Icon badge with modern styling */}
        <div
          className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl ${lightBg} border-border/40 border shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
          <Icon className={`h-8 w-8 ${darkText}`} />
        </div>
        {/* Connecting line - gradient */}
        <div className="from-border/60 via-border/30 mt-6 h-24 w-1 bg-gradient-to-b to-transparent"></div>
      </div>

      {/* Content column */}
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-col gap-2.5">
          {/* Top section with time and badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground/60 h-3.5 w-3.5" />
              <span className="text-muted-foreground/70 text-xs font-medium tracking-wide">
                {logTime}
              </span>
            </div>
            {/* Activity type dot */}
            <div className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full ${activityDotColor}`}></div>
              <span className="text-muted-foreground text-xs font-medium">
                {activityType === "scheduled" && "Scheduled"}
                {activityType === "manual" && "Manual"}
                {activityType === "system" && "System"}
              </span>
            </div>
          </div>

          {/* Title - more prominent */}
          <h3 className="text-foreground text-base leading-snug font-bold">{getMainText()}</h3>

          {/* Details row - enhanced */}
          {(log.username || getDetails()) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
              {log.username && (
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full ${lightBg} border-border/40 flex items-center justify-center border ${darkText} text-xs font-bold`}>
                    {log.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground text-sm font-semibold">{log.username}</span>
                  </div>
                </div>
              )}
              {getDetails() && (
                <span className="text-muted-foreground text-xs">
                  in <span className="text-foreground/70 font-medium">{getDetails()}</span>
                </span>
              )}
            </div>
          )}

          {/* Event-specific metadata */}
          {renderMetadataDetails()}
        </div>
      </div>
    </div>
  );
}

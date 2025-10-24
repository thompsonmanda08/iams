"use client";

import { Card } from "@/components/ui/card";
import { FileText, AlertCircle, CheckCircle2, Edit, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditActivity {
  id: string;
  type: "created" | "updated" | "finding-added" | "workpaper-completed" | "status-changed";
  description: string;
  user: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities?: AuditActivity[];
  isLoading?: boolean;
}

const getActivityIcon = (type: AuditActivity["type"]) => {
  switch (type) {
    case "created":
      return Plus;
    case "updated":
      return Edit;
    case "finding-added":
      return AlertCircle;
    case "workpaper-completed":
      return CheckCircle2;
    case "status-changed":
      return FileText;
    default:
      return FileText;
  }
};

const getActivityColor = (type: AuditActivity["type"]) => {
  switch (type) {
    case "created":
      return "text-blue-600 bg-blue-50 dark:bg-blue-950";
    case "updated":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950";
    case "finding-added":
      return "text-red-600 bg-red-50 dark:bg-red-950";
    case "workpaper-completed":
      return "text-green-600 bg-green-50 dark:bg-green-950";
    case "status-changed":
      return "text-purple-600 bg-purple-50 dark:bg-purple-950";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          No recent activity
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);

          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

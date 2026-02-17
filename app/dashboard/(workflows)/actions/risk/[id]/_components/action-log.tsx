"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LogItem } from "./log-item";
import { EnrichedLog, PaginationInfo } from "@/lib/types/risk-log";

interface ActionLogProps {
  logs: EnrichedLog[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export function ActionLog({ logs, pagination, onPageChange, loading = false }: ActionLogProps) {
  const [searchTerm] = useState("");

  const filteredLogs = logs?.filter((log) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.risk_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedLogs = filteredLogs?.reduce(
    (groups, log) => {
      const date = new Date(log.created_at).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
      return groups;
    },
    {} as Record<string, EnrichedLog[]>
  );

  if (loading) {
    return (
      <div className="bg-card border-border rounded-2xl border p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 border-border rounded-2xl border p-6 backdrop-blur-sm">
      {/* Header with gradient background */}
      <div className="border-border/50 mb-6 border-b pb-4">
        <h2 className="text-foreground text-lg font-bold">Activity Log</h2>
        <p className="text-muted-foreground mt-1 text-sm">Track all actions and changes</p>
      </div>

      {/* Log List */}
      <div className="space-y-8">
        {Object?.entries(groupedLogs)?.map(([date, dateLogs]) => (
          <div key={date}>
            <div className="mb-6 flex items-center gap-3">
              <div className="from-border h-px flex-1 bg-gradient-to-r to-transparent"></div>
              <h3 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                {date}
              </h3>
              <div className="from-border h-px flex-1 bg-gradient-to-l to-transparent"></div>
            </div>
            <div className="space-y-6">
              {dateLogs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
            </div>
          </div>
        ))}

        {filteredLogs?.length === 0 && (
          <div className="py-16 text-center">
            <div className="mb-3 text-3xl">📋</div>
            <p className="text-muted-foreground font-medium">No activity logs found</p>
            <p className="text-muted-foreground/70 mt-1 text-sm">
              Actions will appear here as they happen
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination?.total_pages > 1 && (
        <div className="border-border/50 mt-8 flex items-center justify-between border-t pt-6">
          <button
            onClick={() => onPageChange(pagination?.page - 1)}
            disabled={!pagination?.has_prev}
            className="border-border/50 bg-secondary/50 text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          <span className="text-muted-foreground text-sm font-medium">
            Page <span className="text-foreground font-bold">{pagination?.page}</span> of{" "}
            <span className="text-foreground font-bold">{pagination?.total_pages}</span>
          </span>
          <button
            onClick={() => onPageChange(pagination?.page + 1)}
            disabled={!pagination?.has_next}
            className="border-border/50 bg-secondary/50 text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

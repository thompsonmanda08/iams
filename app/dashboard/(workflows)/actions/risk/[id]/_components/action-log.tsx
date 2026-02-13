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
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Log List */}
      <div className="">
        {Object?.entries(groupedLogs)?.map(([date, dateLogs]) => (
          <div key={date}>
            <h3 className="mb-3 text-sm font-medium text-gray-500">{date}</h3>
            <div className="space-y-3">
              {dateLogs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
            </div>
          </div>
        ))}

        {filteredLogs?.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-2 text-gray-400">📋</div>
            <p className="text-gray-500">No activity logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination?.total_pages > 1 && (
        <div className="flex items-center justify-between border-t p-4">
          <button
            onClick={() => onPageChange(pagination?.page - 1)}
            disabled={!pagination?.has_prev}
            className="rounded-lg border px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination?.page} of {pagination?.total_pages}
          </span>
          <button
            onClick={() => onPageChange(pagination?.page + 1)}
            disabled={!pagination?.has_next}
            className="rounded-lg border px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { Check, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataSource } from "@/lib/types/report-types";
import { WidgetDataSourcePicker } from "./widget-data-source-picker";

export interface StrategicObjective {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface GroupRisk {
  id: string;
  number: number;
  description: string;
  mappedObjectives: string[];
}

export interface RiskObjectiveMappingTableProps {
  title?: string;
  subtitle?: string;
  objectives: StrategicObjective[];
  risks: GroupRisk[];
  className?: string;
  showNumbers?: boolean;
  checkmarkColor?: string;
  headerBgColor?: string;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  showDataSourcePicker?: boolean;
  onCellClick?: (riskId: string, objectiveId: string) => void;
}

export function RiskObjectiveMappingTable({
  title,
  objectives,
  risks,
  className,
  showNumbers = true,
  checkmarkColor = "text-white",
  headerBgColor = "bg-slate-800",
  dataSourceId,
  onDataSourceChange,
  showDataSourcePicker = true,
  onCellClick
}: RiskObjectiveMappingTableProps) {
  const handleCellClick = (riskId: string, objectiveId: string) => {
    if (onCellClick) {
      onCellClick(riskId, objectiveId);
    }
  };

  const isMapped = (risk: GroupRisk, objectiveId: string): boolean => {
    return risk.mappedObjectives.includes(objectiveId);
  };

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white", className)}>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Table2 className="h-4 w-4 text-blue-600" />
          {title}
        </h4>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="risk_objective_mapping"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={cn(headerBgColor, "border-b border-slate-700")}>
              <th className="sticky left-0 z-20 min-w-[300px] border-r border-slate-700 bg-slate-800 px-4 py-3 text-left">
                <div className="font-bold tracking-wide text-white uppercase">GROUP RISK</div>
              </th>
              <th
                colSpan={objectives.length}
                className="border-l border-slate-700 px-4 py-3 text-center">
                <div className="font-bold tracking-wide text-white uppercase">
                  STRATEGIC OBJECTIVES
                </div>
              </th>
            </tr>
            <tr className={cn(headerBgColor, "border-b border-slate-700")}>
              <th className="sticky left-0 z-20 border-r border-slate-700 bg-slate-800"></th>
              {objectives.map((objective) => (
                <th
                  key={objective.id}
                  className="min-w-[140px] border-l border-slate-700 px-4 py-3 text-center">
                  <div className="px-2 py-2 text-xs leading-tight font-bold text-white uppercase">
                    {objective.shortLabel || objective.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {risks.length === 0 ? (
              <tr>
                <td colSpan={objectives.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No data available. Select a data source to populate this table.
                </td>
              </tr>
            ) : (
              risks.map((risk, index) => (
                <tr
                  key={risk.id}
                  className={cn(
                    "transition-colors hover:bg-gray-50/50",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  )}>
                  <td className="sticky left-0 z-10 border-r bg-inherit px-4 py-3">
                    <div className="flex items-start gap-3 py-2">
                      {showNumbers && (
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-800 text-xs font-bold text-white">
                          {risk.number}
                        </div>
                      )}
                      <span className="text-sm leading-relaxed font-medium text-gray-900">
                        {risk.description}
                      </span>
                    </div>
                  </td>
                  {objectives.map((objective) => (
                    <td
                      key={`${risk.id}-${objective.id}`}
                      className={cn(
                        "border-l px-4 py-3 text-center",
                        onCellClick && "cursor-pointer hover:bg-gray-100"
                      )}
                      onClick={() => handleCellClick(risk.id, objective.id)}>
                      {isMapped(risk, objective.id) && (
                        <div className="flex items-center justify-center">
                          <Check className={cn("h-5 w-5 font-bold", checkmarkColor)} />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

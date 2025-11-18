"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { State } from "@/lib/types/workflow";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowNodeData extends State {
  onSelect?: (state: State) => void;
  onDelete?: (stateId: string) => void;
  isSelected?: boolean;
}

export const WorkflowNode = ({ data, isSelected }: NodeProps<WorkflowNodeData>) => {
  const { id, name, isInitial, isFinal, onSelect, onDelete, description } = data;

  const getBorderColor = () => {
    if (isInitial) return "border-amber-500";
    if (isFinal) return "border-green-500";
    return "border-slate-300";
  };

  const getBgColor = () => {
    if (isInitial) return "bg-amber-50";
    if (isFinal) return "bg-green-50";
    return "bg-white";
  };

  return (
    <>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />

      {/* Node content */}
      <div
        className={`
          rounded-lg border-2 p-4 shadow-md transition-all
          ${getBorderColor()} ${getBgColor()}
          ${isSelected ? "ring-2 ring-blue-500" : ""}
          w-60 cursor-default
        `}>
        {/* Header with icons */}
        <div className="mb-3 flex items-center justify-between">
          {/* Drag icon and state badges */}
          <div className="flex items-center gap-2">
            <div className="nodrag cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
              <GripVertical className="h-4 w-4" />
            </div>
            {isInitial && (
              <span className="rounded bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-900">
                Initial
              </span>
            )}
            {isFinal && (
              <span className="rounded bg-green-200 px-2 py-1 text-xs font-semibold text-green-900">
                Final
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(data);
              }}
              title="Edit state">
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(id);
              }}
              title="Delete state">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* State name */}
        <h3 className="mb-2 text-center font-semibold text-slate-900">{name}</h3>

        {/* Description if present */}
        {description && (
          <p className="text-xs text-slate-600 text-center line-clamp-2">{description}</p>
        )}
      </div>
    </>
  );
};

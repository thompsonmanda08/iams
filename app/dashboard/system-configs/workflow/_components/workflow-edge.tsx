"use client";

import {
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";

interface WorkflowEdgeData {
  label?: string;
  onEdit?: (edgeId: string) => void;
  onDelete?: (edgeId: string) => void;
}

export const WorkflowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style
}: EdgeProps<WorkflowEdgeData>) => {
  const { label, onEdit, onDelete } = data || {};
  const { getEdge } = useReactFlow();

  // Get smooth step path (rectangular path with rounded corners)
  // This prevents edges from overlapping by using right-angle paths
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: "var(--primary)",
          strokeWidth: 2.5
        }}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "auto"
            }}
            className="nopan nodrag">
            {/* Label background box */}
            <div
              className="
                rounded-lg border-2 border-primary/30 bg-card px-3 py-1
                shadow-md transition-all hover:shadow-lg
                flex items-center gap-2 cursor-pointer
                group
              "
              onClick={() => onEdit?.(id)}>
              {/* Label text */}
              <span className="text-xs font-semibold text-primary whitespace-nowrap">
                {label}
              </span>

              {/* Action buttons on hover */}
              <div className="ml-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(id);
                  }}>
                  <Edit2 className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(id);
                  }}>
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

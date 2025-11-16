"use client";
import { useState, useRef, useEffect } from "react";
import { GripVertical, Trash2, Edit2, Check, X, Link as LinkIcon, Flag, FlagOff } from "lucide-react";
import { State } from "@/lib/types/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StateNodeProps {
  state: State;
  isSelected: boolean;
  isConnecting?: boolean;
  isConnectTarget?: boolean;
  onSelect: () => void;
  onUpdate: (state: State) => void;
  onDelete: () => void;
  onConnectStart: () => void;
  onConnectEnd: () => void;
  onConnectCancel: () => void;
}

export const StateNode = ({
  state,
  isSelected,
  isConnecting = false,
  isConnectTarget = false,
  onSelect,
  onUpdate,
  onDelete,
  onConnectStart,
  onConnectEnd,
  onConnectCancel
}: StateNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input")) return;

    // If in connect target mode, complete the connection
    if (isConnectTarget) {
      onConnectEnd();
      return;
    }

    // If in connecting mode, cancel on drag attempt
    if (isConnecting) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - state.position.x,
      y: e.clientY - state.position.y
    });
    onSelect();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      onUpdate({
        ...state,
        position: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, state, onUpdate]);

  // Don't render deleted states
  if (state._changeType === "deleted") {
    return null;
  }

  return (
    <div
      ref={nodeRef}
      className={`absolute w-[240px] rounded-lg border-2 p-4 shadow-md transition-all duration-200 ${isSelected ? "border-primary ring-primary/20 z-20 ring-2" : "z-10"} ${isDragging ? "z-30 scale-105 cursor-grabbing shadow-xl" : ""} ${isConnecting ? "border-accent ring-accent/30 z-20 cursor-pointer ring-2" : ""} ${isConnectTarget ? "border-accent ring-accent/50 z-20 cursor-pointer ring-4 hover:scale-105" : ""} ${!isConnecting && !isConnectTarget && !isDragging ? "cursor-move hover:shadow-lg" : ""} `}
      style={{
        left: state.position.x,
        top: state.position.y,
        backgroundColor: "var(--state-node)",
        borderColor: state.isInitial
          ? "var(--state-node-initial)"
          : state.isFinal
            ? "var(--state-node-final)"
            : "var(--state-node-border)"
      }}
      onMouseDown={handleMouseDown}>
      {isConnecting ? (
        <div className="py-2 text-center">
          <p className="text-accent mb-2 text-xs font-semibold">Select target state</p>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onConnectCancel();
            }}
            className="w-full">
            Cancel
          </Button>
        </div>
      ) : isConnectTarget ? (
        <div className="py-2 text-center">
          <p className="text-accent text-xs font-semibold">Click to connect</p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-start justify-between gap-2">
            <GripVertical className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-sm font-semibold">{state.name}</h3>
                <span className="text-muted-foreground text-xs">(locked)</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </>
      )}

      {!isConnecting && !isConnectTarget && (
        <>
          {/* State Flags - Initial/Final */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={state.isInitial ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ ...state, isInitial: !state.isInitial });
                }}
                className="flex-1 text-xs">
                <Flag className="mr-1 h-3 w-3" />
                Initial
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={state.isFinal ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ ...state, isFinal: !state.isFinal });
                }}
                className="flex-1 text-xs">
                <FlagOff className="mr-1 h-3 w-3" />
                Final
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onConnectStart();
            }}
            className="w-full text-xs">
            <LinkIcon className="mr-1 h-3 w-3" />
            Add Transition
          </Button>
        </>
      )}
    </div>
  );
};

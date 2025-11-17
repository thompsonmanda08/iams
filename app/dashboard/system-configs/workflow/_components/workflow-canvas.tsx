"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { State, Transition } from "@/lib/types/workflow";
import { TransitionArrow } from "./transition-arrow";
import { StateNode } from "./state-node";

interface WorkflowCanvasProps {
  states: State[];
  transitions: Transition[];
  onStateAdd: () => void;
  onStateUpdate: (state: State) => void;
  onStateDelete: (stateId: string) => void;
  onTransitionClick: (transition: Transition) => void;
  onTransitionAdd: (fromStateId: string, toStateId: string) => void;
}

export const WorkflowCanvas = ({
  states,
  transitions,
  onStateAdd,
  onStateUpdate,
  onStateDelete,
  onTransitionClick,
  onTransitionAdd
}: WorkflowCanvasProps) => {
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  return (
    <div
      className="relative flex-1 overflow-auto"
      //  style={{ backgroundColor: 'var(--canvas-bg)' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--canvas-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--canvas-grid) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px"
        }}
      />

      {/* Canvas content */}
      <div className="relative min-h-full p-8">
        {/* SVG layer for arrows - positioned to match the content div */}
        <svg
          className="pointer-events-none absolute top-8 right-8 bottom-8 left-8 overflow-visible"
          style={{ zIndex: 1 }}>
          <g style={{ pointerEvents: "auto" }}>
            {transitions.map((transition, index) => {
              // Skip deleted transitions
              if (transition._changeType === "deleted") return null;

              const fromState = states.find((s) => s.id === transition.from_state_id && s._changeType !== "deleted");
              const toState = states.find((s) => s.id === transition.to_state_id && s._changeType !== "deleted");
              if (!fromState || !toState) return null;

              // Calculate curve offset for multiple transitions between same states
              // Find all transitions between these two states (in the same direction)
              const transitionsBetweenSameStates = transitions.filter(
                (t) =>
                  t._changeType !== "deleted" &&
                  t.from_state_id === transition.from_state_id &&
                  t.to_state_id === transition.to_state_id
              );

              // Get the index of this transition among others between the same states
              const indexAmongSimilar = transitionsBetweenSameStates.findIndex((t) => t.id === transition.id);

              // Calculate offset: center around 0 (-1, 0, 1 for 3 transitions, etc.)
              const count = transitionsBetweenSameStates.length;
              const curveOffset = count > 1 ? indexAmongSimilar - (count - 1) / 2 : 0;

              return (
                <TransitionArrow
                  key={transition.id}
                  from={fromState.position}
                  to={toState.position}
                  label={transition.transition_name}
                  onClick={() => onTransitionClick(transition)}
                  curveOffset={curveOffset}
                />
              );
            })}
          </g>
        </svg>

        {states.map((state) => (
          <StateNode
            key={state.id}
            state={state}
            isSelected={selectedStateId === state.id}
            isConnecting={connectingFromId === state.id}
            isConnectTarget={connectingFromId !== null && connectingFromId !== state.id}
            totalStates={states.filter((s) => s._changeType !== "deleted").length}
            onSelect={() => setSelectedStateId(state.id)}
            onUpdate={onStateUpdate}
            onDelete={() => onStateDelete(state.id)}
            onConnectStart={() => {
              setConnectingFromId(state.id);
              setSelectedStateId(null);
            }}
            onConnectEnd={() => {
              if (connectingFromId && connectingFromId !== state.id) {
                onTransitionAdd(connectingFromId, state.id);
              }
              setConnectingFromId(null);
            }}
            onConnectCancel={() => setConnectingFromId(null)}
          />
        ))}

        {/* Add State Button */}
        {states.length === 0 && (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No states yet. Add your first state to begin.
              </p>
              <Button onClick={onStateAdd} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add First State
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {states.length > 0 && (
        <Button
          onClick={onStateAdd}
          className="absolute right-8 bottom-8 z-10 aspect-square h-16! max-h-none! w-16 rounded-full p-0! shadow-xl">
          <Plus className="h-12 w-12" />
        </Button>
      )}
    </div>
  );
};

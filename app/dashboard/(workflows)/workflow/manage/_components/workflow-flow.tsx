"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  Panel,
  useNodes,
  useEdges
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { State, Transition } from "@/lib/types/workflow";
import { WorkflowNode } from "./workflow-node";
import { WorkflowEdge } from "./workflow-edge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowFlowProps {
  states: State[];
  transitions: Transition[];
  onStateAdd: () => void;
  onStateUpdate: (state: State) => void;
  onStatePositionChange?: (stateId: string, position: { x: number; y: number }) => void;
  onStateDelete: (stateId: string) => void;
  onTransitionClick: (transition: Transition) => void;
  onTransitionAdd: (fromStateId: string, toStateId: string) => void;
  onTransitionDelete?: (transitionId: string) => void;
}

// Define node and edge types
const nodeTypes = {
  workflowNode: WorkflowNode
};

const edgeTypes = {
  workflowEdge: WorkflowEdge
};

export const WorkflowFlow = ({
  states,
  transitions,
  onStateAdd,
  onStateUpdate,
  onStatePositionChange,
  onStateDelete,
  onTransitionClick,
  onTransitionAdd,
  onTransitionDelete
}: WorkflowFlowProps) => {
  // Maintain local state for nodes to enable proper dragging
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Initialize and update nodes when states change
  useEffect(() => {
    const newNodes = states
      .filter((state) => state._changeType !== "deleted")
      .map((state) => ({
        id: state.id,
        data: {
          ...state,
          onSelect: onStateUpdate,
          onDelete: onStateDelete
        },
        position: state.position,
        type: "workflowNode",
        draggable: true
      } as Node));
    setNodes(newNodes);
  }, [states, onStateUpdate, onStateDelete]);

  // Initialize and update edges when transitions change
  useEffect(() => {
    const newEdges = transitions
      .filter((transition) => transition._changeType !== "deleted")
      .map((transition) => ({
        id: transition.id,
        source: transition.from_state_id,
        target: transition.to_state_id,
        type: "workflowEdge",
        data: {
          label: transition.transition_name,
          onEdit: () => onTransitionClick(transition),
          onDelete: onTransitionDelete
        },
        animated: false
      } as Edge));
    setEdges(newEdges);
  }, [transitions, onTransitionClick, onTransitionDelete]);

  // Handle node changes (drag, select, etc.)
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Update node positions in the state
      changes.forEach((change) => {
        if (change.type === "position" && "position" in change && change.position) {
          // Use the position change handler if available, otherwise fall back to update
          if (onStatePositionChange) {
            onStatePositionChange(change.id, change.position);
          } else {
            const state = states.find((s) => s.id === change.id);
            if (state) {
              onStateUpdate({
                ...state,
                position: change.position,
                _changeType: state._changeType === "synced" ? "modified" : state._changeType
              });
            }
          }
        }
      });
    },
    [states, onStateUpdate, onStatePositionChange]
  );

  // Handle edge changes (delete, etc.)
  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    changes.forEach((change) => {
      if (change.type === "remove" && "id" in change) {
        onTransitionDelete?.(change.id);
      }
    });
  }, [onTransitionDelete]);

  // Handle new connections
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        onTransitionAdd(connection.source, connection.target);
      }
    },
    [onTransitionAdd]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView>
        <Background />
        <Controls />

        {/* Add State Button Panel */}
        <Panel position="bottom-right" className="mb-4 mr-4">
          <Button
            onClick={onStateAdd}
            className="gap-2 rounded-full h-14 w-14 shadow-xl"
            size="lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

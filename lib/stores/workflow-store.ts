import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workflow } from "@/lib/types/workflow";

interface WorkflowStore {
  workflows: Workflow[];
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  getWorkflow: (id: string) => Workflow | undefined;
  getWorkflowByEntityType: (entityType: string) => Workflow | undefined;
  clearWorkflows: () => void;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      workflows: [],

      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [...state.workflows, workflow]
        })),

      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w))
        })),

      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id)
        })),

      getWorkflow: (id) => {
        return get().workflows.find((w) => w.id === id);
      },

      getWorkflowByEntityType: (entityType) => {
        return get().workflows.find((w) => w.entityType === entityType);
      },

      clearWorkflows: () => set({ workflows: [] })
    }),
    {
      name: "workflow-storage"
    }
  )
);

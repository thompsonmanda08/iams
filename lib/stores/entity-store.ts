import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EntityType } from "@/lib/types/workflow";

export interface WorkflowEntity {
  id: string;
  type: EntityType;
  name: string;
  currentState: string;
  currentStateId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  history: EntityHistory[];
}

export interface EntityHistory {
  id: string;
  fromState: string;
  toState: string;
  actionName: string;
  performedBy: string;
  performedAt: string;
  comment?: string;
}

interface EntityStore {
  entities: WorkflowEntity[];
  addEntity: (entity: WorkflowEntity) => void;
  updateEntity: (id: string, updates: Partial<WorkflowEntity>) => void;
  deleteEntity: (id: string) => void;
  getEntity: (id: string) => WorkflowEntity | undefined;
  getEntitiesByType: (type: EntityType) => WorkflowEntity[];
  transitionEntity: (
    id: string,
    newState: string,
    newStateId: string,
    actionName: string,
    performedBy: string,
    comment?: string
  ) => void;
  clearEntities: () => void;
}

export const useEntityStore = create<EntityStore>()(
  persist(
    (set, get) => ({
      entities: [],

      addEntity: (entity) =>
        set((state) => ({
          entities: [...state.entities, entity]
        })),

      updateEntity: (id, updates) =>
        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          )
        })),

      deleteEntity: (id) =>
        set((state) => ({
          entities: state.entities.filter((e) => e.id !== id)
        })),

      getEntity: (id) => {
        return get().entities.find((e) => e.id === id);
      },

      getEntitiesByType: (type) => {
        return get().entities.filter((e) => e.type === type);
      },

      transitionEntity: (id, newState, newStateId, actionName, performedBy, comment) =>
        set((state) => ({
          entities: state.entities.map((e) => {
            if (e.id === id) {
              const historyEntry: EntityHistory = {
                id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                fromState: e.currentState,
                toState: newState,
                actionName,
                performedBy,
                performedAt: new Date().toISOString(),
                comment
              };

              return {
                ...e,
                currentState: newState,
                currentStateId: newStateId,
                updatedAt: new Date().toISOString(),
                history: [...e.history, historyEntry]
              };
            }
            return e;
          })
        })),

      clearEntities: () => set({ entities: [] })
    }),
    {
      name: "entity-storage"
    }
  )
);

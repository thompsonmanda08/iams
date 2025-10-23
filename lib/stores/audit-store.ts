/**
 * Audit Management Module State Store
 *
 * Zustand store for managing client-side state including UI state, filters, and drafts.
 * Uses persist middleware for localStorage persistence of drafts and preferences.
 *
 * @module audit-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AuditFilters,
  FindingFilters,
  WorkpaperDraft,
  ViewMode,
  AuditStatus,
  FindingSeverity,
  FindingStatus,
} from '@/lib/types/audit-types';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface AuditState {
  // UI State
  selectedAuditId: string | null;
  viewMode: ViewMode;
  isCreateAuditModalOpen: boolean;
  isCreateFindingModalOpen: boolean;
  isCreateWorkpaperModalOpen: boolean;
  selectedFindingId: string | null;

  // Filters
  auditFilters: AuditFilters;
  findingFilters: FindingFilters;

  // Drafts (Map for workpaper drafts)
  workpaperDrafts: Map<string, WorkpaperDraft>;

  // UI Actions
  setSelectedAudit: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setCreateAuditModalOpen: (open: boolean) => void;
  setCreateFindingModalOpen: (open: boolean) => void;
  setCreateWorkpaperModalOpen: (open: boolean) => void;
  setSelectedFinding: (id: string | null) => void;

  // Filter Actions
  updateAuditFilters: (filters: Partial<AuditFilters>) => void;
  resetAuditFilters: () => void;
  updateFindingFilters: (filters: Partial<FindingFilters>) => void;
  resetFindingFilters: () => void;

  // Draft Actions
  saveWorkpaperDraft: (id: string, data: WorkpaperDraft) => void;
  getWorkpaperDraft: (id: string) => WorkpaperDraft | undefined;
  clearWorkpaperDraft: (id: string) => void;
  clearAllDrafts: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultAuditFilters: AuditFilters = {
  status: [],
  dateRange: null,
  teamLeader: undefined,
  search: '',
};

const defaultFindingFilters: FindingFilters = {
  severity: [],
  status: [],
  clause: undefined,
  assignedTo: undefined,
  search: '',
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedAuditId: null,
      viewMode: 'list',
      isCreateAuditModalOpen: false,
      isCreateFindingModalOpen: false,
      isCreateWorkpaperModalOpen: false,
      selectedFindingId: null,
      auditFilters: defaultAuditFilters,
      findingFilters: defaultFindingFilters,
      workpaperDrafts: new Map(),

      // UI Actions
      setSelectedAudit: (id) => set({ selectedAuditId: id }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setCreateAuditModalOpen: (open) => set({ isCreateAuditModalOpen: open }),

      setCreateFindingModalOpen: (open) => set({ isCreateFindingModalOpen: open }),

      setCreateWorkpaperModalOpen: (open) => set({ isCreateWorkpaperModalOpen: open }),

      setSelectedFinding: (id) => set({ selectedFindingId: id }),

      // Filter Actions
      updateAuditFilters: (filters) =>
        set((state) => ({
          auditFilters: { ...state.auditFilters, ...filters },
        })),

      resetAuditFilters: () => set({ auditFilters: defaultAuditFilters }),

      updateFindingFilters: (filters) =>
        set((state) => ({
          findingFilters: { ...state.findingFilters, ...filters },
        })),

      resetFindingFilters: () => set({ findingFilters: defaultFindingFilters }),

      // Draft Actions
      saveWorkpaperDraft: (id, data) =>
        set((state) => {
          const newDrafts = new Map(state.workpaperDrafts);
          newDrafts.set(id, { ...data, lastSaved: new Date() });
          return { workpaperDrafts: newDrafts };
        }),

      getWorkpaperDraft: (id) => {
        return get().workpaperDrafts.get(id);
      },

      clearWorkpaperDraft: (id) =>
        set((state) => {
          const newDrafts = new Map(state.workpaperDrafts);
          newDrafts.delete(id);
          return { workpaperDrafts: newDrafts };
        }),

      clearAllDrafts: () => set({ workpaperDrafts: new Map() }),
    }),
    {
      name: 'audit-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist viewMode and drafts
      partialize: (state) => ({
        viewMode: state.viewMode,
        workpaperDrafts: Array.from(state.workpaperDrafts.entries()),
      }),
      // Custom merge to handle Map serialization
      merge: (persistedState: any, currentState) => {
        // Convert array back to Map
        const draftsArray = persistedState.workpaperDrafts || [];
        const draftsMap = new Map(
          draftsArray.map(([key, value]: [string, any]) => [
            key,
            {
              ...value,
              lastSaved: value.lastSaved ? new Date(value.lastSaved) : undefined,
            },
          ])
        );

        return {
          ...currentState,
          viewMode: persistedState.viewMode || currentState.viewMode,
          workpaperDrafts: draftsMap,
        };
      },
    }
  )
);

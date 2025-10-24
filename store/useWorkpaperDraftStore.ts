/**
 * Workpaper Draft Store
 *
 * Zustand store for managing workpaper drafts with auto-save functionality.
 * Drafts are stored per audit ID to allow multiple concurrent draft sessions.
 */

import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkpaperDraft } from "@/lib/types/audit-types";

interface WorkpaperDraftStore {
  // State
  drafts: Record<string, WorkpaperDraft>; // Keyed by auditId
  lastAutoSave: Record<string, Date>; // Track last auto-save per draft

  // Actions
  getDraft: (auditId: string) => WorkpaperDraft | null;
  saveDraft: (auditId: string, draft: Partial<WorkpaperDraft>) => void;
  updateDraft: (auditId: string, updates: Partial<WorkpaperDraft>) => void;
  deleteDraft: (auditId: string) => void;
  clearAllDrafts: () => void;
  hasDraft: (auditId: string) => boolean;
}

const workpaperDraftStore: StateCreator<WorkpaperDraftStore> = (set, get) => ({
  // Initial state
  drafts: {},
  lastAutoSave: {},

  // Get draft for a specific audit
  getDraft: (auditId: string) => {
    return get().drafts[auditId] || null;
  },

  // Save or create a new draft
  saveDraft: (auditId: string, draft: Partial<WorkpaperDraft>) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [auditId]: {
          auditId,
          ...draft,
          lastSaved: new Date(),
        } as WorkpaperDraft,
      },
      lastAutoSave: {
        ...state.lastAutoSave,
        [auditId]: new Date(),
      },
    }));
  },

  // Update existing draft
  updateDraft: (auditId: string, updates: Partial<WorkpaperDraft>) => {
    set((state) => {
      const existingDraft = state.drafts[auditId];
      if (!existingDraft) {
        // If no draft exists, create one
        return {
          drafts: {
            ...state.drafts,
            [auditId]: {
              auditId,
              ...updates,
              lastSaved: new Date(),
            } as WorkpaperDraft,
          },
          lastAutoSave: {
            ...state.lastAutoSave,
            [auditId]: new Date(),
          },
        };
      }

      // Update existing draft
      return {
        drafts: {
          ...state.drafts,
          [auditId]: {
            ...existingDraft,
            ...updates,
            lastSaved: new Date(),
          },
        },
        lastAutoSave: {
          ...state.lastAutoSave,
          [auditId]: new Date(),
        },
      };
    });
  },

  // Delete a specific draft
  deleteDraft: (auditId: string) => {
    set((state) => {
      const { [auditId]: _, ...remainingDrafts } = state.drafts;
      const { [auditId]: __, ...remainingAutoSave } = state.lastAutoSave;
      return {
        drafts: remainingDrafts,
        lastAutoSave: remainingAutoSave,
      };
    });
  },

  // Clear all drafts
  clearAllDrafts: () => {
    set({ drafts: {}, lastAutoSave: {} });
  },

  // Check if a draft exists
  hasDraft: (auditId: string) => {
    return !!get().drafts[auditId];
  },
});

// Create the store with persistence
const useWorkpaperDraftStore = create<WorkpaperDraftStore>()(
  persist(workpaperDraftStore, {
    name: "workpaper-drafts-storage", // Key in localStorage
    // Only persist the drafts, not the lastAutoSave timestamps
    partialize: (state) => ({ drafts: state.drafts }),
  })
);

export default useWorkpaperDraftStore;

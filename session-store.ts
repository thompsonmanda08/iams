import { create } from "zustand";
import { getSystemSetup } from "@/app/_actions/session-actions";

type SessionState = {
  session: any;
  isLoading: boolean;
  lastFetched: number | null;
  actions: {
    fetchSession: (force?: boolean) => Promise<void>;
    clearSession: () => void;
  };
};

const REVALIDATE_AFTER = 3 * 60 * 1000; // 3 minutes

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  isLoading: true,
  lastFetched: null,
  actions: {
    fetchSession: async (force = false) => {
      const { lastFetched, isLoading } = get();
      const now = Date.now();

      // Prevent refetching if already loading or if called within revalidation window, unless forced
      if (isLoading || (!force && lastFetched && now - lastFetched < REVALIDATE_AFTER)) {
        return;
      }

      set({ isLoading: true });
      try {
        const systemInit = await getSystemSetup();
        if (systemInit.success) {
          set({
            session: systemInit.data,
            isLoading: false,
            lastFetched: now
          });
        } else {
          // Handle case where session is invalid or fetch fails
          set({ session: null, isLoading: false, lastFetched: null });
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        set({ session: null, isLoading: false, lastFetched: null });
      }
    },
    clearSession: () => {
      set({ session: null, isLoading: false, lastFetched: null });
    }
  }
}));

export const useSessionActions = () => useSessionStore((state) => state.actions);

export const useSession = () => useSessionStore((state) => state.session);

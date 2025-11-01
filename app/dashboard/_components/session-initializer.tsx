"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSystemSetup } from "@/hooks/use-users-query-data";

/**
 * Client component that initializes user session data if missing
 * This runs once on dashboard mount to fetch user data from /api/v1/auth/setup
 * After successful fetch, it triggers a soft navigation to refresh server components
 */
export function SessionInitializer({ hasUser }: { hasUser: boolean }) {
  const router = useRouter();

  // Only run if user is missing AND we haven't initialized this session
  const shouldFetch = !hasUser && typeof window !== "undefined" &&
    sessionStorage.getItem("session_initialized") !== "true";

  console.log("🔍 [SessionInitializer] State:", { hasUser, shouldFetch });

  // Enable query only when needed
  const { data, isSuccess, isError, error } = useSystemSetup(shouldFetch);

  useEffect(() => {
    if (shouldFetch && isSuccess && data?.success) {
      console.log("✅ [SessionInitializer] User data fetched and saved to session");

      // Mark as initialized - won't refetch again this session
      sessionStorage.setItem("session_initialized", "true");

      // Trigger a soft navigation to the current URL
      // This refreshes server components without full page reload
      console.log("🔄 [SessionInitializer] Triggering soft navigation to refresh user data...");

      // Add small delay to ensure cookie is written server-side
      setTimeout(() => {
        console.log("🔄 [SessionInitializer] Executing router.replace()...");
        // Use replace to avoid adding to browser history
        router.replace(window.location.pathname + window.location.search, {
          scroll: false // Don't scroll to top
        });
      }, 500); // 500ms delay
    }

    if (isError) {
      console.error("❌ [SessionInitializer] Failed to fetch user data:", error);
      // Still mark as initialized to prevent retry loops
      sessionStorage.setItem("session_initialized", "true");
    }
  }, [shouldFetch, isSuccess, data, isError, error, router]);

  // Don't render anything - this is just for side effects
  return null;
}

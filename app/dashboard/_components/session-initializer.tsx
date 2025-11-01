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
  const { data, isSuccess, isError, error } = useSystemSetup(!hasUser);

  // Don't render anything - this is just for side effects
  return null;
}

import "server-only";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { fetchSystemSetup } from "@/app/_actions/auth-actions";
import { buildPermissionMap } from "@/lib/permissions/build-permission-map";
import type { ModuleCode } from "@/lib/constants/module-codes";

/**
 * Gate a server component / layout by the current user's can_view permission on a module.
 *
 * - Redirects to /login when unauthenticated.
 * - Short-circuits for BACKOFFICE_ADMIN (matching the client-side bypass in usePermissions).
 * - Redirects to /dashboard/home only when we have a *definitive* "no permission" answer:
 *   the setup payload was successfully retrieved AND can_view !== true.
 * - On fetch failure / network timeout / empty permissions array, allows through.
 *   Mutations remain gated by the client-side checkPermission and the backend API,
 *   so this fail-open posture only affects UX (no false redirects on slow networks).
 *
 * Uses `fetchSystemSetup` which prefers the encrypted cookie cache; falls back
 * to the backend on cache miss. Wrapped in React.cache() so multiple layouts
 * in the same request share one resolution.
 */
export async function requireModuleView(moduleCode: ModuleCode): Promise<void> {
  const { isAuthenticated, user_type } = await verifySession();
  if (!isAuthenticated) redirect("/login");
  if (user_type === "BACKOFFICE_ADMIN") return;

  const setup = await fetchSystemSetup();

  // Fetch failed (network, backend down, slow timeout). Don't punish the user —
  // let them through. Client-side checks + backend authz still enforce safety.
  if (!setup?.success) return;

  const perms = setup?.data?.permissions as any[] | undefined;
  // Empty / missing permissions array — likely a transient failure too.
  // Only act when we have an array we can definitively check against.
  if (!Array.isArray(perms) || perms.length === 0) return;

  const map = buildPermissionMap(perms);
  if (map.get(moduleCode)?.can_view !== true) {
    redirect("/dashboard/home");
  }
}

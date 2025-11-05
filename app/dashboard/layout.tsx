import React from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { User } from "@/lib/types/account";
import { initializeSystemSetup } from "../_actions/auth-actions";
import { redirect } from "next/navigation";
import { getUserSession, verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  const { session, isAuthenticated, user_type } = await verifySession();
  const user = session?.user as User;

  // console.log("[DASHBOARD LAYOUT] Session Data:", {
  //   isAuthenticated,
  //   user_type,
  //   sessionUserType: session?.user_type,
  //   userObjectUserType: user?.user_type,
  //   path: "/dashboard/*"
  // });

  // if (!isAuthenticated) return redirect("/login");

  if (user_type === "BACKOFFICE_ADMIN") {
    console.log("[DASHBOARD LAYOUT] Redirecting to /admin/home - user_type:", user_type);
    return redirect("/admin/home");
  }

  // Enrich user object with user_type from session
  const enrichedUser = {
    ...user,
    user_type: user_type || session?.user_type
  } as User;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }>
      <AppSidebar variant="inset" user={enrichedUser} isAuthenticated={!!user_type} />
      <SidebarInset>
        <SiteHeader user={enrichedUser} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

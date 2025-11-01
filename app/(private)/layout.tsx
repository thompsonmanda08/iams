import React from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { User } from "@/lib/types/account";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  const { session, isAuthenticated } = await verifySession();

  if (session?.isAuthenticated && session?.user?.user_type != "BACKOFFICE_USER") {
    // ROUTE PROTECTION - GLOBAL BACK_OFFICE USERS
    return redirect("/");
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }>
      <AppSidebar variant="inset" session={session} isAuthenticated={isAuthenticated} />
      <SidebarInset>
        <SiteHeader user={session?.user as User} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

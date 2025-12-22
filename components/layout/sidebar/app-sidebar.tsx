"use client";

import * as React from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/layout/logo";
import { useSystemSetup } from "@/hooks/use-users-query-data";

export function AppSidebar({
  user: userData,
  isAuthenticated,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: any; isAuthenticated: boolean }) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  const { data: sessionResponse, isLoading } = useSystemSetup(isAuthenticated);
  const session = sessionResponse?.data;
  const isLoadingUser = isLoading || !userData || Object.keys(userData).length <= 0; // USER OBJECT HAS NO KEYS

  const user = React.useMemo(() => {
    return {
      ...userData,
      ...session?.user
    };
  }, [session?.user, userData, isLoadingUser]);

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo src={session?.logo_url} />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain user={user} isAuthenticated={isAuthenticated} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {/* NAV USER */}
        <NavUser user={user} isLoadingUser={isLoadingUser || Boolean(!userData.email)} />
      </SidebarFooter>
    </Sidebar>
  );
}

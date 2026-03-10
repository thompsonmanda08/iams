"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { LogOutIcon, UserCircle2Icon } from "lucide-react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { logUserOut } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";
import { generateAvatarFallback, getAvatarSrc } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function NavUser({ user, isLoadingUser }: { user: User; isLoadingUser: boolean }) {
  const { isMobile } = useSidebar();

  const fullName = `${user?.first_name} ${user?.last_name}`;
  const userEmail = user?.email;

  const handleUserLogOut = async () => {
    // Clear session initialization flag
    sessionStorage.removeItem("session_initialized");

    const response = await logUserOut("User initiated logout");
    if (response.success) {
      window.location.href = "/";
      return;
    }
  };

  // LOADING STATE
  return isLoadingUser ? (
    <>
      <Skeleton className="h-10 w-full rounded-lg" />
    </>
  ) : (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar>
                <AvatarImage src={getAvatarSrc(fullName)} alt={`${fullName} - Image`} />
                <AvatarFallback className="rounded-lg">
                  {generateAvatarFallback(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.user_type == "BACKOFFICE_ADMIN"
                    ? "Back Office Admin"
                    : user?.role?.name || String(user?.role)}
                </span>
              </div>
              <DotsVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={getAvatarSrc(fullName)} alt={`${fullName} - Image`} />
                  <AvatarFallback className="rounded-lg">
                    {generateAvatarFallback(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/system-configs?tab=profile">
                <UserCircle2Icon />
                Account
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUserLogOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

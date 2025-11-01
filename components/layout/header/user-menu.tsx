"use client";
import { BadgeCheck, LogOut } from "lucide-react";

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
import { logUserOut } from "@/app/_actions/auth-actions";
// import { useSystemSetup } from "@/hooks/use-users-query-data";
import { User } from "@/lib/types/account";
import { generateAvatarFallback, getAvatarSrc } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemSetup } from "@/hooks/use-users-query-data";

export default function UserMenu({ user }: { user: User }) {
  const { data: setup } = useSystemSetup();
  const userData = (user || setup?.data?.user) as User;
  const fullName = `${userData?.first_name || "No"} ${userData?.last_name || "Session"}`;
  const userEmail = userData?.email || "example@mail.com";

  const handleUserLogOut = async () => {
    // Clear session initialization flag
    sessionStorage.removeItem("session_initialized");

    const response = await logUserOut("User initiated logout");
    if (response.success) {
      window.location.href = "/";
      return;
    }
  };

  return !userData || Object.keys(userData).length < 0 ? (
    <>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={getAvatarSrc(fullName)} alt={`${fullName} - Image`} />
          <AvatarFallback className="rounded-lg">{generateAvatarFallback(fullName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarImage src={getAvatarSrc(fullName)} alt={`${fullName} - Image`} />
              <AvatarFallback className="rounded-lg">
                {generateAvatarFallback(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullName}</span>
              <span className="text-muted-foreground truncate text-xs">{userEmail || ""}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="https://shadcnuikit.com/pricing" target="_blank">
              <Sparkles /> Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleUserLogOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
        {/* <div className="bg-muted mt-1.5 rounded-md border">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Credits</h4>
              <div className="text-muted-foreground flex cursor-pointer items-center text-sm">
                <span>5 left</span>
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
            <Progress value={40} indicatorColor="bg-primary" />
            <div className="text-muted-foreground flex items-center text-sm">
              Daily credits used first
            </div>
          </div>
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

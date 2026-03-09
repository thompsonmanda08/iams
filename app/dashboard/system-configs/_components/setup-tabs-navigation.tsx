"use client";

import { useRouter } from "next/navigation";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Briefcase, UserCog } from "lucide-react";

const TABS = [
  { value: "branches", label: "Branches", icon: Building2 },
  { value: "departments", label: "Departments", icon: Briefcase },
  { value: "users", label: "Users", icon: UserCog }
] as const;

export type SetupTab = (typeof TABS)[number]["value"];

export function SetupTabsNavigation({ activeTab }: { activeTab: SetupTab }) {
  const router = useRouter();

  return (
    <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-2">
      {TABS.map(({ value, label, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className="gap-2"
          onClick={() =>
            router.replace(`/dashboard/system-configs/setup?tab=${value}`, { scroll: false })
          }>
          <Icon className="h-4 w-4" />
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

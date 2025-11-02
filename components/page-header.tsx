"use client";
import { ArrowLeft, UserCog, Users, Settings, Shield, Activity, Puzzle } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  UserCog,
  Users,
  Settings,
  Shield,
  Activity
};

function PageHeader({
  title,
  description,
  icon,
  Icon,
  showBackButton = false
}: {
  title: string;
  description: string;
  icon?: string;
  Icon?: LucideIcon;
  showBackButton?: boolean;
}) {
  const router = useRouter();

  // Support both icon string and Icon component for backward compatibility
  const IconComponent = Icon || (icon ? iconMap[icon] : null) || Puzzle;

  return (
    <div className="flex items-center gap-4">
      {showBackButton ? (
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg">
          <ArrowLeft className="text-primary-foreground h-7 w-7" />
        </Button>
      ) : (
        <div className="from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg">
          <IconComponent className="text-primary-foreground h-7 w-7" />
        </div>
      )}
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

export default PageHeader;

"use client";
import {
  ArrowLeft,
  UserCog,
  Users,
  Settings,
  Shield,
  Activity,
  Puzzle,
  ShieldUser,
  LayoutDashboard,
  Building2,
  ShieldAlert,
  FileCode2,
  FileText,
  ClipboardCheck,
  AlertCircle,
  MapPin,
  Briefcase,
  ListCheck,
  Wallet,
  Workflow,
  AlertTriangle,
  Map,
  ChartNetwork,
  Globe,
  Calendar
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LucideIcon, ReactNode } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  UserCog,
  Users,
  Settings,
  Shield,
  Activity,
  Puzzle,
  ShieldUser,
  LayoutDashboard,
  Building2,
  ShieldAlert,
  FileCode2,
  FileText,
  ClipboardCheck,
  AlertCircle,
  MapPin,
  Briefcase,
  ListCheck,
  Wallet,
  Workflow,
  AlertTriangle,
  Map,
  ChartNetwork,
  Globe,
  Calendar
};

export interface PageHeaderClassNames {
  container?: string;
  iconWrapper?: string;
  icon?: string;
  textWrapper?: string;
  title?: string;
  description?: string;
  iconBackdrop?: string;
}

function PageHeader({
  title,
  description,
  icon,
  Icon,
  showBackButton = false,
  classNames,
  customIcon
}: {
  title: string;
  description: string;
  icon?: string;
  Icon?: LucideIcon;
  showBackButton?: boolean;
  classNames?: PageHeaderClassNames;
  customIcon?: ReactNode;
}) {
  const router = useRouter();

  // Support both icon string and Icon component for backward compatibility
  const IconComponent = Icon || (icon ? iconMap[icon] : null) || Puzzle;

  // Default styles
  const defaultContainer = "flex items-center gap-4";
  const defaultIconWrapper = "from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg";
  const defaultIcon = "text-primary-foreground h-7 w-7";
  const defaultTextWrapper = "";
  const defaultTitle = "text-foreground text-2xl font-bold tracking-tight";
  const defaultDescription = "text-muted-foreground text-sm";

  return (
    <div className={cn(defaultContainer, classNames?.container)}>
      {customIcon ? (
        customIcon
      ) : showBackButton ? (
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className={cn(defaultIconWrapper, classNames?.iconWrapper)}>
          <ArrowLeft className={cn(defaultIcon, classNames?.icon)} />
        </Button>
      ) : (
        <div className={cn(defaultIconWrapper, classNames?.iconWrapper)}>
          <IconComponent className={cn(defaultIcon, classNames?.icon)} />
        </div>
      )}
      <div className={cn(defaultTextWrapper, classNames?.textWrapper)}>
        <h1 className={cn(defaultTitle, classNames?.title)}>{title}</h1>
        <p className={cn(defaultDescription, classNames?.description)}>{description}</p>
      </div>
    </div>
  );
}

export default PageHeader;

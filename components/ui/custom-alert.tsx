import { cn } from "@/lib/utils";
import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type AlertType = "info" | "warning" | "error" | "success";

type CustomAlertProps = {
  type?: AlertType;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>> | null;
  onDismiss?: () => void;
};

const ALERT_CONFIG: Record<
  AlertType,
  {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    base: string;
    iconClass: string;
    titleClass: string;
    bar: string;
  }
> = {
  info: {
    icon: Info,
    base: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200",
    iconClass: "text-blue-500 dark:text-blue-400",
    titleClass: "text-blue-900 dark:text-blue-100",
    bar: "bg-blue-500 dark:bg-blue-400"
  },
  warning: {
    icon: AlertTriangle,
    base: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200",
    iconClass: "text-amber-500 dark:text-amber-400",
    titleClass: "text-amber-900 dark:text-amber-100",
    bar: "bg-amber-500 dark:bg-amber-400"
  },
  error: {
    icon: AlertCircle,
    base: "border-red-200 bg-red-50 text-red-900 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200",
    iconClass: "text-red-500 dark:text-red-400",
    titleClass: "text-red-900 dark:text-red-100",
    bar: "bg-red-500 dark:bg-red-400"
  },
  success: {
    icon: CheckCircle2,
    base: "border-green-200 bg-green-50 text-green-900 dark:border-green-800/60 dark:bg-green-950/40 dark:text-green-200",
    iconClass: "text-green-500 dark:text-green-400",
    titleClass: "text-green-900 dark:text-green-100",
    bar: "bg-green-500 dark:bg-green-400"
  }
};

const DEFAULT_CONFIG = {
  base: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
  iconClass: "text-slate-500 dark:text-slate-400",
  titleClass: "text-slate-900 dark:text-slate-100",
  bar: "bg-slate-400 dark:bg-slate-500"
};

function CustomAlert({
  type,
  className,
  title,
  message,
  Icon,
  children,
  onDismiss
}: CustomAlertProps) {
  const config = type ? ALERT_CONFIG[type] : null;
  const ResolvedIcon = Icon ?? config?.icon ?? null;
  const base = config?.base ?? DEFAULT_CONFIG.base;
  const iconClass = config?.iconClass ?? DEFAULT_CONFIG.iconClass;
  const titleClass = config?.titleClass ?? DEFAULT_CONFIG.titleClass;
  const bar = config?.bar ?? DEFAULT_CONFIG.bar;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full overflow-hidden rounded-lg border text-sm shadow-sm",
        base,
        className
      )}>
      {/* Left accent bar */}
      <div className={cn("w-1 shrink-0 self-stretch rounded-l-lg", bar)} />

      <div className="flex flex-1 items-start gap-3 px-4 py-3">
        {ResolvedIcon && <ResolvedIcon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />}

        <div className="flex-1 space-y-0.5">
          {title && <p className={cn("leading-snug font-semibold", titleClass)}>{title}</p>}
          {message ? <p className="leading-relaxed opacity-90">{message}</p> : children}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "-mt-0.5 ml-auto rounded p-0.5 opacity-60 transition-opacity hover:opacity-100",
              iconClass
            )}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default CustomAlert;

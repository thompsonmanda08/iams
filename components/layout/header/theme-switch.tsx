"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Computer, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeSwitchProps {
  compact?: boolean;
}

export default function ThemeSwitch({ compact = true }: ThemeSwitchProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={compact ? "h-9 w-9" : "flex gap-1"}>
        <div className="bg-muted h-9 w-9 animate-pulse rounded-md" />
        {!compact && (
          <>
            <div className="bg-muted h-9 w-9 animate-pulse rounded-md" />
            <div className="bg-muted h-9 w-9 animate-pulse rounded-md" />
          </>
        )}
      </div>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "system") {
      return <Computer className="h-4 w-4" />;
    }
    if (theme === "light" || (theme === "system" && resolvedTheme === "light")) {
      return <Sun className="h-4 w-4" />;
    }
    return <Moon className="h-4 w-4" />;
  };

  const getThemeLabel = () => {
    if (theme === "system") return "System theme";
    if (theme === "light") return "Light theme";
    return "Dark theme";
  };

  if (compact) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="relative h-9 w-9"
        onClick={cycleTheme}
        title={getThemeLabel()}>
        {getThemeIcon()}
        <span className="sr-only">{getThemeLabel()}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
      <Button
        size="icon"
        variant={theme === "light" ? "default" : "ghost"}
        className={cn(
          "border-border/30 h-8 w-8 border transition-all",
          theme === "light" && "bg-primary border-none shadow-sm"
        )}
        onClick={() => setTheme("light")}
        title="Light theme">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light theme</span>
      </Button>

      <Button
        size="icon"
        variant={theme === "system" ? "default" : "ghost"}
        className={cn(
          "border-border/30 h-8 w-8 border transition-all",
          theme === "system" && "bg-primary border-none shadow-sm"
        )}
        onClick={() => setTheme("system")}
        title="System theme">
        <Computer className="h-4 w-4" />
        <span className="sr-only">System theme</span>
      </Button>

      <Button
        size="icon"
        variant={theme === "dark" ? "default" : "ghost"}
        className={cn(
          "border-border/30 h-8 w-8 border transition-all",
          theme === "dark" && "bg-primary border-none shadow-sm"
        )}
        onClick={() => setTheme("dark")}
        title="Dark theme">
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark theme</span>
      </Button>
    </div>
  );
}

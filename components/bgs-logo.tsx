"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useLayoutEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
import { cn } from "@/lib/utils";

export default function BGSLogo({
  className = "",
  isWhite,
  isDark
}: {
  className?: string;
  isWhite?: boolean;
  isDark?: boolean;
}) {
  const { theme } = useTheme();
  const [logoUrl, setLogoUrl] = useState("/images/bgs-light-mode-logo.png");

  useLayoutEffect(() => {
    if (isWhite) {
      setLogoUrl("/images/bgs-dark-mode-logo.png");
    } else if (isDark) {
      setLogoUrl("/images/bgs-light-mode-logo.png");
    } else {
      // Auto-switch based on theme
      setLogoUrl(
        theme === "dark" ? "/images/bgs-dark-mode-logo.png" : "/images/bgs-light-mode-logo.png"
      );
    }
  }, [theme, isDark, isWhite]);

  // LOADING STATE
  if (!logoUrl) {
    return <Spinner className="size-7" />;
  }

  return (
    <Image
      src={logoUrl}
      className={cn("h-16 w-auto object-contain", className)}
      width={300}
      height={100}
      alt="BGS Logo"
    />
  );
}

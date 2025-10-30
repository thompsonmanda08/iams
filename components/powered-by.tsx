import React from "react";
import BGSLogo from "./bgs-logo";
import { cn } from "@/lib/utils";

function PoweredBy({
  className,
  classNames,
  isWhite = undefined,
  isDark = undefined
}: {
  isWhite?: boolean;
  isDark?: boolean;
  className?: string;
  classNames?: { wrapper?: string; text?: string; logo?: string };
}) {
  return (
    <div
      className={cn(
        "my-6 flex items-center justify-center text-center text-sm font-normal italic lg:justify-start",
        className,
        classNames?.wrapper
      )}>
      <p className={cn("text-foreground text-bg lg:text-left", classNames?.text)}>Powered by</p>
      <span className="ml-2">
        <BGSLogo className={classNames?.logo} isWhite={isWhite} isDark={isDark} />
      </span>
    </div>
  );
}

export default PoweredBy;

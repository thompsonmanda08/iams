"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

function OverlayLoader({
  show,
  className,
  classNames,
  title = "Please wait",
  description = "Please wait while we prepare everything for you"
}: {
  show: boolean;
  className?: string;
  classNames?: {
    wrapper?: string;
    title?: string;
    spinner?: string;
    description?: string;
  };
  title?: string;
  description?: string;
}) {
  const [isOpen, setIsOpen] = useState(show || false);

  useEffect(() => {
    setIsOpen(show);

    return () => {
      setIsOpen(false);
    };
  }, [show]);

  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";

        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    isOpen && (
      <AnimatePresence>
        <motion.div
          animate="visible"
          className={cn(
            "via-card/80 to-secondary/20s absolute inset-0 z-9999999 flex h-screen w-full items-center justify-center from-transparent opacity-5 backdrop-blur-sm",
            className,
            classNames?.wrapper
          )}
          exit="exit"
          initial="hidden"
          transition={{ duration: 0.25 }}
          variants={overlayVariants}>
          <motion.div
            animate="visible"
            className="w-full max-w-md space-y-8 text-center"
            exit="exit"
            initial="hidden"
            transition={{ duration: 0.3 }}
            variants={modalVariants}>
            {/* Main Loading Spinner */}
            <div className="relative">
              <div className="from-primary/20 to-secondary/20 absolute inset-0 animate-pulse rounded-full bg-linear-to-r blur-xl" />
              <div className="border-divider bg-card shadow-primary/10 relative mx-auto flex h-24 w-24 items-center justify-center rounded-full p-8 shadow-2xl">
                <Spinner className={cn("h-12 w-12", classNames?.spinner)} />
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-3">
              <h1 className="text-foreground text-base font-semibold tracking-tight lg:text-lg">
                {title}
                <span className="inline-block w-8 text-left">{dots}</span>
              </h1>
              <p className="text-foreground/80 text-xs font-medium lg:text-sm">{description}</p>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-3">
              <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                <div className="from-primary to-primary h-1.5 animate-pulse rounded-full bg-linear-to-r" />
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-3 opacity-60">
              <div className="bg-secondary h-4 w-4 animate-bounce rounded-full" />
              <div
                className="bg-secondary h-4 w-4 animate-bounce rounded-full"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="bg-secondary h-4 w-4 animate-bounce rounded-full"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </motion.div>

          {/* Background Pattern */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="from-primary/5 to-secondary/5 absolute -top-4 -right-4 h-72 w-72 animate-pulse rounded-full bg-linear-to-br blur-3xl" />
            <div
              className="from-secondary/5 to-primary/5 absolute -bottom-4 -left-4 h-72 w-72 animate-pulse rounded-full bg-linear-to-tr blur-3xl"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    )
  );
}

export default OverlayLoader;

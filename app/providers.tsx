"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IdleTimerContainer } from "@/components/screen-lock";
import FirstLogin from "@/components/first-login";
import { useNetwork } from "@/hooks/use-network";
import { TooltipProvider } from "@/components/ui/tooltip";

function Providers({
  session,
  children
}: PropsWithChildren & {
  session?: any;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  const { online } = useNetwork();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        {!online && (
          <motion.div
            className="fixed top-4 right-4 z-999 mb-4 max-w-sm animate-pulse rounded-2xl bg-red-500 p-4 py-2 text-xs font-bold text-white capitalize backdrop-blur-2xl"
            transition={{
              type: "spring",
              stiffness: 100,
              ease: "easeInOut",
              duration: 0.3
            }}
            whileInView={{
              y: [-20, 1],
              opacity: [0, 1]
            }}>
            Check your internet connection and try again!
          </motion.div>
        )}

        {children}
        {session?.accessToken && <IdleTimerContainer session={session} />}
        {session?.change_password && <FirstLogin open={session?.change_password} />}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </TooltipProvider>
  );
}

export default Providers;

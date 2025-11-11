import React from "react";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import NextTopLoader from "nextjs-toploader";

import "./globals.css";

import { ActiveThemeProvider } from "@/components/active-theme";
import { DEFAULT_THEME } from "@/lib/themes";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import { Metadata } from "next";
import localFont from "next/font/local";
import { verifySession } from "@/lib/session";
import { defaultMetadata } from "./metadata";

const inter = localFont({
  src: [
    {
      path: "fonts/inter/100.ttf",
      weight: "100",
      style: "normal"
    },
    {
      path: "fonts/inter/200.ttf",
      weight: "200",
      style: "normal"
    },
    {
      path: "fonts/inter/300.ttf",
      weight: "300",
      style: "normal"
    },
    {
      path: "fonts/inter/400.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "fonts/inter/500.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "fonts/inter/600.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "fonts/inter/700.ttf",
      weight: "700",
      style: "normal"
    },
    {
      path: "fonts/inter/800.ttf",
      weight: "800",
      style: "normal"
    },
    {
      path: "fonts/inter/900.ttf",
      weight: "900",
      style: "normal"
    }
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["inter", "system-ui", "arial"]
});

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeSettings = {
    preset: (cookieStore.get("theme_preset")?.value ?? DEFAULT_THEME.preset) as any,
    scale: (cookieStore.get("theme_scale")?.value ?? DEFAULT_THEME.scale) as any,
    radius: (cookieStore.get("theme_radius")?.value ?? DEFAULT_THEME.radius) as any,
    contentLayout: (cookieStore.get("theme_content_layout")?.value ??
      DEFAULT_THEME.contentLayout) as any
  };

  const bodyAttributes = Object.fromEntries(
    Object.entries(themeSettings)
      .filter(([_, value]) => value)
      .map(([key, value]) => [`data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value])
  );

  const { session } = await verifySession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-inter", inter.variable)}
        {...bodyAttributes}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <ActiveThemeProvider initialTheme={themeSettings}>
            {/* REST OF THE CLIENT SIDE PROVIDERS */}
            <Providers session={session}>{children}</Providers>
            <Toaster position="top-center" richColors />
            <NextTopLoader color="var(--primary)" showSpinner={false} height={2} shadow-sm="none" />
            {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

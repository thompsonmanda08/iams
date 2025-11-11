import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Infratel IAMS - Audit & Risk Management System",
  description: "Integrated Audit and Risk Management System. Accessible. Everywhere.",
  applicationName: "Infratel IAMS",
  authors: [{ name: "Infratel" }],
  generator: "Next.js",
  icons: {
    icon: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.png", type: "image/png" },
  ],
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "Infratel IAMS - Audit & Risk Management System",
    description: "Integrated Audit and Risk Management System. Accessible. Everywhere.",
    siteName: "Infratel IAMS",
    images: [
      {
        url: "/images/infratel-logo.png",
        width: 1200,
        height: 630,
        alt: "Infratel IAMS - Audit & Risk Management System"
      }
    ],
    type: "website",
    locale: "en_GB"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Infratel IAMS"
  },
  formatDetection: {
    telephone: false
  }
};

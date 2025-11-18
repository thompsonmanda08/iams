import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Infratel IAMS - Audit & Risk Management System",
  description: "Integrated Audit and Risk Management System. Accessible. Everywhere.",
  applicationName: "Infratel IAMS",
  authors: [{ name: "Infratel" }],
  generator: "Next.js",
  icons: {
    icon: "/favicon.ico"
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

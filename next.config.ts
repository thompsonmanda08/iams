import type { NextConfig } from "next";
import { config } from "dotenv";

config();

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // assetPrefix: isProduction ? "https://dashboard.shadcnuikit.com" : undefined,
  turbopack: {
    resolveAlias: {}
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "https",
        hostname: "bundui-images.netlify.app"
      }
    ]
  },

  experimental: {
    optimizePackageImports: ["lucide-react"], // Optimize chunk splitting
    serverActions: {
      bodySizeLimit: (process.env.MAX_FILE_SIZE_LIMIT as any) || "60mb",
      // allowedForwardedHosts: ["localhost:3001", "iams-dev.infratel.co.zm"] ,
      allowedOrigins: [
        "iams-dev.infratel.co.zm",
        "https://iams-dev.infratel.co.zm",
        "infratel.co.zm",
        "*.infratel.co.zm"
      ]
    }
  }
};

export default nextConfig;

import type { NextConfig } from "next";
import dotenv from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";

dotenv.config();

const withNextIntl = createNextIntlPlugin();

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactCompiler: true,
  compress: true,
  compiler: {
    removeConsole: isProduction,
  },
  experimental: {
    optimizePackageImports: ["@heroui/react", "lucide-react", "lodash", "date-fns"],
  },
  async rewrites() {
    if (isProduction) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.CLIENT_BACKEND}/api/:path*`,
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

import type { NextConfig } from "next";
import dotenv from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";

dotenv.config();

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.CLIENT_BACKEND}/api/:path*`,
        },
      ];
    }

    return [];
  },
  experimental: {
    reactCompiler: true,
  },
};

export default withNextIntl(nextConfig);

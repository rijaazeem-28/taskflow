import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@taskflow/shared", "@taskflow/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

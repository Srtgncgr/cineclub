import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Build sırasında ESLint hatalarını ignore et
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript type hatalarını ignore et
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint errors during build
  },
  /* other config options */
};

export default nextConfig;

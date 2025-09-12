import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint errors during build
  },
  productionBrowserSourceMaps: false,
  
  // Additional compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  /* other config options */
};

export default nextConfig;

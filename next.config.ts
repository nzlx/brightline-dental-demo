import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    deviceSizes: [400, 640, 828, 1080, 1280, 1920, 2400],
    // Photos are served at 85–90; lower values made them look soft.
    qualities: [75, 85, 90],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;

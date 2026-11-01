import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    deviceSizes: [400, 640, 828, 1080, 1280, 1920, 2400],
    qualities: [60, 70, 75],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;

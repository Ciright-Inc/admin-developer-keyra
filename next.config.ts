import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["recharts", "@tanstack/react-table", "framer-motion"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep a running local dev server isolated from production build artifacts.
  distDir: process.env.CS_ATLAS_BUILD_DIR && /^\.next-[a-z0-9-]+$/.test(process.env.CS_ATLAS_BUILD_DIR)
    ? process.env.CS_ATLAS_BUILD_DIR
    : process.env.NODE_ENV === "production" ? ".next-production" : ".next",
};

export default nextConfig;

import type { NextConfig } from "next";

const customBuildDir = process.env.CS_ATLAS_BUILD_DIR;
const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel's Next.js adapter expects the framework-standard `.next` directory.
  // Local production builds stay isolated from a concurrently running dev server.
  distDir: isVercelBuild
    ? ".next"
    : customBuildDir && /^\.next-[a-z0-9-]+$/.test(customBuildDir)
      ? customBuildDir
      : process.env.NODE_ENV === "production"
        ? ".next-production"
        : ".next",
};

export default nextConfig;

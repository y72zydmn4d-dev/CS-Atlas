import type { NextConfig } from "next";

const customBuildDir = process.env.CS_ATLAS_BUILD_DIR;
const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
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

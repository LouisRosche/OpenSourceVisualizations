import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  // Instrumentation is enabled by default in Next.js 15+
  // No experimental flag needed
};

export default nextConfig;

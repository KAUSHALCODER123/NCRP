import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray package-lock.json in the parent directory
  // otherwise makes Turbopack infer C:\Users\mrkau as the root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

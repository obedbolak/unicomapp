import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // You have a stray package-lock.json / node_modules in your home folder.
  // Without this, Turbopack (and your editor's TypeScript server) can infer
  // /home/obed as the project root and resolve React from the wrong place.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

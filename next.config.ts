import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // You have a stray package-lock.json / node_modules in your home folder.
  // Without this, Turbopack (and your editor's TypeScript server) can infer
  // /home/obed as the project root and resolve React from the wrong place.
  turbopack: {
    root: __dirname,
  },

  // @react-pdf/renderer ships native-ish font and image code and reads the
  // Carlito faces off disk at render time. Bundling it breaks both, so it is
  // required from node_modules at runtime instead.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;

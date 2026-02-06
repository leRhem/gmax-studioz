import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Only run the shim in development, not during build
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  // 1. Force these packages to be transpiled/bundled
  transpilePackages: ['@prisma/adapter-pg', 'pg'],

  // 2. Configure Webpack to ignore incompatible native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'pg-native': 'commonjs pg-native', // Ignore native bindings
      });
    }
    return config;
  },
  
  // 3. Ensure we don't accidentally treat pg as an external package
  serverExternalPackages: [], 
};

export default nextConfig;
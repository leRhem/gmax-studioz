import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Only run the Cloudflare shim in development mode
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
 
const nextConfig: NextConfig = {
  /* config options here */
};
 
export default nextConfig;
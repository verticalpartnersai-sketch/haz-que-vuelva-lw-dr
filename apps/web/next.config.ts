import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;

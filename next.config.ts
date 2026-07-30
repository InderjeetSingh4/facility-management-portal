import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve('.'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'durcfljdheewazrlevip.supabase.co',
      },
    ],
  },
};

export default nextConfig;

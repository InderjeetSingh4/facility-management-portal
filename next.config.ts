import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

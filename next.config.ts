import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // explicitly DO NOT cache API or Supabase requests
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkOnly',
      },
      // Cache images, fonts, and standard static assets
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: { maxEntries: 16, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // Fallback for everything else (Next.js pages/data) using NetworkFirst
      {
        urlPattern: /.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-and-data',
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 5,
        },
      }
    ],
  }
});

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

export default withPWA(nextConfig);

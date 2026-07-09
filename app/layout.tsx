import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import IOSInstallPrompt from "@/components/iOSInstallPrompt";

export const metadata: Metadata = {
  title: "Facility Portal",
  description: "Premium Facility Management Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Portal",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <IOSInstallPrompt />
      </body>
    </html>
  );
}

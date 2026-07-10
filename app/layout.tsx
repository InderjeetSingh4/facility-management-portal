import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import InstallPrompt from "@/components/InstallPrompt";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facility Portal",
  description: "Premium Facility Management Dashboard",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-950 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-50">
        <Providers>
          {children}
          <InstallPrompt />
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "!rounded-2xl !border !border-neutral-200/50 !bg-white/60 !backdrop-blur-md !shadow-sm !shadow-neutral-100/40 !text-neutral-900 dark:!bg-neutral-900/60 dark:!border-neutral-800/50 dark:!shadow-none dark:!text-neutral-100",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

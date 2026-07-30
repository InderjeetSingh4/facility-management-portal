import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Facility Portal",
  description: "Enterprise Facility Management Dashboard",
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-gradient-to-br from-[#eef2fa] via-white to-[#f3e8ff] dark:!bg-none dark:bg-bg-page bg-fixed bg-no-repeat text-primary dark:text-text-primary"
      >
        <Providers>
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "!rounded-2xl !border !border-border !bg-surface-solid/90 !backdrop-blur-2xl !shadow-xl !text-primary font-medium",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

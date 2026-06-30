import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RouteChrome } from "@/components/layout/RouteChrome";
import { FloatingConcierge } from "@/components/concierge/FloatingConcierge";
import { CompareBar } from "@/components/packages/CompareBar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { IntroProvider } from "@/context/IntroContext";
import { SkipLink } from "@/components/layout/SkipLink";

export const metadata: Metadata = {
  metadataBase: new URL("https://xoxo-puce.vercel.app"),
  title: "XOXO Travels — Create Your Sooper Hit Holiday",
  description: "Custom international holiday packages. Trusted by 2 Lakh+ Indian travellers.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://xoxo-puce.vercel.app",
    siteName: "XOXO Travels",
    title: "XOXO Travels",
    description: "Create Your Sooper Hit Holiday",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XOXO Travels — Create Your Sooper Hit Holiday",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XOXO Travels",
    description: "Create Your Sooper Hit Holiday",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0D3D2E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <IntroProvider>
            <SkipLink />
            <RouteChrome>{children}</RouteChrome>
            <FloatingConcierge />
            <CompareBar />
          </IntroProvider>
        </AuthProvider>
        <Toaster
          position="top-center"
          containerClassName="!top-[env(safe-area-inset-top)]"
          toastOptions={{
            duration: 3000,
            ariaProps: { role: "status", "aria-live": "polite" },
            style: {
              borderRadius: "14px",
              background: "rgba(17,17,17,0.92)",
              backdropFilter: "blur(12px)",
              color: "#fff",
              fontSize: "14px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            },
            success: { iconTheme: { primary: "#4ADE80", secondary: "#111" } },
          }}
        />
      </body>
    </html>
  );
}

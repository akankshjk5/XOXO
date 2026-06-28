import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { IntroProvider } from "@/context/IntroContext";
import { SkipLink } from "@/components/layout/SkipLink";

export const metadata: Metadata = {
  title: "XOXO Travels — Create Your Sooper Hit Holiday",
  description: "Custom international holiday packages. Trusted by 2 Lakh+ Indian travellers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
            <Navbar />
            <main id="main-content" className="min-h-screen outline-none" tabIndex={-1}>
              <AppShell>{children}</AppShell>
            </main>
            <Footer />
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

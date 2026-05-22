import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Scheherazade_New } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Splash from "@/components/Splash";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const scheherazade = Scheherazade_New({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-arabic", display: "swap" });

const SITE_DESCRIPTION =
  "A private, ad-free Islamic worship companion. Prayer times, Qibla, Quran, duas, dhikr, verified to the Six Books and quran.com. Nothing tracked, no account, open source.";

export const metadata: Metadata = {
  title: "Tasneem · تَسْنِيم",
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  applicationName: "Tasneem",
  appleWebApp: { capable: true, title: "Tasneem", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  openGraph: {
    title: "Tasneem · تَسْنِيم",
    description: SITE_DESCRIPTION,
    siteName: "Tasneem",
    type: "website",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Tasneem" }],
  },
  twitter: {
    card: "summary",
    title: "Tasneem · تَسْنِيم",
    description: SITE_DESCRIPTION,
    images: ["/icon.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A5C36",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} ${scheherazade.variable} min-h-screen font-sans`}>
        <Splash />
        <main className="mx-auto max-w-2xl pb-28">{children}</main>
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

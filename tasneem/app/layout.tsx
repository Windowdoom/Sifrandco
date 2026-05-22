import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Amiri } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Splash from "@/components/Splash";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

export const metadata: Metadata = {
  title: "Tasneem · تَسْنِيم",
  description:
    "Tasneem, a private, ad-free Islamic worship companion. Prayer times, Qibla, Quran, duas, dhikr, verified to the Six Books and quran.com.",
  manifest: "/manifest.json",
  applicationName: "Tasneem",
  appleWebApp: { capable: true, title: "Tasneem", statusBarStyle: "black-translucent" },
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
      <body className={`${inter.variable} ${cormorant.variable} ${amiri.variable} min-h-screen font-sans`}>
        <Splash />
        <main className="mx-auto max-w-2xl pb-28">{children}</main>
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Titillium_Web, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Self-hosted + preloaded via next/font — replaces the render-blocking
// Google Fonts @import that was gating first paint.
const display = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const OG_IMAGE = {
  url: "/artifacts/Airport_SEO_Img.webp",
  width: 6012,
  height: 4008,
  alt: "Techo International Airport Experience: Treasures of Cambodia",
};

export const metadata: Metadata = {
  // Required so relative OG image paths resolve to absolute URLs — crawlers
  // (Facebook, LinkedIn, X, etc.) reject relative image URLs.
  metadataBase: new URL("https://tia-experience.vercel.app"),
  title: "Experience · Techo International Airport",
  description:
    "Discover Treasures of Cambodia, an immersive heritage exhibition at Techo International Airport, then hunt for five hidden treasures across the terminal.",
  keywords: [
    "Techo International Airport",
    "Cambodia",
    "Angkor",
    "heritage exhibition",
    "treasure hunt",
    "artifacts",
  ],
  openGraph: {
    title: "Experience · Techo International Airport",
    description:
      "Treasures of Cambodia exhibition + an interactive treasure hunt across the terminal.",
    url: "/",
    siteName: "Techo International Airport Experience",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Experience · Techo International Airport",
    description:
      "Treasures of Cambodia exhibition + an interactive treasure hunt across the terminal.",
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D6A63A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

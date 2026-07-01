import type { Metadata, Viewport } from "next";
import { Titillium_Web, Cormorant_Garamond } from "next/font/google";
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
const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Experience · Techo International Airport",
  description:
    "Discover Treasures of Cambodia — an immersive heritage exhibition at Techo International Airport — then hunt for five hidden treasures across the terminal.",
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
    type: "website",
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
    <html lang="en" className={`${display.variable} ${editorial.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

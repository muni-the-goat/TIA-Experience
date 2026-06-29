import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

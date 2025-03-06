import "./globals.css";
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { ReactLenis } from "lenis/react";

import { cn } from "@/lib/utils";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://neal267.vercel.app"),
  title: {
    default: "neaL367",
    template: "%s | neaL367",
  },
  description: "Developer & Gamer",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    images: [
      {
        url: "https://neal367.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <ReactLenis root>
        <html lang="en" className={cn(`${geist.variable} ${inter.variable}`)}>
          <body className="flex flex-col min-h-screen bg-background text-foreground antialiased scroll-smooth">
            <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
              {children}
            </main>
          </body>
        </html>
      </ReactLenis>
    </ViewTransitions>
  );
}

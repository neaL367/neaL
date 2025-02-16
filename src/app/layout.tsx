import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "neaL367",
  description: "Developer & Gamer",
  openGraph: {
    title: "neaL367",
    description: "Developer & Gamer",
    url: "https://neal367.vercel.app/",
    siteName: "neaL367",
    locale: "en_US, th_TH",
    type: "website",
    images: [
      {
        url: "https://neal367.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    title: "neaL367",
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={cn(`${inter.variable}`)}>
        <body className="flex flex-col min-h-screen bg-background text-foreground antialiased">
          <SpeedInsights />
          <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
            {children}
          </main>
        </body>
      </html>
    </ViewTransitions>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Navbar from "@/components/nav";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atichat",
  description: "Developer & Gamer",
  openGraph: {
    title: "Atichat",
    description: "Developer & Gamerr",
    url: "https://atichat.vercel.app/",
    siteName: "Atichat",
    locale: "en_US, th_TH",
    type: "website",
    images: [
      // {
      //   url: "https://atichat.vercel.app/og",
      //   width: 1200,
      //   height: 630,
      // },
    ],
  },
  twitter: {
    title: "Atichat",
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
      <html lang="en" className={cn(`${inter.className}`)}>
        <body className="flex flex-col min-h-screen bg-background text-foreground ">
          <SpeedInsights />
          <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
            <Navbar />
            {children}
          </main>
        </body>
      </html>
    </ViewTransitions>
  );
}

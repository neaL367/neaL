import "./globals.css";
import { Geist } from "next/font/google";
import { baseUrl } from "@/app/sitemap";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: "Neal367", template: "%s | Neal367" },
  description: "Lazy coding | Gamer | PixelArt | Rockstar Games fan",
  openGraph: {
    title: "Neal367",
    description: "Lazy coding | Gamer | PixelArt | Rockstar Games fan",
    url: baseUrl,
    siteName: "Neal367",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/opengraph-image.jpg`,
        width: 1200,
        height: 630,
        alt: "neaL367 - Personal website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeaL367",
    description: "Lazy coding | Gamer | PixelArt | Rockstar Games fan",
    creator: "@NL367",
    images: `${baseUrl}/opengraph-image.jpg`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <main className="w-full my-0 md:my-16">{props.children}</main>
      </body>
    </html>
  );
}

import "./globals.css";
import { Geist } from "next/font/google";
import { baseUrl } from "@/app/sitemap";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Neal367", template: "%s | Neal367" },
  description: "Lazy coding | Gamer | PixelArt | Rockstar Games fan",
  openGraph: {
      title: 'Neal367 Website',
      description: '"Lazy coding | Gamer | PixelArt | Rockstar Games fan',
      url: baseUrl,
      siteName: 'Neal367',
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <main className="w-full my-0 md:my-16">{children}</main>
      </body>
    </html>
  );
}

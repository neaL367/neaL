import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})


export const metadata: Metadata = {
  title: "Atichat",
  description: "Developer & Gamer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <div className="flex justify-center items-center min-h-screen">
          <div className="md:mx-auto px-2 sm:px-4 max-w-max w-full h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

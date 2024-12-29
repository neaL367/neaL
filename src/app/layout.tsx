import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="en" className={inter.className}>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
          <Navbar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}

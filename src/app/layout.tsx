import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";


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
        className={`${inter.className} antialiased md:mx-auto px-2 sm:px-4 max-w-5xl w-full`}
      >
        <div className="flex justify-center items-center">
          <div className="">
            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

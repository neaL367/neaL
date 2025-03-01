import type { Metadata } from "next";
import ResumeContent from "@/contents/resume.mdx";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Atichat Thongnak - Web Developer with expertise in React, Next.js, and modern web technologies",
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
    title: "Resume",
    description:
      "Atichat Thongnak - Web Developer with expertise in React, Next.js, and modern web technologies",
  },
};

export default function ResumePage() {
  return (
    <>
      <ResumeContent />
    </>
  );
}

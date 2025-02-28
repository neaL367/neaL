import type { Metadata } from "next";
import ResumeContent from "@/contents/resume.mdx";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Atichat Thongnak - Web Developer with expertise in React, Next.js, and modern web technologies",
  openGraph: {
    title: "Resume | neaL367",
    description:
      "Atichat Thongnak - Web Developer with expertise in React, Next.js, and modern web technologies",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | neaL367",
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

"use client"
import Image from "next/image";
import dynamic from 'next/dynamic'

import IntroContent from "@/contents/introduce.mdx";

const Snow = dynamic(() => import("@/components/snow"), { ssr: false })

export default function Page() {
  return (
    <>
      <div className="relative w-full h-full my-8 pt-6 overflow-hidden rounded-lg border-0 shadow-sm">
        <Image
          src="https://avatars.githubusercontent.com/u/73696671?v=4"
          width={220}
          height={220}
          alt="atichat"
          loading="lazy"
          quality={90}
          className="object-contain"
        />
        <Snow />
      </div>
      <IntroContent />
    </>
  );
}

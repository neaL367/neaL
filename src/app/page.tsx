import Image from "next/image";

import IntroContent from "@/contents/introduce.mdx";
import Avatar from "../../public/images/avatar.png";
import Greeting from "@/components/greeting";

export default function Page() {
  return (
    <section>
      <div className="w-full h-full mt-8 mb-12 flex items-center gap-6">
        <Image
          src={Avatar}
          width={82}
          height={82}
          alt="neaL367"
          loading="lazy"
          quality={100}
          placeholder="blur"
          className="rounded-full border"
        />
        <Greeting primaryText="Hi there!" secondaryText="สวัสดี!" emoji="👋" />
      </div>
      <IntroContent />
    </section>
  );
}

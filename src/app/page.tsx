import Image from "next/image";

import IntroContent from "@/contents/introduce.mdx";
import Avatar from "../../public/images/avatar.png";

export default function Page() {
  return (
    <section>
      <div className="w-full h-full mt-8 mb-12 flex items-center gap-6">
        <Image
          src={Avatar}
          width={100}
          height={100}
          alt="neaL367"
          loading="lazy"
          quality={100}
          placeholder="blur"
          className="rounded-full border"
        />
        <p className="text-xl font-medium">
          <span
            aria-hidden="true"
            className="block overflow-hidden group relative font-inter"
          >
            <span className="inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full whitespace-nowrap">
              {"Hi there!".split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block"
                  style={{ transitionDelay: `${index * 25}ms` }}
                >
                  {letter === " " ? "\u00A0" : letter} 
                </span>
              ))} 👋
            </span>
            <span className="inline-block absolute left-0 top-0 transition-all duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
              {"สวัสดี!".split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block"
                  style={{ transitionDelay: `${index * 25}ms` }}
                >
                  {letter}
                </span>
              ))} 👋
            </span>
          </span>
        </p>
      </div>
      <IntroContent />
    </section>
  );
}

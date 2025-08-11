import Image from "next/image";
import { socialLinks } from "./lib/config";

export default function Page() {
  return (
    <section>
      <a href={socialLinks.twitter} target="_blank">
        {/* <Image
          src="/profile.png"
          alt="Profile photo"
          className="rounded-full bg-gray-100 block lg:mt-5 mt-0 lg:mb-5 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale hover:grayscale-0"
          unoptimized
          width={160}
          height={160}
          priority
        /> */}
      </a>
      <h1 className="mb-8 text-2xl font-medium">
      👋 hi, I'm atichat thongnak <sup>neal367</sup>
      </h1>

      <div className="prose prose-neutral dark:prose-invert">
        <p>I design and build intuitive, high-performance web experiences.</p>

        <p>
          leveraging tools like{" "}
          <a
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          ,{" "}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>
          ,{" "}
          <a
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tailwind CSS
          </a>
          , and{" "}
          <a
            href="https://ui.shadcn.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            shadcn/ui
          </a>{" "}
          to deliver pixel-perfect solutions.
        </p>

        <p>
          studying at{" "}
          <a
            href="https://www.spu.ac.th/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sripatum University
          </a>
          , and volunteering with{" "}
          <a
            href="https://goodgeek.club"
            target="_blank"
            rel="noopener noreferrer"
          >
            GoodGeekClub
          </a>{" "}
          to empower our local tech community.
        </p>

        <p>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            specialties:
          </span>{" "}
          TypeScript, server components, multilingual sites,
          <br /> clean, responsive interfaces, and a focus on craft and detail.
        </p>

        <p>
          I deploy my projects on{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel
          </a>{" "}
          and{" "}
          <a
            href="https://aws.amazon.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            AWS
          </a>
          , and I regularly host workshops to share best practices in web
          development.
        </p>

        <p>
          off-screen, I play{" "}
          <a
            href="https://www.rockstargames.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rockstar Games
          </a>{" "}
          and dream about making pixel-art games.
        </p>
      </div>
    </section>
  );
}

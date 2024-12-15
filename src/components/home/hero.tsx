import React from "react";

export default function Hero() {
  return (
    <div className="font-[family-name:var(--font-inter)] h-full flex flex-col justify-center">
      <h3 className="mb-6 tracking-tight sm:text-lg md:text-2xl font-light text-center">
        <span className="md:text-4xl">👋</span>, my name is Atichat and I am a
        Student
      </h3>
      <div className="group font-extrabold text-[2em] md:text-[5em] lg:text-[10em] text-center md:tracking-tighter leading-[1.1]">
        <h1
          className="inline-block 
          stroke-only 
          text-foreground 
          group-hover:text-[--background] 
          transition-all 
          duration-300 
          ease-in-out"
        >
          Webdeveloper
        </h1>
        <h1
          className="block 
          stroke-only 
          text-background 
          group-hover:text-[--foreround] 
          transition-all 
          duration-300 
          ease-in-out"
        >
          & Gamer
        </h1>
      </div>
      <div className="mt-4 sm:text-lg md:text-2xl font-light text-center md:text-start">
        <h3>based in Bangkok, Thailand.</h3>
      </div>
    </div>
  );
}

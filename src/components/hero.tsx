export default function Hero() {
  return (
    <div className="h-full min-h-[82dvh] flex flex-col justify-center">
      <h3 className="mb-6 tracking-tight sm:text-lg md:text-3xl font-light text-center">
        <span className="md:text-5xl">👋</span>, my name is Atichat and I am a
        Student
      </h3>
      <div className="group font-extrabold text-[2em] md:text-[5em] lg:text-[12em] text-center md:tracking-tighter leading-[1.1]">
        <h1
          className="inline-block 
          stroke-text 
          text-foreground 
          group-hover:text-[--background] 
          ransition-all duration-500 ease-out"
        >
          Webdeveloper
        </h1>
        <h1
          className="block 
          stroke-text 
          text-background 
          group-hover:text-[--foreround] 
          ransition-all duration-500 ease-out"
        >
          & Gamer
        </h1>
      </div>
      <div className="mt-4 sm:text-lg md:text-2xl font-light text-center">
        <h3>based in Bangkok, Thailand.</h3>
      </div>
    </div>
  );
}

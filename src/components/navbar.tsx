"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  const showHome =
    (pathname.startsWith("/p") ||
      pathname.startsWith("/b") ||
      pathname.startsWith("/n")) &&
    pathname !== "/";
    
  return (
    <div className="sticky top-0 h-24 w-full bg-foreground/90 backdrop-blur-lg flex items-center justify-center space-x-6 text-base md:text-2xl text-background/80 font-light ">
      {showHome && (
        <Link
          href="/"
          prefetch={false}
          className={cn(
            ` transition-all duration-500 hover:text-background/80 hover:-translate-y-0.5 hover:font-normal`,
            pathname === "/" ? "" : ""
          )}
        >
          home
        </Link>
      )}
      <Link
        href="/b"
        prefetch={false}
        className={cn(
          ` transition-all duration-500 hover:text-background/80 hover:-translate-y-0.5 hover:font-normal`,
          pathname === "/b" ? "text-foreground font-normal" : ""
        )}
      >
        blog
      </Link>
      <Link
        href="/p"
        prefetch={false}
        className={cn(
          ` transition-all duration-500 hover:text-background/80 hover:-translate-y-0.5 hover:font-normal`,
          pathname === "/p" ? "text-foreground font-normal" : ""
        )}
      >
        projects
      </Link>
      <Link
        href="/n"
        prefetch={false}
        className={cn(
          ` transition-all duration-500 hover:text-background/80 hover:-translate-y-0.5 hover:font-normal`,
          pathname === "/p" ? "text-foreground font-normal" : ""
        )}
      >
        notes
      </Link>
    </div>
  );
}

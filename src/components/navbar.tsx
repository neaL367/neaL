"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();

  const showHome =
    (pathname.startsWith("/p") || pathname.startsWith("/b")) &&
    pathname !== "/";
  return (
    <div className="h-20 flex items-center justify-center space-x-6 text-xl font-light">
      {showHome && (
        <Link
          href="/"
          prefetch={false}
          className="hover:-translate-y-1 hover:font-normal transition-all duration-300"
        >
          home
        </Link>
      )}
      <Link
        href="/b"
        prefetch={false}
        className="hover:-translate-y-1 hover:font-normal transition-all duration-300"
      >
        blog
      </Link>
      <Link
        href="/p"
        prefetch={false}
        className="hover:-translate-y-1 hover:font-normal transition-all duration-300"
      >
        projects
      </Link>
    </div>
  );
}

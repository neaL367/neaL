import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-background">
      <nav className="py-4">
        <div className="flex space-x-6 text-lg">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            H
          </Link>
          <Link
            href="/p"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            P
          </Link>
          <Link
            href="/n"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            N
          </Link>
          <Link
            href="/b"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            B
          </Link>
        </div>
      </nav>
    </header>
  );
}

import { Link } from "next-view-transitions";

export default function Navbar() {
  return (
    <header className="bg-background">
      <nav className="py-4">
        <div className="flex space-x-6 text-lg">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            h
          </Link>
          <Link
            href="/p"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            p
          </Link>
          <Link
            href="/n"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            n
          </Link>
          <Link
            href="/b"
            className="text-foreground hover:text-primary transition-all ease-in-out duration-500 hover:underline hover:font-medium "
          >
            b
          </Link>
        </div>
      </nav>
    </header>
  );
}

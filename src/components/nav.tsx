import { Link } from "next-view-transitions";

export default function Navbar() {
  return (
    <nav className="mb-12">
      <div className="flex space-x-6 text-md justify-start">
        {[
          { href: "/", label: "Home" },
          { href: "/p", label: "Projects" },
          { href: "/n", label: "Notes" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-500 "
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

import { Link } from "next-view-transitions";

export default function Navbar() {
  return (
    <header className="mb-12">
      <nav>
        <div className="flex space-x-8 text-lg justify-start">
          {[
            { href: "/", label: "H<sub>ome</sub>" },
            { href: "/p", label: "P<sub>rojects</sub>" },
            { href: "/n", label: "N<sub>otes</sub>" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-500 "
            >
              <span dangerouslySetInnerHTML={{ __html: label }} />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
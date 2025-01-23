import { Link } from "next-view-transitions";

export default function Navigatior() {
  return (
    <nav className="mb-6">
      <div className="flex text-md font-medium justify-start">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 transition-colors duration-500 "
        >
          Back
        </Link>
      </div>
    </nav>
  );
}

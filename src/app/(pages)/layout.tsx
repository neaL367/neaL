import Navigatior from "@/components/navigatior";
import { GithubIcon } from "lucide-react";

export default function LayoutPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="max-h-full">
      <Navigatior />
      {children}
      <div className="mt-6 gap-2.5 text-sm flex justify-center items-center">
        <p>@neaL367 - {new Date().getFullYear()}</p>
        <a
          href="https://github.com/neaL367"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <GithubIcon size={16} />
        </a>
      </div>{" "}
    </main>
  );
}

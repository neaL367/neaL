import { Link } from "@/components/link";

export default function NotFound() {
  return (
    <div className="h-[70dvh] text-center flex flex-col justify-center">
      <h1 className="mb-6 text-lg text-zinc-900 dark:text-zinc-100">
        The page you&apos;re looking for doesn&apos;t exist or another error
        occurred. (404)
      </h1>
      <Link href="/">Home</Link>
    </div>
  );
}

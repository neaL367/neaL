"use client";

import { useTransitionRouter } from "next-view-transitions";

export default function Navigator() {
  const router = useTransitionRouter();

  return (
    <nav className="mb-10">
      <div className="flex text-md font-medium justify-start">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>
    </nav>
  );
}

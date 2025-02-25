"use client"

import { useTransitionRouter } from "next-view-transitions";

export default function Navigatior() {
  const router = useTransitionRouter();

  return (
    <nav className="mb-6">
      <div className="flex text-md font-medium justify-start">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 transition-colors duration-500 hover:cursor-pointer"
        >
          Back
        </button>
      </div>
    </nav>
  );
}

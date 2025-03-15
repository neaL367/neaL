"use client"

import type React from "react"

import { useTransitionRouter } from "next-view-transitions"
import { usePathname } from "next/navigation"

export default function Navigator() {
  const router = useTransitionRouter()
  const pathname = usePathname()

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()

    // Check current path to determine the content type
    if (pathname) {
      // Handle photo detail pages
      if (pathname.match(/^\/ph\/[^/]+$/)) {
        return router.push("/ph")
      }

      // Handle project detail pages
      if (pathname.match(/^\/pj\/[^/]+$/)) {
        return router.push("/pj")
      }

      // Handle notes detail pages
      if (pathname.match(/^\/nt\/[^/]+$/)) {
        return router.push("/nt")
      }

      // Handle listing pages - go back to home
      if (pathname === "/ph" || pathname === "/pj" || pathname === "/nt") {
        return router.push("/")
      }
    }

    // Default behavior for other pages
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <nav className="mb-10">
      <div className="flex text-md font-medium justify-start">
        <button onClick={handleBack} className="text-sm text-blue-600 hover:underline hover:cursor-pointer">
          ← Back
        </button>
      </div>
    </nav>
  )
}


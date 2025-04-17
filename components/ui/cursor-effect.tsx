'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'motion/react'

export function CursorEffect() {
  const [isVisible, setIsVisible] = useState(false)

  // Mouse position values with spring physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Apply spring physics for smooth movement
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 h-full w-full"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Main cursor with mask effect */}
      <motion.div
        className="pointer-events-none absolute h-12 w-12 rounded-full bg-zinc-600/50 dark:bg-zinc-300/50 mix-blend-overlay"
        style={{
          left: -20,
          top: -20,
          x: springX,
          y: springY,
          transition: 'transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
        }}
      />
    </motion.div>
  )
}

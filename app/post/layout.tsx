'use client'
import { motion } from 'motion/react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ScrollProgress } from '@/components/ui/scroll-progress'

export default function LayoutPost({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="pointer-events-none fixed top-0 left-0 z-10 h-20 w-full bg-zinc-400/50 backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-zinc-950/50 dark:backdrop-blur-xl" />
      <ScrollProgress
        className="fixed top-0 z-20 h-0.5 dark:bg-gray-300 bg-zinc-600"
        springOptions={{
          bounce: 0,
        }}
      />
      <main className="prose-zinc dark:prose-invert max-w-full:prose px-4 pb-20 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </>
  )
}

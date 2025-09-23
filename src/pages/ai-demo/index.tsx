// src/pages/ai-demo/index.tsx - AI Demo page route
import React from 'react'
import { motion } from 'framer-motion'
import ProductionGeminiDemo from '@/components/ai/ProductionGeminiDemo'
import { useScrollDirection } from '@/lib/useScrollDirection'

const AIDemoPage: React.FC = () => {
  const { direction } = useScrollDirection()

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Header */}
      <motion.header
        animate={{ y: direction === "down" ? -72 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="text-2xl">🧞‍♂️</span>
              <span className="hidden font-bold sm:inline-block font-brand">JobGenie</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Home
              </a>
              <a href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Jobs
              </a>
              <a href="/ai-demo" className="transition-colors hover:text-foreground/80 text-foreground">
                AI Demo
              </a>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main>
        <ProductionGeminiDemo />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with{" "}
              <a
                href="https://firebase.google.com/docs/ai"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Firebase AI
              </a>{" "}
              and{" "}
              <a
                href="https://ai.google.dev/docs"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Google Gemini
              </a>
              . Enterprise-ready AI for job seekers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AIDemoPage

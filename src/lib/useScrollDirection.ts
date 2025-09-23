// src/lib/useScrollDirection.ts - Scroll direction detection for enhanced UX
import { useEffect, useState } from "react"

export const useScrollDirection = (threshold = 10) => {
  const [direction, setDirection] = useState<"up" | "down">("up")
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false
    let scrollTimeout: NodeJS.Timeout

    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }

      setDirection(scrollY > lastScrollY ? "down" : "up")
      setIsScrolling(true)
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false

      // Clear existing timeout
      clearTimeout(scrollTimeout)
      
      // Set scrolling to false after scroll ends
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [threshold])

  return { direction, isScrolling }
}

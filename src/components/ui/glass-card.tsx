import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "subtle" | "prominent" | "floating"
  hover?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "subtle", hover = false, ...props }, ref) => {
    const variants = {
      subtle: "glass-subtle",
      prominent: "glass-prominent", 
      floating: "glass-floating"
    }
    
    const hoverClass = hover ? "hover:glass-prominent transition-all duration-200" : ""
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg",
          variants[variant],
          hoverClass,
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
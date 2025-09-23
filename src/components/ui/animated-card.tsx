import { motion } from 'framer-motion'
import { Card } from './card'
import { forwardRef, ReactNode } from 'react'

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  hover?: boolean
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, delay = 0, hover = true, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        whileHover={hover ? { 
          scale: 1.02, 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
        } : undefined}
        whileTap={hover ? { scale: 0.98 } : undefined}
      >
        <Card className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }

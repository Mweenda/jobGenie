import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
  label?: string
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

export function ProgressBar({ 
  value, 
  className, 
  showLabel = false, 
  label, 
  color = 'blue' 
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {value}%
          </span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className={cn("h-2 rounded-full", colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

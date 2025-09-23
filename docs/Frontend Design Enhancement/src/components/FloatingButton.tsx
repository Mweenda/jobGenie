import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface FloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function FloatingButton({ 
  children, 
  onClick, 
  variant = 'glass',
  size = 'default',
  className,
  disabled = false
}: FloatingButtonProps) {
  const glassStyles = {
    primary: 'bg-primary/80 backdrop-blur-md border border-white/20 text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary/80 backdrop-blur-md border border-white/20 text-secondary-foreground hover:bg-secondary/90',
    glass: 'glass-prominent hover:glass-floating text-foreground'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        size={size}
        disabled={disabled}
        className={cn(
          glassStyles[variant],
          'shadow-lg transition-all duration-300',
          className
        )}
      >
        {children}
      </Button>
    </motion.div>
  );
}
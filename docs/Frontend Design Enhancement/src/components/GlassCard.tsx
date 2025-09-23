import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'subtle' | 'prominent' | 'floating';
  className?: string;
  hover?: boolean;
  animate?: boolean;
}

const variants = {
  subtle: 'glass-subtle',
  prominent: 'glass-prominent',
  floating: 'glass-floating'
};

const hoverEffects = {
  subtle: 'hover:shadow-lg hover:scale-[1.02]',
  prominent: 'hover:shadow-xl hover:scale-[1.02]',
  floating: 'hover:shadow-2xl hover:scale-105'
};

export function GlassCard({ 
  children, 
  variant = 'prominent', 
  className, 
  hover = false,
  animate = true 
}: GlassCardProps) {
  const glassClass = variants[variant];
  const hoverClass = hover ? hoverEffects[variant] : '';

  const cardContent = (
    <div className={cn(
      glassClass,
      hoverClass,
      'rounded-lg transition-all duration-300 ease-out',
      className
    )}>
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
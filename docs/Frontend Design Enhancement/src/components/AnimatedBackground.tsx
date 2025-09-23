import React from 'react';
import { motion } from 'motion/react';

interface FloatingElementProps {
  delay: number;
  duration: number;
  className?: string;
  children: React.ReactNode;
}

function FloatingElement({ delay, duration, className, children }: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <FloatingElement delay={0} duration={6} className="absolute top-20 left-10">
        <div className="w-16 h-16 rounded-full glass-subtle opacity-60" />
      </FloatingElement>
      
      <FloatingElement delay={1} duration={8} className="absolute top-40 right-20">
        <div className="w-12 h-12 rotate-45 glass-prominent opacity-40" />
      </FloatingElement>
      
      <FloatingElement delay={2} duration={7} className="absolute bottom-40 left-20">
        <div className="w-20 h-20 rounded-lg glass-subtle opacity-50" />
      </FloatingElement>
      
      <FloatingElement delay={3} duration={9} className="absolute bottom-20 right-10">
        <div className="w-8 h-8 rounded-full glass-floating opacity-70" />
      </FloatingElement>
      
      <FloatingElement delay={4} duration={5} className="absolute top-1/2 left-1/4">
        <div className="w-6 h-6 rounded-full glass-prominent opacity-30" />
      </FloatingElement>
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-24 h-24 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
          filter: 'blur(15px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
}
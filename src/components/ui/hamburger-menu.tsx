import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Briefcase, Bookmark, MessageSquare, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GlassCard } from './glass-card'

interface MenuOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const menuOptions: MenuOption[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    path: '/jobs'
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: Bookmark,
    path: '/saved'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    path: '/messages'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  }
]

export const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleMenuClick = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <motion.button
        onClick={handleMenuClick}
        className={`p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isOpen 
            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-500/30' 
            : 'glass-subtle hover:glass-prominent hover:shadow-md'
        }`}
        aria-expanded={isOpen}
        aria-controls="hamburger-menu"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Desktop Dropdown */}
            <motion.div
              id="hamburger-menu"
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                x: -10,
                y: -5 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: 0,
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                x: -10,
                y: -5 
              }}
              transition={{ 
                duration: 0.25,
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="hidden md:block absolute top-full left-0 mt-2 z-[60] w-[280px]"
            >
              <GlassCard 
                variant="floating" 
                className="w-full p-3 shadow-2xl border border-white/30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl"
              >
                <div className="space-y-1">
                  {menuOptions.map((option, index) => {
                    const IconComponent = option.icon
                    const isActive = isActivePath(option.path)
                    
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05 
                        }}
                        onClick={() => handleOptionClick(option.path)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-500/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
                        }`}
                        whileHover={{ x: 6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className={`w-4 h-4 ${
                          isActive ? 'text-blue-600 dark:text-blue-400' : ''
                        }`} />
                        <span className="font-medium text-sm">{option.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>

            {/* Mobile Drawer */}
            <motion.div
              initial={{ 
                opacity: 0, 
                x: -300
              }}
              animate={{ 
                opacity: 1, 
                x: 0
              }}
              exit={{ 
                opacity: 0, 
                x: -300
              }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="md:hidden fixed top-0 left-0 h-full w-80 z-50"
            >
              <GlassCard 
                variant="floating" 
                className="h-full w-full p-6 shadow-2xl border-r border-white/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-none rounded-r-2xl"
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg glass-subtle hover:glass-prominent transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-2">
                  {menuOptions.map((option, index) => {
                    const IconComponent = option.icon
                    const isActive = isActivePath(option.path)
                    
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1 
                        }}
                        onClick={() => handleOptionClick(option.path)}
                        className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 font-medium ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-500/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
                        }`}
                        whileHover={{ x: 8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className={`w-5 h-5 ${
                          isActive ? 'text-blue-600 dark:text-blue-400' : ''
                        }`} />
                        <span className="font-medium text-base">{option.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="ml-auto w-2 h-2 rounded-full bg-blue-500"
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HamburgerMenu
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
        className="p-2 rounded-lg glass-subtle hover:glass-prominent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Menu */}
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

            {/* Menu Content */}
            <motion.div
              id="hamburger-menu"
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                x: -20,
                y: 10 
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
                x: -20,
                y: 10 
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              className="absolute top-full left-0 mt-2 z-50"
            >
              <GlassCard 
                variant="floating" 
                className="min-w-[200px] p-2 shadow-xl border border-white/20"
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
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 glass-prominent'
                            : 'text-gray-700 dark:text-gray-300 hover:glass-subtle hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        whileHover={{ x: 4 }}
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
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HamburgerMenu

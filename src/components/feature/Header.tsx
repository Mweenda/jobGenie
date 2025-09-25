import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, User, Settings, LogOut, Sparkles, Bookmark, MessageSquare, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { GlassCard } from '../ui/glass-card'
import { FloatingButton } from '../ui/floating-button'
import { HamburgerMenu } from '../ui/hamburger-menu'

export default function Header() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showUserDropdown])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      setShowUserDropdown(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleUserMenuClick = (path: string) => {
    navigate(path)
    setShowUserDropdown(false)
  }

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const userMenuOptions = [
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: User
    },
    {
      id: 'saved',
      label: 'Saved Jobs',
      path: '/saved',
      icon: Bookmark
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/messages',
      icon: MessageSquare
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ]

  const notifications = [
    {
      id: 1,
      title: 'New job match found!',
      message: 'Senior Frontend Developer at TechCorp matches your profile',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      title: 'Application update',
      message: 'Your application for Product Manager role is under review',
      time: '1 day ago',
      unread: true
    },
    {
      id: 3,
      title: 'Profile view',
      message: 'A recruiter viewed your profile',
      time: '2 days ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-prominent"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with Hamburger Menu */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu (Authenticated Only) */}
            {isAuthenticated && (
              <HamburgerMenu />
            )}
            
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center space-x-2">
                <Sparkles className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="text-brand-md">JobGenie</span>
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Search Bar (Authenticated Only) */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for jobs..."
                  className="pl-10 glass-subtle border-0"
                />
              </div>
            </div>
          )}

          {/* Navigation & User Actions */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              // Loading skeleton
              <div className="animate-pulse glass-subtle h-10 w-32 rounded-md" />
            ) : isAuthenticated && user ? (
              <>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full glass-subtle hover:glass-prominent transition-all duration-200 relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>
                  
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50"
                    >
                      <div className="p-5 border-b border-gray-200/30">
                        <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                        <p className="text-gray-500 text-sm mt-1">{unreadCount} unread notifications</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-5 border-b border-gray-100/50 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer ${
                              notification.unread ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-3">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                                  {notification.unread && (
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm mt-2 leading-relaxed">{notification.message}</p>
                                <p className="text-gray-500 text-xs mt-3 flex items-center">
                                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200/30 bg-gray-50/30">
                        <button className="text-blue-600 font-medium text-sm hover:text-blue-700 w-full text-center transition-colors py-2 px-4 rounded-lg hover:bg-blue-50">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* User Dropdown - Hamburger Menu Style */}
                <div className="relative" ref={userDropdownRef}>
                  <motion.button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      showUserDropdown 
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-500/30' 
                        : 'glass-subtle hover:glass-prominent hover:shadow-md'
                    }`}
                    aria-expanded={showUserDropdown}
                    aria-controls="user-menu"
                    aria-label={showUserDropdown ? 'Close user menu' : 'Open user menu'}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {user.firstName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {user.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      showUserDropdown ? 'rotate-180' : ''
                    }`} />
                  </motion.button>

                  {/* User Menu Dropdown */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        id="user-menu"
                        initial={{ 
                          opacity: 0, 
                          scale: 0.95,
                          x: 10,
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
                          x: 10,
                          y: -5 
                        }}
                        transition={{ 
                          duration: 0.25,
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 300,
                          damping: 30
                        }}
                        className="absolute top-full right-0 mt-2 z-[60] w-[280px]"
                      >
                        <GlassCard 
                          variant="floating" 
                          className="w-full p-3 shadow-2xl border border-white/30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl"
                        >
                          {/* User Info Header */}
                          <div className="p-3 mb-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100/50">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.firstName || 'User'}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Options */}
                          <div className="space-y-1">
                            {userMenuOptions.map((option, index) => {
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
                                  onClick={() => handleUserMenuClick(option.path)}
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
                                      layoutId="activeUserIndicator"
                                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                                      transition={{ duration: 0.2 }}
                                    />
                                  )}
                                </motion.button>
                              )
                            })}
                            
                            {/* Separator */}
                            <div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                            
                            {/* Sign Out */}
                            <motion.button
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ 
                                duration: 0.2, 
                                delay: userMenuOptions.length * 0.05 
                              }}
                              onClick={handleSignOut}
                              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md"
                              whileHover={{ x: 6, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="font-medium text-sm">Sign Out</span>
                            </motion.button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <FloatingButton 
                  variant="glass" 
                  size="sm"
                  onClick={() => navigate('/?action=signin')}
                >
                  Sign In
                </FloatingButton>
                <FloatingButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/?action=signup')}
                >
                  Get Started
                </FloatingButton>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowNotifications(false)}
        />
      )}
      {showUserDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </motion.header>
  )
}
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

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 p-2 rounded-lg glass-subtle hover:glass-prominent transition-all duration-200"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">
                        {user.firstName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-floating border-white/10">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.firstName || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved')}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Saved Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
    </motion.header>
  )
}
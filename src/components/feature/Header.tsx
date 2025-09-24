import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, User, Settings, LogOut, Sparkles, Bookmark, MessageSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { FloatingButton } from '../ui/floating-button'
import { HamburgerMenu } from '../ui/hamburger-menu'

export default function Header() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

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
                {/* Quick Nav Links */}
                <nav className="hidden lg:flex items-center space-x-6">
                  <Link to="/jobs" className="text-sm hover:text-blue-500 transition-colors">
                    Jobs
                  </Link>
                  <Link to="/saved" className="text-sm hover:text-blue-500 transition-colors">
                    Saved
                  </Link>
                  <Link to="/messages" className="text-sm hover:text-blue-500 transition-colors">
                    Messages
                  </Link>
                </nav>

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
                      className="absolute right-0 mt-2 w-80 glass-floating rounded-lg z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div key={notification.id} className={`p-4 border-b border-white/5 hover:glass-prominent transition-colors ${notification.unread ? 'bg-blue-500/5' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                                <p className="text-muted-foreground text-xs mt-2">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <button className="text-blue-500 text-sm hover:text-blue-600 w-full text-center transition-colors">
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
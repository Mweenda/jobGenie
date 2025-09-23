import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Users, CheckCircle, User, LogOut, Briefcase, Search, Brain, TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card' // Unused
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu'
import { GlassCard } from '../../components/ui/glass-card'
import { FloatingButton } from '../../components/ui/floating-button'
import { AnimatedBackground } from '../../components/ui/animated-background'
import AuthModal from './components/AuthModal'
import { useAuth } from '../../hooks/useAuth'

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <GlassCard variant="prominent" hover className="p-6 h-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-3 rounded-full glass-floating"
          >
            {icon}
          </motion.div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  delay: number;
}

function StatCard({ number, label, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard variant="floating" className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        >
          <div className="text-2xl font-bold mb-2">{number}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()

  // Redirect authenticated users to home page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/home')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleGetStarted = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    navigate('/home')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-blue-400" />,
      title: "AI-Powered Matching",
      description: "Advanced algorithms analyze your skills and preferences to find the perfect job matches tailored just for you.",
      delay: 0.2
    },
    {
      icon: <Search className="w-6 h-6 text-purple-400" />,
      title: "Smart Job Discovery",
      description: "Discover hidden opportunities with our intelligent search that goes beyond keywords to understand your career goals.",
      delay: 0.4
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Instant Applications",
      description: "Apply to multiple positions with one click using our smart application system that optimizes your profile for each role.",
      delay: 0.6
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Jobs", delay: 0.2 },
    { number: "95%", label: "Match Success", delay: 0.4 },
    { number: "15K+", label: "Happy Users", delay: 0.6 },
    { number: "500+", label: "Top Companies", delay: 0.8 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      <AnimatedBackground />
      {/* Glass Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass-prominent"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-brand-md bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobGenie
              </span>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm hover:text-blue-500 transition-colors">Features</a>
              <a href="#about" className="text-sm hover:text-blue-500 transition-colors">About</a>
              <a href="#contact" className="text-sm hover:text-blue-500 transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isLoading ? (
                // Loading skeleton
                <div className="animate-pulse bg-white/20 h-10 w-32 rounded-md backdrop-blur-sm" />
              ) : isAuthenticated && user ? (
                // Authenticated user dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10 backdrop-blur-sm">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {user.firstName?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block">
                        {user.firstName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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
                    <DropdownMenuItem onClick={() => navigate('/home')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Saved Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Users className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                        // Unauthenticated buttons
                        <>
                          <FloatingButton variant="glass" size="sm" onClick={handleSignIn}>
                            Sign In
                          </FloatingButton>
                          <FloatingButton variant="primary" size="sm" onClick={handleGetStarted}>
                            Get Started
                          </FloatingButton>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1 
                  className="text-display-xl lg:text-6xl leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Find Your Dream Job with{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Magic
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  JobGenie uses advanced AI to match you with perfect career opportunities. 
                  Stop searching, start discovering your next adventure.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <FloatingButton variant="primary" className="px-8 py-3" onClick={handleGetStarted}>
                  <Briefcase className="w-5 h-5 mr-2" />
                  Start Job Hunt
                </FloatingButton>
                
                <FloatingButton variant="glass" className="px-8 py-3">
                  <Users className="w-5 h-5 mr-2" />
                  View Demo
                </FloatingButton>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8"
              >
                {stats.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <GlassCard variant="floating" className="p-8">
                <div className="w-full h-64 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">AI-Powered Career Matching</p>
                    <p className="text-sm text-muted-foreground">Smart algorithms working for you</p>
                  </div>
                </div>
              </GlassCard>
              
              {/* Floating job cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4"
              >
                <GlassCard variant="prominent" className="p-4 w-48">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Senior Developer</div>
                      <div className="text-xs text-muted-foreground">$120k - $150k</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -right-4"
              >
                <GlassCard variant="prominent" className="p-4 w-44">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Product Manager</div>
                      <div className="text-xs text-muted-foreground">Remote OK</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-display-lg mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobGenie?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of job searching with our AI-powered platform designed to connect you with your ideal career.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <GlassCard variant="floating" className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Ready to Transform Your Career?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who've found their dream jobs with JobGenie's AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FloatingButton variant="primary" className="px-8 py-3" onClick={handleGetStarted}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </FloatingButton>
                <FloatingButton variant="glass" className="px-8 py-3">
                  Schedule Demo
                </FloatingButton>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
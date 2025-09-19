import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Target, Zap, Users, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import AuthModal from './components/AuthModal'

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen bg-work-environment bg-cover bg-center bg-no-repeat">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-brand text-white drop-shadow-lg">JobGenie</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleSignIn} className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700 backdrop-blur-sm">
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-blue-600/20 text-blue-100 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-400/30">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Job Matching</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Find Your Dream Job
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">with AI Magic</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
              JobGenie uses advanced AI to match you with perfect job opportunities, 
              provide personalized career advice, and help you land your next role faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                Start Your Job Search
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-white/80">Jobs Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <div className="text-white/80">Match Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24hrs</div>
                <div className="text-white/80">Average Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose JobGenie?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform revolutionizes job searching with intelligent matching and personalized guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our AI analyzes your skills, experience, and preferences to find perfect job matches.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Instant Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Apply to multiple jobs with one click using our optimized application system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Career Coaching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get personalized career advice and interview preparation from our AI assistant.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Success Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your application progress and get insights to improve your success rate.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have already found their perfect career match with JobGenie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-4">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% Free to Start</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel Anytime</span>
            </div>
          </div>
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
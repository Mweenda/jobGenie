import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Briefcase, Users, TrendingUp, Search, Brain, Zap, Mail, MapPin, Phone, Award, Target, Heart } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { FloatingButton } from './FloatingButton';
import { AnimatedBackground } from './AnimatedBackground';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LinkedInLoginModal } from './LinkedInLoginModal';

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

export function LandingPage() {
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleSignIn = () => {
    setLoginModal({ isOpen: true, mode: 'signin' });
  };

  const handleGetStarted = () => {
    setLoginModal({ isOpen: true, mode: 'signup' });
  };

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
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobGenie
              </span>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm hover:text-blue-500 transition-colors">Features</a>
              <a href="#about" className="text-sm hover:text-blue-500 transition-colors">About</a>
              <a href="#contact" className="text-sm hover:text-blue-500 transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <FloatingButton variant="secondary" size="sm" onClick={handleSignIn}>
                Sign In
              </FloatingButton>
              <FloatingButton variant="primary" size="sm" onClick={handleGetStarted}>
                Get Started
              </FloatingButton>
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
                  className="text-5xl lg:text-6xl font-bold leading-tight"
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
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU4NTA2NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Modern office workspace"
                  className="w-full h-auto rounded-lg"
                />
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
            <h2 className="text-4xl font-bold mb-4">
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

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobGenie
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing the job search experience by combining cutting-edge AI technology 
              with human-centered design to create meaningful career connections.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <GlassCard variant="prominent" className="p-8">
                <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    At JobGenie, we believe that finding the right job shouldn't be a matter of luck. 
                    Our mission is to empower professionals with AI-driven insights that match their 
                    unique skills, aspirations, and values with the perfect career opportunities.
                  </p>
                  <p>
                    We're building a future where job searching is intelligent, personalized, and 
                    genuinely helpful – not just another endless scroll through generic listings.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full glass-floating flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">99%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full glass-floating flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">2024</div>
                    <div className="text-xs text-muted-foreground">Founded</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full glass-floating flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold">15K+</div>
                    <div className="text-xs text-muted-foreground">Success Stories</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <GlassCard variant="floating" className="p-8">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzU4NTM5Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Team collaboration"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-bold mb-4">Built by Career Experts</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team combines decades of recruiting experience with cutting-edge AI research. 
                  We understand both the technical challenges of matching algorithms and the human 
                  nuances of career satisfaction.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Get in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about JobGenie? We'd love to hear from you. 
              Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <GlassCard variant="prominent" hover className="p-8 text-center h-full">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-floating flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-4">
                  Send us a message and we'll respond within 24 hours.
                </p>
                <FloatingButton variant="glass" className="w-full">
                  christopher@hytel.io
                </FloatingButton>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassCard variant="prominent" hover className="p-8 text-center h-full">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-floating flex items-center justify-center">
                  <Phone className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Call Us</h3>
                <p className="text-muted-foreground mb-4">
                  Speak directly with our support team during business hours.
                </p>
                <FloatingButton variant="glass" className="w-full">
                  +260976342205
                </FloatingButton>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GlassCard variant="prominent" hover className="p-8 text-center h-full">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-floating flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Visit Us</h3>
                <p className="text-muted-foreground mb-4">
                  Stop by our office in Lusaka, Zambia.
                </p>
                <FloatingButton variant="glass" className="w-full">
                  Quadrant Park, Great East Rd, Lusaka
                </FloatingButton>
              </GlassCard>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlassCard variant="floating" className="p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg glass-subtle border-0 placeholder:text-muted-foreground"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg glass-subtle border-0 placeholder:text-muted-foreground"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg glass-subtle border-0 placeholder:text-muted-foreground"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg glass-subtle border-0 placeholder:text-muted-foreground"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg glass-subtle border-0 placeholder:text-muted-foreground resize-none"
                    placeholder="Tell us more details..."
                  />
                </div>
                
                <FloatingButton variant="primary" className="w-full py-3">
                  <Mail className="w-5 h-5 mr-2" />
                  Send Message
                </FloatingButton>
              </form>
            </GlassCard>
          </motion.div>
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

      {/* Login Modal */}
      <LinkedInLoginModal
        isOpen={loginModal.isOpen}
        onClose={() => setLoginModal({ ...loginModal, isOpen: false })}
        mode={loginModal.mode}
      />
    </div>
  );
}
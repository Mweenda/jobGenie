import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Linkedin, Mail, Lock, ArrowRight, User, Phone, Briefcase } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { FloatingButton } from './FloatingButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface LinkedInLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export function LinkedInLoginModal({ isOpen, onClose, mode }: LinkedInLoginModalProps) {
  const isSignUp = mode === 'signup';
  const [switchMode, setSwitchMode] = useState(mode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <GlassCard variant="floating" className="p-6 relative">
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full glass-subtle hover:glass-prominent transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Header */}
            <DialogHeader className="space-y-3 mb-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <DialogTitle className="text-xl font-bold mb-1">
                  {switchMode === 'signup' ? 'Join JobGenie' : 'Welcome Back'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  {switchMode === 'signup' 
                    ? 'Create your account to get started' 
                    : 'Sign in to continue your job search'
                  }
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            {/* LinkedIn Button - Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <FloatingButton 
                variant="primary" 
                className="w-full py-3 bg-[#0077B5] hover:bg-[#005885] text-white border-0"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                {switchMode === 'signup' ? 'Continue with LinkedIn' : 'Sign in with LinkedIn'}
              </FloatingButton>

              {switchMode === 'signup' && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    <strong>Recommended:</strong> Auto-fill your profile instantly
                  </p>
                </div>
              )}
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="my-4"
            >
              <div className="relative">
                <Separator className="my-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="glass-prominent px-3 text-xs text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              {switchMode === 'signup' ? (
                // Sign Up Form
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="First name"
                        className="pl-10 glass-subtle border-0 h-10 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Last name"
                        className="pl-10 glass-subtle border-0 h-10 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="pl-10 glass-subtle border-0 h-10 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      className="pl-10 glass-subtle border-0 h-10 text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Job title/field"
                      className="pl-10 glass-subtle border-0 h-10 text-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Create password"
                      className="pl-10 glass-subtle border-0 h-10 text-sm"
                    />
                  </div>
                </div>
              ) : (
                // Sign In Form
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      className="pl-10 glass-subtle border-0 h-10 text-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      className="pl-10 glass-subtle border-0 h-10 text-sm"
                    />
                  </div>

                  <div className="text-right">
                    <Button variant="link" className="p-0 h-auto text-xs text-blue-500 hover:text-blue-600">
                      Forgot password?
                    </Button>
                  </div>
                </div>
              )}

              <FloatingButton variant="glass" className="w-full py-2.5 mt-4">
                {switchMode === 'signup' ? 'Create Account' : 'Sign In'}
              </FloatingButton>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                {switchMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs text-blue-500 hover:text-blue-600"
                  onClick={() => setSwitchMode(switchMode === 'signup' ? 'signin' : 'signup')}
                >
                  {switchMode === 'signup' ? 'Sign in' : 'Sign up'}
                </Button>
              </p>
              
              <div className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{' '}
                <Button variant="link" className="p-0 h-auto text-xs underline">
                  Terms
                </Button>{' '}
                and{' '}
                <Button variant="link" className="p-0 h-auto text-xs underline">
                  Privacy Policy
                </Button>
              </div>
            </motion.div>

            {/* Trust Indicators - Only for Sign Up */}
            {switchMode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-sm font-bold">50K+</div>
                    <div className="text-xs text-muted-foreground">Jobs</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">95%</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">500+</div>
                    <div className="text-xs text-muted-foreground">Companies</div>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
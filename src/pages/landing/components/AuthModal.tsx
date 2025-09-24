import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Eye, EyeOff, Loader2, Sparkles, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
// import { Button } from '../../../components/ui/button' // Unused
import { Input } from '../../../components/ui/input'
import { GlassCard } from '../../../components/ui/glass-card'
import { FloatingButton } from '../../../components/ui/floating-button'
import { useAuth } from '../../../hooks/useAuth'
import ProfileImport from '../../../components/feature/ProfileImport'
import { ImportedProfile } from '../../../services/linkedinService'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    experienceLevel: 'entry'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showProfileImport, setShowProfileImport] = useState(false)
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password)
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          jobTitle: formData.jobTitle,
          experienceLevel: formData.experienceLevel
        })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleProfileImportComplete = async (importedProfile: ImportedProfile) => {
    try {
      // Create account with imported profile data
      await signUp({
        email: importedProfile.basicInfo.email,
        password: '', // Will be handled by OAuth
        firstName: importedProfile.basicInfo.firstName,
        lastName: importedProfile.basicInfo.lastName,
        jobTitle: importedProfile.basicInfo.headline || '',
        experienceLevel: 'mid', // Default, can be inferred from experience
        // profileData: importedProfile // TODO: Add to SignUpData interface
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account with LinkedIn profile')
      setShowProfileImport(false)
    }
  }

  if (!isOpen) return null

  // Show profile import flow for signup
  if (showProfileImport && mode === 'signup') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 glass-floating flex items-center justify-center p-4 z-50"
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      >
        <ProfileImport
          onImportComplete={handleProfileImportComplete}
          onCancel={() => setShowProfileImport(false)}
          className="w-full max-w-lg"
        />
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ 
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-[90%] ${mode === 'signup' ? 'max-w-[450px]' : 'max-w-[400px]'} relative`}
      >
        <GlassCard variant="floating" className="relative overflow-hidden">
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-full glass-subtle hover:glass-prominent transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </motion.button>
          
          {/* Header with Brand */}
          <div className="text-center pt-8 pb-6 px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <span className="text-brand-md">JobGenie</span>
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-2 flex items-center justify-center space-x-2">
                {mode === 'signin' ? (
                  <>
                    <LogIn className="w-6 h-6 text-blue-500" />
                    <span>Welcome Back</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-6 h-6 text-purple-500" />
                    <span>Create Account</span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'signin' 
                  ? 'Sign in to continue your job search journey' 
                  : 'Join thousands finding their dream careers with AI'
                }
              </p>
            </motion.div>
          </div>

          {/* Form Content */}
          <div className="px-6 pb-8">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6 space-y-3"
              >
                <FloatingButton
                  type="button"
                  variant="glass"
                  onClick={() => setShowProfileImport(true)}
                  className="w-full border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/20"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Import from LinkedIn
                </FloatingButton>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="glass-subtle px-3 py-1 rounded-full text-muted-foreground">Or create manually</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-1.5 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>First Name</span>
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="glass-subtle border-0 focus:glass-prominent h-9"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                        <span>Last Name</span>
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="glass-subtle border-0 focus:glass-prominent h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium mb-1.5 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>Job Title</span>
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                      </label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                        className="glass-subtle border-0 focus:glass-prominent h-9"
                      />
                    </div>
                    <div>
                      <label htmlFor="experienceLevel" className="block text-sm font-medium mb-1.5">
                        Experience
                      </label>
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="flex h-9 w-full rounded-md glass-subtle border-0 px-3 py-2 text-sm focus:glass-prominent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                      >
                        <option value="entry">Entry (0-2y)</option>
                        <option value="mid">Mid (3-5y)</option>
                        <option value="senior">Senior (6y+)</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mode === 'signup' ? 0.7 : 0.6 }}
              >
                <label htmlFor="email" className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Email Address</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="glass-subtle border-0 focus:glass-prominent h-10"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mode === 'signup' ? 0.8 : 0.7 }}
              >
                <label htmlFor="password" className="block text-sm font-medium mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Password</span>
                  </div>
                  {mode === 'signin' && (
                    <button type="button" className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={mode === 'signup' ? 'Create a strong password' : '••••••••'}
                    className="glass-subtle border-0 focus:glass-prominent pr-10 h-10"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with letters and numbers
                  </p>
                )}
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-subtle border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center space-x-2"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mode === 'signup' ? 0.9 : 0.8 }}
              >
                <FloatingButton 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === 'signin' ? (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In to <span className="text-brand-sm">JobGenie</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create My Account
                    </>
                  )}
                </FloatingButton>
              </motion.div>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: mode === 'signup' ? 1.0 : 0.9 }}
              className="mt-6 text-center"
            >
              <div className="glass-subtle px-4 py-3 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {mode === 'signin' ? 'Create account' : 'Sign in instead'}
                </motion.button>
              </div>
              
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
                </p>
              )}
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
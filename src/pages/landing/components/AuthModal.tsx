import { useState } from 'react'
import { X, Mail, Lock, User } from 'lucide-react'
import Button from '../../../components/base/Button'
import Input from '../../../components/base/Input'

interface AuthModalProps {
  mode: 'signin' | 'signup'
  onClose: () => void
  onSuccess: () => void
  onSwitchMode: (mode: 'signin' | 'signup') => void
}

export default function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (mode === 'signup' && !formData.name) {
      newErrors.name = 'Name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      if (mode === 'signin') {
        // For now, simulate the auth - will be replaced with real auth
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        // For signup, simulate creating account
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      onSuccess()
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Authentication failed. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          {mode === 'signup' && (
            <Input
              label="Full Name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name}
            />
          )}
          
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email}
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password}
            helperText={mode === 'signup' ? 'Must be at least 6 characters' : undefined}
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
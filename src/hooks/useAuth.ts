import { useState, useEffect, createContext, useContext } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Custom hook for authentication state management
 * Provides sign in, sign up, and sign out functionality
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook for managing authentication state
 * This is a mock implementation - replace with real auth service
 */
export function useAuthState(): AuthContextType {
  const [user, setUser] = useLocalStorage<User | null>('jobgenie_user', null)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      
      setUser(mockUser)
    } catch (error) {
      throw new Error('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock API call - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      
      setUser(mockUser)
    } catch (error) {
      throw new Error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut
  }
}

export { AuthContext }
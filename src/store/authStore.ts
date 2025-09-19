import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService, type AuthUser } from '../services/authService'
import type { User } from 'firebase/auth'

interface AuthState {
  user: AuthUser | null
  firebaseUser: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    jobTitle?: string
    experienceLevel?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>
  initialize: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setFirebaseUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

/**
 * Global authentication state management using Zustand
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { user: authUser } = await AuthService.signIn({ email, password })
          
          if (authUser) {
            const userProfile = await AuthService.getUserProfile(authUser.uid)
            set({
              user: userProfile,
              firebaseUser: authUser,
              isAuthenticated: true,
              isLoading: false
            })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signUp: async (userData) => {
        set({ isLoading: true })
        try {
          const { user: authUser } = await AuthService.signUp(userData)
          
          if (authUser) {
            const userProfile = await AuthService.getUserProfile(authUser.uid)
            set({
              user: userProfile,
              firebaseUser: authUser,
              isAuthenticated: true,
              isLoading: false
            })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        try {
          await AuthService.signOut()
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) throw new Error('No user logged in')

        set({ isLoading: true })
        try {
          await AuthService.updateUserProfile(user.id, updates)
          set({
            user: { ...user, ...updates },
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      initialize: async () => {
        set({ isLoading: true })
        try {
          // Wait for Firebase auth to initialize
          return new Promise((resolve) => {
            const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
              unsubscribe() // Only run once for initialization
              
              if (firebaseUser) {
                const userProfile = await AuthService.getUserProfile(firebaseUser.uid)
                set({
                  user: userProfile,
                  firebaseUser,
                  isAuthenticated: true,
                  isLoading: false
                })
              } else {
                set({
                  user: null,
                  firebaseUser: null,
                  isAuthenticated: false,
                  isLoading: false
                })
              }
              resolve(undefined)
            })
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'jobgenie-auth',
      partialize: (state) => ({
        user: state.user,
        firebaseUser: state.firebaseUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
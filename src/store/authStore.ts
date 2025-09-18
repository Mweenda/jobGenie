import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService, type AuthUser } from '../services/authService'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: AuthUser | null
  session: Session | null
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
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
}

/**
 * Global authentication state management using Zustand
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { user: authUser, session } = await AuthService.signIn({ email, password })
          
          if (authUser) {
            const userProfile = await AuthService.getUserProfile(authUser.id)
            set({
              user: userProfile,
              session,
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
          const { user: authUser, session } = await AuthService.signUp(userData)
          
          if (authUser) {
            const userProfile = await AuthService.getUserProfile(authUser.id)
            set({
              user: userProfile,
              session,
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
            session: null,
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
          const session = await AuthService.getCurrentSession()
          
          if (session?.user) {
            const userProfile = await AuthService.getUserProfile(session.user.id)
            set({
              user: userProfile,
              session,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'jobgenie-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
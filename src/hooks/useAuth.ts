import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { AuthService } from '../services/authService'

/**
 * Custom hook for authentication state management
 * Uses Zustand store and Supabase for real authentication
 */
export function useAuth() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    initialize,
    setUser,
    setSession,
  } = useAuthStore()

  // Initialize auth state on mount
  useEffect(() => {
    initialize()

    // Listen to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await AuthService.getUserProfile(session.user.id)
          setUser(userProfile)
          setSession(session)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initialize, setUser, setSession])

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
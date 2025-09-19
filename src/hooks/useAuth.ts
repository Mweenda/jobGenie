import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { AuthService } from '../services/authService'

/**
 * Custom hook for authentication state management
 * Uses Zustand store and Firebase for authentication
 */
export function useAuth() {
  const {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    initialize,
    setUser,
    setFirebaseUser,
  } = useAuthStore()

  // Initialize auth state on mount
  useEffect(() => {
    initialize()

    // Listen to auth state changes
    const unsubscribe = AuthService.onAuthStateChange(
      async (firebaseUser) => {
        if (firebaseUser) {
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid)
          setUser(userProfile)
          setFirebaseUser(firebaseUser)
        } else {
          setUser(null)
          setFirebaseUser(null)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [initialize, setUser, setFirebaseUser])

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
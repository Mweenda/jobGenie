import { auth, db } from '../lib/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  experienceLevel?: string
  profileImageUrl?: string
  resumeUrl?: string
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  jobTitle?: string
  experienceLevel?: string
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Authentication service using Firebase Auth
 * Handles user registration, login, logout, and profile management
 */
export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(userData: SignUpData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )

      const user = userCredential.user

      // Update the display name
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      })

      // Create user profile in Firestore
      await this.createUserProfile(user, userData)

      return { user, session: null }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(credentials: SignInData) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      )

      return { user: userCredential.user, session: null }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Get the current user session
   */
  static async getCurrentSession() {
    try {
      return auth.currentUser
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser() {
    try {
      return auth.currentUser
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()
      return {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        experienceLevel: data.experienceLevel,
        profileImageUrl: data.profileImageUrl,
        resumeUrl: data.resumeUrl,
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<AuthUser>) {
    try {
      const docRef = doc(db, 'users', userId)
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })

      // Get the updated profile
      const updatedProfile = await this.getUserProfile(userId)
      return updatedProfile
    } catch (error) {
      console.error('Update user profile error:', error)
      throw error
    }
  }

  /**
   * Create user profile in Firestore
   */
  private static async createUserProfile(user: User, userData: SignUpData) {
    try {
      const profile = {
        id: user.uid,
        email: user.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobTitle: userData.jobTitle,
        experienceLevel: userData.experienceLevel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'users', user.uid), profile)
    } catch (error) {
      console.error('Create user profile error:', error)
      throw error
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  /**
   * Check if email already exists
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      return !querySnapshot.empty
    } catch (error: any) {
      throw new Error(`Failed to check email: ${error.message}`)
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  }
}
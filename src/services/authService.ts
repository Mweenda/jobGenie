import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

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
 * Authentication service using Supabase Auth
 * Handles user registration, login, logout, and profile management
 */
export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(userData: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            job_title: userData.jobTitle,
            experience_level: userData.experienceLevel,
          }
        }
      })

      if (error) throw error

      // Create user profile in our users table
      if (data.user) {
        await this.createUserProfile(data.user, userData)
      }

      return { user: data.user, session: data.session }
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error

      return { user: data.user, session: data.session }
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
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
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
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
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  /**
   * Get user profile from our users table
   */
  static async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        jobTitle: data.job_title,
        experienceLevel: data.experience_level,
        profileImageUrl: data.profile_image_url,
        resumeUrl: data.resume_url,
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
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          job_title: updates.jobTitle,
          experience_level: updates.experienceLevel,
          profile_image_url: updates.profileImageUrl,
          resume_url: updates.resumeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update user profile error:', error)
      throw error
    }
  }

  /**
   * Create user profile in our users table
   */
  private static async createUserProfile(user: User, userData: SignUpData) {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          first_name: userData.firstName,
          last_name: userData.lastName,
          job_title: userData.jobTitle,
          experience_level: userData.experienceLevel,
        })

      if (error) throw error
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env'

// Supabase client configuration
const supabaseUrl = config.supabaseUrl
const supabaseKey = config.supabaseAnonKey

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (will be generated from Supabase CLI in production)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          job_title: string | null
          experience_level: string | null
          profile_image_url: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          job_title?: string | null
          experience_level?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          job_title?: string | null
          experience_level?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          industry: string | null
          size: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          requirements: string[] | null
          location: string | null
          job_type: string | null
          salary_min: number | null
          salary_max: number | null
          is_remote: boolean
          status: string
          posted_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          requirements?: string[] | null
          location?: string | null
          job_type?: string | null
          salary_min?: number | null
          salary_max?: number | null
          is_remote?: boolean
          status?: string
          posted_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          requirements?: string[] | null
          location?: string | null
          job_type?: string | null
          salary_min?: number | null
          salary_max?: number | null
          is_remote?: boolean
          status?: string
          expires_at?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          job_id: string
          status: string
          cover_letter: string | null
          applied_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          status?: string
          cover_letter?: string | null
          applied_at?: string
        }
        Update: {
          id?: string
          status?: string
          cover_letter?: string | null
        }
      }
      saved_jobs: {
        Row: {
          id: string
          user_id: string
          job_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          saved_at?: string
        }
        Update: {
          id?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          proficiency_level: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          proficiency_level: number
          created_at?: string
        }
        Update: {
          id?: string
          skill_name?: string
          proficiency_level?: number
        }
      }
    }
  }
}
// src/types/user.ts

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location?: {
    city: string
    state?: string
    country: string
  }
  skills?: UserSkill[]
  experience?: WorkExperience[]
  education?: Education[]
  preferences?: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserSkill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
  verified?: boolean
}

export interface WorkExperience {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
  skills?: string[]
  achievements?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  current: boolean
  gpa?: number
  achievements?: string[]
}

export interface UserPreferences {
  jobTypes: ('full-time' | 'part-time' | 'contract' | 'temporary' | 'internship')[]
  remote: boolean
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  locations?: string[]
  industries?: string[]
  companySize?: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[]
  notificationsEnabled: boolean
  emailDigestFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
}

/**
 * LinkedIn OAuth and Profile Import Service
 * Implements LinkedIn OAuth flow and profile data import
 */

import { auth } from '../lib/firebase'
import { 
  signInWithPopup, 
  OAuthProvider, 
  User,
  linkWithPopup,
  AuthError
} from 'firebase/auth'

// LinkedIn OAuth Configuration
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI || `${window.location.origin}/auth/callback`

// LinkedIn API Scopes for profile import
const LINKEDIN_SCOPES = [
  'r_liteprofile',
  'r_emailaddress',
  'r_basicprofile',
  'w_member_social'
].join(' ')

// LinkedIn Profile Data Types
export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline?: string
  summary?: string
  location?: {
    country: string
    region: string
  }
  profilePicture?: string
  emailAddress: string
  positions?: LinkedInPosition[]
  educations?: LinkedInEducation[]
  skills?: LinkedInSkill[]
  languages?: LinkedInLanguage[]
}

export interface LinkedInPosition {
  id: string
  title: string
  companyName: string
  description?: string
  location?: string
  startDate: {
    month?: number
    year: number
  }
  endDate?: {
    month?: number
    year: number
  }
  isCurrent: boolean
}

export interface LinkedInEducation {
  id: string
  schoolName: string
  fieldOfStudy?: string
  degree?: string
  startDate?: {
    year: number
  }
  endDate?: {
    year: number
  }
  grade?: string
  description?: string
}

export interface LinkedInSkill {
  id: string
  name: string
  endorsementCount?: number
}

export interface LinkedInLanguage {
  name: string
  proficiency: 'ELEMENTARY' | 'LIMITED_WORKING' | 'PROFESSIONAL_WORKING' | 'FULL_PROFESSIONAL' | 'NATIVE_OR_BILINGUAL'
}

// Imported Profile Schema for JobGenie
export interface ImportedProfile {
  source: 'linkedin'
  basicInfo: {
    firstName: string
    lastName: string
    email: string
    headline?: string
    summary?: string
    location?: string
    profilePicture?: string
  }
  experience: {
    id: string
    title: string
    company: string
    description?: string
    location?: string
    startDate: Date
    endDate?: Date
    isCurrent: boolean
  }[]
  education: {
    id: string
    school: string
    degree?: string
    fieldOfStudy?: string
    startDate?: Date
    endDate?: Date
    description?: string
  }[]
  skills: {
    name: string
    endorsements?: number
    category?: 'technical' | 'soft' | 'industry' | 'other'
  }[]
  languages: {
    name: string
    proficiency: string
  }[]
  consent: {
    profileImport: boolean
    recruiterContact: boolean
    dataUsage: boolean
    marketingEmails: boolean
  }
}

export class LinkedInService {
  private static instance: LinkedInService
  private accessToken: string | null = null

  private constructor() {
    if (!LINKEDIN_CLIENT_ID) {
      console.warn('LinkedIn Client ID not configured')
    }
  }

  public static getInstance(): LinkedInService {
    if (!LinkedInService.instance) {
      LinkedInService.instance = new LinkedInService()
    }
    return LinkedInService.instance
  }

  /**
   * Initiate LinkedIn OAuth flow using Firebase Auth
   */
  async signInWithLinkedIn(): Promise<{ user: User; profile?: LinkedInProfile }> {
    try {
      // Create LinkedIn OAuth provider
      const provider = new OAuthProvider('oidc.linkedin')
      
      // Configure OAuth parameters
      provider.setCustomParameters({
        client_id: LINKEDIN_CLIENT_ID,
        response_type: 'code',
        scope: LINKEDIN_SCOPES,
        redirect_uri: LINKEDIN_REDIRECT_URI
      })

      // Sign in with popup
      const result = await signInWithPopup(auth, provider)
      
      // Extract access token for API calls
      const credential = OAuthProvider.credentialFromResult(result)
      this.accessToken = credential?.accessToken || null

      // Import profile data if access token is available
      let linkedInProfile: LinkedInProfile | undefined
      if (this.accessToken) {
        linkedInProfile = await this.fetchLinkedInProfile()
      }

      return {
        user: result.user,
        profile: linkedInProfile
      }
    } catch (error) {
      console.error('LinkedIn OAuth error:', error)
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Link existing Firebase account with LinkedIn
   */
  async linkWithLinkedIn(user: User): Promise<LinkedInProfile | null> {
    try {
      const provider = new OAuthProvider('oidc.linkedin')
      provider.setCustomParameters({
        client_id: LINKEDIN_CLIENT_ID,
        response_type: 'code',
        scope: LINKEDIN_SCOPES,
        redirect_uri: LINKEDIN_REDIRECT_URI
      })

      const result = await linkWithPopup(user, provider)
      const credential = OAuthProvider.credentialFromResult(result)
      this.accessToken = credential?.accessToken || null

      if (this.accessToken) {
        return await this.fetchLinkedInProfile()
      }

      return null
    } catch (error) {
      console.error('LinkedIn linking error:', error)
      throw this.handleAuthError(error as AuthError)
    }
  }

  /**
   * Fetch LinkedIn profile data using access token
   */
  private async fetchLinkedInProfile(): Promise<LinkedInProfile> {
    if (!this.accessToken) {
      throw new Error('No LinkedIn access token available')
    }

    try {
      // Fetch basic profile
      const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!profileResponse.ok) {
        throw new Error(`LinkedIn API error: ${profileResponse.status}`)
      }

      const profileData = await profileResponse.json()

      // Fetch email address
      const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      let emailAddress = ''
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        emailAddress = emailData.elements?.[0]?.['handle~']?.emailAddress || ''
      }

      // Fetch positions (work experience)
      const positionsResponse = await fetch('https://api.linkedin.com/v2/positions?q=members&projection=(elements*(id,title,companyName,description,location,startDate,endDate,isCurrent))', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      let positions: LinkedInPosition[] = []
      if (positionsResponse.ok) {
        const positionsData = await positionsResponse.json()
        positions = positionsData.elements || []
      }

      // Transform LinkedIn data to our schema
      return {
        id: profileData.id,
        firstName: profileData.localizedFirstName || '',
        lastName: profileData.localizedLastName || '',
        headline: profileData.localizedHeadline,
        emailAddress,
        positions,
        profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
      }
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error)
      throw new Error('Failed to fetch LinkedIn profile data')
    }
  }

  /**
   * Transform LinkedIn profile to JobGenie profile format
   */
  transformToJobGenieProfile(
    linkedInProfile: LinkedInProfile,
    consent: ImportedProfile['consent']
  ): ImportedProfile {
    return {
      source: 'linkedin',
      basicInfo: {
        firstName: linkedInProfile.firstName,
        lastName: linkedInProfile.lastName,
        email: linkedInProfile.emailAddress,
        headline: linkedInProfile.headline,
        summary: linkedInProfile.summary,
        location: linkedInProfile.location ? 
          `${linkedInProfile.location.region}, ${linkedInProfile.location.country}` : undefined,
        profilePicture: linkedInProfile.profilePicture
      },
      experience: (linkedInProfile.positions || []).map(pos => ({
        id: pos.id,
        title: pos.title,
        company: pos.companyName,
        description: pos.description,
        location: pos.location,
        startDate: new Date(pos.startDate.year, (pos.startDate.month || 1) - 1),
        endDate: pos.endDate ? new Date(pos.endDate.year, (pos.endDate.month || 12) - 1) : undefined,
        isCurrent: pos.isCurrent
      })),
      education: (linkedInProfile.educations || []).map(edu => ({
        id: edu.id,
        school: edu.schoolName,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate ? new Date(edu.startDate.year, 0) : undefined,
        endDate: edu.endDate ? new Date(edu.endDate.year, 11) : undefined,
        description: edu.description
      })),
      skills: (linkedInProfile.skills || []).map(skill => ({
        name: skill.name,
        endorsements: skill.endorsementCount,
        category: this.categorizeSkill(skill.name)
      })),
      languages: (linkedInProfile.languages || []).map(lang => ({
        name: lang.name,
        proficiency: lang.proficiency
      })),
      consent
    }
  }

  /**
   * Categorize skills into types
   */
  private categorizeSkill(skillName: string): 'technical' | 'soft' | 'industry' | 'other' {
    const technicalSkills = [
      'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'sql',
      'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'mongodb', 'postgresql'
    ]
    
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
      'analytical thinking', 'creativity', 'adaptability', 'time management'
    ]

    const skillLower = skillName.toLowerCase()
    
    if (technicalSkills.some(tech => skillLower.includes(tech))) {
      return 'technical'
    }
    
    if (softSkills.some(soft => skillLower.includes(soft))) {
      return 'soft'
    }
    
    return 'other'
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  private handleAuthError(error: AuthError): Error {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in was cancelled. Please try again.')
      case 'auth/popup-blocked':
        return new Error('Popup was blocked. Please allow popups and try again.')
      case 'auth/cancelled-popup-request':
        return new Error('Another sign-in is in progress. Please wait.')
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection and try again.')
      case 'auth/too-many-requests':
        return new Error('Too many attempts. Please try again later.')
      default:
        return new Error('LinkedIn sign-in failed. Please try again.')
    }
  }

  /**
   * Get authorization URL for manual OAuth flow
   */
  getLinkedInAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID || '',
      redirect_uri: LINKEDIN_REDIRECT_URI,
      scope: LINKEDIN_SCOPES,
      state: this.generateState()
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  }

  /**
   * Generate secure state parameter for OAuth
   */
  private generateState(): string {
    return btoa(crypto.getRandomValues(new Uint8Array(32)).toString())
  }

  /**
   * Clear stored access token
   */
  clearToken(): void {
    this.accessToken = null
  }
}

// Export singleton instance
export const linkedInService = LinkedInService.getInstance()

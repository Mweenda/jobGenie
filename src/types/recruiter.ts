// src/types/recruiter.ts
export interface RecruiterProfile {
  id: string
  userId: string
  companyId: string
  role: 'recruiter' | 'hiring_manager' | 'admin'
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  avatar?: string
  subscription: SubscriptionDetails
  credits: number
  searchHistory: SearchRecord[]
  savedCandidates: string[] // candidate IDs
  preferences: RecruiterPreferences
  permissions: RecruiterPermissions
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionDetails {
  tier: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

export interface RecruiterPreferences {
  industries: string[]
  locations: string[]
  remoteOk: boolean
  experienceLevels: ('entry' | 'mid' | 'senior' | 'lead')[]
  skills: string[]
  salaryRanges: SalaryRangePreference[]
  companyTypes: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[]
  notifications: NotificationPreferences
}

export interface SalaryRangePreference {
  min: number
  max: number
  currency: string
  period: 'hourly' | 'monthly' | 'annually'
}

export interface NotificationPreferences {
  emailDigest: boolean
  newCandidateMatches: boolean
  candidateResponses: boolean
  systemUpdates: boolean
  marketingEmails: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
}

export interface RecruiterPermissions {
  canSearchCandidates: boolean
  canContactCandidates: boolean
  canExportData: boolean
  canManageTeam: boolean
  canAccessAnalytics: boolean
  maxSearchesPerMonth: number
  maxContactsPerMonth: number
}

export interface SearchRecord {
  id: string
  query: string
  filters: CandidateSearchFilters
  resultsCount: number
  timestamp: string
  creditsUsed: number
  savedCandidates: string[]
}

export interface CandidateSearchFilters {
  query?: string
  skills?: string[]
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead'
  location?: string
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
  industries?: string[]
  companies?: string[]
  educationLevel?: string
  languages?: string[]
  availability?: 'immediate' | 'within_2_weeks' | 'within_month' | 'not_looking'
}

export interface CandidateSearchParams extends CandidateSearchFilters {
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'experience' | 'salary' | 'last_active'
  sortOrder?: 'asc' | 'desc'
  includeAISummary?: boolean
}

export interface CandidateProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  avatar?: string
  headline: string
  summary?: string
  location: CandidateLocation
  experience: WorkExperience[]
  education: Education[]
  skills: CandidateSkill[]
  certifications: Certification[]
  languages: Language[]
  portfolio: PortfolioItem[]
  preferences: CandidatePreferences
  visibility: VisibilitySettings
  lastActive: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CandidateLocation {
  city: string
  state?: string
  country: string
  timezone: string
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible'
  willingToRelocate: boolean
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  description: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  skills: string[]
  achievements: string[]
  location?: string
  remote: boolean
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  gpa?: number
  achievements: string[]
}

export interface CandidateSkill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience: number
  endorsed: boolean
  endorsements: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expirationDate?: string
  credentialId?: string
  credentialUrl?: string
}

export interface Language {
  name: string
  proficiency: 'basic' | 'conversational' | 'professional' | 'native'
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  url?: string
  imageUrl?: string
  technologies: string[]
  category: 'project' | 'article' | 'presentation' | 'other'
  featured: boolean
}

export interface CandidatePreferences {
  jobTypes: ('full-time' | 'part-time' | 'contract' | 'internship')[]
  industries: string[]
  salaryExpectations: SalaryExpectation[]
  remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible'
  availabilityDate: string
  willingToRelocate: boolean
  preferredCompanySizes: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[]
}

export interface SalaryExpectation {
  min: number
  max: number
  currency: string
  period: 'hourly' | 'monthly' | 'annually'
  negotiable: boolean
}

export interface VisibilitySettings {
  profileVisible: boolean
  searchable: boolean
  showSalaryExpectations: boolean
  showContactInfo: boolean
  allowRecruiterContact: boolean
  blockedRecruiters: string[]
  blockedCompanies: string[]
}

export interface CandidateSearchResult {
  candidates: CandidateMatch[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  searchTime: number
  creditsUsed: number
}

export interface CandidateMatch {
  candidate: CandidateProfile
  matchScore: number
  matchComponents: MatchComponents
  reasoning: string[]
  confidence: number
  aiSummary?: AICandidateSummary
}

export interface MatchComponents {
  skills: number
  experience: number
  location: number
  salary: number
  preferences: number
  availability: number
}

export interface AICandidateSummary {
  id: string
  candidateId: string
  summary: string
  keyStrengths: string[]
  potentialConcerns: string[]
  fitAssessment: string
  recommendedQuestions: string[]
  confidenceScore: number
  generatedAt: string
}

// API Request/Response Types
export interface SearchCandidatesRequest {
  query?: string
  filters: CandidateSearchFilters
  pagination: {
    page: number
    limit: number
  }
  options: {
    includeAISummary: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

export interface SearchCandidatesResponse {
  success: boolean
  data: CandidateSearchResult
  message?: string
  errors?: string[]
}

export interface GenerateAISummaryRequest {
  candidateId: string
  jobDescription?: string
  specificRequirements?: string[]
}

export interface GenerateAISummaryResponse {
  success: boolean
  data: AICandidateSummary
  message?: string
  errors?: string[]
}

export interface ContactCandidateRequest {
  candidateId: string
  subject: string
  message: string
  jobId?: string
  scheduleMeeting?: boolean
  meetingDetails?: MeetingDetails
}

export interface MeetingDetails {
  preferredDates: string[]
  duration: number
  type: 'phone' | 'video' | 'in_person'
  location?: string
  agenda?: string
}

export interface ContactCandidateResponse {
  success: boolean
  data: {
    messageId: string
    deliveryStatus: 'sent' | 'delivered' | 'read'
    creditsUsed: number
  }
  message?: string
  errors?: string[]
}

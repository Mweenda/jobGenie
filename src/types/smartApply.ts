// src/types/smartApply.ts
import { Job } from './job'
import { UserProfile } from './user'

export interface SmartApplyRequest {
  job: Job
  userProfile: UserProfile
  includeResumeBullets: boolean
  includeCoverLetter: boolean
  customInstructions?: string
}

export interface GeneratedContent {
  coverLetter: string | null
  resumeBullets: string[]
  aiGenerated: boolean
  generatedAt: string
  jobId: string
  userId: string
}

export interface SmartApplyResponse {
  success: boolean
  content?: GeneratedContent
  error?: string
  generationTime: number
  cached: boolean
  aiLabeled: boolean
}

export interface ApplicationSubmission {
  jobId: string
  userId: string
  coverLetter?: string
  resumeBullets?: string[]
  customResume?: string
  additionalDocuments?: string[]
  submittedAt?: string
}

export interface SmartApplyAnalytics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageGenerationTime: number
  totalCost: number
  cacheHits: number
  cacheMisses: number
}

// src/types/interview.ts
import { Job } from './job'
import { UserProfile } from './user'

export interface InterviewQuestion {
  id: string
  text: string
  type: 'behavioral' | 'technical' | 'culture_fit' | 'situational'
  difficulty: 'easy' | 'medium' | 'hard'
  evaluationCriteria: string
  order: number
}

export interface InterviewSession {
  id: string
  jobId: string
  userId: string
  jobTitle: string
  companyName: string
  questions: InterviewQuestion[]
  responses: InterviewResponse[]
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt?: string
  estimatedDuration: number // in minutes
}

export interface CreateInterviewRequest {
  job: Job
  userProfile: UserProfile
  questionCount?: number
}

export interface InterviewResponse {
  id: string
  sessionId: string
  questionId: string
  responseText: string
  submittedAt: string
}

export interface InterviewFeedback {
  questionId: string
  score: number // 1-10
  strengths: string[]
  improvements: string[]
  suggestion: string
}

export interface InterviewResult {
  id: string
  sessionId: string
  overallScore: number // percentage
  feedback: InterviewFeedback[]
  actionableTips: string[]
  completedAt: string
  sessionDuration: number // in milliseconds
}

export interface InterviewAnalytics {
  totalSessions: number
  completedSessions: number
  averageScore: number
  averageSessionTime: number // in milliseconds
  totalCost: number
  thumbsUpRate: number // percentage
}

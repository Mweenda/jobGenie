// src/types/assessment.ts

export type AssessmentType = 'frontend' | 'qa' | 'product'

export interface AssessmentQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  points: number
  category: AssessmentType
}

export interface Assessment {
  id: string
  title: string
  description: string
  category: AssessmentType
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questions: AssessmentQuestion[]
  estimatedTime: number // in minutes
  passingScore: number // percentage
  createdAt: string
  isActive: boolean
}

export interface CreateAssessmentRequest {
  type: AssessmentType
  questionCount?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface AssessmentSubmission {
  assessmentId: string
  userId: string
  answers: Record<string, 'A' | 'B' | 'C' | 'D'> // questionId -> answer
  startedAt: string
  submittedAt: string
}

export interface QuestionResult {
  questionId: string
  userAnswer: 'A' | 'B' | 'C' | 'D'
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  explanation: string
  points: number
}

export interface AssessmentResult {
  id: string
  assessmentId: string
  userId: string
  score: number // percentage
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  questionResults: QuestionResult[]
  submittedAt: string
  badge?: Badge
  completionTime: number // in milliseconds
}

export interface Badge {
  id: string
  name: string
  description: string
  category: AssessmentType
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  iconUrl: string
  earnedAt: string
  userId: string
  assessmentId: string
  verificationCode: string
}

export interface AssessmentAnalytics {
  totalAssessments: number
  completedAssessments: number
  averageScore: number
  badgesAwarded: number
  averageCompletionTime: number // in milliseconds
  totalCost: number
}

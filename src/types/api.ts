// src/types/api.ts
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: APIError[]
  metadata?: ResponseMetadata
}

export interface APIError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

export class APIError extends Error {
  code: string
  field?: string
  details?: Record<string, any>

  constructor(error: { code: string; message: string; field?: string; details?: Record<string, any> }) {
    super(error.message)
    this.name = 'APIError'
    this.code = error.code
    this.field = error.field
    this.details = error.details
  }
}

export interface ResponseMetadata {
  timestamp: string
  requestId: string
  version: string
  processingTime: number
  rateLimit?: RateLimitInfo
  pagination?: PaginationInfo
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: string
  retryAfter?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Job-related API types
export interface JobSearchRequest {
  query?: string
  filters: JobSearchFilters
  pagination: PaginationParams
  options?: SearchOptions
}

export interface JobSearchResponse extends APIResponse<JobSearchResult> {
  data: JobSearchResult
}

export interface JobDetailsRequest {
  jobId: string
  includeCompanyInfo?: boolean
  includeRelatedJobs?: boolean
}

export interface JobDetailsResponse extends APIResponse<Job> {
  data: Job & {
    companyInfo?: CompanyDetails
    relatedJobs?: Job[]
  }
}

// Recruiter API types
export interface RecruiterDashboardRequest {
  dateRange?: DateRange
  includeMetrics?: boolean
  includeRecentActivity?: boolean
}

export interface RecruiterDashboardResponse extends APIResponse<RecruiterDashboard> {
  data: RecruiterDashboard
}

export interface RecruiterDashboard {
  profile: RecruiterProfile
  metrics: RecruiterMetrics
  recentActivity: ActivityItem[]
  upcomingTasks: TaskItem[]
  notifications: NotificationItem[]
}

export interface RecruiterMetrics {
  totalSearches: number
  candidatesContacted: number
  responseRate: number
  successfulHires: number
  creditsUsed: number
  creditsRemaining: number
  averageMatchScore: number
  topSkillsSearched: string[]
  searchTrends: TrendData[]
}

export interface ActivityItem {
  id: string
  type: 'search' | 'contact' | 'hire' | 'note'
  description: string
  timestamp: string
  relatedEntityId?: string
  relatedEntityType?: 'candidate' | 'job' | 'company'
}

export interface TaskItem {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  relatedEntityId?: string
}

export interface NotificationItem {
  id: string
  type: 'candidate_response' | 'new_match' | 'system_update' | 'billing'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionRequired: boolean
  actionUrl?: string
}

export interface TrendData {
  date: string
  value: number
  change?: number
  changePercent?: number
}

// AI Services API types
export interface AIAnalysisRequest {
  type: 'resume_analysis' | 'job_matching' | 'salary_prediction' | 'career_advice'
  data: Record<string, any>
  options?: AIAnalysisOptions
}

export interface AIAnalysisOptions {
  includeExplanation?: boolean
  confidenceThreshold?: number
  maxSuggestions?: number
  language?: string
}

export interface AIAnalysisResponse extends APIResponse<AIAnalysisResult> {
  data: AIAnalysisResult
}

export interface AIAnalysisResult {
  type: string
  result: Record<string, any>
  confidence: number
  explanation?: string
  suggestions?: AISuggestion[]
  metadata: AIMetadata
}

export interface AISuggestion {
  type: string
  title: string
  description: string
  priority: number
  actionable: boolean
  estimatedImpact?: string
}

export interface AIMetadata {
  model: string
  version: string
  processingTime: number
  tokensUsed?: number
  features: string[]
}

// Payment API types
export interface CreateSubscriptionRequest {
  tierId: string
  paymentMethodId: string
  billingAddress: BillingAddress
  couponCode?: string
}

export interface CreateSubscriptionResponse extends APIResponse<SubscriptionDetails> {
  data: SubscriptionDetails & {
    clientSecret?: string
    nextPaymentDate: string
  }
}

export interface PurchaseCreditsRequest {
  packageId: string
  quantity: number
  paymentMethodId: string
}

export interface PurchaseCreditsResponse extends APIResponse<CreditPurchase> {
  data: CreditPurchase
}

export interface CreditPurchase {
  id: string
  userId: string
  creditsAdded: number
  amountPaid: number
  currency: string
  transactionId: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'digital_wallet'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  dueDate: string
  paidAt?: string
  items: InvoiceItem[]
  downloadUrl?: string
  createdAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitAmount: number
  totalAmount: number
  period?: {
    start: string
    end: string
  }
}

// Webhook types
export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, any>
  timestamp: string
  signature: string
}

export interface StripeWebhookEvent extends WebhookEvent {
  type: 'customer.subscription.created' | 'customer.subscription.updated' | 'customer.subscription.deleted' | 
        'invoice.payment_succeeded' | 'invoice.payment_failed' | 'payment_method.attached'
}

// Utility types
export interface DateRange {
  startDate: string
  endDate: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface SearchOptions {
  includeMetadata?: boolean
  includeHighlights?: boolean
  timeout?: number
}

export interface CompanyDetails {
  id: string
  name: string
  description?: string
  website?: string
  logo?: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  founded?: number
  headquarters?: string
  glassdoorRating?: number
  benefits?: string[]
  culture?: string[]
  techStack?: string[]
}

// Error codes
export enum APIErrorCodes {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Rate Limiting & Quotas
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  
  // Payment
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE'
}

// HTTP Status codes mapping
export const HTTPStatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// Import shared types
import type { Job, JobSearchFilters, JobSearchResult } from './job'
import type { RecruiterProfile, CandidateProfile, CandidateSearchFilters } from './recruiter'

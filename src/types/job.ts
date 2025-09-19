// src/types/job.ts
export interface SalaryRange {
  min?: number
  max?: number
  text?: string
  currency?: string
  period?: 'hourly' | 'monthly' | 'annually'
}

export interface JobLocation {
  city?: string
  state?: string
  country?: string
  remote: boolean
  timezone?: string
}

export interface JobCompany {
  name: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  industry?: string
  logo?: string
  website?: string
}

export interface Job {
  id: string
  title: string
  company: JobCompany
  location: JobLocation
  salary?: SalaryRange
  description?: string
  requirements?: string[]
  benefits?: string[]
  skills: string[]
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead'
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship'
  postedDate: string // ISO date
  expiresAt?: string // ISO date
  source: 'indeed' | 'glassdoor' | 'remoteok' | 'linkedin' | 'jobgenie'
  sourceId: string
  sourceUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  raw?: any // original payload for debugging
}

export interface JobSearchFilters {
  query?: string
  location?: string
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
  experienceLevel?: Job['experienceLevel']
  employmentType?: Job['employmentType']
  company?: string
  skills?: string[]
  postedSince?: 'day' | 'week' | 'month'
}

export interface JobSearchParams extends JobSearchFilters {
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'date' | 'salary'
  sortOrder?: 'asc' | 'desc'
  fetchAllPages?: boolean
}

export interface JobSearchResult {
  jobs: Job[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// External API response interfaces
export interface IndeedJobResponse {
  jobs: IndeedJob[]
  totalResults: number
  currentPage: number
  nextPage?: number
  hasMore: boolean
}

export interface IndeedJob {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  requirements?: string[]
  skills?: string[]
  remote: boolean
  employmentType?: string
  postedDate: string
  url: string
  companyLogo?: string
  companySize?: string
  benefits?: string[]
}

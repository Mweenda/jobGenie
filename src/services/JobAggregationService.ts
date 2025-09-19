// src/services/JobAggregationService.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { Job, JobSearchParams, JobSearchResult, IndeedJobResponse, IndeedJob, JobLocation, SalaryRange } from '../types/job'

interface ProviderConfig {
  baseUrl: string
  apiKey?: string
  rateLimitPerMinute?: number
}

interface RetryOptions {
  retries: number
  backoffMs: number
  maxBackoffMs?: number
}

interface CacheOptions {
  enabled: boolean
  ttlMinutes: number
}

interface ServiceOptions {
  providers: {
    indeed: ProviderConfig
  }
  retryOptions?: RetryOptions
  cacheOptions?: CacheOptions
}

interface AggregationMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalJobsFetched: number
  averageResponseTime: number
  cacheHitRate: number
}

interface CacheEntry {
  data: JobSearchResult
  timestamp: number
  ttl: number
}

export class JobAggregationService {
  private indeedClient: AxiosInstance
  private retryOptions: RetryOptions
  private cacheOptions: CacheOptions
  private cache = new Map<string, CacheEntry>()
  private metrics: AggregationMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalJobsFetched: 0,
    averageResponseTime: 0,
    cacheHitRate: 0
  }
  private rateLimitQueue: Array<{ resolve: Function; reject: Function; timestamp: number }> = []
  private lastRequestTime = 0
  private requestInterval: number

  constructor(private options: ServiceOptions) {
    this.indeedClient = axios.create({
      baseURL: options.providers.indeed.baseUrl,
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${options.providers.indeed.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'JobGenie/1.0'
      }
    })

    this.retryOptions = {
      retries: 3,
      backoffMs: 100,
      maxBackoffMs: 5000,
      ...options.retryOptions
    }

    this.cacheOptions = {
      enabled: true,
      ttlMinutes: 15,
      ...options.cacheOptions
    }

    // Calculate request interval for rate limiting (requests per minute)
    const rateLimitPerMinute = options.providers.indeed.rateLimitPerMinute || 60
    this.requestInterval = 60000 / rateLimitPerMinute

    // Setup periodic cache cleanup
    setInterval(() => this.cleanupCache(), 60000) // Every minute
  }

  async fetchFromIndeed(params: JobSearchParams): Promise<JobSearchResult> {
    const startTime = Date.now()
    this.metrics.totalRequests++

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('indeed', params)
      if (this.cacheOptions.enabled) {
        const cached = this.getFromCache(cacheKey)
        if (cached) {
          return cached
        }
      }

      // Apply rate limiting
      await this.enforceRateLimit()

      const result = await this.fetchJobsWithPagination(params)
      
      // Cache the result
      if (this.cacheOptions.enabled) {
        this.setCache(cacheKey, result)
      }

      this.metrics.successfulRequests++
      this.metrics.totalJobsFetched += result.jobs.length
      this.updateAverageResponseTime(Date.now() - startTime)

      return result

    } catch (error) {
      this.metrics.failedRequests++
      throw error
    }
  }

  private async fetchJobsWithPagination(params: JobSearchParams): Promise<JobSearchResult> {
    const allJobs: Job[] = []
    let currentPage = params.page || 1
    let totalCount = 0
    let hasMore = true

    while (hasMore && (params.fetchAllPages || currentPage === (params.page || 1))) {
      const response = await this.callWithRetry('/jobs/search', {
        params: this.buildQueryParams({ ...params, page: currentPage })
      })

      const data: IndeedJobResponse = response.data

      // Handle malformed responses gracefully
      if (!data || !data.jobs || !Array.isArray(data.jobs)) {
        // Only break gracefully if we have some jobs already
        if (allJobs.length > 0) {
          break
        }
        // Return empty result for completely malformed responses
        return {
          jobs: [],
          totalCount: 0,
          currentPage: params.page || 1,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }

      const normalizedJobs = this.normalizeAndValidateJobs(data.jobs)
      allJobs.push(...normalizedJobs)

      totalCount = data.totalResults || allJobs.length
      hasMore = data.hasMore && data.nextPage !== undefined
      currentPage = data.nextPage || currentPage + 1

      // Prevent infinite loops
      if (currentPage > 10) break
    }

    // Deduplicate jobs
    const uniqueJobs = this.deduplicateJobs(allJobs)

    return {
      jobs: uniqueJobs,
      totalCount,
      currentPage: params.page || 1,
      totalPages: Math.ceil(totalCount / (params.limit || 20)),
      hasNextPage: currentPage < Math.ceil(totalCount / (params.limit || 20)),
      hasPreviousPage: (params.page || 1) > 1
    }
  }

  private buildQueryParams(params: JobSearchParams): Record<string, any> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 20
    }

    if (params.query) queryParams.q = params.query
    if (params.location) queryParams.location = params.location
    if (params.remote !== undefined) queryParams.remote = params.remote
    if (params.salaryMin) queryParams.salary_min = params.salaryMin
    if (params.salaryMax) queryParams.salary_max = params.salaryMax
    if (params.experienceLevel) queryParams.experience_level = params.experienceLevel
    if (params.employmentType) queryParams.employment_type = params.employmentType
    if (params.company) queryParams.company = params.company
    if (params.skills && params.skills.length > 0) queryParams.skills = params.skills.join(',')
    if (params.postedSince) queryParams.posted_since = params.postedSince
    if (params.sortBy) queryParams.sort_by = params.sortBy
    if (params.sortOrder) queryParams.sort_order = params.sortOrder

    return queryParams
  }

  private normalizeAndValidateJobs(jobs: IndeedJob[]): Job[] {
    return jobs
      .map(job => this.normalizeIndeedJob(job))
      .filter(job => this.validateJob(job))
  }

  private normalizeIndeedJob(indeedJob: IndeedJob): Job {
    const now = new Date().toISOString()
    
    return {
      id: `indeed-${indeedJob.id}`,
      title: this.sanitizeString(indeedJob.title) || 'Unknown Position',
      company: {
        name: this.sanitizeString(indeedJob.company) || 'Unknown Company',
        size: this.normalizeCompanySize(indeedJob.companySize),
        logo: indeedJob.companyLogo
      },
      location: this.normalizeLocation(indeedJob.location, indeedJob.remote),
      salary: this.normalizeSalary(indeedJob.salary),
      description: this.sanitizeAndTruncateText(indeedJob.description, 5000),
      requirements: indeedJob.requirements?.filter(req => req && req.trim()) || [],
      benefits: indeedJob.benefits?.filter(benefit => benefit && benefit.trim()) || [],
      skills: this.normalizeSkills(indeedJob.skills),
      experienceLevel: this.inferExperienceLevel(indeedJob.title, indeedJob.description),
      employmentType: this.normalizeEmploymentType(indeedJob.employmentType),
      postedDate: this.normalizeDate(indeedJob.postedDate) || now,
      source: 'indeed',
      sourceId: indeedJob.id,
      sourceUrl: indeedJob.url,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      raw: indeedJob
    }
  }

  private validateJob(job: Job): boolean {
    return !!(
      job.title &&
      job.company.name &&
      job.sourceId &&
      job.postedDate
    )
  }

  private sanitizeString(input: string | undefined): string {
    if (!input) return ''
    
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .trim()
  }

  private sanitizeAndTruncateText(input: string | undefined, maxLength: number): string {
    if (!input) return ''
    
    const sanitized = this.sanitizeString(input)
    return sanitized.length > maxLength 
      ? sanitized.substring(0, maxLength) + '...'
      : sanitized
  }

  private normalizeLocation(location: string, remote: any): JobLocation {
    const sanitizedLocation = this.sanitizeString(location)
    const isRemote = this.normalizeBoolean(remote)
    
    if (!sanitizedLocation && !isRemote) {
      return {
        city: 'Unknown',
        country: 'Unknown',
        remote: false
      }
    }

    // Parse location string (e.g., "Lusaka, Zambia" or "San Francisco, CA, USA")
    const parts = sanitizedLocation.split(',').map(part => part.trim())
    
    return {
      city: parts[0] || 'Unknown',
      state: parts.length > 2 ? parts[1] : undefined,
      country: parts[parts.length - 1] || 'Unknown',
      remote: isRemote
    }
  }

  private normalizeSalary(salary: string | undefined): SalaryRange | undefined {
    if (!salary) return undefined

    const sanitized = this.sanitizeString(salary)
    
    // Extract numbers from salary string
    const numbers = sanitized.match(/[\d,]+/g)?.map(n => parseInt(n.replace(/,/g, '')))
    
    if (!numbers || numbers.length === 0) {
      return { text: sanitized }
    }

    // Determine currency and period
    const currency = sanitized.includes('K') ? 'ZMW' : 
                    sanitized.includes('$') ? 'USD' : 
                    sanitized.includes('€') ? 'EUR' : 'USD'
    
    const period = sanitized.includes('hour') ? 'hourly' :
                  sanitized.includes('month') ? 'monthly' : 'annually'

    return {
      min: numbers[0],
      max: numbers[1] || numbers[0],
      text: sanitized,
      currency,
      period
    }
  }

  private normalizeSkills(skills: string[] | undefined): string[] {
    if (!skills || !Array.isArray(skills)) return []
    
    return skills
      .filter(skill => skill && typeof skill === 'string')
      .map(skill => this.sanitizeString(skill))
      .filter(skill => skill.length > 0)
      .slice(0, 20) // Limit to 20 skills max
  }

  private normalizeCompanySize(size: string | undefined): Job['company']['size'] {
    if (!size) return undefined
    
    const normalized = size.toLowerCase()
    if (normalized.includes('startup') || normalized.includes('1-10')) return 'startup'
    if (normalized.includes('small') || normalized.includes('11-50')) return 'small'
    if (normalized.includes('medium') || normalized.includes('51-200')) return 'medium'
    if (normalized.includes('large') || normalized.includes('201-1000')) return 'large'
    if (normalized.includes('enterprise') || normalized.includes('1000+')) return 'enterprise'
    
    return undefined
  }

  private normalizeEmploymentType(type: string | undefined): Job['employmentType'] {
    if (!type) return undefined
    
    const normalized = type.toLowerCase()
    if (normalized.includes('full')) return 'full-time'
    if (normalized.includes('part')) return 'part-time'
    if (normalized.includes('contract')) return 'contract'
    if (normalized.includes('intern')) return 'internship'
    
    return 'full-time' // Default
  }

  private inferExperienceLevel(title: string, description?: string): Job['experienceLevel'] {
    const text = `${title} ${description || ''}`.toLowerCase()
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior'
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) return 'entry'
    if (text.includes('mid') || text.includes('intermediate')) return 'mid'
    if (text.includes('lead') || text.includes('manager')) return 'lead'
    
    return 'mid' // Default
  }

  private normalizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const normalized = value.toLowerCase()
      return normalized === 'true' || normalized === 'yes' || normalized === '1'
    }
    return false
  }

  private normalizeDate(date: string | undefined): string | undefined {
    if (!date) return undefined
    
    try {
      const parsed = new Date(date)
      return isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
    } catch {
      return undefined
    }
  }

  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.name.toLowerCase()}-${job.location.city?.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private async callWithRetry(path: string, options: any): Promise<AxiosResponse> {
    const { retries, backoffMs, maxBackoffMs } = this.retryOptions
    let attempt = 0
    
    while (attempt <= retries) {
      try {
        return await this.indeedClient.get(path, options)
      } catch (error: any) {
        const status = error?.response?.status
        
        // Fail fast on client errors (4xx)
        if (status && status >= 400 && status < 500) {
          throw new Error(`Client error: ${status}`)
        }
        
        attempt++
        
        // Retry on server errors (5xx) or network errors
        if (attempt > retries) {
          throw new Error(`Server error after ${retries} retries`)
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          backoffMs * Math.pow(2, attempt - 1) + Math.random() * 100,
          maxBackoffMs || 5000
        )
        
        await this.sleep(delay)
      }
    }
    
    throw new Error('Max retries exceeded')
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.requestInterval) {
      const delay = this.requestInterval - timeSinceLastRequest
      await this.sleep(delay)
    }
    
    this.lastRequestTime = Date.now()
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateCacheKey(provider: string, params: JobSearchParams): string {
    return `${provider}:${JSON.stringify(params)}`
  }

  private getFromCache(key: string): JobSearchResult | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // Update cache hit rate
    this.metrics.cacheHitRate = (this.metrics.cacheHitRate * 0.9) + (1 * 0.1)
    
    return entry.data
  }

  private setCache(key: string, data: JobSearchResult): void {
    const ttl = this.cacheOptions.ttlMinutes * 60 * 1000
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private updateAverageResponseTime(responseTime: number): void {
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * 0.9) + (responseTime * 0.1)
  }

  public getMetrics(): AggregationMetrics {
    return { ...this.metrics }
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public getCacheSize(): number {
    return this.cache.size
  }
}

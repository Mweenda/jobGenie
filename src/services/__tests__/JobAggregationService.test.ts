// src/services/__tests__/JobAggregationService.test.ts
import nock from 'nock'
import { JobAggregationService } from '../JobAggregationService'
import { Job, IndeedJobResponse } from '../../types/job'

const INDEED_BASE = 'https://api.indeed.com'

describe('JobAggregationService - TDD Implementation', () => {
  let service: JobAggregationService

  beforeEach(() => {
    service = new JobAggregationService({
      providers: {
        indeed: {
          baseUrl: INDEED_BASE,
          apiKey: 'test-api-key',
          rateLimitPerMinute: 60
        }
      },
      retryOptions: {
        retries: 3,
        backoffMs: 50,
        maxBackoffMs: 1000
      },
      cacheOptions: {
        enabled: true,
        ttlMinutes: 15
      }
    })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('🔴 RED: fetchFromIndeed - Basic Functionality', () => {
    it('should fetch and normalize jobs from Indeed API', async () => {
      const mockResponse: IndeedJobResponse = {
        jobs: [
          {
            id: 'indeed-123',
            title: 'Senior React Developer',
            company: 'TechCorp Inc',
            location: 'Lusaka, Zambia',
            salary: 'K15,000 - K25,000 per month',
            description: 'Build amazing React applications with TypeScript',
            requirements: ['React', 'TypeScript', '3+ years experience'],
            skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
            remote: false,
            employmentType: 'full-time',
            postedDate: '2025-01-19T10:00:00Z',
            url: 'https://indeed.com/job/indeed-123',
            companyLogo: 'https://logo.com/techcorp.png',
            companySize: 'medium',
            benefits: ['Health Insurance', 'Remote Work']
          }
        ],
        totalResults: 1,
        currentPage: 1,
        hasMore: false
      }

      nock(INDEED_BASE)
        .get('/jobs/search')
        .query(true)
        .reply(200, mockResponse)

      const result = await service.fetchFromIndeed({ 
        query: 'React developer', 
        location: 'Lusaka' 
      })

      expect(result.jobs).toHaveLength(1)
      
      const job = result.jobs[0]
      expect(job.title).toBe('Senior React Developer')
      expect(job.company.name).toBe('TechCorp Inc')
      expect(job.location.remote).toBe(false)
      expect(job.skills).toContain('React')
      expect(job.skills).toContain('TypeScript')
      expect(job.source).toBe('indeed')
      expect(job.sourceId).toBe('indeed-123')
      expect(job.isActive).toBe(true)
      expect(new Date(job.createdAt)).toBeInstanceOf(Date)
    })

    it('should handle pagination and merge multiple pages', async () => {
      // Page 1
      nock(INDEED_BASE)
        .get('/jobs/search')
        .query(qs => qs.page === '1')
        .reply(200, {
          jobs: [
            { id: 'job-1', title: 'Developer 1', company: 'Company A', location: 'Lusaka', postedDate: '2025-01-19T10:00:00Z', remote: false }
          ],
          totalResults: 2,
          currentPage: 1,
          nextPage: 2,
          hasMore: true
        })

      // Page 2
      nock(INDEED_BASE)
        .get('/jobs/search')
        .query(qs => qs.page === '2')
        .reply(200, {
          jobs: [
            { id: 'job-2', title: 'Developer 2', company: 'Company B', location: 'Ndola', postedDate: '2025-01-19T11:00:00Z', remote: true }
          ],
          totalResults: 2,
          currentPage: 2,
          hasMore: false
        })

      const result = await service.fetchFromIndeed({ 
        query: 'developer',
        fetchAllPages: true 
      })

      expect(result.jobs).toHaveLength(2)
      expect(result.totalCount).toBe(2)
      expect(result.jobs[0].sourceId).toBe('job-1')
      expect(result.jobs[1].sourceId).toBe('job-2')
    })

    it('should deduplicate jobs based on title + company + location', async () => {
      const duplicateJob = {
        id: 'job-1',
        title: 'React Developer',
        company: 'TechCorp',
        location: 'Lusaka, Zambia',
        postedDate: '2025-01-19T10:00:00Z',
        remote: false
      }

      nock(INDEED_BASE)
        .get('/jobs/search')
        .query(true)
        .reply(200, {
          jobs: [
            duplicateJob,
            { ...duplicateJob, id: 'job-1-duplicate' }, // Same job, different ID
            { id: 'job-2', title: 'Vue Developer', company: 'OtherCorp', location: 'Ndola', postedDate: '2025-01-19T11:00:00Z', remote: false }
          ],
          totalResults: 3,
          currentPage: 1,
          hasMore: false
        })

      const result = await service.fetchFromIndeed({ query: 'developer' })

      expect(result.jobs).toHaveLength(2) // Duplicates removed
      expect(result.jobs.find(j => j.title === 'React Developer')).toBeDefined()
      expect(result.jobs.find(j => j.title === 'Vue Developer')).toBeDefined()
    })
  })

  describe('🔴 RED: Error Handling & Resilience', () => {
    it('should retry on 5xx errors and eventually throw after max retries', async () => {
      nock(INDEED_BASE)
        .get('/jobs/search')
        .times(4) // Initial + 3 retries
        .reply(500, { error: 'Internal Server Error' })

      await expect(
        service.fetchFromIndeed({ query: 'developer' })
      ).rejects.toThrow('Server error after 3 retries')

      // Verify exponential backoff was applied
      expect(nock.isDone()).toBe(true)
    })

    it('should fail fast on 4xx client errors without retries', async () => {
      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(400, { error: 'Bad Request' })

      await expect(
        service.fetchFromIndeed({ query: 'developer' })
      ).rejects.toThrow('Client error: 400')

      expect(nock.isDone()).toBe(true)
    })

    it('should handle network timeouts with retry', async () => {
      nock(INDEED_BASE)
        .get('/jobs/search')
        .twice()
        .delayConnection(6000) // Longer than timeout
        .reply(200, { jobs: [] })

      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(200, { 
          jobs: [{ id: 'job-1', title: 'Developer', company: 'Corp', location: 'Lusaka', postedDate: '2025-01-19T10:00:00Z', remote: false }],
          totalResults: 1,
          hasMore: false
        })

      const result = await service.fetchFromIndeed({ query: 'developer' })
      expect(result.jobs).toHaveLength(1)
    })

    it('should handle malformed API responses gracefully', async () => {
      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(200, { invalid: 'response' })

      const result = await service.fetchFromIndeed({ query: 'developer' })
      expect(result.jobs).toHaveLength(0)
      expect(result.totalCount).toBe(0)
    })
  })

  describe('🔴 RED: Performance & Caching', () => {
    it('should complete single page normalization under 200ms', async () => {
      const jobs = Array.from({ length: 50 }, (_, i) => ({
        id: `job-${i}`,
        title: `Developer ${i}`,
        company: `Company ${i}`,
        location: 'Lusaka, Zambia',
        postedDate: '2025-01-19T10:00:00Z',
        remote: false
      }))

      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(200, { jobs, totalResults: 50, hasMore: false })

      const startTime = Date.now()
      const result = await service.fetchFromIndeed({ query: 'developer' })
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(200)
      expect(result.jobs).toHaveLength(50)
    })

    it('should cache results and return cached data on subsequent requests', async () => {
      const mockJobs = [{
        id: 'cached-job',
        title: 'Cached Developer',
        company: 'Cache Corp',
        location: 'Lusaka',
        postedDate: '2025-01-19T10:00:00Z',
        remote: false
      }]

      // First request - hits API
      nock(INDEED_BASE)
        .get('/jobs/search')
        .query(true)
        .reply(200, { jobs: mockJobs, totalResults: 1, hasMore: false })

      const firstResult = await service.fetchFromIndeed({ query: 'developer' })
      expect(firstResult.jobs).toHaveLength(1)

      // Second request - should use cache (no nock setup for this)
      const secondResult = await service.fetchFromIndeed({ query: 'developer' })
      expect(secondResult.jobs).toHaveLength(1)
      expect(secondResult.jobs[0].sourceId).toBe('cached-job')
    })

    it('should respect rate limiting', async () => {
      // Setup multiple rapid requests
      for (let i = 0; i < 5; i++) {
        nock(INDEED_BASE)
          .get('/jobs/search')
          .reply(200, { jobs: [], totalResults: 0, hasMore: false })
      }

      const promises = Array.from({ length: 5 }, () => 
        service.fetchFromIndeed({ query: 'developer' })
      )

      const startTime = Date.now()
      await Promise.all(promises)
      const duration = Date.now() - startTime

      // Should take some time due to rate limiting
      expect(duration).toBeGreaterThan(100)
    })
  })

  describe('🔴 RED: Data Validation & Sanitization', () => {
    it('should sanitize and validate job data', async () => {
      const malformedJob = {
        id: 'malformed-job',
        title: '   <script>alert("xss")</script>Senior Developer   ',
        company: 'Evil<Corp>',
        location: '',
        salary: 'Not a number',
        description: 'A'.repeat(10000), // Very long description
        skills: ['React', '', null, 'TypeScript'], // Mixed valid/invalid skills
        postedDate: 'invalid-date',
        remote: 'maybe' // Invalid boolean
      }

      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(200, { 
          jobs: [malformedJob], 
          totalResults: 1, 
          hasMore: false 
        })

      const result = await service.fetchFromIndeed({ query: 'developer' })
      const job = result.jobs[0]

      expect(job.title).toBe('Senior Developer') // XSS removed, trimmed
      expect(job.company.name).toBe('EvilCorp') // HTML entities removed
      expect(job.location.city).toBe('Unknown') // Default for empty location
      expect(job.skills).toEqual(['React', 'TypeScript']) // Filtered invalid skills
      expect(job.description?.length).toBeLessThanOrEqual(5000) // Truncated
      expect(typeof job.location.remote).toBe('boolean') // Coerced to boolean
      expect(new Date(job.postedDate)).toBeInstanceOf(Date) // Valid date
    })

    it('should handle missing required fields gracefully', async () => {
      const incompleteJob = {
        id: 'incomplete-job'
        // Missing title, company, etc.
      }

      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(200, { 
          jobs: [incompleteJob], 
          totalResults: 1, 
          hasMore: false 
        })

      const result = await service.fetchFromIndeed({ query: 'developer' })
      
      expect(result.jobs).toHaveLength(0) // Invalid job filtered out
    })
  })

  describe('🔴 RED: Advanced Features', () => {
    it('should support advanced search filters', async () => {
      nock(INDEED_BASE)
        .get('/jobs/search')
        .query(qs => {
          expect(qs.q).toContain('React')
          expect(qs.location).toBe('Lusaka')
          expect(qs.salary_min).toBe('15000')
          expect(qs.remote).toBe('true')
          expect(qs.experience_level).toBe('senior')
          return true
        })
        .reply(200, { jobs: [], totalResults: 0, hasMore: false })

      await service.fetchFromIndeed({
        query: 'React developer',
        location: 'Lusaka',
        remote: true,
        salaryMin: 15000,
        experienceLevel: 'senior'
      })

      expect(nock.isDone()).toBe(true)
    })

    it('should track aggregation metrics', async () => {
      nock(INDEED_BASE)
        .get('/jobs/search')
        .reply(200, { 
          jobs: [{ id: 'job-1', title: 'Dev', company: 'Corp', location: 'Lusaka', postedDate: '2025-01-19T10:00:00Z', remote: false }], 
          totalResults: 1, 
          hasMore: false 
        })

      const result = await service.fetchFromIndeed({ query: 'developer' })
      const metrics = service.getMetrics()

      expect(metrics.totalRequests).toBe(1)
      expect(metrics.successfulRequests).toBe(1)
      expect(metrics.totalJobsFetched).toBe(1)
      expect(metrics.averageResponseTime).toBeGreaterThan(0)
      expect(metrics.cacheHitRate).toBeDefined()
    })
  })
})

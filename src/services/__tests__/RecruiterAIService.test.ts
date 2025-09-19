// src/services/__tests__/RecruiterAIService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RecruiterAIService } from '../RecruiterAIService'
import { CandidateProfile, CandidateSearchParams } from '../../types/recruiter'

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    },
    embeddings: {
      create: vi.fn()
    }
  }))
}))

// Mock Pinecone
vi.mock('@pinecone-database/pinecone', () => ({
  Pinecone: vi.fn().mockImplementation(() => ({
    index: vi.fn().mockReturnValue({
      query: vi.fn()
    })
  }))
}))

describe('RecruiterAIService - TDD Implementation', () => {
  let service: RecruiterAIService
  let mockOpenAI: any
  let mockPinecone: any

  const mockConfig = {
    openai: {
      apiKey: 'test-openai-key',
      model: 'gpt-4',
      maxTokens: 1000
    },
    pinecone: {
      apiKey: 'test-pinecone-key',
      environment: 'test',
      indexName: 'test-index'
    },
    rateLimit: {
      requestsPerMinute: 60,
      creditsPerSearch: 1
    }
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Create service instance
    service = new RecruiterAIService(mockConfig)
    
    // Get mock instances
    const OpenAI = require('openai').default
    const { Pinecone } = require('@pinecone-database/pinecone')
    
    mockOpenAI = new OpenAI()
    mockPinecone = new Pinecone()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('🔴 RED: Semantic Search Functionality', () => {
    it('should perform semantic candidate search within 5 seconds', async () => {
      // Mock OpenAI embedding response
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      // Mock Pinecone search results
      const mockPineconeResults = {
        matches: [
          {
            id: 'candidate_1',
            score: 0.95,
            metadata: {
              firstName: 'John',
              lastName: 'Doe',
              headline: 'Senior React Developer',
              skills: 'React,TypeScript,Node.js',
              experienceLevel: 'senior',
              location: 'Lusaka, Zambia',
              remote: true,
              salaryMin: 70000,
              salaryMax: 90000
            }
          },
          {
            id: 'candidate_2',
            score: 0.88,
            metadata: {
              firstName: 'Jane',
              lastName: 'Smith',
              headline: 'Full Stack Developer',
              skills: 'React,Python,AWS',
              experienceLevel: 'mid',
              location: 'Ndola, Zambia',
              remote: false,
              salaryMin: 60000,
              salaryMax: 80000
            }
          }
        ]
      }

      mockPinecone.index().query.mockResolvedValue(mockPineconeResults)

      const searchParams: CandidateSearchParams = {
        query: 'Senior React developer with TypeScript experience',
        skills: ['React', 'TypeScript'],
        experienceLevel: 'senior',
        location: 'Lusaka',
        limit: 10
      }

      const startTime = Date.now()
      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user-id')
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000)
      expect(result.candidates).toHaveLength(2)
      expect(result.searchTime).toBeGreaterThan(0)
      expect(result.creditsUsed).toBe(1)
      
      // Verify first candidate match
      const topMatch = result.candidates[0]
      expect(topMatch.candidate.firstName).toBe('John')
      expect(topMatch.candidate.headline).toBe('Senior React Developer')
      expect(topMatch.matchScore).toBeGreaterThan(0)
      expect(topMatch.matchComponents).toBeDefined()
      expect(topMatch.reasoning).toBeInstanceOf(Array)
      expect(topMatch.confidence).toBeGreaterThan(0)
    })

    it('should generate explainable candidate summaries', async () => {
      const mockCandidate: CandidateProfile = createMockCandidate()
      
      // Mock OpenAI chat completion response
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'Experienced React developer with strong TypeScript skills and 5+ years of experience.',
              keyStrengths: ['React expertise', 'TypeScript proficiency', 'Team leadership'],
              potentialConcerns: ['Limited backend experience'],
              fitAssessment: 'Strong',
              recommendedQuestions: [
                'Can you describe your experience with React hooks?',
                'How do you approach component architecture?'
              ]
            })
          }
        }]
      })

      const summary = await service.generateCandidateSummary(mockCandidate, 'Senior React Developer position')

      expect(summary.candidateId).toBe(mockCandidate.id)
      expect(summary.summary).toContain('React developer')
      expect(summary.keyStrengths).toContain('React expertise')
      expect(summary.potentialConcerns).toContain('Limited backend experience')
      expect(summary.fitAssessment).toBe('Strong')
      expect(summary.recommendedQuestions).toHaveLength(2)
      expect(summary.confidenceScore).toBeGreaterThan(0)
      expect(new Date(summary.generatedAt)).toBeInstanceOf(Date)
    })

    it('should provide recruiter chatbot assistance', async () => {
      const conversation = [
        { role: 'user' as const, content: 'Find React developers in Lusaka with 3+ years experience' }
      ]

      // Mock OpenAI response
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'I can help you find React developers in Lusaka. Let me search for candidates with 3+ years of experience. I recommend also considering candidates with related skills like Vue.js or Angular.'
          }
        }]
      })

      // Mock semantic search for suggested candidates
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [
          {
            id: 'candidate_1',
            score: 0.9,
            metadata: {
              firstName: 'Alice',
              lastName: 'Johnson',
              headline: 'React Developer',
              skills: 'React,JavaScript,CSS',
              experienceLevel: 'mid',
              location: 'Lusaka, Zambia'
            }
          }
        ]
      })

      const response = await service.chatbotAssist(conversation, 'test-user-id')

      expect(response.message).toContain('React developers')
      expect(response.suggestedActions).toBeInstanceOf(Array)
      expect(response.searchQuery).toBeDefined()
      expect(response.searchQuery?.query).toContain('React developers')
      expect(response.candidateResults).toBeInstanceOf(Array)
      if (response.candidateResults && response.candidateResults.length > 0) {
        expect(response.candidateResults[0].candidate.headline).toBe('React Developer')
      }
    })
  })

  describe('🔴 RED: Match Scoring Algorithm', () => {
    it('should calculate accurate skills match scores', async () => {
      const candidate = createMockCandidate({
        skills: [
          { name: 'React', level: 'expert', yearsOfExperience: 5, endorsed: true, endorsements: 10 },
          { name: 'TypeScript', level: 'advanced', yearsOfExperience: 3, endorsed: true, endorsements: 8 },
          { name: 'Node.js', level: 'intermediate', yearsOfExperience: 2, endorsed: false, endorsements: 3 }
        ]
      })

      // Mock the private method by testing through semanticSearch
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{
          id: 'test_candidate',
          score: 0.9,
          metadata: {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            headline: candidate.headline,
            skills: candidate.skills.map(s => s.name).join(','),
            experienceLevel: 'senior'
          }
        }]
      })

      const searchParams: CandidateSearchParams = {
        query: 'React TypeScript developer',
        skills: ['React', 'TypeScript', 'GraphQL'], // GraphQL not in candidate skills
        limit: 1
      }

      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user')
      const match = result.candidates[0]

      expect(match.matchComponents.skills).toBeGreaterThan(0.5) // 2 out of 3 skills match
      expect(match.matchComponents.skills).toBeLessThan(1.0) // Not perfect match
    })

    it('should calculate experience level match accurately', async () => {
      const seniorCandidate = createMockCandidate({
        experience: [
          {
            id: '1',
            company: 'TechCorp',
            position: 'Senior Developer',
            description: 'Led development team',
            startDate: '2018-01-01',
            endDate: '2023-01-01',
            isCurrent: false,
            skills: ['React', 'TypeScript'],
            achievements: ['Delivered 5 major projects'],
            remote: false
          },
          {
            id: '2',
            company: 'StartupXYZ',
            position: 'Developer',
            description: 'Full stack development',
            startDate: '2016-01-01',
            endDate: '2018-01-01',
            isCurrent: false,
            skills: ['JavaScript', 'Python'],
            achievements: ['Built MVP from scratch'],
            remote: true
          }
        ]
      })

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{
          id: 'senior_candidate',
          score: 0.95,
          metadata: {
            firstName: seniorCandidate.firstName,
            lastName: seniorCandidate.lastName,
            experienceLevel: 'senior'
          }
        }]
      })

      const searchParams: CandidateSearchParams = {
        query: 'Senior developer',
        experienceLevel: 'senior',
        limit: 1
      }

      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user')
      const match = result.candidates[0]

      expect(match.matchComponents.experience).toBeGreaterThan(0.8) // Should be high for senior with 7 years
    })

    it('should handle salary expectations matching', async () => {
      const candidate = createMockCandidate({
        preferences: {
          jobTypes: ['full-time'],
          industries: ['Technology'],
          salaryExpectations: [{
            min: 70000,
            max: 90000,
            currency: 'USD',
            period: 'annually',
            negotiable: true
          }],
          remotePreference: 'flexible',
          availabilityDate: new Date().toISOString(),
          willingToRelocate: false,
          preferredCompanySizes: ['medium', 'large']
        }
      })

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{
          id: 'salary_candidate',
          score: 0.9,
          metadata: {
            firstName: candidate.firstName,
            salaryMin: 70000,
            salaryMax: 90000
          }
        }]
      })

      const searchParams: CandidateSearchParams = {
        query: 'Developer',
        salaryMin: 75000,
        salaryMax: 85000, // Overlaps with candidate expectations
        limit: 1
      }

      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user')
      const match = result.candidates[0]

      expect(match.matchComponents.salary).toBeGreaterThan(0.8) // Good overlap
    })
  })

  describe('🔴 RED: Performance & Scalability', () => {
    it('should handle concurrent searches efficiently', async () => {
      // Mock responses
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{ id: 'test', score: 0.9, metadata: { firstName: 'Test' } }]
      })

      const searchPromises = Array.from({ length: 5 }, (_, i) =>
        service.semanticSearch(`Query ${i}`, { query: `Query ${i}`, limit: 5 }, `user-${i}`)
      )

      const startTime = Date.now()
      const results = await Promise.all(searchPromises)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(10000) // All searches complete within 10s
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.candidates).toBeDefined()
        expect(result.searchTime).toBeGreaterThan(0)
      })
    })

    it('should respect rate limiting', async () => {
      const serviceWithLimits = new RecruiterAIService({
        ...mockConfig,
        rateLimit: {
          requestsPerMinute: 6, // 1 request per 10 seconds
          creditsPerSearch: 1
        }
      })

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{ id: 'test', score: 0.9, metadata: { firstName: 'Test' } }]
      })

      const startTime = Date.now()
      
      // Make 3 rapid requests
      const promises = [
        serviceWithLimits.semanticSearch('Query 1', { query: 'Query 1' }, 'user-1'),
        serviceWithLimits.semanticSearch('Query 2', { query: 'Query 2' }, 'user-1'),
        serviceWithLimits.semanticSearch('Query 3', { query: 'Query 3' }, 'user-1')
      ]

      await Promise.all(promises)
      const duration = Date.now() - startTime

      // Should take at least 20 seconds due to rate limiting (10s between requests)
      expect(duration).toBeGreaterThan(15000)
    })

    it('should calculate credits usage accurately', async () => {
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: Array.from({ length: 10 }, (_, i) => ({
          id: `candidate_${i}`,
          score: 0.9 - (i * 0.05),
          metadata: { firstName: `Candidate${i}` }
        }))
      })

      const searchParams: CandidateSearchParams = {
        query: 'React developer',
        includeAISummary: true, // Should increase credit usage
        limit: 10
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{"summary": "Test summary"}' } }]
      })

      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user')

      expect(result.creditsUsed).toBeGreaterThan(1) // Base + AI summary credits
      expect(result.creditsUsed).toBe(6) // 1 base + 10 * 0.5 for AI summaries
    })
  })

  describe('🔴 RED: Error Handling & Resilience', () => {
    it('should handle OpenAI API failures gracefully', async () => {
      mockOpenAI.embeddings.create.mockRejectedValue(new Error('OpenAI API Error'))

      const searchParams: CandidateSearchParams = {
        query: 'React developer',
        limit: 5
      }

      await expect(
        service.semanticSearch(searchParams.query!, searchParams, 'test-user')
      ).rejects.toThrow('AI search service temporarily unavailable')
    })

    it('should handle Pinecone connection failures', async () => {
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockRejectedValue(new Error('Pinecone connection failed'))

      const searchParams: CandidateSearchParams = {
        query: 'React developer',
        limit: 5
      }

      await expect(
        service.semanticSearch(searchParams.query!, searchParams, 'test-user')
      ).rejects.toThrow('AI search service temporarily unavailable')
    })

    it('should handle malformed AI responses', async () => {
      const candidate = createMockCandidate()

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response that cannot be parsed'
          }
        }]
      })

      const summary = await service.generateCandidateSummary(candidate)

      expect(summary.candidateId).toBe(candidate.id)
      expect(summary.summary).toBeDefined()
      expect(summary.confidenceScore).toBeLessThan(0.8) // Lower confidence for malformed response
    })

    it('should validate search parameters', async () => {
      const invalidSearchParams: CandidateSearchParams = {
        query: '', // Empty query
        limit: -1 // Invalid limit
      }

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      // Service should handle invalid parameters gracefully
      const result = await service.semanticSearch('fallback query', invalidSearchParams, 'test-user')

      expect(result.candidates).toBeDefined()
      expect(result.totalCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('🔴 RED: Advanced Filtering', () => {
    it('should apply availability filters correctly', async () => {
      const immediateCandidate = createMockCandidate({
        preferences: {
          ...createMockCandidate().preferences,
          availabilityDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
        }
      })

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{
          id: 'immediate_candidate',
          score: 0.9,
          metadata: {
            firstName: immediateCandidate.firstName,
            availabilityDate: immediateCandidate.preferences.availabilityDate
          }
        }]
      })

      const searchParams: CandidateSearchParams = {
        query: 'Developer',
        availability: 'immediate', // Within 7 days
        limit: 5
      }

      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user')
      const match = result.candidates[0]

      expect(match.matchComponents.availability).toBeGreaterThan(0.9) // High availability match
    })

    it('should filter by company experience', async () => {
      const candidate = createMockCandidate({
        experience: [
          {
            id: '1',
            company: 'Google',
            position: 'Software Engineer',
            description: 'Worked on search algorithms',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
            isCurrent: false,
            skills: ['Python', 'Machine Learning'],
            achievements: ['Improved search relevance by 15%'],
            remote: false
          }
        ]
      })

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }]
      })

      mockPinecone.index().query.mockResolvedValue({
        matches: [{
          id: 'google_candidate',
          score: 0.9,
          metadata: {
            firstName: candidate.firstName,
            companies: 'Google'
          }
        }]
      })

      const searchParams: CandidateSearchParams = {
        query: 'Software Engineer',
        companies: ['Google', 'Microsoft'], // Should match Google experience
        limit: 5
      }

      const result = await service.semanticSearch(searchParams.query!, searchParams, 'test-user')

      expect(result.candidates).toHaveLength(1)
      expect(result.candidates[0].candidate.experience[0].company).toBe('Google')
    })
  })

  // Helper function to create mock candidate
  function createMockCandidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
    return {
      id: 'test-candidate-id',
      userId: 'test-user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      headline: 'Senior React Developer',
      summary: 'Experienced React developer with 5+ years of experience',
      location: {
        city: 'Lusaka',
        country: 'Zambia',
        timezone: 'Africa/Lusaka',
        remotePreference: 'flexible',
        willingToRelocate: false
      },
      experience: [
        {
          id: '1',
          company: 'TechCorp',
          position: 'React Developer',
          description: 'Built web applications',
          startDate: '2019-01-01',
          endDate: '2024-01-01',
          isCurrent: true,
          skills: ['React', 'TypeScript'],
          achievements: ['Led team of 3 developers'],
          remote: true
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of Zambia',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2015-01-01',
          endDate: '2019-01-01',
          achievements: ['Graduated with honors']
        }
      ],
      skills: [
        { name: 'React', level: 'expert', yearsOfExperience: 5, endorsed: true, endorsements: 10 },
        { name: 'TypeScript', level: 'advanced', yearsOfExperience: 3, endorsed: true, endorsements: 8 }
      ],
      certifications: [],
      languages: [
        { name: 'English', proficiency: 'native' }
      ],
      portfolio: [],
      preferences: {
        jobTypes: ['full-time'],
        industries: ['Technology'],
        salaryExpectations: [{
          min: 60000,
          max: 80000,
          currency: 'USD',
          period: 'annually',
          negotiable: true
        }],
        remotePreference: 'flexible',
        availabilityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        willingToRelocate: false,
        preferredCompanySizes: ['medium', 'large']
      },
      visibility: {
        profileVisible: true,
        searchable: true,
        showSalaryExpectations: true,
        showContactInfo: false,
        allowRecruiterContact: true,
        blockedRecruiters: [],
        blockedCompanies: []
      },
      lastActive: new Date().toISOString(),
      isActive: true,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }
})

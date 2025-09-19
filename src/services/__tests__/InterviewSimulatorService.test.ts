// src/services/__tests__/InterviewSimulatorService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { InterviewSimulatorService } from '../InterviewSimulatorService'
import { Job } from '../../types/job'
import { CandidateProfile } from '../../types/recruiter'

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}))

describe('InterviewSimulatorService - TDD Implementation', () => {
  let service: InterviewSimulatorService
  let mockOpenAI: any

  const mockConfig = {
    openai: {
      apiKey: 'test-openai-key',
      model: 'gpt-4',
      maxTokens: 2000
    },
    simulation: {
      questionsPerSession: 10,
      maxResponseTime: 300, // 5 minutes per question
      difficultyProgression: true
    },
    scoring: {
      categories: ['technical', 'communication', 'problem_solving', 'culture_fit'],
      passingScore: 70
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new InterviewSimulatorService(mockConfig)
    
    const OpenAI = require('openai').default
    mockOpenAI = new OpenAI()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('🔴 RED: Interview Simulator Core Functionality', () => {
    it('should generate 10-question mock interview for saved job', async () => {
      const mockJob = createMockJob()
      const mockCandidate = createMockCandidate()

      // Mock OpenAI response for question generation
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  question: 'Tell me about yourself and your experience with React.',
                  category: 'technical',
                  difficulty: 'easy',
                  expectedAnswerPoints: ['React experience', 'Projects worked on', 'Technical skills'],
                  timeLimit: 180
                },
                {
                  id: 'q2',
                  question: 'How would you optimize a React application for performance?',
                  category: 'technical',
                  difficulty: 'medium',
                  expectedAnswerPoints: ['Code splitting', 'Memoization', 'Bundle optimization'],
                  timeLimit: 300
                },
                {
                  id: 'q3',
                  question: 'Describe a challenging project you worked on and how you overcame obstacles.',
                  category: 'problem_solving',
                  difficulty: 'medium',
                  expectedAnswerPoints: ['Problem description', 'Solution approach', 'Results'],
                  timeLimit: 240
                }
                // ... more questions would be generated
              ]
            })
          }
        }]
      })

      const session = await service.startInterviewSimulation(mockCandidate, mockJob)

      expect(session.sessionId).toBeDefined()
      expect(session.candidateId).toBe(mockCandidate.id)
      expect(session.jobId).toBe(mockJob.id)
      expect(session.questions).toHaveLength(10)
      expect(session.currentQuestionIndex).toBe(0)
      expect(session.startedAt).toBeDefined()
      expect(session.status).toBe('in_progress')

      // Verify question structure
      const firstQuestion = session.questions[0]
      expect(firstQuestion).toMatchObject({
        id: expect.any(String),
        question: expect.any(String),
        category: expect.stringMatching(/^(technical|communication|problem_solving|culture_fit)$/),
        difficulty: expect.stringMatching(/^(easy|medium|hard)$/),
        expectedAnswerPoints: expect.any(Array),
        timeLimit: expect.any(Number)
      })

      // Verify company/role context is used
      expect(session.questions.some(q => 
        q.question.includes('TechCorp') || 
        q.question.includes('React') ||
        q.question.includes('Senior')
      )).toBe(true)
    })

    it('should accept candidate responses and provide real-time feedback', async () => {
      const sessionId = 'session-123'
      const questionId = 'q1'
      const candidateResponse = {
        answer: 'I have been working with React for over 5 years, building scalable web applications. In my previous role at StartupXYZ, I led the development of a React-based dashboard that served over 100,000 users daily. I have extensive experience with React hooks, state management using Redux, and optimizing performance through code splitting and memoization.',
        timeSpent: 120, // 2 minutes
        confidence: 8 // 1-10 scale
      }

      // Mock OpenAI response for answer evaluation
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              score: 85,
              feedback: {
                strengths: [
                  'Clearly articulated years of experience',
                  'Provided specific examples with metrics',
                  'Mentioned relevant technical concepts'
                ],
                improvements: [
                  'Could have mentioned more recent React features like Suspense',
                  'Would benefit from discussing testing approaches'
                ],
                nextQuestionHint: 'Be prepared to dive deeper into performance optimization techniques'
              },
              categoryScores: {
                technical: 85,
                communication: 80,
                specificity: 90
              }
            })
          }
        }]
      })

      const result = await service.submitAnswer(sessionId, questionId, candidateResponse)

      expect(result.score).toBe(85)
      expect(result.feedback.strengths).toHaveLength.greaterThan(0)
      expect(result.feedback.improvements).toHaveLength.greaterThan(0)
      expect(result.feedback.nextQuestionHint).toBeDefined()
      expect(result.categoryScores.technical).toBe(85)
      expect(result.isComplete).toBe(false)
      expect(result.nextQuestionIndex).toBe(1)
    })

    it('should provide final score and 3 actionable tips after completion', async () => {
      const sessionId = 'session-123'

      // Mock completion of all 10 questions
      const mockSessionData = {
        responses: Array.from({ length: 10 }, (_, i) => ({
          questionId: `q${i + 1}`,
          score: 75 + Math.random() * 20,
          timeSpent: 120 + Math.random() * 180
        }))
      }

      // Mock OpenAI response for final evaluation
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              overallScore: 82,
              categoryBreakdown: {
                technical: 85,
                communication: 78,
                problem_solving: 80,
                culture_fit: 85
              },
              actionableTips: [
                {
                  category: 'communication',
                  tip: 'Practice using the STAR method (Situation, Task, Action, Result) to structure your behavioral answers more effectively',
                  priority: 'high',
                  resources: ['https://example.com/star-method-guide']
                },
                {
                  category: 'technical',
                  tip: 'Strengthen your knowledge of React performance optimization techniques like useMemo and useCallback',
                  priority: 'medium',
                  resources: ['https://react.dev/reference/react/useMemo']
                },
                {
                  category: 'problem_solving',
                  tip: 'When describing technical challenges, include more details about your thought process and alternative solutions considered',
                  priority: 'medium',
                  resources: []
                }
              ],
              strengths: [
                'Strong technical foundation',
                'Good communication skills',
                'Relevant experience'
              ],
              areasForImprovement: [
                'More structured responses',
                'Deeper technical explanations'
              ]
            })
          }
        }]
      })

      const result = await service.completeInterviewSimulation(sessionId)

      expect(result.overallScore).toBe(82)
      expect(result.categoryBreakdown).toMatchObject({
        technical: expect.any(Number),
        communication: expect.any(Number),
        problem_solving: expect.any(Number),
        culture_fit: expect.any(Number)
      })
      expect(result.actionableTips).toHaveLength(3)
      
      result.actionableTips.forEach(tip => {
        expect(tip).toMatchObject({
          category: expect.any(String),
          tip: expect.any(String),
          priority: expect.stringMatching(/^(high|medium|low)$/),
          resources: expect.any(Array)
        })
      })

      expect(result.completedAt).toBeDefined()
      expect(result.totalTimeSpent).toBeGreaterThan(0)
      expect(result.certificateUrl).toBeDefined()
    })

    it('should achieve >= 70% NPS surrogate (thumbs up)', async () => {
      const sessionId = 'session-123'

      // Complete simulation
      await service.completeInterviewSimulation(sessionId)

      // Submit feedback
      const feedback = await service.submitSessionFeedback(sessionId, {
        rating: 'thumbs_up',
        helpful: true,
        wouldRecommend: true,
        comments: 'Very realistic interview experience, helped me prepare well!'
      })

      expect(feedback.rating).toBe('thumbs_up')

      // Check overall satisfaction metrics
      const metrics = await service.getSatisfactionMetrics({
        timeframe: 'last_30_days'
      })

      // This validates the AC requirement: >= 70% thumbs up
      expect(metrics.thumbsUpPercentage).toBeGreaterThanOrEqual(70)
    })
  })

  describe('🔴 RED: Company & Role Context Integration', () => {
    it('should use cached company data to ground interview prompts', async () => {
      const mockJob = createMockJob({
        company: {
          name: 'TechCorp',
          size: 'large',
          industry: 'Technology',
          culture: ['Innovation', 'Collaboration', 'Growth mindset'],
          techStack: ['React', 'Node.js', 'AWS', 'Docker'],
          interviewProcess: ['Phone screen', 'Technical assessment', 'System design', 'Culture fit']
        }
      })
      const mockCandidate = createMockCandidate()

      // Mock company data retrieval
      vi.spyOn(service, 'getCompanyData').mockResolvedValue({
        name: 'TechCorp',
        industry: 'Technology',
        size: 'large',
        culture: ['Innovation', 'Collaboration'],
        techStack: ['React', 'Node.js', 'AWS'],
        commonInterviewQuestions: [
          'How do you stay updated with technology trends?',
          'Describe a time when you had to learn a new technology quickly'
        ],
        glassdoorData: {
          rating: 4.2,
          reviewHighlights: ['Great work-life balance', 'Innovative projects']
        }
      })

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  question: 'TechCorp values innovation and collaboration. Can you describe a project where you innovated while working in a team?',
                  category: 'culture_fit',
                  difficulty: 'medium',
                  companySpecific: true
                }
              ]
            })
          }
        }]
      })

      const session = await service.startInterviewSimulation(mockCandidate, mockJob)

      // Verify company-specific questions are included
      const companySpecificQuestions = session.questions.filter(q => 
        q.question.includes('TechCorp') || 
        q.question.includes('innovation') ||
        q.question.includes('collaboration')
      )
      expect(companySpecificQuestions.length).toBeGreaterThan(0)
    })

    it('should adapt questions based on job level and requirements', async () => {
      const seniorJob = createMockJob({
        title: 'Senior React Developer',
        requirements: [
          '5+ years React experience',
          'Team leadership experience',
          'System architecture knowledge'
        ]
      })

      const juniorJob = createMockJob({
        title: 'Junior React Developer',
        requirements: [
          '1-2 years React experience',
          'Basic JavaScript knowledge',
          'Eagerness to learn'
        ]
      })

      const candidate = createMockCandidate()

      // Generate questions for senior role
      const seniorSession = await service.startInterviewSimulation(candidate, seniorJob)
      
      // Generate questions for junior role
      const juniorSession = await service.startInterviewSimulation(candidate, juniorJob)

      // Senior questions should be more complex
      const seniorComplexityScore = seniorSession.questions.reduce((sum, q) => 
        sum + (q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1), 0
      )

      const juniorComplexityScore = juniorSession.questions.reduce((sum, q) => 
        sum + (q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1), 0
      )

      expect(seniorComplexityScore).toBeGreaterThan(juniorComplexityScore)

      // Senior questions should include leadership topics
      const seniorLeadershipQuestions = seniorSession.questions.filter(q =>
        q.question.toLowerCase().includes('lead') ||
        q.question.toLowerCase().includes('team') ||
        q.question.toLowerCase().includes('mentor')
      )
      expect(seniorLeadershipQuestions.length).toBeGreaterThan(0)
    })
  })

  describe('🔴 RED: Performance & Analytics', () => {
    it('should track required analytics events', async () => {
      const mockJob = createMockJob()
      const mockCandidate = createMockCandidate()

      const analyticsEvents: string[] = []
      const mockAnalytics = {
        track: vi.fn((event: string) => analyticsEvents.push(event))
      }

      service.setAnalytics(mockAnalytics)

      // Start simulation
      await service.startInterviewSimulation(mockCandidate, mockJob)
      expect(analyticsEvents).toContain('InterviewSim_Started')

      // Complete simulation
      await service.completeInterviewSimulation('session-123')
      expect(analyticsEvents).toContain('InterviewSim_Completed')
    })

    it('should complete question evaluation under 10 seconds', async () => {
      const sessionId = 'session-123'
      const questionId = 'q1'
      const response = {
        answer: 'Detailed technical answer about React performance optimization...',
        timeSpent: 180,
        confidence: 7
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ score: 80, feedback: {} }) } }]
      })

      const startTime = Date.now()
      await service.submitAnswer(sessionId, questionId, response)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(10000)
    })

    it('should handle concurrent interview simulations', async () => {
      const mockJob = createMockJob()
      const candidates = Array.from({ length: 5 }, (_, i) => 
        createMockCandidate({ id: `candidate-${i}` })
      )

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ questions: [] }) } }]
      })

      const promises = candidates.map(candidate =>
        service.startInterviewSimulation(candidate, mockJob)
      )

      const sessions = await Promise.all(promises)

      expect(sessions).toHaveLength(5)
      sessions.forEach(session => {
        expect(session.sessionId).toBeDefined()
        expect(session.status).toBe('in_progress')
      })
    })
  })

  describe('🔴 RED: Security & Content Safety', () => {
    it('should sanitize candidate responses for security', async () => {
      const sessionId = 'session-123'
      const questionId = 'q1'
      const maliciousResponse = {
        answer: 'My answer includes <script>alert("xss")</script> and some SQL injection attempts',
        timeSpent: 60,
        confidence: 5
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ score: 50, feedback: {} }) } }]
      })

      const result = await service.submitAnswer(sessionId, questionId, maliciousResponse)

      // Response should be sanitized before processing
      expect(result.sanitizedResponse).not.toContain('<script>')
      expect(result.securityFlags.containedHTML).toBe(true)
      expect(result.securityFlags.sanitized).toBe(true)
    })

    it('should enforce session timeouts and prevent manipulation', async () => {
      const sessionId = 'session-123'
      
      // Mock expired session
      vi.spyOn(service, 'getSession').mockResolvedValue({
        sessionId,
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
        status: 'expired'
      } as any)

      await expect(
        service.submitAnswer(sessionId, 'q1', {
          answer: 'Test answer',
          timeSpent: 60,
          confidence: 7
        })
      ).rejects.toThrow('Interview session expired')
    })

    it('should validate response authenticity and prevent cheating', async () => {
      const sessionId = 'session-123'
      const questionId = 'q1'
      
      // Suspicious response (too fast, too perfect)
      const suspiciousResponse = {
        answer: 'Perfect textbook answer that seems copy-pasted from documentation',
        timeSpent: 5, // Too fast for complex question
        confidence: 10, // Overconfident
        metadata: {
          copyPasteDetected: true,
          tabSwitches: 5
        }
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ score: 95, feedback: {} }) } }]
      })

      const result = await service.submitAnswer(sessionId, questionId, suspiciousResponse)

      expect(result.cheatingFlags).toMatchObject({
        suspiciouslyFast: true,
        possibleCopyPaste: true,
        tabSwitchingDetected: true
      })
      expect(result.adjustedScore).toBeLessThan(result.rawScore)
    })
  })

  describe('🔴 RED: AI Content Labeling & Transparency', () => {
    it('should clearly label all AI-generated feedback', async () => {
      const sessionId = 'session-123'

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              overallScore: 78,
              actionableTips: [
                { tip: 'Practice more technical examples' }
              ]
            })
          }
        }]
      })

      const result = await service.completeInterviewSimulation(sessionId)

      expect(result.aiDisclaimer).toContain('Generated by JobGenie AI')
      expect(result.feedbackSource).toBe('ai_generated')
      expect(result.humanReviewAvailable).toBe(true)
    })

    it('should provide edit/customize options for AI suggestions', async () => {
      const sessionId = 'session-123'
      const customizations = {
        focusAreas: ['technical_depth', 'communication'],
        excludeCategories: ['culture_fit'],
        additionalContext: 'Candidate is switching from backend to frontend'
      }

      const result = await service.generateCustomizedFeedback(sessionId, customizations)

      expect(result.customized).toBe(true)
      expect(result.focusedFeedback.technical_depth).toBeDefined()
      expect(result.focusedFeedback.communication).toBeDefined()
      expect(result.focusedFeedback.culture_fit).toBeUndefined()
    })
  })

  // Helper functions
  function createMockJob(overrides: Partial<Job> = {}): Job {
    return {
      id: 'job-123',
      title: 'Senior React Developer',
      company: {
        name: 'TechCorp',
        size: 'medium',
        industry: 'Technology'
      },
      location: {
        city: 'Lusaka',
        country: 'Zambia',
        remote: true
      },
      requirements: [
        '5+ years React experience',
        'TypeScript proficiency',
        'Team leadership experience'
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'Node.js'],
      description: 'We are looking for a Senior React Developer to join our growing team.',
      source: 'jobgenie',
      sourceId: 'job-123',
      isActive: true,
      createdAt: '2025-01-19T10:00:00Z',
      updatedAt: '2025-01-19T10:00:00Z',
      ...overrides
    }
  }

  function createMockCandidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
    return {
      id: 'candidate-123',
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      headline: 'Senior React Developer',
      summary: 'Experienced React developer with 5+ years of experience.',
      location: {
        city: 'Lusaka',
        country: 'Zambia',
        timezone: 'Africa/Lusaka',
        remotePreference: 'flexible',
        willingToRelocate: true
      },
      experience: [
        {
          id: '1',
          company: 'StartupXYZ',
          position: 'Senior React Developer',
          description: 'Led development of React applications',
          startDate: '2020-01-01',
          endDate: '2024-01-01',
          isCurrent: false,
          skills: ['React', 'TypeScript'],
          achievements: ['Built scalable applications'],
          remote: true
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of Zambia',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-01-01',
          endDate: '2020-01-01',
          achievements: ['Graduated with honors']
        }
      ],
      skills: [
        { name: 'React', level: 'expert', yearsOfExperience: 5, endorsed: true, endorsements: 15 }
      ],
      certifications: [],
      languages: [{ name: 'English', proficiency: 'native' }],
      portfolio: [],
      preferences: {
        jobTypes: ['full-time'],
        industries: ['Technology'],
        salaryExpectations: [{
          min: 80000,
          max: 120000,
          currency: 'USD',
          period: 'annually',
          negotiable: true
        }],
        remotePreference: 'flexible',
        availabilityDate: new Date().toISOString(),
        willingToRelocate: true,
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
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }
})

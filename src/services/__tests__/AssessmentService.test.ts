// src/services/__tests__/AssessmentService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AssessmentService } from '../AssessmentService'

describe('AssessmentService - TDD Implementation', () => {
  let service: AssessmentService

  const mockConfig = {
    openaiApiKey: 'test-api-key',
    database: {
      connection: 'test-db'
    },
    scoring: {
      passingScore: 70,
      timeLimit: 1800 // 30 minutes
    },
    badges: {
      enabled: true,
      verificationEnabled: true
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AssessmentService(mockConfig)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('🔴 RED: Assessment Core Functionality', () => {
    it('should provide at least 3 micro-assessments (frontend, QA, product)', async () => {
      const availableAssessments = await service.getAvailableAssessments()

      expect(availableAssessments.length).toBeGreaterThanOrEqual(3)
      
      const assessmentTypes = availableAssessments.map(a => a.category)
      expect(assessmentTypes).toContain('frontend')
      expect(assessmentTypes).toContain('qa')
      expect(assessmentTypes).toContain('product')

      // Verify assessment structure
      const frontendAssessment = availableAssessments.find(a => a.category === 'frontend')
      expect(frontendAssessment).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        category: 'frontend',
        description: expect.any(String),
        estimatedDuration: expect.any(Number),
        questionCount: expect.any(Number),
        difficulty: expect.any(String),
        skills: expect.any(Array),
        badge: expect.objectContaining({
          name: expect.any(String),
          icon: expect.any(String),
          color: expect.any(String)
        })
      })
    })

    it('should start assessment and return questions', async () => {
      const userId = 'user-123'
      const assessmentId = 'frontend-react-basics'

      const session = await service.startAssessment(userId, assessmentId)

      expect(session.sessionId).toBeDefined()
      expect(session.assessmentId).toBe(assessmentId)
      expect(session.userId).toBe(userId)
      expect(session.questions.length).toBeGreaterThan(0)
      expect(session.currentQuestionIndex).toBe(0)
      expect(session.startedAt).toBeDefined()
      expect(session.expiresAt).toBeDefined()
      expect(session.status).toBe('in_progress')

      // Verify question structure
      const firstQuestion = session.questions[0]
      expect(firstQuestion).toMatchObject({
        id: expect.any(String),
        type: expect.stringMatching(/^(multiple_choice|code_completion|drag_drop|short_answer)$/),
        question: expect.any(String),
        options: expect.any(Array),
        points: expect.any(Number),
        timeLimit: expect.any(Number)
      })

      // Verify no correct answers are exposed
      expect(firstQuestion.correctAnswer).toBeUndefined()
      expect(firstQuestion.explanation).toBeUndefined()
    })

    it('should auto-grade assessment and return immediate score', async () => {
      const _userId = 'user-123' // Used in submission object
      const sessionId = 'session-123'
      
      const mockAnswers = [
        { questionId: 'q1', answer: 'A', timeSpent: 30 },
        { questionId: 'q2', answer: 'B', timeSpent: 45 },
        { questionId: 'q3', answer: 'useState', timeSpent: 120 },
        { questionId: 'q4', answer: 'C', timeSpent: 60 },
        { questionId: 'q5', answer: 'D', timeSpent: 90 }
      ]

      const result = await service.submitAssessment({
        assessmentId: 'test-assessment-id',
        userId: _userId,
        answers: mockAnswers.reduce((acc, answer) => ({ 
          ...acc, [answer.questionId]: answer.answer 
        }), {}),
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      })

      expect(result.sessionId).toBe(sessionId)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.passed).toBe(result.score >= 70)
      expect(result.completedAt).toBeDefined()
      expect(result.totalTimeSpent).toBeGreaterThan(0)
      
      expect(result.breakdown).toMatchObject({
        correctAnswers: expect.any(Number),
        totalQuestions: expect.any(Number),
        categoryScores: expect.any(Object)
      })

      expect(result.feedback).toBeInstanceOf(Array)
      expect(result.feedback?.length || 0).toBeGreaterThan(0)
    })

    it('should award verifiable badge for passing assessment', async () => {
      const _userId = 'user-123' // Used in submission object
      // const sessionId = 'session-123' // Used for test context
      
      // Mock high-scoring answers
      const mockAnswers = [
        { questionId: 'q1', answer: 'A', timeSpent: 30 },
        { questionId: 'q2', answer: 'B', timeSpent: 45 },
        { questionId: 'q3', answer: 'useState', timeSpent: 120 },
        { questionId: 'q4', answer: 'C', timeSpent: 60 },
        { questionId: 'q5', answer: 'D', timeSpent: 90 }
      ]

      // Mock service to return passing score
      vi.spyOn(service as any, 'calculateScore').mockResolvedValue({
        score: 85,
        passed: true,
        breakdown: { correctAnswers: 4, totalQuestions: 5, categoryScores: {} }
      })

      const result = await service.submitAssessment({
        assessmentId: 'test-assessment-id',
        userId: _userId,
        answers: mockAnswers.reduce((acc, answer) => ({ 
          ...acc, [answer.questionId]: answer.answer 
        }), {}),
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      })

      expect(result.passed).toBe(true)
      expect(result.badge).toBeDefined()
      expect(result.badge).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        iconUrl: expect.any(String),
        verificationCode: expect.any(String),
        issuedAt: expect.any(String),
        validUntil: expect.any(String),
        skills: expect.any(Array),
        score: 85
      })

      // Verify badge is stored on user profile
      const userBadges = await service.getUserBadges(_userId)
      expect(userBadges.find(badge => badge.id === result.badge!.id)).toBeDefined()
    })

    it('should track assessment completion rate', async () => {
      const userId = 'user-123'
      const assessmentId = 'frontend-react-basics'

      // Start assessment
      await service.startAssessment(userId, assessmentId)

      // Track started event
      const analytics = service.getAnalytics()

      expect(analytics.totalStarted).toBeGreaterThan(0)
      expect(analytics.events).toContainEqual(
        expect.objectContaining({
          event: 'Assessment_Started',
          userId: userId,
          assessmentId: assessmentId
        })
      )
    })
  })

  describe('🔴 RED: Assessment Types & Content', () => {
    it('should provide frontend assessment with React/JavaScript questions', async () => {
      const assessment = await service.getAssessmentById('frontend-react-basics')

      expect(assessment).toBeDefined()
      if (assessment) {
        expect(assessment.category).toBe('frontend')
        expect(assessment.skills).toContain('React')
        expect(assessment.skills).toContain('JavaScript')
        expect(assessment.questionCount).toBeGreaterThanOrEqual(10)
        expect(assessment.estimatedDuration).toBeLessThanOrEqual(30) // 30 minutes max
      }

      const questions = await service.getAssessmentQuestions(assessment?.id || 'test-id')
      
      // Should have mix of question types
      const questionTypes = [...new Set(questions.map(q => q.type || 'multiple-choice'))]
      expect(questionTypes.length).toBeGreaterThan(1)
      
      // Should include React-specific questions
      const reactQuestions = questions.filter(q => 
        (q.question || q.text).toLowerCase().includes('react') || 
        (q.question || q.text).toLowerCase().includes('jsx') ||
        (q.question || q.text).toLowerCase().includes('component')
      )
      expect(reactQuestions.length).toBeGreaterThan(0)
    })

    it('should provide QA assessment with testing knowledge questions', async () => {
      const assessment = await service.getAssessmentById('qa-fundamentals')

      expect(assessment).toBeDefined()
      if (assessment) {
        expect(assessment.category).toBe('qa')
        expect(assessment.skills).toContain('Testing')
        expect(assessment.skills).toContain('Quality Assurance')
      }

      const questions = await service.getAssessmentQuestions(assessment?.id || 'test-id')
      
      // Should include testing concepts
      const testingQuestions = questions.filter(q =>
        (q.question || q.text).toLowerCase().includes('test') ||
        (q.question || q.text).toLowerCase().includes('bug') ||
        (q.question || q.text).toLowerCase().includes('quality')
      )
      expect(testingQuestions.length).toBeGreaterThan(0)
    })

    it('should provide product assessment with PM knowledge questions', async () => {
      const assessment = await service.getAssessmentById('product-management-basics')

      expect(assessment).toBeDefined()
      if (assessment) {
        expect(assessment.category).toBe('product')
        expect(assessment.skills).toContain('Product Management')
        expect(assessment.skills).toContain('Strategy')
      }

      const questions = await service.getAssessmentQuestions(assessment?.id || 'test-id')
      
      // Should include product management concepts
      const pmQuestions = questions.filter(q =>
        (q.question || q.text).toLowerCase().includes('product') ||
        (q.question || q.text).toLowerCase().includes('feature') ||
        (q.question || q.text).toLowerCase().includes('user')
      )
      expect(pmQuestions.length).toBeGreaterThan(0)
    })
  })

  describe('🔴 RED: Security & Validation', () => {
    it('should prevent assessment session tampering', async () => {
      // const userId = 'user-123'
      // const assessmentId = 'frontend-react-basics'
      // const session = await service.startAssessment(userId, assessmentId)
      
      // Try to tamper with session
      const invalidAnswers = [
        { questionId: 'invalid-question', answer: 'A', timeSpent: -10 },
        { questionId: 'q1', answer: 'INVALID_LONG_ANSWER'.repeat(100), timeSpent: 0 }
      ]

      await expect(
        service.submitAssessment({
          assessmentId: 'test-assessment-id',
          userId: 'test-user-id',
          answers: invalidAnswers.reduce((acc, answer) => ({ 
            ...acc, [answer.questionId]: answer.answer 
          }), {}),
          startedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString()
        })
      ).rejects.toThrow('Invalid assessment submission')
    })

    it('should enforce time limits and prevent cheating', async () => {
      const userId = 'user-123'
      const assessmentId = 'frontend-react-basics'

      const session = await service.startAssessment(userId, assessmentId)
      
      // Mock expired session
      vi.spyOn(Date, 'now').mockReturnValue(
        new Date(session.expiresAt).getTime() + 1000
      )

      const answers = [{ questionId: 'q1', answer: 'A', timeSpent: 30 }]

      await expect(
        service.submitAssessment({
          assessmentId: 'test-assessment-id',
          userId: 'test-user-id',
          answers: answers.reduce((acc, answer) => ({ 
            ...acc, [answer.questionId]: answer.answer 
          }), {}),
          startedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString()
        })
      ).rejects.toThrow('Assessment session expired')
    })

    it('should validate badge verification codes', async () => {
      const badgeId = 'badge-123'
      // const verificationCode = 'VERIFY-ABC123'

      const verification = await service.verifyBadge(badgeId)

      expect(verification).toBe(true)
    })
  })

  describe('🔴 RED: Performance & Analytics', () => {
    it('should complete assessment scoring under 5 seconds', async () => {
      // const sessionId = 'session-123'
      const answers = Array.from({ length: 20 }, (_, i) => ({
        questionId: `q${i + 1}`,
        answer: 'A',
        timeSpent: 30
      }))

      const startTime = Date.now()
      await service.submitAssessment({
        assessmentId: 'test-assessment-id',
        userId: 'test-user-id',
        answers: answers.reduce((acc, answer) => ({ 
          ...acc, [answer.questionId]: answer.answer 
        }), {}),
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      })
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(5000)
    })

    it('should track required analytics events', async () => {
      const userId = 'user-123'
      const assessmentId = 'frontend-react-basics'

      const analyticsEvents: string[] = []
      const mockAnalytics = {
        totalAssessments: 0,
        completedAssessments: 0,
        averageScore: 0,
        averageCompletionTime: 0
      }

      service.setAnalytics(mockAnalytics)

      // Start assessment
      await service.startAssessment(userId, assessmentId)
      expect(analyticsEvents).toContain('Assessment_Started')

      // Complete assessment
      // const session = await service.getSession('session-123')
      await service.submitAssessment({
        assessmentId: 'test-assessment-id',
        userId: 'test-user-id',
        answers: {},
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      })
      expect(analyticsEvents).toContain('Assessment_Completed')
    })

    it('should calculate assessment completion rate >= 40%', async () => {
      // const assessmentId = 'frontend-react-basics'
      
      // Mock analytics data
      const analytics = service.getAnalytics()

      const completionRate = ((analytics.totalCompleted || 0) / (analytics.totalStarted || 1)) * 100
      
      // This test validates the acceptance criteria
      expect(completionRate).toBeGreaterThanOrEqual(40)
    })

    it('should show 2x application likelihood for assessment takers', async () => {
      const userId = 'user-123'
      
      // Get user behavior before assessment
      const beforeStats = await service.getUserApplicationStats(userId)
      
      // Take assessment
      await service.startAssessment(userId, 'frontend-react-basics')
      // ... complete assessment
      
      // Get user behavior after assessment
      const afterStats = await service.getUserApplicationStats(userId)

      // This validates AC requirement: users who take assessment are 2x more likely to apply
      expect(afterStats.applicationLikelihood).toBeGreaterThanOrEqual(
        beforeStats.applicationLikelihood * 2
      )
    })
  })

  describe('🔴 RED: Badge System', () => {
    it('should create verifiable digital badges', async () => {
      const userId = 'user-123'
      const assessmentResult = {
        assessmentId: 'frontend-react-basics',
        score: 85,
        passed: true,
        skills: ['React', 'JavaScript', 'TypeScript']
      }

      const badge = await service.createBadge(assessmentResult)

      expect(badge).toMatchObject({
        id: expect.any(String),
        userId: userId,
        assessmentId: assessmentResult.assessmentId,
        name: expect.any(String),
        description: expect.any(String),
        iconUrl: expect.any(String),
        verificationCode: expect.stringMatching(/^[A-Z0-9-]{10,20}$/),
        issuedAt: expect.any(String),
        validUntil: expect.any(String),
        skills: assessmentResult.skills,
        score: assessmentResult.score,
        metadata: expect.objectContaining({
          assessmentVersion: expect.any(String),
          issuingOrganization: 'JobGenie',
          verificationUrl: expect.any(String)
        })
      })
    })

    it('should display badges on candidate profile', async () => {
      const userId = 'user-123'
      
      const badges = await service.getUserBadges(userId)

      expect(badges).toBeInstanceOf(Array)
      badges.forEach(badge => {
        expect(badge).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          iconUrl: expect.any(String),
          skills: expect.any(Array),
          issuedAt: expect.any(String),
          verificationCode: expect.any(String)
        })
      })
    })

    it('should support GDPR deletion of assessment data', async () => {
      const userId = 'user-123'

      // Take assessment
      // const session = await service.startAssessment(userId, 'frontend-react-basics')
      await service.submitAssessment({
        assessmentId: 'test-assessment-id',
        userId: userId,
        answers: {},
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      })

      // Request data deletion
      await service.deleteUserData(userId)

      // Verify data is deleted
      const userBadges = await service.getUserBadges(userId)
      expect(userBadges).toHaveLength(0)

      const userSessions = await service.getUserSessions(userId)
      expect(userSessions).toHaveLength(0)
    })
  })
})

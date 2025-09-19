// src/services/AssessmentService.ts
import OpenAI from 'openai'
import { 
  Assessment, 
  AssessmentQuestion, 
  AssessmentResult, 
  AssessmentSubmission,
  Badge,
  AssessmentAnalytics,
  AssessmentType,
  CreateAssessmentRequest
} from '../types/assessment'
import { UserProfile } from '../types/user'
import { sanitizeHtml } from '../utils/sanitizers'

export interface AssessmentServiceConfig {
  openaiApiKey: string
  maxRetries?: number
  timeoutMs?: number
  costTrackingEnabled?: boolean
}

export class AssessmentService {
  private openai: OpenAI
  private config: AssessmentServiceConfig
  private analytics: AssessmentAnalytics = {
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    badgesAwarded: 0,
    averageCompletionTime: 0,
    totalCost: 0
  }

  // Pre-built assessment templates
  private assessmentTemplates: Record<AssessmentType, Partial<Assessment>> = {
    'frontend': {
      title: 'Frontend Development Assessment',
      description: 'Test your knowledge of HTML, CSS, JavaScript, and React',
      category: 'frontend',
      difficulty: 'intermediate',
      estimatedTime: 15,
      passingScore: 70
    },
    'qa': {
      title: 'Quality Assurance Assessment',
      description: 'Test your knowledge of testing methodologies, automation, and best practices',
      category: 'qa',
      difficulty: 'intermediate',
      estimatedTime: 12,
      passingScore: 75
    },
    'product': {
      title: 'Product Management Assessment',
      description: 'Test your knowledge of product strategy, user research, and analytics',
      category: 'product',
      difficulty: 'intermediate',
      estimatedTime: 18,
      passingScore: 70
    }
  }

  constructor(config: AssessmentServiceConfig) {
    this.config = {
      maxRetries: 3,
      timeoutMs: 30000,
      costTrackingEnabled: true,
      ...config
    }
    
    this.openai = new OpenAI({
      apiKey: this.config.openaiApiKey,
      timeout: this.config.timeoutMs
    })
  }

  async createAssessment(request: CreateAssessmentRequest): Promise<Assessment> {
    const template = this.assessmentTemplates[request.type]
    if (!template) {
      throw new Error(`Assessment type '${request.type}' not supported`)
    }

    const questions = await this.generateQuestions(request.type, request.questionCount || 10)
    
    const assessment: Assessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template.title!,
      description: template.description!,
      category: template.category!,
      difficulty: template.difficulty!,
      questions,
      estimatedTime: template.estimatedTime!,
      passingScore: template.passingScore!,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    this.analytics.totalAssessments++
    return assessment
  }

  private async generateQuestions(type: AssessmentType, count: number): Promise<AssessmentQuestion[]> {
    const prompts = {
      frontend: `Generate ${count} multiple choice questions about frontend development covering HTML, CSS, JavaScript, React, and web development best practices. Each question should have 4 options with exactly one correct answer.`,
      qa: `Generate ${count} multiple choice questions about quality assurance covering testing methodologies, automation tools, test planning, bug reporting, and QA best practices. Each question should have 4 options with exactly one correct answer.`,
      product: `Generate ${count} multiple choice questions about product management covering product strategy, user research, analytics, roadmapping, and stakeholder management. Each question should have 4 options with exactly one correct answer.`
    }

    const prompt = `${prompts[type]}

Format each question as:
Question: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
Correct: [A/B/C/D]
Explanation: [brief explanation of why this is correct]

Generate exactly ${count} questions in this format.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Track cost if enabled
    if (this.config.costTrackingEnabled && response.usage) {
      const cost = (response.usage.prompt_tokens * 0.001 + response.usage.completion_tokens * 0.002) / 1000
      this.analytics.totalCost += cost
    }

    return this.parseQuestionsFromAI(content, type)
  }

  private parseQuestionsFromAI(content: string, type: AssessmentType): AssessmentQuestion[] {
    const questions: AssessmentQuestion[] = []
    const questionBlocks = content.split(/Question:/i).slice(1) // Remove first empty element

    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(line => line.trim())
      if (lines.length < 6) return // Skip malformed questions

      const questionText = lines[0].trim()
      const options: string[] = []
      let correctAnswer = 'A'
      let explanation = ''

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.match(/^[A-D]\)/)) {
          options.push(line.substring(2).trim())
        } else if (line.toLowerCase().startsWith('correct:')) {
          correctAnswer = line.split(':')[1].trim().toUpperCase()
        } else if (line.toLowerCase().startsWith('explanation:')) {
          explanation = line.split(':').slice(1).join(':').trim()
        }
      }

      if (questionText && options.length === 4) {
        questions.push({
          id: `q_${type}_${index + 1}_${Date.now()}`,
          text: sanitizeHtml(questionText),
          options: options.map(opt => sanitizeHtml(opt)),
          correctAnswer: correctAnswer as 'A' | 'B' | 'C' | 'D',
          explanation: sanitizeHtml(explanation),
          points: 10,
          category: type
        })
      }
    })

    // Fallback questions if AI generation fails
    if (questions.length === 0) {
      return this.getFallbackQuestions(type)
    }

    return questions.slice(0, 10) // Ensure we don't exceed requested count
  }

  private getFallbackQuestions(type: AssessmentType): AssessmentQuestion[] {
    const fallbacks = {
      frontend: [{
        id: `q_${type}_fallback_1`,
        text: 'Which CSS property is used to control the spacing between elements?',
        options: ['margin', 'padding', 'border', 'spacing'],
        correctAnswer: 'A' as const,
        explanation: 'Margin controls the space outside an element, between elements.',
        points: 10,
        category: type
      }],
      qa: [{
        id: `q_${type}_fallback_1`,
        text: 'What is the primary goal of regression testing?',
        options: [
          'To test new features',
          'To ensure existing functionality still works after changes',
          'To test performance',
          'To test security'
        ],
        correctAnswer: 'B' as const,
        explanation: 'Regression testing ensures that previously working functionality continues to work after code changes.',
        points: 10,
        category: type
      }],
      product: [{
        id: `q_${type}_fallback_1`,
        text: 'What is a Product Requirements Document (PRD)?',
        options: [
          'A technical specification',
          'A detailed document outlining what a product should do',
          'A marketing plan',
          'A budget document'
        ],
        correctAnswer: 'B' as const,
        explanation: 'A PRD outlines the purpose, features, and functionality of a product.',
        points: 10,
        category: type
      }]
    }

    return fallbacks[type] || []
  }

  async submitAssessment(submission: AssessmentSubmission): Promise<AssessmentResult> {
    const startTime = Date.now()
    
    try {
      // Validate submission
      if (!submission.assessmentId || !submission.userId || !submission.answers) {
        throw new Error('Assessment ID, User ID, and answers are required')
      }

      // Get assessment (in real implementation, this would be from database)
      const assessment = await this.getAssessmentById(submission.assessmentId)
      if (!assessment) {
        throw new Error('Assessment not found')
      }

      // Grade the assessment
      const result = await this.gradeAssessment(assessment, submission)
      
      // Award badge if passed
      let badge: Badge | undefined
      if (result.passed) {
        badge = await this.awardBadge(assessment, result, submission.userId)
        this.analytics.badgesAwarded++
      }

      const completionTime = Date.now() - startTime
      this.updateAnalytics(result.score, completionTime)

      return {
        ...result,
        badge,
        completionTime
      }
    } catch (error) {
      throw new Error(`Assessment submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async gradeAssessment(assessment: Assessment, submission: AssessmentSubmission): Promise<Omit<AssessmentResult, 'badge' | 'completionTime'>> {
    let correctAnswers = 0
    let totalPoints = 0
    let earnedPoints = 0

    const questionResults = assessment.questions.map(question => {
      const userAnswer = submission.answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer
      
      totalPoints += question.points
      if (isCorrect) {
        correctAnswers++
        earnedPoints += question.points
      }

      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? question.points : 0
      }
    })

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= assessment.passingScore

    return {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assessmentId: assessment.id,
      userId: submission.userId,
      score,
      passed,
      correctAnswers,
      totalQuestions: assessment.questions.length,
      questionResults,
      submittedAt: new Date().toISOString()
    }
  }

  private async awardBadge(assessment: Assessment, result: AssessmentResult, userId: string): Promise<Badge> {
    const badgeLevel = this.determineBadgeLevel(result.score)
    
    return {
      id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${assessment.category.charAt(0).toUpperCase() + assessment.category.slice(1)} ${badgeLevel}`,
      description: `Earned by scoring ${result.score}% on the ${assessment.title}`,
      category: assessment.category,
      level: badgeLevel,
      iconUrl: `/badges/${assessment.category}-${badgeLevel.toLowerCase()}.svg`,
      earnedAt: new Date().toISOString(),
      userId,
      assessmentId: assessment.id,
      verificationCode: this.generateVerificationCode()
    }
  }

  private determineBadgeLevel(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (score >= 95) return 'Platinum'
    if (score >= 85) return 'Gold'
    if (score >= 75) return 'Silver'
    return 'Bronze'
  }

  private generateVerificationCode(): string {
    return `VER_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    // In real implementation, this would query the database
    // For now, return a mock assessment
    const type = id.includes('frontend') ? 'frontend' : id.includes('qa') ? 'qa' : 'product'
    return this.createAssessment({ type })
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    // In real implementation, this would query the database
    // For now, return empty array
    return []
  }

  getAnalytics(): AssessmentAnalytics {
    return { ...this.analytics }
  }

  private updateAnalytics(score: number, completionTime: number): void {
    this.analytics.completedAssessments++
    
    // Update average score
    this.analytics.averageScore = 
      (this.analytics.averageScore * (this.analytics.completedAssessments - 1) + score) / 
      this.analytics.completedAssessments

    // Update average completion time
    this.analytics.averageCompletionTime = 
      (this.analytics.averageCompletionTime * (this.analytics.completedAssessments - 1) + completionTime) / 
      this.analytics.completedAssessments
  }
}

export default AssessmentService

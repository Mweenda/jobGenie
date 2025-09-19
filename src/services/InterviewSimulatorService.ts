// src/services/InterviewSimulatorService.ts
import OpenAI from 'openai'
import { 
  InterviewSession,
  InterviewQuestion,
  InterviewResponse,
  InterviewFeedback,
  InterviewResult,
  CreateInterviewRequest,
  InterviewAnalytics
} from '../types/interview'
import { Job } from '../types/job'
import { UserProfile } from '../types/user'
import { sanitizeHtml } from '../utils/sanitizers'

export interface InterviewSimulatorServiceConfig {
  openaiApiKey: string
  maxRetries?: number
  timeoutMs?: number
  costTrackingEnabled?: boolean
}

export class InterviewSimulatorService {
  private openai: OpenAI
  private config: InterviewSimulatorServiceConfig
  private analytics: InterviewAnalytics = {
    totalSessions: 0,
    completedSessions: 0,
    averageScore: 0,
    averageSessionTime: 0,
    totalCost: 0,
    thumbsUpRate: 0
  }

  constructor(config: InterviewSimulatorServiceConfig) {
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

  async createInterviewSession(request: CreateInterviewRequest): Promise<InterviewSession> {
    const { job, userProfile, questionCount = 10 } = request

    try {
      // Generate interview questions based on job and company
      const questions = await this.generateQuestions(job, userProfile, questionCount)

      const session: InterviewSession = {
        id: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jobId: job.id,
        userId: userProfile.id,
        jobTitle: job.title,
        companyName: job.company.name,
        questions,
        responses: [],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        estimatedDuration: questionCount * 3 // 3 minutes per question
      }

      this.analytics.totalSessions++
      return session
    } catch (error) {
      throw new Error(`Failed to create interview session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async generateQuestions(job: Job, userProfile: UserProfile, count: number): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} realistic interview questions for the following job application:

Job Title: ${job.title}
Company: ${job.company.name}
Company Industry: ${job.company.industry || 'Technology'}
Job Description: ${job.description.substring(0, 1200)}
Required Skills: ${job.skills.join(', ')}

Candidate Profile:
Experience Level: ${userProfile.experience?.length || 0} positions
Skills: ${userProfile.skills?.map(s => s.name).join(', ') || 'Not specified'}
Education: ${userProfile.education?.map(e => `${e.degree} from ${e.institution}`).join(', ') || 'Not specified'}

Generate a mix of question types:
- 40% Behavioral questions (STAR method applicable)
- 30% Technical/Role-specific questions
- 20% Company/Culture fit questions
- 10% Situational/Problem-solving questions

For each question, also provide:
- Question type (behavioral, technical, culture_fit, situational)
- Difficulty level (easy, medium, hard)
- Key evaluation criteria (what the interviewer is looking for)

Format as:
Question: [question text]
Type: [behavioral/technical/culture_fit/situational]
Difficulty: [easy/medium/hard]
Criteria: [what to evaluate in the answer]

Generate exactly ${count} questions in this format.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.8
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Track cost if enabled
    if (this.config.costTrackingEnabled && response.usage) {
      const cost = (response.usage.prompt_tokens * 0.03 + response.usage.completion_tokens * 0.06) / 1000
      this.analytics.totalCost += cost
    }

    return this.parseQuestionsFromAI(content, job.title)
  }

  private parseQuestionsFromAI(content: string, jobTitle: string): InterviewQuestion[] {
    const questions: InterviewQuestion[] = []
    const questionBlocks = content.split(/Question:/i).slice(1) // Remove first empty element

    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(line => line.trim())
      if (lines.length < 4) return // Skip malformed questions

      const questionText = lines[0].trim()
      let type: InterviewQuestion['type'] = 'behavioral'
      let difficulty: InterviewQuestion['difficulty'] = 'medium'
      let criteria = ''

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase()
        if (line.startsWith('type:')) {
          const typeValue = line.split(':')[1].trim()
          if (['behavioral', 'technical', 'culture_fit', 'situational'].includes(typeValue)) {
            type = typeValue as InterviewQuestion['type']
          }
        } else if (line.startsWith('difficulty:')) {
          const difficultyValue = line.split(':')[1].trim()
          if (['easy', 'medium', 'hard'].includes(difficultyValue)) {
            difficulty = difficultyValue as InterviewQuestion['difficulty']
          }
        } else if (line.startsWith('criteria:')) {
          criteria = lines[i].split(':').slice(1).join(':').trim()
        }
      }

      if (questionText) {
        questions.push({
          id: `q_${index + 1}_${Date.now()}`,
          text: sanitizeHtml(questionText),
          type,
          difficulty,
          evaluationCriteria: sanitizeHtml(criteria),
          order: index + 1
        })
      }
    })

    // Fallback questions if AI generation fails
    if (questions.length === 0) {
      return this.getFallbackQuestions(jobTitle)
    }

    return questions.slice(0, 10) // Ensure we don't exceed requested count
  }

  private getFallbackQuestions(jobTitle: string): InterviewQuestion[] {
    return [
      {
        id: 'fallback_1',
        text: 'Tell me about yourself and why you\'re interested in this position.',
        type: 'behavioral',
        difficulty: 'easy',
        evaluationCriteria: 'Clear communication, relevant experience, genuine interest',
        order: 1
      },
      {
        id: 'fallback_2',
        text: `What interests you most about working as a ${jobTitle}?`,
        type: 'culture_fit',
        difficulty: 'easy',
        evaluationCriteria: 'Understanding of role, alignment with career goals',
        order: 2
      },
      {
        id: 'fallback_3',
        text: 'Describe a challenging project you worked on and how you handled it.',
        type: 'behavioral',
        difficulty: 'medium',
        evaluationCriteria: 'Problem-solving skills, resilience, learning from challenges',
        order: 3
      }
    ]
  }

  async submitResponse(sessionId: string, questionId: string, responseText: string): Promise<InterviewResponse> {
    try {
      const response: InterviewResponse = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        questionId,
        responseText: sanitizeHtml(responseText),
        submittedAt: new Date().toISOString()
      }

      return response
    } catch (error) {
      throw new Error(`Failed to submit response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async completeInterview(sessionId: string, responses: InterviewResponse[]): Promise<InterviewResult> {
    const startTime = Date.now()

    try {
      // Get session (in real implementation, this would be from database)
      const session = await this.getSessionById(sessionId)
      if (!session) {
        throw new Error('Interview session not found')
      }

      // Generate AI feedback for each response
      const feedback = await this.generateFeedback(session, responses)

      // Calculate overall score
      const overallScore = this.calculateOverallScore(feedback)

      // Generate actionable tips
      const actionableTips = await this.generateActionableTips(session, responses, feedback)

      const result: InterviewResult = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        overallScore,
        feedback,
        actionableTips,
        completedAt: new Date().toISOString(),
        sessionDuration: Date.now() - new Date(session.startedAt).getTime()
      }

      this.updateAnalytics(overallScore, result.sessionDuration)
      return result
    } catch (error) {
      throw new Error(`Failed to complete interview: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async generateFeedback(session: InterviewSession, responses: InterviewResponse[]): Promise<InterviewFeedback[]> {
    const feedbackPromises = responses.map(async (response) => {
      const question = session.questions.find(q => q.id === response.questionId)
      if (!question) {
        throw new Error(`Question ${response.questionId} not found`)
      }

      const prompt = `Evaluate this interview response and provide constructive feedback:

Question: ${question.text}
Question Type: ${question.type}
Difficulty: ${question.difficulty}
Evaluation Criteria: ${question.evaluationCriteria}

Candidate Response: ${response.responseText}

Provide:
1. A score from 1-10
2. Strengths in the response (2-3 points)
3. Areas for improvement (2-3 points)
4. One specific suggestion for a better answer

Format as:
Score: [1-10]
Strengths: [bullet points]
Improvements: [bullet points]
Suggestion: [specific advice]`

      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      })

      const content = aiResponse.choices[0]?.message?.content || ''
      
      // Track cost if enabled
      if (this.config.costTrackingEnabled && aiResponse.usage) {
        const cost = (aiResponse.usage.prompt_tokens * 0.03 + aiResponse.usage.completion_tokens * 0.06) / 1000
        this.analytics.totalCost += cost
      }

      return this.parseFeedbackFromAI(content, response.questionId)
    })

    return Promise.all(feedbackPromises)
  }

  private parseFeedbackFromAI(content: string, questionId: string): InterviewFeedback {
    const lines = content.split('\n').filter(line => line.trim())
    let score = 5
    const strengths: string[] = []
    const improvements: string[] = []
    let suggestion = ''

    let currentSection = ''
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.toLowerCase().startsWith('score:')) {
        const scoreMatch = trimmedLine.match(/\d+/)
        if (scoreMatch) {
          score = Math.min(10, Math.max(1, parseInt(scoreMatch[0])))
        }
      } else if (trimmedLine.toLowerCase().startsWith('strengths:')) {
        currentSection = 'strengths'
      } else if (trimmedLine.toLowerCase().startsWith('improvements:')) {
        currentSection = 'improvements'
      } else if (trimmedLine.toLowerCase().startsWith('suggestion:')) {
        suggestion = trimmedLine.split(':').slice(1).join(':').trim()
        currentSection = ''
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const point = trimmedLine.substring(1).trim()
        if (currentSection === 'strengths') {
          strengths.push(sanitizeHtml(point))
        } else if (currentSection === 'improvements') {
          improvements.push(sanitizeHtml(point))
        }
      }
    }

    return {
      questionId,
      score,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
      suggestion: sanitizeHtml(suggestion)
    }
  }

  private calculateOverallScore(feedback: InterviewFeedback[]): number {
    if (feedback.length === 0) return 0
    
    const totalScore = feedback.reduce((sum, f) => sum + f.score, 0)
    return Math.round((totalScore / feedback.length) * 10) // Convert to percentage
  }

  private async generateActionableTips(session: InterviewSession, responses: InterviewResponse[], feedback: InterviewFeedback[]): Promise<string[]> {
    const averageScore = this.calculateOverallScore(feedback) / 10
    const weakestAreas = feedback
      .filter(f => f.score < 6)
      .map(f => {
        const question = session.questions.find(q => q.id === f.questionId)
        return question?.type || 'general'
      })

    const prompt = `Based on this interview performance, provide 3 actionable tips for improvement:

Job Title: ${session.jobTitle}
Company: ${session.companyName}
Overall Score: ${averageScore}/10
Weakest Areas: ${weakestAreas.join(', ') || 'None identified'}

Number of Questions: ${responses.length}
Performance Level: ${averageScore >= 0.8 ? 'Excellent' : averageScore >= 0.6 ? 'Good' : averageScore >= 0.4 ? 'Fair' : 'Needs Improvement'}

Provide exactly 3 specific, actionable tips that would help this candidate improve their interview performance. Focus on the weakest areas identified.

Format as:
1. [Specific actionable tip]
2. [Specific actionable tip]  
3. [Specific actionable tip]`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Track cost if enabled
    if (this.config.costTrackingEnabled && response.usage) {
      const cost = (response.usage.prompt_tokens * 0.001 + response.usage.completion_tokens * 0.002) / 1000
      this.analytics.totalCost += cost
    }

    const tips = content
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => sanitizeHtml(line.replace(/^\d+\.\s*/, '')))
      .slice(0, 3)

    // Fallback tips if AI generation fails
    if (tips.length === 0) {
      return [
        'Practice the STAR method (Situation, Task, Action, Result) for behavioral questions',
        'Research the company culture and values before your interview',
        'Prepare specific examples that demonstrate your key skills and achievements'
      ]
    }

    return tips
  }

  async getSessionById(sessionId: string): Promise<InterviewSession | null> {
    // In real implementation, this would query the database
    // For now, return null to indicate session not found
    return null
  }

  async rateInterview(sessionId: string, rating: 'thumbs_up' | 'thumbs_down', feedback?: string): Promise<void> {
    // Track rating for analytics
    if (rating === 'thumbs_up') {
      this.analytics.thumbsUpRate = 
        (this.analytics.thumbsUpRate * this.analytics.completedSessions + 1) / 
        (this.analytics.completedSessions + 1)
    }
    
    // In real implementation, this would save to database
  }

  getAnalytics(): InterviewAnalytics {
    return { ...this.analytics }
  }

  private updateAnalytics(score: number, sessionTime: number): void {
    this.analytics.completedSessions++
    
    // Update average score
    this.analytics.averageScore = 
      (this.analytics.averageScore * (this.analytics.completedSessions - 1) + score) / 
      this.analytics.completedSessions

    // Update average session time
    this.analytics.averageSessionTime = 
      (this.analytics.averageSessionTime * (this.analytics.completedSessions - 1) + sessionTime) / 
      this.analytics.completedSessions
  }
}

export default InterviewSimulatorService

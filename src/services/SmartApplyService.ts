// src/services/SmartApplyService.ts
import OpenAI from 'openai'
import { 
  SmartApplyRequest, 
  SmartApplyResponse, 
  GeneratedContent, 
  ApplicationSubmission,
  SmartApplyAnalytics 
} from '../types/smartApply'
import { Job } from '../types/job'
import { UserProfile } from '../types/user'
import { sanitizeHtml } from '../utils/sanitizers'

export interface SmartApplyServiceConfig {
  openaiApiKey: string
  maxRetries?: number
  timeoutMs?: number
  costTrackingEnabled?: boolean
}

export class SmartApplyService {
  private openai: OpenAI
  private config: SmartApplyServiceConfig
  private analytics: SmartApplyAnalytics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageGenerationTime: 0,
    totalCost: 0,
    cacheHits: 0,
    cacheMisses: 0
  }
  private cache = new Map<string, { content: GeneratedContent; timestamp: number }>()
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

  constructor(config: SmartApplyServiceConfig) {
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

  async generateSmartApplication(request: SmartApplyRequest): Promise<SmartApplyResponse> {
    const startTime = Date.now()
    this.analytics.totalRequests++

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request)
      const cached = this.getCachedContent(cacheKey)
      if (cached) {
        this.analytics.cacheHits++
        return {
          success: true,
          content: cached,
          generationTime: Date.now() - startTime,
          cached: true,
          aiLabeled: true
        }
      }
      this.analytics.cacheMisses++

      // Generate AI content
      const content = await this.generateContent(request)
      
      // Cache the result
      this.setCachedContent(cacheKey, content)

      const generationTime = Date.now() - startTime
      this.updateAnalytics(generationTime, true)

      return {
        success: true,
        content,
        generationTime,
        cached: false,
        aiLabeled: true
      }
    } catch (error) {
      this.analytics.failedRequests++
      this.updateAnalytics(Date.now() - startTime, false)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime,
        cached: false,
        aiLabeled: false
      }
    }
  }

  private async generateContent(request: SmartApplyRequest): Promise<GeneratedContent> {
    const { job, userProfile, includeResumeBullets, includeCoverLetter } = request

    const results: Partial<GeneratedContent> = {}

    // Generate cover letter if requested
    if (includeCoverLetter) {
      results.coverLetter = await this.generateCoverLetter(job, userProfile)
    }

    // Generate resume bullets if requested
    if (includeResumeBullets) {
      results.resumeBullets = await this.generateResumeBullets(job, userProfile)
    }

    return {
      coverLetter: results.coverLetter || null,
      resumeBullets: results.resumeBullets || [],
      aiGenerated: true,
      generatedAt: new Date().toISOString(),
      jobId: job.id,
      userId: userProfile.id
    }
  }

  private async generateCoverLetter(job: Job, userProfile: UserProfile): Promise<string> {
    const prompt = `Generate a professional cover letter for the following job application:

Job Title: ${job.title}
Company: ${job.company.name}
Job Description: ${job.description.substring(0, 1000)}...

Candidate Profile:
Name: ${userProfile.firstName} ${userProfile.lastName}
Experience: ${userProfile.experience?.map(exp => `${exp.title} at ${exp.company}`).join(', ') || 'Not specified'}
Skills: ${userProfile.skills?.map(skill => skill.name).join(', ') || 'Not specified'}
Education: ${userProfile.education?.map(edu => `${edu.degree} from ${edu.institution}`).join(', ') || 'Not specified'}

Requirements:
- Professional tone
- Highlight relevant skills and experience
- Show enthusiasm for the role
- Keep it concise (3-4 paragraphs)
- Address the hiring manager professionally
- End with a strong call to action

Generate ONLY the cover letter content, no additional commentary.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Track cost if enabled
    if (this.config.costTrackingEnabled && response.usage) {
      const cost = (response.usage.prompt_tokens * 0.03 + response.usage.completion_tokens * 0.06) / 1000
      this.analytics.totalCost += cost
    }

    return sanitizeHtml(content)
  }

  private async generateResumeBullets(job: Job, userProfile: UserProfile): Promise<string[]> {
    const prompt = `Generate 3 tailored resume bullet points for this job application:

Job Title: ${job.title}
Company: ${job.company.name}
Required Skills: ${job.skills.join(', ')}
Job Description: ${job.description.substring(0, 800)}...

Candidate Experience:
${userProfile.experience?.map(exp => 
  `- ${exp.title} at ${exp.company}: ${exp.description || 'No description'}`
).join('\n') || 'No experience listed'}

Requirements:
- Start each bullet with a strong action verb
- Quantify achievements where possible
- Align with job requirements
- Professional tone
- Each bullet should be 1-2 lines
- Focus on impact and results

Generate exactly 3 bullet points, one per line, no additional formatting or commentary.`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.6
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Track cost if enabled
    if (this.config.costTrackingEnabled && response.usage) {
      const cost = (response.usage.prompt_tokens * 0.03 + response.usage.completion_tokens * 0.06) / 1000
      this.analytics.totalCost += cost
    }

    return content
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3)
      .map(bullet => sanitizeHtml(bullet.replace(/^[-•]\s*/, '')))
  }

  async submitApplication(submission: ApplicationSubmission): Promise<{ success: boolean; applicationId?: string; error?: string }> {
    try {
      // Validate submission
      if (!submission.jobId || !submission.userId) {
        throw new Error('Job ID and User ID are required')
      }

      if (!submission.coverLetter && !submission.resumeBullets?.length) {
        throw new Error('Either cover letter or resume bullets must be provided')
      }

      // Sanitize content before submission
      const sanitizedSubmission = {
        ...submission,
        coverLetter: submission.coverLetter ? sanitizeHtml(submission.coverLetter) : undefined,
        resumeBullets: submission.resumeBullets?.map(bullet => sanitizeHtml(bullet))
      }

      // Generate application ID
      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // In a real implementation, this would save to database
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 100))

      return {
        success: true,
        applicationId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Submission failed'
      }
    }
  }

  getAnalytics(): SmartApplyAnalytics {
    return { ...this.analytics }
  }

  clearCache(): void {
    this.cache.clear()
  }

  private generateCacheKey(request: SmartApplyRequest): string {
    const keyData = {
      jobId: request.job.id,
      userId: request.userProfile.id,
      includeResumeBullets: request.includeResumeBullets,
      includeCoverLetter: request.includeCoverLetter
    }
    return btoa(JSON.stringify(keyData))
  }

  private getCachedContent(cacheKey: string): GeneratedContent | null {
    const cached = this.cache.get(cacheKey)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL
    if (isExpired) {
      this.cache.delete(cacheKey)
      return null
    }

    return cached.content
  }

  private setCachedContent(cacheKey: string, content: GeneratedContent): void {
    this.cache.set(cacheKey, {
      content,
      timestamp: Date.now()
    })
  }

  private updateAnalytics(generationTime: number, success: boolean): void {
    if (success) {
      this.analytics.successfulRequests++
    }

    // Update average generation time
    const totalRequests = this.analytics.successfulRequests + this.analytics.failedRequests
    this.analytics.averageGenerationTime = 
      (this.analytics.averageGenerationTime * (totalRequests - 1) + generationTime) / totalRequests
  }
}

export default SmartApplyService

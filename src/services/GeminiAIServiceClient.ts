// src/services/GeminiAIServiceClient.ts - Client-side service for AI generation
import { AIGenerationService, type AIGenerationRequest, type AIGenerationResponse, type GenerationOptions, type ModelName } from './AIGenerationService'

export { type GenerationOptions, type ModelName }

interface AIServiceMetrics {
  totalRequests: number
  totalTokens: number
  totalCost: number
  cacheHitRate: number
  averageResponseTime: number
}

export class GeminiAIServiceClient {
  private aiService: AIGenerationService
  private metrics: AIServiceMetrics = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    cacheHitRate: 0,
    averageResponseTime: 0
  }

  constructor() {
    this.aiService = AIGenerationService.getInstance()
  }

  async generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const startTime = Date.now()
    
    try {
      const request: AIGenerationRequest = { prompt, options }
      const response = await this.aiService.generateContent(request)
      
      // Update metrics
      this.updateMetrics(response, Date.now() - startTime)
      
      return response.text
    } catch (error) {
      console.error('AI generation failed:', error)
      throw error
    }
  }

  async generateCoverLetter(jobTitle: string, companyName: string, candidateName: string, candidateSkills: string[]): Promise<string> {
    const prompt = `Generate a professional cover letter for the following:

Job Title: ${jobTitle}
Company: ${companyName}
Candidate: ${candidateName}
Key Skills: ${candidateSkills.join(', ')}

Requirements:
- Professional tone
- Highlight relevant skills
- Show enthusiasm for the role
- Keep it concise (3-4 paragraphs)
- Include proper salutation and closing`

    return this.generateText(prompt, { model: 'gemini-pro' })
  }

  async generateResumeBulletEdits(jobDescription: string, candidateExperience: string): Promise<string[]> {
    const prompt = `Based on this job description and candidate experience, generate 5 tailored resume bullet points:

Job Description: ${jobDescription}
Candidate Experience: ${candidateExperience}

Requirements:
- Use action verbs
- Include quantifiable achievements when possible
- Align with job requirements
- Professional formatting
- Each bullet should be 1-2 lines`

    const response = await this.generateText(prompt, { model: 'gemini-flash' })
    
    // Parse response into bullet points
    return response.split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5)
  }

  async generateInterviewQuestions(jobTitle: string, companyName: string, jobDescription: string): Promise<string[]> {
    const prompt = `Generate 8 relevant interview questions for this position:

Job Title: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription.substring(0, 1000)}

Requirements:
- Mix of behavioral, technical, and situational questions
- Relevant to the specific role and industry
- Professional and appropriate
- Varying difficulty levels`

    const response = await this.generateText(prompt, { model: 'gemini-flash' })
    
    // Parse response into questions
    return response.split('\n')
      .filter(line => line.trim().includes('?'))
      .map(line => line.replace(/^\d+\.?\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 8)
  }

  async generateFeedback(interviewResponses: string[], jobContext: string): Promise<string> {
    const prompt = `Provide constructive interview feedback based on these responses:

Job Context: ${jobContext}
Responses: ${interviewResponses.join('\n\n')}

Requirements:
- Highlight strengths and areas for improvement
- Provide specific, actionable advice
- Professional and encouraging tone
- Include suggestions for better responses`

    return this.generateText(prompt, { model: 'gemini-pro' })
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', confidence: number }> {
    const prompt = `Analyze the sentiment of this text and provide a JSON response:

Text: "${text}"

Respond with JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0
}`

    const response = await this.generateText(prompt, { model: 'gemini-flash' })
    
    try {
      const parsed = JSON.parse(response)
      return {
        sentiment: parsed.sentiment || 'neutral',
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1)
      }
    } catch {
      // Fallback if JSON parsing fails
      return { sentiment: 'neutral', confidence: 0.5 }
    }
  }

  // Update internal metrics
  private updateMetrics(response: AIGenerationResponse, responseTime: number) {
    this.metrics.totalRequests += 1
    this.metrics.totalTokens += response.meta.tokensUsed
    this.metrics.totalCost += response.meta.cost || 0
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / this.metrics.totalRequests
    
    // Update cache hit rate
    const cacheHits = this.metrics.totalRequests * this.metrics.cacheHitRate + (response.meta.cached ? 1 : 0)
    this.metrics.cacheHitRate = cacheHits / this.metrics.totalRequests
  }

  // Get service metrics
  getMetrics(): AIServiceMetrics {
    return { ...this.metrics }
  }

  // Get rate limit info
  getRateLimitInfo(userId?: string) {
    return this.aiService.getRateLimitInfo(userId)
  }

  // Get cache stats
  getCacheStats() {
    return this.aiService.getCacheStats()
  }
}
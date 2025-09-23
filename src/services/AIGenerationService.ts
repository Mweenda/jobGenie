// src/services/AIGenerationService.ts - Production-ready AI generation service
import { LRUCache } from 'lru-cache'
import { geminiFlash, geminiPro } from '@/lib/firebase'

// Types
export type ModelName = 'gemini-flash' | 'gemini-pro'

export interface GenerationOptions {
  model?: ModelName
  temperature?: number
  maxTokens?: number
  userId?: string
}

export interface AIGenerationRequest {
  prompt: string
  options?: GenerationOptions
}

export interface AIGenerationResponse {
  text: string
  meta: {
    model: string
    tokensUsed: number
    cached: boolean
    generatedAt: string
    cost?: number
  }
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Response cache (24 hour TTL)
const cache = new LRUCache<string, AIGenerationResponse>({ 
  max: 1000, 
  ttl: 1000 * 60 * 60 * 24 // 24 hours
})

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

export class AIGenerationService {
  private static instance: AIGenerationService
  
  static getInstance(): AIGenerationService {
    if (!AIGenerationService.instance) {
      AIGenerationService.instance = new AIGenerationService()
    }
    return AIGenerationService.instance
  }

  private constructor() {}

  // Rate limiting check
  private checkRateLimit(userId: string = 'anonymous'): boolean {
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 10

    const entry = rateLimitStore.get(userId)
    
    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (entry.count >= maxRequests) {
      return false // Rate limited
    }

    entry.count += 1
    return true
  }

  // Generate cache key
  private generateCacheKey(prompt: string, options: GenerationOptions = {}): string {
    const { model = 'gemini-flash', temperature = 0.7, maxTokens = 1000 } = options
    return `${model}:${temperature}:${maxTokens}:${prompt.substring(0, 100)}`
  }

  // Main generation method
  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const { prompt, options = {} } = request
    const { model = 'gemini-flash', userId } = options

    // Rate limiting
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    // Check cache
    const cacheKey = this.generateCacheKey(prompt, options)
    const cached = cache.get(cacheKey)
    if (cached) {
      return {
        ...cached,
        meta: { ...cached.meta, cached: true }
      }
    }

    try {
      // Select model
      const aiModel = model === 'gemini-pro' ? geminiPro : geminiFlash

      // Generate content
      const result = await aiModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Estimate token usage (rough approximation)
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4)

      const generationResponse: AIGenerationResponse = {
        text,
        meta: {
          model,
          tokensUsed,
          cached: false,
          generatedAt: new Date().toISOString(),
          cost: this.calculateCost(model, tokensUsed)
        }
      }

      // Cache the response
      cache.set(cacheKey, generationResponse)

      return generationResponse

    } catch (error) {
      console.error('AI Generation Error:', error)
      throw new Error('Failed to generate content. Please try again.')
    }
  }

  // Calculate estimated cost
  private calculateCost(model: ModelName, tokens: number): number {
    // Estimated costs per 1K tokens (adjust based on actual pricing)
    const costs = {
      'gemini-flash': 0.0001, // Very cheap
      'gemini-pro': 0.001     // More expensive but higher quality
    }
    
    return (tokens / 1000) * costs[model]
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: cache.size,
      max: cache.max,
      ttl: cache.ttl
    }
  }

  // Clear cache (for testing/admin)
  clearCache() {
    cache.clear()
  }

  // Get rate limit info for a user
  getRateLimitInfo(userId: string = 'anonymous') {
    const entry = rateLimitStore.get(userId)
    if (!entry) {
      return { remaining: 10, resetTime: null }
    }

    const remaining = Math.max(0, 10 - entry.count)
    return { remaining, resetTime: new Date(entry.resetTime) }
  }
}

// src/services/RecruiterAIService.ts
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import {
  CandidateSearchParams,
  CandidateSearchResult,
  CandidateMatch,
  AICandidateSummary,
  CandidateProfile,
  MatchComponents
} from '../types/recruiter'
import { APIError, APIErrorCodes } from '../types/api'

export interface RecruiterAIConfig {
  openai: {
    apiKey: string
    model?: string
    maxTokens?: number
  }
  pinecone: {
    apiKey: string
    environment: string
    indexName: string
  }
  rateLimit?: {
    requestsPerMinute: number
    creditsPerSearch: number
  }
}

export class RecruiterAIService {
  private openai: OpenAI
  private pinecone: Pinecone
  private vectorIndex: any
  private config: RecruiterAIConfig
  private requestQueue: Array<{ resolve: Function; reject: Function; timestamp: number }> = []
  private lastRequestTime = 0

  constructor(config: RecruiterAIConfig) {
    this.config = config
    
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    })

    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey
    })
    
    this.initializePineconeIndex()
  }

  private async initializePineconeIndex(): Promise<void> {
    try {
      this.vectorIndex = this.pinecone.index(this.config.pinecone.indexName)
    } catch (error) {
      console.error('Failed to initialize Pinecone index:', error)
      throw new APIError({
        code: APIErrorCodes.EXTERNAL_SERVICE_ERROR,
        message: 'Vector search service unavailable'
      })
    }
  }

  async semanticSearch(
    query: string, 
    filters: CandidateSearchParams,
    userId: string
  ): Promise<CandidateSearchResult> {
    const startTime = Date.now()

    try {
      // Apply rate limiting
      await this.enforceRateLimit()

      // Generate embeddings for the search query
      const queryEmbedding = await this.generateEmbedding(query)

      // Perform vector search
      const vectorResults = await this.vectorIndex.query({
        vector: queryEmbedding,
        topK: (filters.limit || 20) * 2, // Get more results for filtering
        includeMetadata: true,
        filter: this.buildPineconeFilter(filters)
      })

      // Convert vector results to candidate profiles
      const candidates = await this.hydrateCandidateProfiles(vectorResults.matches || [])

      // Apply additional filtering
      const filteredCandidates = this.applyAdvancedFiltering(candidates, filters)

      // Calculate match scores and generate AI summaries
      const candidateMatches = await Promise.all(
        filteredCandidates.slice(0, filters.limit || 20).map(async (candidate) => {
          const match = await this.calculateCandidateMatch(candidate, query, filters)
          
          if (filters.includeAISummary) {
            match.aiSummary = await this.generateCandidateSummary(candidate, query)
          }
          
          return match
        })
      )

      // Sort by match score
      candidateMatches.sort((a, b) => b.matchScore - a.matchScore)

      const searchTime = Date.now() - startTime
      const creditsUsed = this.calculateCreditsUsed(candidateMatches.length, filters)

      // Log search for analytics
      await this.logSearch(userId, query, filters, candidateMatches.length, creditsUsed)

      return {
        candidates: candidateMatches,
        totalCount: vectorResults.matches?.length || 0,
        currentPage: filters.page || 1,
        totalPages: Math.ceil((vectorResults.matches?.length || 0) / (filters.limit || 20)),
        hasNextPage: (filters.page || 1) < Math.ceil((vectorResults.matches?.length || 0) / (filters.limit || 20)),
        hasPreviousPage: (filters.page || 1) > 1,
        searchTime,
        creditsUsed
      }

    } catch (error) {
      console.error('Semantic search error:', error)
      if (error instanceof APIError) throw error
      
      throw new APIError({
        code: APIErrorCodes.AI_SERVICE_UNAVAILABLE,
        message: 'AI search service temporarily unavailable'
      })
    }
  }

  async generateCandidateSummary(
    candidate: CandidateProfile, 
    jobContext?: string
  ): Promise<AICandidateSummary> {
    try {
      const prompt = this.buildSummaryPrompt(candidate, jobContext)
      
      const completion = await this.openai.chat.completions.create({
        model: this.config.openai.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert technical recruiter. Analyze the candidate profile and provide a comprehensive assessment. Be objective, highlighting both strengths and potential concerns. Focus on technical skills, experience relevance, and cultural fit indicators.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.openai.maxTokens || 1000,
        temperature: 0.3 // Lower temperature for more consistent analysis
      })

      const aiResponse = completion.choices[0]?.message?.content || ''
      
      return this.parseAISummary(candidate.id, aiResponse)

    } catch (error) {
      console.error('AI summary generation error:', error)
      throw new APIError({
        code: APIErrorCodes.AI_SERVICE_UNAVAILABLE,
        message: 'AI summary service temporarily unavailable'
      })
    }
  }

  async chatbotAssist(
    conversation: Array<{ role: 'user' | 'assistant'; content: string }>,
    userId: string
  ): Promise<{
    message: string
    suggestedActions: string[]
    candidateResults?: CandidateMatch[]
    searchQuery?: CandidateSearchParams
  }> {
    try {
      const systemPrompt = `You are JobGenie's AI recruiting assistant. Help recruiters find, evaluate, and engage with candidates effectively. You can:
      1. Suggest search queries and filters
      2. Analyze candidate profiles
      3. Recommend outreach strategies
      4. Provide market insights
      5. Help with interview preparation
      
      Be concise, actionable, and professional. Always prioritize candidate experience and ethical recruiting practices.`

      const completion = await this.openai.chat.completions.create({
        model: this.config.openai.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation
        ],
        max_tokens: 500,
        temperature: 0.7
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Parse response for actionable suggestions
      const suggestedActions = this.extractSuggestedActions(response)
      const searchQuery = this.extractSearchQuery(conversation[conversation.length - 1]?.content || '')

      // If the conversation indicates a search intent, perform it
      let candidateResults: CandidateMatch[] | undefined
      if (searchQuery && Object.keys(searchQuery).length > 0) {
        const searchResult = await this.semanticSearch(
          searchQuery.query || '',
          { ...searchQuery, limit: 5 },
          userId
        )
        candidateResults = searchResult.candidates
      }

      return {
        message: response,
        suggestedActions,
        candidateResults,
        searchQuery
      }

    } catch (error) {
      console.error('Chatbot assist error:', error)
      throw new APIError({
        code: APIErrorCodes.AI_SERVICE_UNAVAILABLE,
        message: 'AI assistant temporarily unavailable'
      })
    }
  }

  // Private helper methods
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000) // Limit input length
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Embedding generation error:', error)
      throw new APIError({
        code: APIErrorCodes.AI_SERVICE_UNAVAILABLE,
        message: 'Text embedding service unavailable'
      })
    }
  }

  private buildPineconeFilter(filters: CandidateSearchParams): Record<string, any> {
    const pineconeFilter: Record<string, any> = {}

    if (filters.experienceLevel) {
      pineconeFilter.experienceLevel = { $eq: filters.experienceLevel }
    }

    if (filters.location) {
      pineconeFilter.location = { $eq: filters.location }
    }

    if (filters.remote !== undefined) {
      pineconeFilter.remote = { $eq: filters.remote }
    }

    if (filters.skills && filters.skills.length > 0) {
      pineconeFilter.skills = { $in: filters.skills }
    }

    if (filters.industries && filters.industries.length > 0) {
      pineconeFilter.industry = { $in: filters.industries }
    }

    if (filters.salaryMin || filters.salaryMax) {
      const salaryFilter: Record<string, number> = {}
      if (filters.salaryMin) salaryFilter.$gte = filters.salaryMin
      if (filters.salaryMax) salaryFilter.$lte = filters.salaryMax
      pineconeFilter.expectedSalary = salaryFilter
    }

    return pineconeFilter
  }

  private async hydrateCandidateProfiles(vectorMatches: any[]): Promise<CandidateProfile[]> {
    // In production, this would fetch full candidate profiles from database
    // For now, we'll create mock profiles based on vector metadata
    return vectorMatches.map(match => this.createMockCandidateFromVector(match))
  }

  private createMockCandidateFromVector(vectorMatch: any): CandidateProfile {
    const metadata = vectorMatch.metadata || {}
    
    return {
      id: vectorMatch.id,
      userId: metadata.userId || `user_${vectorMatch.id}`,
      firstName: metadata.firstName || 'John',
      lastName: metadata.lastName || 'Doe',
      email: `${metadata.firstName || 'john'}.${metadata.lastName || 'doe'}@example.com`,
      headline: metadata.headline || 'Software Engineer',
      summary: metadata.summary || 'Experienced software engineer with strong technical skills.',
      location: {
        city: metadata.city || 'Lusaka',
        country: metadata.country || 'Zambia',
        timezone: 'Africa/Lusaka',
        remotePreference: metadata.remote ? 'remote_only' : 'flexible',
        willingToRelocate: metadata.willingToRelocate || false
      },
      experience: metadata.experience || [],
      education: metadata.education || [],
      skills: (metadata.skills || 'JavaScript,React,Node.js').split(',').map((skill: string) => ({
        name: skill.trim(),
        level: 'intermediate' as const,
        yearsOfExperience: 3,
        endorsed: true,
        endorsements: 5
      })),
      certifications: metadata.certifications || [],
      languages: [{ name: 'English', proficiency: 'professional' as const }],
      portfolio: metadata.portfolio || [],
      preferences: {
        jobTypes: ['full-time'],
        industries: metadata.industries?.split(',') || ['Technology'],
        salaryExpectations: [{
          min: metadata.salaryMin || 50000,
          max: metadata.salaryMax || 80000,
          currency: 'USD',
          period: 'annually' as const,
          negotiable: true
        }],
        remotePreference: metadata.remote ? 'remote_only' : 'flexible',
        availabilityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        willingToRelocate: metadata.willingToRelocate || false,
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
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private applyAdvancedFiltering(
    candidates: CandidateProfile[], 
    filters: CandidateSearchParams
  ): CandidateProfile[] {
    return candidates.filter(candidate => {
      // Apply availability filter
      if (filters.availability) {
        const availabilityDate = new Date(candidate.preferences.availabilityDate)
        const now = new Date()
        const daysDiff = (availabilityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        
        switch (filters.availability) {
          case 'immediate':
            if (daysDiff > 7) return false
            break
          case 'within_2_weeks':
            if (daysDiff > 14) return false
            break
          case 'within_month':
            if (daysDiff > 30) return false
            break
          case 'not_looking':
            if (daysDiff <= 90) return false
            break
        }
      }

      // Apply company filter
      if (filters.companies && filters.companies.length > 0) {
        const hasWorkExperienceAtCompany = candidate.experience.some(exp =>
          filters.companies!.some(company =>
            exp.company.toLowerCase().includes(company.toLowerCase())
          )
        )
        if (!hasWorkExperienceAtCompany) return false
      }

      // Apply education level filter
      if (filters.educationLevel) {
        const hasRequiredEducation = candidate.education.some(edu =>
          edu.degree.toLowerCase().includes(filters.educationLevel!.toLowerCase())
        )
        if (!hasRequiredEducation) return false
      }

      // Apply languages filter
      if (filters.languages && filters.languages.length > 0) {
        const hasRequiredLanguages = filters.languages.every(lang =>
          candidate.languages.some(candidateLang =>
            candidateLang.name.toLowerCase() === lang.toLowerCase()
          )
        )
        if (!hasRequiredLanguages) return false
      }

      return true
    })
  }

  private async calculateCandidateMatch(
    candidate: CandidateProfile,
    query: string,
    filters: CandidateSearchParams
  ): Promise<CandidateMatch> {
    // Calculate component-based match scores
    const components: MatchComponents = {
      skills: this.calculateSkillsMatch(candidate, filters.skills || []),
      experience: this.calculateExperienceMatch(candidate, filters.experienceLevel),
      location: this.calculateLocationMatch(candidate, filters.location, filters.remote),
      salary: this.calculateSalaryMatch(candidate, filters.salaryMin, filters.salaryMax),
      preferences: this.calculatePreferencesMatch(candidate, filters),
      availability: this.calculateAvailabilityMatch(candidate, filters.availability)
    }

    // Calculate overall match score (weighted average)
    const weights = { skills: 0.3, experience: 0.25, location: 0.15, salary: 0.15, preferences: 0.1, availability: 0.05 }
    const matchScore = Object.entries(components).reduce((total, [key, value]) => {
      return total + (value * (weights[key as keyof typeof weights] || 0))
    }, 0)

    // Generate reasoning
    const reasoning = this.generateMatchReasoning(components, candidate, query)

    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence(candidate, components)

    return {
      candidate,
      matchScore: Math.round(matchScore * 100) / 100,
      matchComponents: components,
      reasoning,
      confidence
    }
  }

  private calculateSkillsMatch(candidate: CandidateProfile, requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 1.0

    const candidateSkills = candidate.skills.map(s => s.name.toLowerCase())
    const matchingSkills = requiredSkills.filter(skill =>
      candidateSkills.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
    )

    return matchingSkills.length / requiredSkills.length
  }

  private calculateExperienceMatch(candidate: CandidateProfile, requiredLevel?: string): number {
    if (!requiredLevel) return 1.0

    const totalExperience = candidate.experience.reduce((total, exp) => {
      const startDate = new Date(exp.startDate)
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date()
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return total + years
    }, 0)

    const levelMap = { entry: [0, 2], mid: [2, 5], senior: [5, 10], lead: [8, 20] }
    const [minYears, maxYears] = levelMap[requiredLevel as keyof typeof levelMap] || [0, 20]

    if (totalExperience < minYears) return Math.max(0, totalExperience / minYears)
    if (totalExperience > maxYears) return Math.max(0.8, 1 - ((totalExperience - maxYears) / maxYears) * 0.2)
    return 1.0
  }

  private calculateLocationMatch(candidate: CandidateProfile, location?: string, remote?: boolean): number {
    if (remote && candidate.location.remotePreference !== 'onsite') return 1.0
    if (!location) return 1.0

    const candidateLocation = `${candidate.location.city}, ${candidate.location.country}`.toLowerCase()
    const requiredLocation = location.toLowerCase()

    if (candidateLocation.includes(requiredLocation) || requiredLocation.includes(candidateLocation)) {
      return 1.0
    }

    // Check if willing to relocate
    if (candidate.location.willingToRelocate) return 0.7

    return 0.3
  }

  private calculateSalaryMatch(candidate: CandidateProfile, minSalary?: number, maxSalary?: number): number {
    if (!minSalary && !maxSalary) return 1.0

    const candidateExpectation = candidate.preferences.salaryExpectations[0]
    if (!candidateExpectation) return 0.8

    const candidateMin = candidateExpectation.min
    const candidateMax = candidateExpectation.max

    // Check for overlap
    const overlapMin = Math.max(candidateMin, minSalary || 0)
    const overlapMax = Math.min(candidateMax, maxSalary || Infinity)

    if (overlapMin <= overlapMax) {
      const overlapSize = overlapMax - overlapMin
      const candidateRange = candidateMax - candidateMin
      return Math.min(1.0, overlapSize / candidateRange)
    }

    // No overlap - calculate distance penalty
    if (maxSalary && candidateMin > maxSalary) {
      const gap = candidateMin - maxSalary
      return Math.max(0, 1 - (gap / maxSalary))
    }

    if (minSalary && candidateMax < minSalary) {
      const gap = minSalary - candidateMax
      return Math.max(0, 1 - (gap / minSalary))
    }

    return 0.5
  }

  private calculatePreferencesMatch(candidate: CandidateProfile, filters: CandidateSearchParams): number {
    let matches = 0
    let total = 0

    // Job types
    if (filters.query) {
      total++
      const jobTypeKeywords = ['full-time', 'part-time', 'contract', 'internship']
      const queryJobTypes = jobTypeKeywords.filter(type => 
        filters.query!.toLowerCase().includes(type)
      )
      
      if (queryJobTypes.length > 0) {
        const hasMatch = queryJobTypes.some(type =>
          candidate.preferences.jobTypes.includes(type as any)
        )
        if (hasMatch) matches++
      } else {
        matches++ // No specific job type requirement
      }
    }

    // Industries
    if (filters.industries && filters.industries.length > 0) {
      total++
      const hasIndustryMatch = filters.industries.some(industry =>
        candidate.preferences.industries.some(candIndustry =>
          candIndustry.toLowerCase().includes(industry.toLowerCase())
        )
      )
      if (hasIndustryMatch) matches++
    }

    return total > 0 ? matches / total : 1.0
  }

  private calculateAvailabilityMatch(candidate: CandidateProfile, availability?: string): number {
    if (!availability) return 1.0

    const availabilityDate = new Date(candidate.preferences.availabilityDate)
    const now = new Date()
    const daysDiff = (availabilityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    switch (availability) {
      case 'immediate':
        return daysDiff <= 7 ? 1.0 : Math.max(0, 1 - (daysDiff - 7) / 14)
      case 'within_2_weeks':
        return daysDiff <= 14 ? 1.0 : Math.max(0, 1 - (daysDiff - 14) / 14)
      case 'within_month':
        return daysDiff <= 30 ? 1.0 : Math.max(0, 1 - (daysDiff - 30) / 30)
      case 'not_looking':
        return daysDiff > 90 ? 1.0 : 0.3
      default:
        return 1.0
    }
  }

  private generateMatchReasoning(
    components: MatchComponents,
    candidate: CandidateProfile,
    query: string
  ): string[] {
    const reasoning: string[] = []

    if (components.skills > 0.8) {
      reasoning.push(`Strong skills match - candidate has most required technical skills`)
    } else if (components.skills > 0.5) {
      reasoning.push(`Good skills overlap with some gaps that could be filled through training`)
    } else {
      reasoning.push(`Limited skills match - significant upskilling may be required`)
    }

    if (components.experience > 0.8) {
      reasoning.push(`Experience level aligns well with requirements`)
    } else if (components.experience > 0.5) {
      reasoning.push(`Moderate experience match - some areas may need development`)
    } else {
      reasoning.push(`Experience level below requirements - consider for growth potential`)
    }

    if (components.location > 0.8) {
      reasoning.push(`Excellent location match or strong remote work capability`)
    } else if (components.location > 0.5) {
      reasoning.push(`Reasonable location match - may require relocation or remote work`)
    }

    if (components.salary > 0.8) {
      reasoning.push(`Salary expectations align well with budget`)
    } else if (components.salary > 0.5) {
      reasoning.push(`Some salary negotiation may be needed`)
    } else {
      reasoning.push(`Significant salary expectation gap - careful negotiation required`)
    }

    return reasoning
  }

  private calculateConfidence(candidate: CandidateProfile, components: MatchComponents): number {
    let completenessScore = 0
    let totalFields = 0

    // Profile completeness factors
    const fields = [
      candidate.summary,
      candidate.experience.length > 0,
      candidate.education.length > 0,
      candidate.skills.length > 0,
      candidate.preferences.salaryExpectations.length > 0
    ]

    fields.forEach(field => {
      totalFields++
      if (field) completenessScore++
    })

    const completeness = completenessScore / totalFields

    // Match consistency (variance in component scores)
    const componentValues = Object.values(components)
    const avgScore = componentValues.reduce((a, b) => a + b, 0) / componentValues.length
    const variance = componentValues.reduce((acc, score) => acc + Math.pow(score - avgScore, 2), 0) / componentValues.length
    const consistency = Math.max(0, 1 - variance)

    // Combine factors
    return (completeness * 0.6 + consistency * 0.4)
  }

  private buildSummaryPrompt(candidate: CandidateProfile, jobContext?: string): string {
    const contextSection = jobContext ? `\n\nJob Context: ${jobContext}` : ''
    
    return `Analyze this candidate profile and provide a structured assessment:

Candidate: ${candidate.firstName} ${candidate.lastName}
Headline: ${candidate.headline}
Summary: ${candidate.summary || 'No summary provided'}

Skills: ${candidate.skills.map(s => `${s.name} (${s.level})`).join(', ')}

Experience:
${candidate.experience.map(exp => 
  `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`
).join('\n')}

Education:
${candidate.education.map(edu => 
  `- ${edu.degree} in ${edu.field} from ${edu.institution}`
).join('\n')}

Location: ${candidate.location.city}, ${candidate.location.country}
Remote Preference: ${candidate.location.remotePreference}
${contextSection}

Provide:
1. A 2-3 sentence professional summary
2. Top 3 key strengths
3. Any potential concerns or gaps
4. Overall fit assessment (Strong/Good/Moderate/Weak)
5. 2-3 recommended interview questions

Format as JSON with fields: summary, keyStrengths, potentialConcerns, fitAssessment, recommendedQuestions`
  }

  private parseAISummary(candidateId: string, aiResponse: string): AICandidateSummary {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(aiResponse)
      
      return {
        id: `summary_${candidateId}_${Date.now()}`,
        candidateId,
        summary: parsed.summary || aiResponse.substring(0, 500),
        keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : [],
        potentialConcerns: Array.isArray(parsed.potentialConcerns) ? parsed.potentialConcerns : [],
        fitAssessment: parsed.fitAssessment || 'Moderate',
        recommendedQuestions: Array.isArray(parsed.recommendedQuestions) ? parsed.recommendedQuestions : [],
        confidenceScore: 0.8,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      // Fallback parsing for non-JSON responses
      return {
        id: `summary_${candidateId}_${Date.now()}`,
        candidateId,
        summary: aiResponse.substring(0, 500),
        keyStrengths: [],
        potentialConcerns: [],
        fitAssessment: 'Moderate',
        recommendedQuestions: [],
        confidenceScore: 0.6,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private extractSuggestedActions(response: string): string[] {
    const actions: string[] = []
    
    // Look for common action patterns
    const actionPatterns = [
      /(?:try|consider|recommend|suggest).{1,100}(?:search|filter|contact|review)/gi,
      /(?:you could|you might|you should).{1,100}/gi,
      /(?:next step|action item|recommendation):.{1,100}/gi
    ]

    actionPatterns.forEach(pattern => {
      const matches = response.match(pattern)
      if (matches) {
        actions.push(...matches.map(match => match.trim()))
      }
    })

    return actions.slice(0, 3) // Limit to top 3 suggestions
  }

  private extractSearchQuery(userMessage: string): CandidateSearchParams {
    const query: CandidateSearchParams = {}

    // Extract skills
    const skillPatterns = [
      /(?:skills?|technologies?|tech stack|programming languages?)[\s:]*([a-zA-Z\s,+#.]+)/gi,
      /(?:experience with|familiar with|knowledge of)[\s:]*([a-zA-Z\s,+#.]+)/gi
    ]

    skillPatterns.forEach(pattern => {
      const match = userMessage.match(pattern)
      if (match && match[1]) {
        const skills = match[1].split(/[,\s]+/).filter(s => s.length > 1)
        query.skills = [...(query.skills || []), ...skills]
      }
    })

    // Extract location
    const locationMatch = userMessage.match(/(?:in|from|located|based)[\s:]*([A-Za-z\s,]+)(?:\s|$|,)/i)
    if (locationMatch && locationMatch[1]) {
      query.location = locationMatch[1].trim()
    }

    // Extract experience level
    const experienceMatch = userMessage.match(/(entry|junior|mid|senior|lead|principal)/gi)
    if (experienceMatch) {
      query.experienceLevel = experienceMatch[0].toLowerCase() as any
    }

    // Extract remote preference
    if (/remote|work from home|distributed/i.test(userMessage)) {
      query.remote = true
    }

    // Set query text
    query.query = userMessage

    return query
  }

  private calculateCreditsUsed(resultCount: number, filters: CandidateSearchParams): number {
    let credits = this.config.rateLimit?.creditsPerSearch || 1
    
    // Additional credits for AI summaries
    if (filters.includeAISummary) {
      credits += resultCount * 0.5
    }

    return Math.ceil(credits)
  }

  private async logSearch(
    userId: string,
    query: string,
    filters: CandidateSearchParams,
    resultCount: number,
    creditsUsed: number
  ): Promise<void> {
    // In production, this would log to database for analytics
    console.log('Search logged:', {
      userId,
      query,
      filters,
      resultCount,
      creditsUsed,
      timestamp: new Date().toISOString()
    })
  }

  private async enforceRateLimit(): Promise<void> {
    if (!this.config.rateLimit) return

    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    const minInterval = 60000 / this.config.rateLimit.requestsPerMinute

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    this.lastRequestTime = Date.now()
  }
}

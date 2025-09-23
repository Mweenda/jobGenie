/**
 * AI Career Coach Service
 * Provides AI-powered career guidance, resume optimization, and interview preparation
 */

import OpenAI from 'openai'
import { UserProfile, Job } from './jobMatchingEngineV2'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
})

export interface ResumeOptimization {
  originalBullets: string[]
  optimizedBullets: string[]
  changes: ChangeExplanation[]
  matchImprovement: number
  overallScore: number
}

export interface ChangeExplanation {
  original: string
  optimized: string
  reason: string
  impact: 'high' | 'medium' | 'low'
}

export interface CoverLetterGeneration {
  coverLetter: string
  tone: WritingTone
  keyPoints: string[]
  personalization: string[]
}

export interface InterviewPrep {
  commonQuestions: InterviewQuestion[]
  companySpecificQuestions: InterviewQuestion[]
  behavioralQuestions: InterviewQuestion[]
  technicalQuestions: InterviewQuestion[]
  tips: InterviewTip[]
}

export interface InterviewQuestion {
  question: string
  type: 'behavioral' | 'technical' | 'situational' | 'company-specific'
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedAnswer?: string
  starFramework?: STARAnswer
}

export interface STARAnswer {
  situation: string
  task: string
  action: string
  result: string
}

export interface InterviewTip {
  category: 'preparation' | 'communication' | 'technical' | 'behavioral'
  tip: string
  importance: 'high' | 'medium' | 'low'
}

export interface CareerGuidance {
  skillsToLearn: SkillRecommendation[]
  careerPath: CareerStep[]
  salaryProjection: SalaryProjection
  industryInsights: string[]
}

export interface SkillRecommendation {
  skill: string
  priority: 'high' | 'medium' | 'low'
  timeToLearn: string
  resources: LearningResource[]
  demandInMarket: number // 1-10 scale
}

export interface CareerStep {
  role: string
  timeframe: string
  requirements: string[]
  averageSalary: string
}

export interface SalaryProjection {
  currentRange: string
  oneYearProjection: string
  fiveYearProjection: string
  factors: string[]
}

export interface LearningResource {
  title: string
  type: 'course' | 'book' | 'certification' | 'project'
  provider: string
  url?: string
  duration: string
  cost: 'free' | 'paid'
}

export type WritingTone = 'professional' | 'enthusiastic' | 'technical' | 'conversational'

export class AICareerCoach {
  private static instance: AICareerCoach
  private rateLimitCache = new Map<string, number>()
  private readonly RATE_LIMIT_WINDOW = 60000 // 1 minute
  private readonly MAX_REQUESTS_PER_MINUTE = 10

  private constructor() {}

  public static getInstance(): AICareerCoach {
    if (!AICareerCoach.instance) {
      AICareerCoach.instance = new AICareerCoach()
    }
    return AICareerCoach.instance
  }

  /**
   * Optimize resume bullets for a specific job
   */
  async optimizeResume(
    userProfile: UserProfile,
    job: Job,
    currentResumeBullets: string[]
  ): Promise<ResumeOptimization> {
    if (!this.checkRateLimit('optimizeResume')) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    try {
      const prompt = this.buildResumeOptimizationPrompt(userProfile, job, currentResumeBullets)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and career coach. Optimize resume bullets to better match job requirements while maintaining truthfulness.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        throw new Error('Failed to generate resume optimization')
      }

      return this.parseResumeOptimization(currentResumeBullets, result)
    } catch (error) {
      console.error('Resume optimization error:', error)
      throw new Error('Failed to optimize resume. Please try again.')
    }
  }

  /**
   * Generate a tailored cover letter
   */
  async generateCoverLetter(
    userProfile: UserProfile,
    job: Job,
    tone: WritingTone = 'professional'
  ): Promise<CoverLetterGeneration> {
    if (!this.checkRateLimit('generateCoverLetter')) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    try {
      const prompt = this.buildCoverLetterPrompt(userProfile, job, tone)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career coach specializing in cover letter writing. Create compelling, personalized cover letters that highlight relevant experience and show genuine interest in the role.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        throw new Error('Failed to generate cover letter')
      }

      return this.parseCoverLetter(result, tone)
    } catch (error) {
      console.error('Cover letter generation error:', error)
      throw new Error('Failed to generate cover letter. Please try again.')
    }
  }

  /**
   * Prepare interview questions and tips
   */
  async prepareInterview(
    userProfile: UserProfile,
    job: Job
  ): Promise<InterviewPrep> {
    if (!this.checkRateLimit('prepareInterview')) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    try {
      const prompt = this.buildInterviewPrepPrompt(userProfile, job)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced interview coach. Provide comprehensive interview preparation including likely questions, suggested answers using the STAR method, and practical tips.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        throw new Error('Failed to generate interview prep')
      }

      return this.parseInterviewPrep(result)
    } catch (error) {
      console.error('Interview prep error:', error)
      throw new Error('Failed to prepare interview materials. Please try again.')
    }
  }

  /**
   * Provide career guidance and skill recommendations
   */
  async getCareerGuidance(userProfile: UserProfile): Promise<CareerGuidance> {
    if (!this.checkRateLimit('getCareerGuidance')) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    try {
      const prompt = this.buildCareerGuidancePrompt(userProfile)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a senior career advisor with deep knowledge of tech industry trends, skill demands, and career progression paths. Provide actionable career guidance based on current market conditions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1800
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        throw new Error('Failed to generate career guidance')
      }

      return this.parseCareerGuidance(result)
    } catch (error) {
      console.error('Career guidance error:', error)
      throw new Error('Failed to generate career guidance. Please try again.')
    }
  }

  /**
   * Explain why a job is a good match
   */
  async explainJobMatch(
    userProfile: UserProfile,
    job: Job,
    matchScore: number
  ): Promise<string> {
    if (!this.checkRateLimit('explainJobMatch')) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    try {
      const prompt = `
        Explain why this job is a ${matchScore}% match for the candidate:
        
        Candidate Profile:
        - Name: ${userProfile.firstName} ${userProfile.lastName}
        - Current Role: ${userProfile.headline || 'Job Seeker'}
        - Skills: ${userProfile.skills.map(s => s.name).join(', ')}
        - Experience: ${userProfile.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
        
        Job Details:
        - Title: ${job.title}
        - Company: ${job.company.name}
        - Required Skills: ${job.requiredSkills.join(', ')}
        - Experience Level: ${job.experienceLevel}
        - Location: ${job.location}
        - Remote: ${job.isRemote ? 'Yes' : 'No'}
        
        Provide a personalized, encouraging explanation in 2-3 sentences that highlights the strongest match points and addresses any gaps as growth opportunities.
      `
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive career coach. Provide encouraging, personalized explanations that help job seekers understand their fit for roles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })

      return response.choices[0]?.message?.content || 'This role aligns well with your background and offers great growth potential.'
    } catch (error) {
      console.error('Job match explanation error:', error)
      return 'This role offers a good match for your skills and experience level.'
    }
  }

  // Private helper methods
  private checkRateLimit(operation: string): boolean {
    const key = `${operation}-${Date.now()}`
    const now = Date.now()
    
    // Clean old entries
    for (const [cacheKey, timestamp] of this.rateLimitCache.entries()) {
      if (now - timestamp > this.RATE_LIMIT_WINDOW) {
        this.rateLimitCache.delete(cacheKey)
      }
    }

    // Check current rate
    const recentRequests = Array.from(this.rateLimitCache.values()).filter(
      timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
    )

    if (recentRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      return false
    }

    this.rateLimitCache.set(key, now)
    return true
  }

  private buildResumeOptimizationPrompt(
    userProfile: UserProfile,
    job: Job,
    bullets: string[]
  ): string {
    return `
      Optimize these resume bullets for a ${job.title} position at ${job.company.name}:
      
      Current Resume Bullets:
      ${bullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}
      
      Job Requirements:
      - Required Skills: ${job.requiredSkills.join(', ')}
      - Experience Level: ${job.experienceLevel}
      - Company: ${job.company.name} (${job.company.size} ${job.company.industry} company)
      
      User Background:
      - Skills: ${userProfile.skills.map(s => s.name).join(', ')}
      - Experience: ${userProfile.experience.map(e => e.title).join(', ')}
      
      Please provide:
      1. Optimized versions of each bullet point
      2. Explanation of changes made
      3. How each change improves the match for this specific role
      
      Keep all claims truthful and based on the user's actual experience.
      
      Format your response as JSON:
      {
        "optimizations": [
          {
            "original": "original bullet",
            "optimized": "optimized bullet",
            "reason": "explanation of change",
            "impact": "high|medium|low"
          }
        ],
        "overallImprovement": "percentage improvement estimate"
      }
    `
  }

  private buildCoverLetterPrompt(
    userProfile: UserProfile,
    job: Job,
    tone: WritingTone
  ): string {
    return `
      Write a ${tone} cover letter for:
      
      Candidate: ${userProfile.firstName} ${userProfile.lastName}
      Current Role: ${userProfile.headline || 'Job Seeker'}
      
      Target Position: ${job.title} at ${job.company.name}
      
      Key Requirements to Address:
      ${job.requiredSkills.slice(0, 5).join(', ')}
      
      Candidate's Relevant Experience:
      ${userProfile.experience.slice(0, 2).map(exp => 
        `- ${exp.title} at ${exp.company}: ${exp.description || 'Relevant experience'}`
      ).join('\n')}
      
      Company Context: ${job.company.industry} company, ${job.company.size} size
      
      The cover letter should:
      - Be 3-4 paragraphs
      - Show genuine interest in the company
      - Highlight relevant skills and experience
      - Match the ${tone} tone
      - Include a strong call to action
      
      Format as JSON:
      {
        "coverLetter": "full cover letter text",
        "keyPoints": ["point1", "point2", "point3"],
        "personalization": ["company-specific element1", "element2"]
      }
    `
  }

  private buildInterviewPrepPrompt(userProfile: UserProfile, job: Job): string {
    return `
      Create interview preparation materials for:
      
      Position: ${job.title} at ${job.company.name}
      Candidate: ${userProfile.firstName} ${userProfile.lastName}
      
      Required Skills: ${job.requiredSkills.join(', ')}
      Company: ${job.company.industry} industry, ${job.company.size} size
      
      Provide:
      1. 5 common interview questions for this role
      2. 3 company-specific questions they might ask
      3. 3 behavioral questions with STAR method answers
      4. 2-3 technical questions if applicable
      5. 5 practical interview tips
      
      Format as JSON with questions, suggested answers, and tips.
    `
  }

  private buildCareerGuidancePrompt(userProfile: UserProfile): string {
    return `
      Provide career guidance for:
      
      ${userProfile.firstName} ${userProfile.lastName}
      Current Role: ${userProfile.headline || 'Job Seeker'}
      Skills: ${userProfile.skills.map(s => s.name).join(', ')}
      Experience: ${userProfile.experience.length} positions
      
      Provide:
      1. Top 5 skills to learn for career growth
      2. Career progression path (next 3 steps)
      3. Salary projection (current, 1-year, 5-year)
      4. Industry insights and trends
      
      Focus on actionable advice based on current market conditions.
      Format as structured JSON.
    `
  }

  private parseResumeOptimization(original: string[], aiResponse: string): ResumeOptimization {
    try {
      const parsed = JSON.parse(aiResponse)
      return {
        originalBullets: original,
        optimizedBullets: parsed.optimizations?.map((opt: any) => opt.optimized) || original,
        changes: parsed.optimizations || [],
        matchImprovement: parseInt(parsed.overallImprovement) || 0,
        overallScore: 85 // Placeholder score
      }
    } catch {
      // Fallback parsing if JSON fails
      return {
        originalBullets: original,
        optimizedBullets: original,
        changes: [],
        matchImprovement: 0,
        overallScore: 70
      }
    }
  }

  private parseCoverLetter(aiResponse: string, tone: WritingTone): CoverLetterGeneration {
    try {
      const parsed = JSON.parse(aiResponse)
      return {
        coverLetter: parsed.coverLetter || aiResponse,
        tone,
        keyPoints: parsed.keyPoints || [],
        personalization: parsed.personalization || []
      }
    } catch {
      return {
        coverLetter: aiResponse,
        tone,
        keyPoints: [],
        personalization: []
      }
    }
  }

  private parseInterviewPrep(_aiResponse: string): InterviewPrep {
    // Simplified parsing - in production, would use more sophisticated JSON parsing
    return {
      commonQuestions: [
        { question: 'Tell me about yourself', type: 'behavioral', difficulty: 'easy' },
        { question: 'Why are you interested in this role?', type: 'behavioral', difficulty: 'easy' },
        { question: 'What are your greatest strengths?', type: 'behavioral', difficulty: 'medium' }
      ],
      companySpecificQuestions: [
        { question: 'Why do you want to work here?', type: 'company-specific', difficulty: 'medium' }
      ],
      behavioralQuestions: [
        { question: 'Describe a challenging project you worked on', type: 'behavioral', difficulty: 'medium' }
      ],
      technicalQuestions: [
        { question: 'Explain your approach to solving complex problems', type: 'technical', difficulty: 'hard' }
      ],
      tips: [
        { category: 'preparation', tip: 'Research the company thoroughly', importance: 'high' },
        { category: 'communication', tip: 'Use the STAR method for behavioral questions', importance: 'high' }
      ]
    }
  }

  private parseCareerGuidance(_aiResponse: string): CareerGuidance {
    // Simplified implementation - would parse AI response in production
    return {
      skillsToLearn: [
        { skill: 'React', priority: 'high', timeToLearn: '2-3 months', resources: [], demandInMarket: 9 },
        { skill: 'TypeScript', priority: 'high', timeToLearn: '1-2 months', resources: [], demandInMarket: 8 }
      ],
      careerPath: [
        { role: 'Senior Developer', timeframe: '1-2 years', requirements: ['Advanced React', 'Team Leadership'], averageSalary: '$120k-150k' }
      ],
      salaryProjection: {
        currentRange: '$80k-100k',
        oneYearProjection: '$95k-120k',
        fiveYearProjection: '$130k-160k',
        factors: ['Skill development', 'Market demand', 'Experience growth']
      },
      industryInsights: [
        'Remote work is becoming the standard',
        'AI/ML skills are increasingly valuable',
        'Full-stack developers are in high demand'
      ]
    }
  }
}

// Export singleton instance
export const aiCareerCoach = AICareerCoach.getInstance()

import { JobService } from './jobService'
import { AuthService } from './authService'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  data?: any
  type?: 'text' | 'job_recommendations' | 'job_list' | 'career_advice'
}

export interface ChatIntent {
  type: 'JOB_SEARCH' | 'RESUME_HELP' | 'INTERVIEW_PREP' | 'SALARY_INFO' | 'CAREER_ADVICE' | 'UNKNOWN'
  parameters: Record<string, any>
  confidence: number
}

/**
 * AI Chatbot service for career assistance and job search help
 */
export class ChatbotService {
  /**
   * Process user message and generate appropriate response
   */
  static async processMessage(userId: string, message: string): Promise<ChatMessage> {
    try {
      const intent = this.analyzeIntent(message)
      
      switch (intent.type) {
        case 'JOB_SEARCH':
          return await this.handleJobSearch(userId, intent.parameters)
        case 'RESUME_HELP':
          return await this.handleResumeHelp(userId, intent.parameters)
        case 'INTERVIEW_PREP':
          return await this.handleInterviewPrep(intent.parameters)
        case 'SALARY_INFO':
          return await this.handleSalaryInquiry(intent.parameters)
        case 'CAREER_ADVICE':
          return await this.handleCareerAdvice(userId, intent.parameters)
        default:
          return this.getDefaultResponse()
      }
    } catch (error) {
      console.error('Process message error:', error)
      return this.getErrorResponse()
    }
  }

  /**
   * Analyze user message to determine intent
   */
  private static analyzeIntent(message: string): ChatIntent {
    const lowerMessage = message.toLowerCase()
    
    // Job search intent
    if (this.containsKeywords(lowerMessage, ['job', 'find', 'search', 'position', 'opportunity', 'work', 'hiring'])) {
      return {
        type: 'JOB_SEARCH',
        parameters: this.extractJobSearchParams(message),
        confidence: 0.8
      }
    }
    
    // Resume help intent
    if (this.containsKeywords(lowerMessage, ['resume', 'cv', 'curriculum', 'experience', 'skills', 'qualifications'])) {
      return {
        type: 'RESUME_HELP',
        parameters: this.extractResumeParams(message),
        confidence: 0.8
      }
    }
    
    // Interview prep intent
    if (this.containsKeywords(lowerMessage, ['interview', 'questions', 'preparation', 'tips', 'practice'])) {
      return {
        type: 'INTERVIEW_PREP',
        parameters: this.extractInterviewParams(message),
        confidence: 0.8
      }
    }
    
    // Salary inquiry intent
    if (this.containsKeywords(lowerMessage, ['salary', 'pay', 'compensation', 'wage', 'money', 'negotiate'])) {
      return {
        type: 'SALARY_INFO',
        parameters: this.extractSalaryParams(message),
        confidence: 0.8
      }
    }
    
    // Career advice intent
    if (this.containsKeywords(lowerMessage, ['career', 'advice', 'guidance', 'path', 'development', 'growth'])) {
      return {
        type: 'CAREER_ADVICE',
        parameters: this.extractCareerParams(message),
        confidence: 0.7
      }
    }
    
    return {
      type: 'UNKNOWN',
      parameters: {},
      confidence: 0.1
    }
  }

  /**
   * Handle job search requests
   */
  private static async handleJobSearch(userId: string, params: any): Promise<ChatMessage> {
    try {
      const recommendations = await JobService.getRecommendations(userId)
      
      if (recommendations.length === 0) {
        return {
          id: this.generateId(),
          text: "I couldn't find any specific job matches for you right now. Let me help you search for jobs! What type of position are you looking for?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
      }
      
      return {
        id: this.generateId(),
        text: `🔍 Great! I found ${recommendations.length} personalized job recommendations for you based on your profile. Here are your top matches:`,
        sender: 'bot',
        timestamp: new Date(),
        data: recommendations.slice(0, 3),
        type: 'job_recommendations'
      }
    } catch (error) {
      return this.getErrorResponse()
    }
  }

  /**
   * Handle resume help requests
   */
  private static async handleResumeHelp(userId: string, params: any): Promise<ChatMessage> {
    const resumeTips = [
      "📝 **Keep it concise**: Aim for 1-2 pages maximum",
      "🎯 **Tailor for each job**: Customize your resume for specific positions",
      "📊 **Use action verbs**: Start bullet points with strong action words",
      "🔢 **Quantify achievements**: Include numbers and percentages when possible",
      "🔍 **Include keywords**: Use relevant industry keywords from job descriptions",
      "✨ **Professional format**: Use clean, readable fonts and consistent formatting"
    ]
    
    return {
      id: this.generateId(),
      text: `📋 Here are some key resume tips to help you stand out:\n\n${resumeTips.join('\n')}\n\nWould you like specific advice for any section of your resume?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'career_advice'
    }
  }

  /**
   * Handle interview preparation requests
   */
  private static async handleInterviewPrep(params: any): Promise<ChatMessage> {
    const interviewTips = [
      "🔍 **Research the company**: Know their mission, values, and recent news",
      "📝 **Practice STAR method**: Structure answers with Situation, Task, Action, Result",
      "❓ **Prepare questions**: Have thoughtful questions about the role and company",
      "👔 **Dress appropriately**: Match or slightly exceed the company's dress code",
      "⏰ **Arrive early**: Plan to arrive 10-15 minutes before your interview",
      "💪 **Show enthusiasm**: Express genuine interest in the role and company"
    ]
    
    const commonQuestions = [
      "Tell me about yourself",
      "Why do you want this job?",
      "What are your strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Why are you leaving your current job?",
      "Do you have any questions for us?"
    ]
    
    return {
      id: this.generateId(),
      text: `🎯 **Interview Preparation Guide**\n\n**Key Tips:**\n${interviewTips.join('\n')}\n\n**Common Questions to Practice:**\n${commonQuestions.map(q => `• ${q}`).join('\n')}\n\nWould you like help practicing answers to any of these questions?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'career_advice'
    }
  }

  /**
   * Handle salary inquiry requests
   */
  private static async handleSalaryInquiry(params: any): Promise<ChatMessage> {
    const salaryTips = [
      "📊 **Research market rates**: Use sites like Glassdoor, PayScale, and LinkedIn Salary",
      "💼 **Consider total compensation**: Include benefits, bonuses, and stock options",
      "🎯 **Know your worth**: Factor in your experience, skills, and achievements",
      "⏰ **Time it right**: Negotiate after receiving an offer, not during initial interviews",
      "📝 **Be prepared to justify**: Have specific examples of your value and contributions",
      "🤝 **Be flexible**: Consider non-salary benefits if the base pay isn't negotiable"
    ]
    
    return {
      id: this.generateId(),
      text: `💰 **Salary Negotiation Guide**\n\n${salaryTips.join('\n')}\n\nRemember: The worst they can say is no, but many employers expect some negotiation. What specific role are you considering?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'career_advice'
    }
  }

  /**
   * Handle career advice requests
   */
  private static async handleCareerAdvice(userId: string, params: any): Promise<ChatMessage> {
    try {
      const user = await AuthService.getUserProfile(userId)
      
      let personalizedAdvice = "Here's some career advice tailored for you:\n\n"
      
      if (user?.experienceLevel === 'entry') {
        personalizedAdvice += "🌱 **For Entry-Level Professionals:**\n"
        personalizedAdvice += "• Focus on building foundational skills\n"
        personalizedAdvice += "• Seek mentorship opportunities\n"
        personalizedAdvice += "• Consider internships or junior positions\n"
        personalizedAdvice += "• Build a strong professional network\n\n"
      } else if (user?.experienceLevel === 'mid') {
        personalizedAdvice += "🚀 **For Mid-Level Professionals:**\n"
        personalizedAdvice += "• Develop leadership and management skills\n"
        personalizedAdvice += "• Consider specializing in a niche area\n"
        personalizedAdvice += "• Look for stretch assignments and new challenges\n"
        personalizedAdvice += "• Build your personal brand in the industry\n\n"
      } else if (user?.experienceLevel === 'senior') {
        personalizedAdvice += "👑 **For Senior Professionals:**\n"
        personalizedAdvice += "• Focus on strategic thinking and vision\n"
        personalizedAdvice += "• Mentor junior team members\n"
        personalizedAdvice += "• Consider executive education programs\n"
        personalizedAdvice += "• Explore board positions or consulting opportunities\n\n"
      }
      
      personalizedAdvice += "💡 **General Career Tips:**\n"
      personalizedAdvice += "• Continuously learn and adapt to industry changes\n"
      personalizedAdvice += "• Build strong relationships across your organization\n"
      personalizedAdvice += "• Set clear career goals and review them regularly\n"
      personalizedAdvice += "• Don't be afraid to take calculated risks\n"
      
      return {
        id: this.generateId(),
        text: personalizedAdvice,
        sender: 'bot',
        timestamp: new Date(),
        type: 'career_advice'
      }
    } catch (error) {
      return this.getDefaultResponse()
    }
  }

  /**
   * Get default response for unknown intents
   */
  private static getDefaultResponse(): ChatMessage {
    const responses = [
      "I'm here to help with your job search and career development! I can assist with finding jobs, resume tips, interview preparation, salary negotiation, and career advice. What would you like to know?",
      "Great question! I specialize in helping with job searches, career guidance, resume optimization, and interview prep. How can I assist you today?",
      "I'm your AI career assistant! I can help you find jobs, improve your resume, prepare for interviews, or provide career advice. What's on your mind?",
    ]
    
    return {
      id: this.generateId(),
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  }

  /**
   * Get error response
   */
  private static getErrorResponse(): ChatMessage {
    return {
      id: this.generateId(),
      text: "I apologize, but I'm having trouble processing your request right now. Please try again, or feel free to ask me about job searching, resume tips, or career advice!",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  }

  // Helper methods
  private static containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword))
  }

  private static extractJobSearchParams(message: string): Record<string, any> {
    // Extract location, job type, etc. from message
    // This is a simplified implementation
    return {}
  }

  private static extractResumeParams(message: string): Record<string, any> {
    return {}
  }

  private static extractInterviewParams(message: string): Record<string, any> {
    return {}
  }

  private static extractSalaryParams(message: string): Record<string, any> {
    return {}
  }

  private static extractCareerParams(message: string): Record<string, any> {
    return {}
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
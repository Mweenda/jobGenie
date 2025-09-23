import { geminiFlash, geminiPro } from '@/lib/firebase'
import type { Job } from '@/components/shared/JobCard'

export class GeminiAIService {
  /**
   * Generate a personalized cover letter using Gemini Flash
   */
  static async generateCoverLetter(
    job: Job, 
    candidateProfile: {
      name: string
      experience: string
      skills: string[]
      background: string
    }
  ): Promise<string> {
    try {
      const prompt = `
        Generate a professional cover letter for the following job application:
        
        Job Details:
        - Position: ${job.title}
        - Company: ${job.company}
        - Location: ${job.location}
        - Requirements: ${job.description || 'Not specified'}
        - Required Skills: ${job.skills.join(', ')}
        
        Candidate Profile:
        - Name: ${candidateProfile.name}
        - Experience: ${candidateProfile.experience}
        - Skills: ${candidateProfile.skills.join(', ')}
        - Background: ${candidateProfile.background}
        
        Instructions:
        1. Write a compelling, personalized cover letter
        2. Highlight relevant skills and experience
        3. Show enthusiasm for the role and company
        4. Keep it professional and concise (3-4 paragraphs)
        5. Include a strong opening and closing
        
        Format: Professional business letter format
      `

      const result = await geminiFlash!.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating cover letter:', error)
      throw new Error('Failed to generate cover letter. Please try again.')
    }
  }

  /**
   * Analyze job compatibility using Gemini Pro
   */
  static async analyzeJobCompatibility(
    job: Job,
    candidateProfile: {
      skills: string[]
      experience: string
      preferences: {
        remote: boolean
        salaryRange?: string
        location?: string
      }
    }
  ): Promise<{
    compatibilityScore: number
    strengths: string[]
    gaps: string[]
    recommendations: string[]
    summary: string
  }> {
    try {
      const prompt = `
        Analyze job compatibility between the candidate and job posting:
        
        Job Details:
        - Position: ${job.title}
        - Company: ${job.company}
        - Location: ${job.location}
        - Remote: ${job.remote ? 'Yes' : 'No'}
        - Salary: ${job.salary || 'Not specified'}
        - Required Skills: ${job.skills.join(', ')}
        - Description: ${job.description || 'Not specified'}
        
        Candidate Profile:
        - Skills: ${candidateProfile.skills.join(', ')}
        - Experience: ${candidateProfile.experience}
        - Remote Preference: ${candidateProfile.preferences.remote ? 'Yes' : 'No'}
        - Salary Expectation: ${candidateProfile.preferences.salaryRange || 'Not specified'}
        - Location Preference: ${candidateProfile.preferences.location || 'Flexible'}
        
        Please provide a detailed analysis in JSON format:
        {
          "compatibilityScore": number (0-100),
          "strengths": ["strength1", "strength2", ...],
          "gaps": ["gap1", "gap2", ...],
          "recommendations": ["recommendation1", "recommendation2", ...],
          "summary": "Brief overall assessment"
        }
        
        Consider skills match, experience level, location/remote preferences, and salary alignment.
      `

      const result = await geminiPro!.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        return JSON.parse(text)
      } catch {
        // Fallback if JSON parsing fails
        return {
          compatibilityScore: 75,
          strengths: ['Relevant experience', 'Good skill match'],
          gaps: ['Some skills need development'],
          recommendations: ['Consider highlighting transferable skills'],
          summary: text.substring(0, 200) + '...'
        }
      }
    } catch (error) {
      console.error('Error analyzing job compatibility:', error)
      throw new Error('Failed to analyze job compatibility. Please try again.')
    }
  }

  /**
   * Generate interview preparation questions using Gemini Flash
   */
  static async generateInterviewQuestions(job: Job): Promise<{
    technical: string[]
    behavioral: string[]
    companySpecific: string[]
    tips: string[]
  }> {
    try {
      const prompt = `
        Generate interview preparation questions for this job:
        
        Job Details:
        - Position: ${job.title}
        - Company: ${job.company}
        - Required Skills: ${job.skills.join(', ')}
        - Description: ${job.description || 'Not specified'}
        
        Generate questions in JSON format:
        {
          "technical": ["technical question 1", "technical question 2", ...],
          "behavioral": ["behavioral question 1", "behavioral question 2", ...],
          "companySpecific": ["company question 1", "company question 2", ...],
          "tips": ["tip 1", "tip 2", ...]
        }
        
        Include:
        - 5-7 technical questions relevant to the role
        - 4-5 behavioral questions
        - 3-4 company-specific questions
        - 5-6 preparation tips
      `

      const result = await geminiFlash!.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        return JSON.parse(text)
      } catch {
        // Fallback if JSON parsing fails
        return {
          technical: [
            `What experience do you have with ${job.skills[0] || 'the required technologies'}?`,
            `How would you approach solving problems in ${job.title}?`
          ],
          behavioral: [
            'Tell me about a challenging project you worked on',
            'How do you handle tight deadlines?'
          ],
          companySpecific: [
            `Why do you want to work at ${job.company}?`,
            'What interests you about this role?'
          ],
          tips: [
            'Research the company thoroughly',
            'Prepare specific examples from your experience',
            'Practice explaining technical concepts clearly'
          ]
        }
      }
    } catch (error) {
      console.error('Error generating interview questions:', error)
      throw new Error('Failed to generate interview questions. Please try again.')
    }
  }

  /**
   * Optimize resume bullet points using Gemini Flash
   */
  static async optimizeResumeBullets(
    currentBullets: string[],
    targetJob: Job
  ): Promise<{
    optimizedBullets: string[]
    suggestions: string[]
    keywordsAdded: string[]
  }> {
    try {
      const prompt = `
        Optimize these resume bullet points for the target job:
        
        Current Bullets:
        ${currentBullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}
        
        Target Job:
        - Position: ${targetJob.title}
        - Company: ${targetJob.company}
        - Required Skills: ${targetJob.skills.join(', ')}
        - Description: ${targetJob.description || 'Not specified'}
        
        Please optimize in JSON format:
        {
          "optimizedBullets": ["optimized bullet 1", "optimized bullet 2", ...],
          "suggestions": ["suggestion 1", "suggestion 2", ...],
          "keywordsAdded": ["keyword 1", "keyword 2", ...]
        }
        
        Guidelines:
        - Use action verbs and quantify achievements
        - Include relevant keywords from the job posting
        - Maintain truthfulness while improving impact
        - Focus on results and value delivered
      `

      const result = await geminiFlash!.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        return JSON.parse(text)
      } catch {
        // Fallback if JSON parsing fails
        return {
          optimizedBullets: currentBullets,
          suggestions: ['Consider adding more specific metrics', 'Include relevant keywords'],
          keywordsAdded: targetJob.skills.slice(0, 3)
        }
      }
    } catch (error) {
      console.error('Error optimizing resume bullets:', error)
      throw new Error('Failed to optimize resume bullets. Please try again.')
    }
  }

  /**
   * Generate job search insights using Gemini Pro
   */
  static async generateJobSearchInsights(
    recentJobs: Job[],
    userProfile: {
      skills: string[]
      experience: string
      goals: string
    }
  ): Promise<{
    marketTrends: string[]
    skillGaps: string[]
    recommendations: string[]
    opportunityScore: number
    summary: string
  }> {
    try {
      const prompt = `
        Analyze job market trends and provide insights based on recent job postings:
        
        Recent Jobs Applied/Viewed:
        ${recentJobs.map(job => `
        - ${job.title} at ${job.company}
        - Skills: ${job.skills.join(', ')}
        - Location: ${job.location}
        `).join('\n')}
        
        User Profile:
        - Skills: ${userProfile.skills.join(', ')}
        - Experience: ${userProfile.experience}
        - Goals: ${userProfile.goals}
        
        Provide insights in JSON format:
        {
          "marketTrends": ["trend 1", "trend 2", ...],
          "skillGaps": ["skill gap 1", "skill gap 2", ...],
          "recommendations": ["recommendation 1", "recommendation 2", ...],
          "opportunityScore": number (0-100),
          "summary": "Overall market assessment"
        }
        
        Focus on actionable insights for career development.
      `

      const result = await geminiPro!.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        return JSON.parse(text)
      } catch {
        // Fallback if JSON parsing fails
        return {
          marketTrends: ['Remote work continues to grow', 'AI skills in high demand'],
          skillGaps: ['Consider learning cloud technologies'],
          recommendations: ['Focus on building portfolio projects'],
          opportunityScore: 80,
          summary: 'Strong market opportunities in your field'
        }
      }
    } catch (error) {
      console.error('Error generating job search insights:', error)
      throw new Error('Failed to generate job search insights. Please try again.')
    }
  }
}

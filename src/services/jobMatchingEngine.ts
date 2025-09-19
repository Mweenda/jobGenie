/**
 * JobGenie Job Matching Engine
 * Intelligent job matching system with multiple phases
 */

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'remote'
  salary?: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  description: string
  requirements: string[]
  posted: Date
  source: 'linkedin' | 'internal' | 'api'
}

export interface UserProfile {
  skills: string[]
  experience: {
    level: 'entry' | 'mid' | 'senior' | 'executive'
    years: number
  }
  location: {
    city: string
    state: string
    remote: boolean
  }
  salary: {
    min: number
    max: number
    currency: string
  }
  jobTypes: ('full-time' | 'part-time' | 'contract' | 'remote')[]
  preferences: {
    industries: string[]
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  }
}

export interface JobMatch {
  job: Job
  score: number
  breakdown: {
    skills: number
    experience: number
    location: number
    salary: number
    type: number
  }
  reasoning: string[]
}

export class JobMatchingEngine {
  /**
   * Phase 1: Basic Keyword + Profile Matching
   */
  static calculateBasicMatch(job: Job, profile: UserProfile): number {
    let score = 0
    let factors = 0

    // Skills matching (40% weight)
    const skillsMatch = this.calculateSkillsMatch(job.skills, profile.skills)
    score += skillsMatch * 0.4
    factors++

    // Location matching (20% weight)
    const locationMatch = this.calculateLocationMatch(job, profile)
    score += locationMatch * 0.2
    factors++

    // Job type matching (20% weight)
    const typeMatch = this.calculateTypeMatch(job, profile)
    score += typeMatch * 0.2
    factors++

    // Salary matching (20% weight)
    if (job.salary && profile.salary) {
      const salaryMatch = this.calculateSalaryMatch(job.salary, profile.salary)
      score += salaryMatch * 0.2
      factors++
    }

    return Math.round((score / factors) * 100)
  }

  /**
   * Phase 2: Advanced Weighted Scoring Algorithm
   */
  static calculateAdvancedMatch(job: Job, profile: UserProfile): JobMatch {
    const skillsScore = this.calculateSkillsMatch(job.skills, profile.skills)
    const experienceScore = this.calculateExperienceMatch(job, profile)
    const locationScore = this.calculateLocationMatch(job, profile)
    const salaryScore = job.salary && profile.salary 
      ? this.calculateSalaryMatch(job.salary, profile.salary) 
      : 0.7 // Default neutral score
    const typeScore = this.calculateTypeMatch(job, profile)

    // Weighted scoring
    const weights = {
      skills: 0.35,
      experience: 0.25,
      location: 0.15,
      salary: 0.15,
      type: 0.10
    }

    const totalScore = 
      (skillsScore * weights.skills) +
      (experienceScore * weights.experience) +
      (locationScore * weights.location) +
      (salaryScore * weights.salary) +
      (typeScore * weights.type)

    const reasoning = this.generateReasoning({
      skills: skillsScore,
      experience: experienceScore,
      location: locationScore,
      salary: salaryScore,
      type: typeScore
    }, job, profile)

    return {
      job,
      score: Math.round(totalScore * 100),
      breakdown: {
        skills: Math.round(skillsScore * 100),
        experience: Math.round(experienceScore * 100),
        location: Math.round(locationScore * 100),
        salary: Math.round(salaryScore * 100),
        type: Math.round(typeScore * 100)
      },
      reasoning
    }
  }

  /**
   * Skills Matching using Jaccard Similarity
   */
  private static calculateSkillsMatch(jobSkills: string[], userSkills: string[]): number {
    if (!jobSkills.length || !userSkills.length) return 0

    const jobSkillsLower = jobSkills.map(s => s.toLowerCase())
    const userSkillsLower = userSkills.map(s => s.toLowerCase())

    const intersection = jobSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    )

    const union = [...new Set([...jobSkillsLower, ...userSkillsLower])]
    
    return intersection.length / union.length
  }

  /**
   * Experience Level Matching
   */
  private static calculateExperienceMatch(job: Job, profile: UserProfile): number {
    const experienceMap = {
      'entry': { min: 0, max: 2 },
      'mid': { min: 2, max: 5 },
      'senior': { min: 5, max: 10 },
      'executive': { min: 10, max: 20 }
    }

    // Extract experience requirements from job description/requirements
    const jobExperienceLevel = this.extractExperienceLevel(job)
    const userYears = profile.experience.years

    if (!jobExperienceLevel) return 0.7 // Neutral score if can't determine

    const jobRange = experienceMap[jobExperienceLevel]
    
    if (userYears >= jobRange.min && userYears <= jobRange.max) {
      return 1.0 // Perfect match
    } else if (userYears < jobRange.min) {
      // Under-qualified
      const deficit = jobRange.min - userYears
      return Math.max(0.3, 1 - (deficit * 0.2))
    } else {
      // Over-qualified
      const excess = userYears - jobRange.max
      return Math.max(0.6, 1 - (excess * 0.1))
    }
  }

  /**
   * Location Matching
   */
  private static calculateLocationMatch(job: Job, profile: UserProfile): number {
    // Remote jobs always match if user accepts remote
    if (job.type === 'remote' && profile.location.remote) {
      return 1.0
    }

    // If user only wants remote and job isn't remote
    if (profile.location.remote && job.type !== 'remote') {
      return 0.2
    }

    // Location-based matching
    if (job.location.toLowerCase().includes(profile.location.city.toLowerCase()) ||
        job.location.toLowerCase().includes(profile.location.state.toLowerCase())) {
      return 1.0
    }

    // Same state but different city
    if (job.location.toLowerCase().includes(profile.location.state.toLowerCase())) {
      return 0.7
    }

    return 0.3 // Different location
  }

  /**
   * Salary Range Matching
   */
  private static calculateSalaryMatch(jobSalary: Job['salary'], profileSalary: UserProfile['salary']): number {
    if (!jobSalary || !profileSalary) return 0.7

    const jobMid = (jobSalary.min + jobSalary.max) / 2
    const profileMid = (profileSalary.min + profileSalary.max) / 2

    // Calculate percentage difference
    const difference = Math.abs(jobMid - profileMid) / profileMid
    
    if (difference <= 0.1) return 1.0 // Within 10%
    if (difference <= 0.2) return 0.8 // Within 20%
    if (difference <= 0.3) return 0.6 // Within 30%
    if (difference <= 0.5) return 0.4 // Within 50%
    
    return 0.2 // More than 50% difference
  }

  /**
   * Job Type Matching
   */
  private static calculateTypeMatch(job: Job, profile: UserProfile): number {
    return profile.jobTypes.includes(job.type) ? 1.0 : 0.3
  }

  /**
   * Extract experience level from job description
   */
  private static extractExperienceLevel(job: Job): UserProfile['experience']['level'] | null {
    const text = (job.description + ' ' + job.requirements.join(' ')).toLowerCase()

    if (text.includes('entry') || text.includes('junior') || text.includes('0-2 years')) {
      return 'entry'
    }
    if (text.includes('senior') || text.includes('lead') || text.includes('5+ years')) {
      return 'senior'
    }
    if (text.includes('executive') || text.includes('director') || text.includes('vp') || text.includes('10+ years')) {
      return 'executive'
    }
    if (text.includes('mid') || text.includes('3-5 years') || text.includes('2-4 years')) {
      return 'mid'
    }

    return null
  }

  /**
   * Generate human-readable reasoning
   */
  private static generateReasoning(scores: Record<string, number>, _job: Job, _profile: UserProfile): string[] {
    const reasoning: string[] = []

    if (scores.skills > 0.8) {
      reasoning.push(`🎯 Excellent skills match - you have most required skills`)
    } else if (scores.skills > 0.6) {
      reasoning.push(`✅ Good skills match - you meet many requirements`)
    } else if (scores.skills > 0.4) {
      reasoning.push(`⚠️ Partial skills match - some learning may be required`)
    }

    if (scores.location > 0.9) {
      reasoning.push(`📍 Perfect location match`)
    } else if (scores.location < 0.4) {
      reasoning.push(`📍 Location may require relocation or remote work`)
    }

    if (scores.salary > 0.8) {
      reasoning.push(`💰 Salary aligns with your expectations`)
    } else if (scores.salary < 0.4) {
      reasoning.push(`💰 Salary may be outside your preferred range`)
    }

    if (scores.experience > 0.8) {
      reasoning.push(`🎓 Your experience level is ideal for this role`)
    } else if (scores.experience < 0.5) {
      reasoning.push(`🎓 Experience level may need consideration`)
    }

    return reasoning
  }

  /**
   * Batch process multiple jobs
   */
  static processJobMatches(jobs: Job[], profile: UserProfile): JobMatch[] {
    return jobs
      .map(job => this.calculateAdvancedMatch(job, profile))
      .sort((a, b) => b.score - a.score) // Sort by score descending
  }

  /**
   * Filter jobs by minimum match score
   */
  static filterByMinScore(matches: JobMatch[], minScore: number = 60): JobMatch[] {
    return matches.filter(match => match.score >= minScore)
  }
}

/**
 * Enhanced Job Matching Engine V2
 * Implements explainable matching with component-based scoring
 * Based on LinkedIn, Indeed, and modern job platform algorithms
 */

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  headline?: string
  location?: string
  skills: UserSkill[]
  experience: WorkExperience[]
  education: Education[]
  preferences: JobPreferences
  salaryExpectation?: SalaryRange
}

export interface UserSkill {
  name: string
  level: 1 | 2 | 3 | 4 | 5 // 1=Beginner, 5=Expert
  category: 'technical' | 'soft' | 'industry' | 'language'
  endorsements?: number
  yearsExperience?: number
}

export interface WorkExperience {
  id: string
  title: string
  company: string
  location?: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description?: string
  skills?: string[]
}

export interface Education {
  id: string
  school: string
  degree?: string
  fieldOfStudy?: string
  startDate?: Date
  endDate?: Date
  gpa?: number
}

export interface JobPreferences {
  jobTypes: JobType[]
  locations: string[]
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible'
  salaryRange?: SalaryRange
  industries: string[]
  companySizes: CompanySize[]
}

export interface Job {
  id: string
  title: string
  company: {
    id: string
    name: string
    size: CompanySize
    industry: string
    logo?: string
    location: string
    description?: string
  }
  location: string
  isRemote: boolean
  isHybrid: boolean
  jobType: JobType
  salaryRange?: SalaryRange
  requiredSkills: string[]
  preferredSkills?: string[]
  experienceLevel: ExperienceLevel
  description: string
  requirements: string[]
  benefits?: string[]
  postedDate: Date
  applicationDeadline?: Date
  applicationUrl: string
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive'

export interface SalaryRange {
  min: number
  max: number
  currency: string
  period: 'hourly' | 'monthly' | 'yearly'
}

export interface JobMatch {
  job: Job
  overallScore: number // 0-100
  confidence: 'high' | 'medium' | 'low'
  components: MatchComponents
  reasoning: string
  recommendationTags: string[]
}

export interface MatchComponents {
  skills: SkillsMatch
  experience: ExperienceMatch
  location: LocationMatch
  salary: SalaryMatch
  preferences: PreferencesMatch
}

export interface SkillsMatch {
  score: number // 0-100
  matchedSkills: MatchedSkill[]
  missingSkills: string[]
  totalRequired: number
  totalMatched: number
  skillsGap: string[]
}

export interface MatchedSkill {
  skill: string
  userLevel: number
  requiredLevel: number
  match: 'exact' | 'above' | 'below' | 'related'
}

export interface ExperienceMatch {
  score: number // 0-100
  userYears: number
  requiredYears: number
  levelMatch: 'exact' | 'above' | 'below'
  relevantExperience: WorkExperience[]
}

export interface LocationMatch {
  score: number // 0-100
  distance?: number // km
  remoteCompatible: boolean
  userPreference: string
  jobLocation: string
}

export interface SalaryMatch {
  score: number // 0-100
  userRange?: SalaryRange
  jobRange?: SalaryRange
  alignment: 'above' | 'within' | 'below' | 'unknown'
}

export interface PreferencesMatch {
  score: number // 0-100
  jobType: boolean
  industry: boolean
  companySize: boolean
  remotePreference: boolean
}

export class JobMatchingEngineV2 {
  private static readonly WEIGHTS = {
    skills: 0.40,      // 40% - Most important
    experience: 0.25,  // 25% - Second most important
    location: 0.15,    // 15% - Important for many
    salary: 0.10,      // 10% - Nice to have
    preferences: 0.10  // 10% - User preferences
  }

  private static readonly SKILL_SIMILARITY_THRESHOLD = 0.7
  // private static readonly LOCATION_MAX_DISTANCE = 50 // km

  /**
   * Calculate comprehensive job match with explainable components
   */
  static calculateJobMatch(userProfile: UserProfile, job: Job): JobMatch {
    const components = this.calculateMatchComponents(userProfile, job)
    const overallScore = this.calculateOverallScore(components)
    const confidence = this.determineConfidence(components, userProfile, job)
    const reasoning = this.generateReasoning(components, userProfile, job)
    const recommendationTags = this.generateRecommendationTags(components, job)

    return {
      job,
      overallScore: Math.round(overallScore),
      confidence,
      components,
      reasoning,
      recommendationTags
    }
  }

  /**
   * Calculate all match components
   */
  private static calculateMatchComponents(userProfile: UserProfile, job: Job): MatchComponents {
    return {
      skills: this.calculateSkillsMatch(userProfile, job),
      experience: this.calculateExperienceMatch(userProfile, job),
      location: this.calculateLocationMatch(userProfile, job),
      salary: this.calculateSalaryMatch(userProfile, job),
      preferences: this.calculatePreferencesMatch(userProfile, job)
    }
  }

  /**
   * Calculate skills matching with detailed breakdown
   */
  private static calculateSkillsMatch(userProfile: UserProfile, job: Job): SkillsMatch {
    const userSkills = userProfile.skills
    const requiredSkills = job.requiredSkills
    const preferredSkills = job.preferredSkills || []
    // const allJobSkills = [...requiredSkills, ...preferredSkills]

    const matchedSkills: MatchedSkill[] = []
    const missingSkills: string[] = []

    // Check each required skill
    for (const requiredSkill of requiredSkills) {
      const userSkill = this.findMatchingSkill(userSkills, requiredSkill)
      
      if (userSkill) {
        matchedSkills.push({
          skill: requiredSkill,
          userLevel: userSkill.level,
          requiredLevel: this.inferRequiredSkillLevel(job.experienceLevel),
          match: this.determineSkillMatch(userSkill.level, this.inferRequiredSkillLevel(job.experienceLevel))
        })
      } else {
        missingSkills.push(requiredSkill)
      }
    }

    // Check preferred skills for bonus points
    for (const preferredSkill of preferredSkills) {
      const userSkill = this.findMatchingSkill(userSkills, preferredSkill)
      if (userSkill && !matchedSkills.find(m => m.skill === preferredSkill)) {
        matchedSkills.push({
          skill: preferredSkill,
          userLevel: userSkill.level,
          requiredLevel: 3, // Preferred skills assumed mid-level
          match: this.determineSkillMatch(userSkill.level, 3)
        })
      }
    }

    // Calculate score
    const requiredMatches = matchedSkills.filter(m => requiredSkills.includes(m.skill))
    const baseScore = requiredSkills.length > 0 ? (requiredMatches.length / requiredSkills.length) * 100 : 0
    
    // Bonus for preferred skills
    const preferredMatches = matchedSkills.filter(m => preferredSkills.includes(m.skill))
    const bonusScore = Math.min(preferredMatches.length * 5, 20) // Max 20% bonus
    
    // Penalty for skill level mismatches
    const levelPenalty = this.calculateSkillLevelPenalty(matchedSkills)
    
    const finalScore = Math.max(0, Math.min(100, baseScore + bonusScore - levelPenalty))

    return {
      score: Math.round(finalScore),
      matchedSkills,
      missingSkills,
      totalRequired: requiredSkills.length,
      totalMatched: requiredMatches.length,
      skillsGap: missingSkills
    }
  }

  /**
   * Calculate experience matching
   */
  private static calculateExperienceMatch(userProfile: UserProfile, job: Job): ExperienceMatch {
    const userYears = this.calculateTotalExperience(userProfile.experience)
    const requiredYears = this.getRequiredYearsForLevel(job.experienceLevel)
    const relevantExperience = this.findRelevantExperience(userProfile.experience, job)

    let score = 0
    let levelMatch: 'exact' | 'above' | 'below' = 'exact'

    if (userYears >= requiredYears) {
      // User meets or exceeds requirements
      const ratio = Math.min(userYears / requiredYears, 2) // Cap at 2x
      score = Math.min(100, 50 + (ratio - 1) * 50)
      levelMatch = userYears > requiredYears * 1.5 ? 'above' : 'exact'
    } else {
      // User below requirements
      score = (userYears / requiredYears) * 50
      levelMatch = 'below'
    }

    // Bonus for relevant experience
    if (relevantExperience.length > 0) {
      const relevantYears = this.calculateTotalExperience(relevantExperience)
      const relevantBonus = Math.min((relevantYears / userYears) * 20, 20)
      score += relevantBonus
    }

    return {
      score: Math.round(Math.min(100, score)),
      userYears,
      requiredYears,
      levelMatch,
      relevantExperience
    }
  }

  /**
   * Calculate location matching
   */
  private static calculateLocationMatch(userProfile: UserProfile, job: Job): LocationMatch {
    const userLocation = userProfile.location || ''
    const jobLocation = job.location
    const remoteCompatible = job.isRemote || job.isHybrid

    let score = 0
    let distance: number | undefined

    // If job is remote and user is open to remote
    if (remoteCompatible && userProfile.preferences.remotePreference !== 'onsite') {
      score = 100
    } else if (userProfile.preferences.remotePreference === 'remote' && !remoteCompatible) {
      // User wants remote but job isn't
      score = 20
    } else {
      // Calculate location similarity
      distance = this.calculateLocationDistance(userLocation, jobLocation)
      
      if (distance === undefined) {
        // Can't determine distance, use fuzzy matching
        score = this.fuzzyLocationMatch(userLocation, jobLocation)
      } else {
        // Distance-based scoring
        if (distance <= 10) score = 100
        else if (distance <= 25) score = 80
        else if (distance <= 50) score = 60
        else if (distance <= 100) score = 40
        else score = 20
      }
    }

    return {
      score: Math.round(score),
      distance,
      remoteCompatible,
      userPreference: userProfile.preferences.remotePreference,
      jobLocation
    }
  }

  /**
   * Calculate salary matching
   */
  private static calculateSalaryMatch(userProfile: UserProfile, job: Job): SalaryMatch {
    const userRange = userProfile.salaryExpectation
    const jobRange = job.salaryRange

    if (!userRange || !jobRange) {
      return {
        score: 50, // Neutral score when salary info is missing
        userRange,
        jobRange,
        alignment: 'unknown'
      }
    }

    // Normalize to yearly USD for comparison
    const userYearly = this.normalizeToYearly(userRange)
    const jobYearly = this.normalizeToYearly(jobRange)

    let score = 0
    let alignment: 'above' | 'within' | 'below' | 'unknown' = 'unknown'

    // Check if ranges overlap
    if (jobYearly.max >= userYearly.min && jobYearly.min <= userYearly.max) {
      // Ranges overlap
      score = 100
      alignment = 'within'
    } else if (jobYearly.min > userYearly.max) {
      // Job pays more than user expects
      const excess = jobYearly.min - userYearly.max
      const relativeExcess = excess / userYearly.max
      score = Math.min(100, 80 + relativeExcess * 20) // Bonus for higher pay
      alignment = 'above'
    } else {
      // Job pays less than user expects
      const shortfall = userYearly.min - jobYearly.max
      const relativeShortfall = shortfall / userYearly.min
      score = Math.max(0, 100 - relativeShortfall * 100)
      alignment = 'below'
    }

    return {
      score: Math.round(score),
      userRange,
      jobRange,
      alignment
    }
  }

  /**
   * Calculate preferences matching
   */
  private static calculatePreferencesMatch(userProfile: UserProfile, job: Job): PreferencesMatch {
    const prefs = userProfile.preferences
    let score = 0
    let matches = 0
    let total = 0

    // Job type match
    if (prefs.jobTypes.includes(job.jobType)) {
      matches++
      score += 25
    }
    total++

    // Industry match
    if (prefs.industries.includes(job.company.industry)) {
      matches++
      score += 25
    }
    total++

    // Company size match
    if (prefs.companySizes.includes(job.company.size)) {
      matches++
      score += 25
    }
    total++

    // Remote preference match
    const remoteMatch = this.checkRemotePreferenceMatch(prefs.remotePreference, job)
    if (remoteMatch) {
      matches++
      score += 25
    }
    total++

    return {
      score: Math.round(score),
      jobType: prefs.jobTypes.includes(job.jobType),
      industry: prefs.industries.includes(job.company.industry),
      companySize: prefs.companySizes.includes(job.company.size),
      remotePreference: remoteMatch
    }
  }

  /**
   * Calculate weighted overall score
   */
  private static calculateOverallScore(components: MatchComponents): number {
    return (
      components.skills.score * this.WEIGHTS.skills +
      components.experience.score * this.WEIGHTS.experience +
      components.location.score * this.WEIGHTS.location +
      components.salary.score * this.WEIGHTS.salary +
      components.preferences.score * this.WEIGHTS.preferences
    )
  }

  /**
   * Determine confidence level
   */
  private static determineConfidence(
    components: MatchComponents, 
    userProfile: UserProfile, 
    _job: Job
  ): 'high' | 'medium' | 'low' {
    const skillsScore = components.skills.score
    const experienceScore = components.experience.score
    const hasCompleteProfile = userProfile.skills.length >= 3 && userProfile.experience.length >= 1
    // const hasCompleteSalary = userProfile.salaryExpectation && job.salaryRange

    if (skillsScore >= 80 && experienceScore >= 70 && hasCompleteProfile) {
      return 'high'
    } else if (skillsScore >= 60 && experienceScore >= 50) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * Generate human-readable reasoning
   */
  private static generateReasoning(
    components: MatchComponents, 
    _userProfile: UserProfile, 
    _job: Job
  ): string {
    const reasons: string[] = []

    // Skills reasoning
    if (components.skills.score >= 80) {
      reasons.push(`Strong skills match (${components.skills.totalMatched}/${components.skills.totalRequired} required skills)`)
    } else if (components.skills.score >= 60) {
      reasons.push(`Good skills match with room to grow`)
    } else {
      reasons.push(`Skills gap exists - great learning opportunity`)
    }

    // Experience reasoning
    if (components.experience.levelMatch === 'exact') {
      reasons.push(`Perfect experience level fit`)
    } else if (components.experience.levelMatch === 'above') {
      reasons.push(`Overqualified - could be a leadership opportunity`)
    } else {
      reasons.push(`Growth opportunity to advance your career`)
    }

    // Location reasoning
    if (components.location.score >= 90) {
      if (components.location.remoteCompatible) {
        reasons.push(`Remote-friendly position`)
      } else {
        reasons.push(`Great location match`)
      }
    }

    // Salary reasoning
    if (components.salary.alignment === 'above') {
      reasons.push(`Salary exceeds your expectations`)
    } else if (components.salary.alignment === 'within') {
      reasons.push(`Salary aligns with your expectations`)
    }

    return reasons.join('. ') + '.'
  }

  /**
   * Generate recommendation tags
   */
  private static generateRecommendationTags(components: MatchComponents, job: Job): string[] {
    const tags: string[] = []

    if (components.skills.score >= 90) tags.push('Perfect Skills Match')
    else if (components.skills.score >= 70) tags.push('Strong Skills Match')
    
    if (components.experience.levelMatch === 'above') tags.push('Senior Opportunity')
    else if (components.experience.levelMatch === 'below') tags.push('Growth Opportunity')
    
    if (components.location.remoteCompatible) tags.push('Remote Friendly')
    if (components.salary.alignment === 'above') tags.push('High Compensation')
    
    if (job.postedDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      tags.push('Recently Posted')
    }

    return tags
  }

  // Helper methods
  private static findMatchingSkill(userSkills: UserSkill[], skillName: string): UserSkill | undefined {
    // Direct match
    const match = userSkills.find(s => 
      s.name.toLowerCase() === skillName.toLowerCase()
    )
    
    if (match) return match

    // Fuzzy match for similar skills
    return userSkills.find(s => 
      this.calculateStringSimilarity(s.name.toLowerCase(), skillName.toLowerCase()) > this.SKILL_SIMILARITY_THRESHOLD
    )
  }

  private static inferRequiredSkillLevel(experienceLevel: ExperienceLevel): number {
    switch (experienceLevel) {
      case 'entry': return 2
      case 'mid': return 3
      case 'senior': return 4
      case 'lead': return 5
      case 'executive': return 5
      default: return 3
    }
  }

  private static determineSkillMatch(userLevel: number, requiredLevel: number): 'exact' | 'above' | 'below' | 'related' {
    if (userLevel === requiredLevel) return 'exact'
    if (userLevel > requiredLevel) return 'above'
    return 'below'
  }

  private static calculateSkillLevelPenalty(matchedSkills: MatchedSkill[]): number {
    let penalty = 0
    for (const skill of matchedSkills) {
      if (skill.match === 'below') {
        penalty += (skill.requiredLevel - skill.userLevel) * 5
      }
    }
    return Math.min(penalty, 30) // Max 30% penalty
  }

  private static calculateTotalExperience(experience: WorkExperience[]): number {
    let totalMonths = 0
    for (const exp of experience) {
      const start = exp.startDate
      const end = exp.endDate || new Date()
      const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      totalMonths += months
    }
    return Math.round(totalMonths / 12 * 10) / 10 // Round to 1 decimal
  }

  private static getRequiredYearsForLevel(level: ExperienceLevel): number {
    switch (level) {
      case 'entry': return 0
      case 'mid': return 3
      case 'senior': return 6
      case 'lead': return 10
      case 'executive': return 15
      default: return 3
    }
  }

  private static findRelevantExperience(experience: WorkExperience[], job: Job): WorkExperience[] {
    return experience.filter(exp => {
      // Check if job title or skills are related
      const titleMatch = this.calculateStringSimilarity(
        exp.title.toLowerCase(), 
        job.title.toLowerCase()
      ) > 0.5
      
      const skillsMatch = exp.skills?.some(skill => 
        job.requiredSkills.some(reqSkill => 
          this.calculateStringSimilarity(skill.toLowerCase(), reqSkill.toLowerCase()) > 0.7
        )
      ) || false

      return titleMatch || skillsMatch
    })
  }

  private static calculateLocationDistance(_location1: string, _location2: string): number | undefined {
    // This would integrate with a geocoding service in production
    // For now, return undefined to trigger fuzzy matching
    return undefined
  }

  private static fuzzyLocationMatch(location1: string, location2: string): number {
    const similarity = this.calculateStringSimilarity(
      location1.toLowerCase(), 
      location2.toLowerCase()
    )
    return Math.round(similarity * 100)
  }

  private static normalizeToYearly(range: SalaryRange): SalaryRange {
    let multiplier = 1
    switch (range.period) {
      case 'hourly': multiplier = 2080; break // 40 hours/week * 52 weeks
      case 'monthly': multiplier = 12; break
      case 'yearly': multiplier = 1; break
    }

    return {
      min: range.min * multiplier,
      max: range.max * multiplier,
      currency: range.currency,
      period: 'yearly'
    }
  }

  private static checkRemotePreferenceMatch(preference: string, job: Job): boolean {
    switch (preference) {
      case 'remote': return job.isRemote
      case 'hybrid': return job.isHybrid || job.isRemote
      case 'onsite': return !job.isRemote
      case 'flexible': return true
      default: return true
    }
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity for now
    // In production, could use more sophisticated NLP similarity
    const set1 = new Set(str1.split(' '))
    const set2 = new Set(str2.split(' '))
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    return intersection.size / union.size
  }
}

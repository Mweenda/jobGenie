import { supabase } from '../lib/supabase'

export interface Job {
  id: string
  title: string
  description: string | null
  requirements: string[] | null
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  isRemote: boolean
  status: string
  postedAt: string
  expiresAt: string | null
  company: {
    id: string
    name: string
    logoUrl: string | null
    industry: string | null
    website: string | null
  }
  matchScore?: number
}

export interface JobSearchParams {
  query?: string
  location?: string
  jobType?: string
  salaryMin?: number
  salaryMax?: number
  remote?: boolean
  skills?: string[]
  page?: number
  limit?: number
}

export interface JobSearchResult {
  jobs: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Job service for managing job listings, search, and recommendations
 */
export class JobService {
  /**
   * Search for jobs with filters
   */
  static async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    try {
      const page = params.page || 1
      const limit = params.limit || 10
      const offset = (page - 1) * limit

      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies!inner (
            id,
            name,
            logo_url,
            industry,
            website
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('posted_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (params.query) {
        query = query.or(
          `title.ilike.%${params.query}%,description.ilike.%${params.query}%`
        )
      }

      if (params.location) {
        query = query.ilike('location', `%${params.location}%`)
      }

      if (params.jobType) {
        query = query.eq('job_type', params.jobType)
      }

      if (params.salaryMin) {
        query = query.gte('salary_min', params.salaryMin)
      }

      if (params.salaryMax) {
        query = query.lte('salary_max', params.salaryMax)
      }

      if (params.remote) {
        query = query.eq('is_remote', true)
      }

      const { data, error, count } = await query

      if (error) throw error

      const jobs: Job[] = (data || []).map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        jobType: job.job_type,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        isRemote: job.is_remote,
        status: job.status,
        postedAt: job.posted_at,
        expiresAt: job.expires_at,
        company: {
          id: job.companies.id,
          name: job.companies.name,
          logoUrl: job.companies.logo_url,
          industry: job.companies.industry,
          website: job.companies.website,
        }
      }))

      return {
        jobs,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Search jobs error:', error)
      throw error
    }
  }

  /**
   * Get job by ID
   */
  static async getJobById(jobId: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            website,
            description
          )
        `)
        .eq('id', jobId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        jobType: data.job_type,
        salaryMin: data.salary_min,
        salaryMax: data.salary_max,
        isRemote: data.is_remote,
        status: data.status,
        postedAt: data.posted_at,
        expiresAt: data.expires_at,
        company: {
          id: data.companies.id,
          name: data.companies.name,
          logoUrl: data.companies.logo_url,
          industry: data.companies.industry,
          website: data.companies.website,
        }
      }
    } catch (error) {
      console.error('Get job by ID error:', error)
      return null
    }
  }

  /**
   * Get AI-powered job recommendations for a user
   */
  static async getRecommendations(userId: string): Promise<Job[]> {
    try {
      // Get user profile and skills
      const { data: user } = await supabase
        .from('users')
        .select(`
          *,
          user_skills (skill_name, proficiency_level)
        `)
        .eq('id', userId)
        .single()

      if (!user) return []

      // Get all active jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            website
          )
        `)
        .eq('status', 'active')
        .order('posted_at', { ascending: false })
        .limit(50)

      if (!jobs) return []

      // Calculate match scores based on user skills and job requirements
      const userSkills = (user.user_skills || []).map((s: any) => s.skill_name.toLowerCase())
      
      const scoredJobs = jobs.map(job => {
        const jobRequirements = (job.requirements || []).map((r: string) => r.toLowerCase())
        const skillMatches = userSkills.filter(skill =>
          jobRequirements.some(req => req.includes(skill))
        ).length

        const matchScore = skillMatches / Math.max(jobRequirements.length, 1)

        return {
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          location: job.location,
          jobType: job.job_type,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          isRemote: job.is_remote,
          status: job.status,
          postedAt: job.posted_at,
          expiresAt: job.expires_at,
          company: {
            id: job.companies.id,
            name: job.companies.name,
            logoUrl: job.companies.logo_url,
            industry: job.companies.industry,
            website: job.companies.website,
          },
          matchScore
        }
      })

      // Sort by match score and return top 10
      return scoredJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10)
    } catch (error) {
      console.error('Get recommendations error:', error)
      return []
    }
  }

  /**
   * Save a job for later
   */
  static async saveJob(userId: string, jobId: string) {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: userId,
          job_id: jobId
        })

      if (error) throw error
    } catch (error) {
      console.error('Save job error:', error)
      throw error
    }
  }

  /**
   * Remove a saved job
   */
  static async unsaveJob(userId: string, jobId: string) {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId)

      if (error) throw error
    } catch (error) {
      console.error('Unsave job error:', error)
      throw error
    }
  }

  /**
   * Get user's saved jobs
   */
  static async getSavedJobs(userId: string): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          jobs (
            *,
            companies (
              id,
              name,
              logo_url,
              industry,
              website
            )
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => ({
        id: item.jobs.id,
        title: item.jobs.title,
        description: item.jobs.description,
        requirements: item.jobs.requirements,
        location: item.jobs.location,
        jobType: item.jobs.job_type,
        salaryMin: item.jobs.salary_min,
        salaryMax: item.jobs.salary_max,
        isRemote: item.jobs.is_remote,
        status: item.jobs.status,
        postedAt: item.jobs.posted_at,
        expiresAt: item.jobs.expires_at,
        company: {
          id: item.jobs.companies.id,
          name: item.jobs.companies.name,
          logoUrl: item.jobs.companies.logo_url,
          industry: item.jobs.companies.industry,
          website: item.jobs.companies.website,
        }
      }))
    } catch (error) {
      console.error('Get saved jobs error:', error)
      return []
    }
  }

  /**
   * Apply to a job
   */
  static async applyToJob(userId: string, jobId: string, coverLetter?: string) {
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          job_id: jobId,
          cover_letter: coverLetter,
          status: 'pending'
        })

      if (error) throw error
    } catch (error) {
      console.error('Apply to job error:', error)
      throw error
    }
  }

  /**
   * Get user's job applications
   */
  static async getUserApplications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            *,
            companies (
              id,
              name,
              logo_url,
              industry
            )
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get user applications error:', error)
      return []
    }
  }
}
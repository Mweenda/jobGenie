import { db } from '../lib/firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit
} from 'firebase/firestore'

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
  experienceLevel: string | null
  postedAt: string
  company: Company
  skills: string[]
  benefits: string[]
  applicationDeadline?: string
  applicationUrl?: string
  contactEmail?: string
}

export interface Company {
    id: string
    name: string
  logo?: string
  website?: string
  description?: string
  industry?: string
  size?: string
  location?: string
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted'
  appliedAt: string
  coverLetter?: string
  resumeUrl?: string
  notes?: string
}

export interface SavedJob {
  id: string
  jobId: string
  userId: string
  savedAt: string
}

export interface JobSearchFilters {
  query?: string
  location?: string
  jobType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  isRemote?: boolean
  skills?: string[]
  company?: string
}

export interface JobSearchParams extends JobSearchFilters {
  // Additional search parameters can be added here
}

export interface JobSearchResult {
  jobs: Job[]
  totalCount: number
  hasMore: boolean
}

/**
 * Job service using Firebase Firestore
 * Handles job listings, applications, and saved jobs
 */
export class JobService {
  /**
   * Get all jobs with optional filters
   */
  static async getJobs(filters: JobSearchFilters = {}, limit = 20): Promise<Job[]> {
    try {
      const jobsRef = collection(db, 'jobs')
      let jobQuery = query(jobsRef, orderBy('postedAt', 'desc'), firestoreLimit(limit))

      // Apply filters
      if (filters.jobType) {
        jobQuery = query(jobQuery, where('jobType', '==', filters.jobType))
      }
      if (filters.isRemote !== undefined) {
        jobQuery = query(jobQuery, where('isRemote', '==', filters.isRemote))
      }
      if (filters.experienceLevel) {
        jobQuery = query(jobQuery, where('experienceLevel', '==', filters.experienceLevel))
      }

      const querySnapshot = await getDocs(jobQuery)
      const jobs: Job[] = []

      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as Job)
      })

      return jobs
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  /**
   * Get a specific job by ID
   */
  static async getJobById(jobId: string): Promise<Job | null> {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', jobId))
      
      if (!jobDoc.exists()) {
        return null
      }

      return { id: jobDoc.id, ...jobDoc.data() } as Job
    } catch (error) {
      console.error('Error fetching job:', error)
      return null
    }
  }

  /**
   * Search jobs by query
   */
  static async searchJobs(searchQuery: string, filters: JobSearchFilters = {}): Promise<Job[]> {
    try {
      // For now, return all jobs and filter client-side
      // In production, you'd want to use Algolia or similar for full-text search
      const jobs = await this.getJobs(filters, 100)
      
      if (!searchQuery) return jobs

      const query = searchQuery.toLowerCase()
      return jobs.filter((job: Job) => 
        job.title.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.skills.some((skill: string) => skill.toLowerCase().includes(query))
      )
    } catch (error) {
      console.error('Error searching jobs:', error)
      return []
    }
  }

  /**
   * Get user's saved jobs
   */
  static async getSavedJobs(userId: string): Promise<Job[]> {
    try {
      const savedJobsRef = collection(db, 'saved_jobs')
      const savedJobsQuery = query(
        savedJobsRef, 
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
      )
      
      const savedJobsSnapshot = await getDocs(savedJobsQuery)
      const jobIds: string[] = []
      
      savedJobsSnapshot.forEach((doc) => {
        jobIds.push(doc.data().jobId)
      })

      // Fetch the actual job details
      const jobs: Job[] = []
      for (const jobId of jobIds) {
        const job = await this.getJobById(jobId)
        if (job) jobs.push(job)
      }

      return jobs
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      return []
    }
  }

  /**
   * Save a job for a user
   */
  static async saveJob(userId: string, jobId: string): Promise<void> {
    try {
      const savedJobsRef = collection(db, 'saved_jobs')
      
      // Check if already saved
      const existingQuery = query(
        savedJobsRef,
        where('userId', '==', userId),
        where('jobId', '==', jobId)
      )
      const existingSnapshot = await getDocs(existingQuery)
      
      if (!existingSnapshot.empty) {
        throw new Error('Job already saved')
      }

      await addDoc(savedJobsRef, {
        userId,
        jobId,
        savedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving job:', error)
      throw error
    }
  }

  /**
   * Remove a saved job
   */
  static async unsaveJob(userId: string, jobId: string): Promise<void> {
    try {
      const savedJobsRef = collection(db, 'saved_jobs')
      const savedJobQuery = query(
        savedJobsRef,
        where('userId', '==', userId),
        where('jobId', '==', jobId)
      )
      
      const savedJobSnapshot = await getDocs(savedJobQuery)
      
      savedJobSnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, 'saved_jobs', docSnapshot.id))
      })
    } catch (error) {
      console.error('Error removing saved job:', error)
      throw error
    }
  }

  /**
   * Apply to a job
   */
  static async applyToJob(
    userId: string, 
    jobId: string, 
    applicationData: Partial<JobApplication>
  ): Promise<void> {
    try {
      const applicationsRef = collection(db, 'applications')
      
      await addDoc(applicationsRef, {
        userId,
        jobId,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        ...applicationData
      })
    } catch (error) {
      console.error('Error applying to job:', error)
      throw error
    }
  }

  /**
   * Get user's job applications
   */
  static async getUserApplications(userId: string): Promise<JobApplication[]> {
    try {
      const applicationsRef = collection(db, 'applications')
      const applicationsQuery = query(
        applicationsRef,
        where('userId', '==', userId),
        orderBy('appliedAt', 'desc')
      )
      
      const applicationsSnapshot = await getDocs(applicationsQuery)
      const applications: JobApplication[] = []
      
      applicationsSnapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() } as JobApplication)
      })

      return applications
    } catch (error) {
      console.error('Error fetching applications:', error)
      return []
    }
  }

  /**
   * Get job recommendations for user (simplified)
   */
  static async getJobRecommendations(_userId: string, limit = 10): Promise<Job[]> {
    try {
      // For now, just return recent jobs
      // In production, you'd implement ML-based recommendations
      const jobs = await this.getJobs({}, limit)
      return jobs
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
  }

  /**
   * Alias for getJobRecommendations for backward compatibility
   */
  static async getRecommendations(userId: string, limit = 10): Promise<Job[]> {
    return this.getJobRecommendations(userId, limit)
  }
}
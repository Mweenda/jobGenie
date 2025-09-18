import { create } from 'zustand'
import { JobService, type Job, type JobSearchParams, type JobSearchResult } from '../services/jobService'

interface JobState {
  jobs: Job[]
  savedJobs: Job[]
  recommendations: Job[]
  currentJob: Job | null
  searchResults: JobSearchResult | null
  isLoading: boolean
  error: string | null
  
  // Actions
  searchJobs: (params: JobSearchParams) => Promise<void>
  getJobById: (jobId: string) => Promise<void>
  getRecommendations: (userId: string) => Promise<void>
  saveJob: (userId: string, jobId: string) => Promise<void>
  unsaveJob: (userId: string, jobId: string) => Promise<void>
  getSavedJobs: (userId: string) => Promise<void>
  applyToJob: (userId: string, jobId: string, coverLetter?: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

/**
 * Global job state management using Zustand
 */
export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  savedJobs: [],
  recommendations: [],
  currentJob: null,
  searchResults: null,
  isLoading: false,
  error: null,

  searchJobs: async (params: JobSearchParams) => {
    set({ isLoading: true, error: null })
    try {
      const results = await JobService.searchJobs(params)
      set({
        searchResults: results,
        jobs: results.jobs,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search jobs',
        isLoading: false
      })
    }
  },

  getJobById: async (jobId: string) => {
    set({ isLoading: true, error: null })
    try {
      const job = await JobService.getJobById(jobId)
      set({
        currentJob: job,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get job details',
        isLoading: false
      })
    }
  },

  getRecommendations: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const recommendations = await JobService.getRecommendations(userId)
      set({
        recommendations,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        isLoading: false
      })
    }
  },

  saveJob: async (userId: string, jobId: string) => {
    try {
      await JobService.saveJob(userId, jobId)
      // Refresh saved jobs
      await get().getSavedJobs(userId)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save job'
      })
    }
  },

  unsaveJob: async (userId: string, jobId: string) => {
    try {
      await JobService.unsaveJob(userId, jobId)
      // Remove from saved jobs list
      const { savedJobs } = get()
      set({
        savedJobs: savedJobs.filter(job => job.id !== jobId)
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to unsave job'
      })
    }
  },

  getSavedJobs: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const savedJobs = await JobService.getSavedJobs(userId)
      set({
        savedJobs,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get saved jobs',
        isLoading: false
      })
    }
  },

  applyToJob: async (userId: string, jobId: string, coverLetter?: string) => {
    try {
      await JobService.applyToJob(userId, jobId, coverLetter)
      // You might want to update the job status or show a success message
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to apply to job'
      })
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}))
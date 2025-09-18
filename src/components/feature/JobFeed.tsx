import { useState, useEffect } from 'react'
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Filter, Star, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useJobStore } from '../../store/jobStore'
import Button from '../base/Button'
import { formatSalary, formatJobType, truncateText } from '../../utils/format'
import { formatJobPostedDate } from '../../utils/date'

type FilterTab = 'recommended' | 'recent' | 'remote' | 'full-time' | 'saved'

interface JobFilters {
  location: string
  jobType: string
  salaryMin: string
  remote: boolean
}

export default function JobFeed() {
  const { user, isAuthenticated } = useAuth()
  const { 
    jobs, 
    recommendations, 
    savedJobs, 
    searchResults, 
    isLoading, 
    searchJobs, 
    getRecommendations, 
    saveJob, 
    unsaveJob,
    getSavedJobs 
  } = useJobStore()

  const [activeTab, setActiveTab] = useState<FilterTab>('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    jobType: '',
    salaryMin: '',
    remote: false
  })

  // Mock jobs for demo purposes (replace with real data)
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: { name: 'TechCorp Inc.', logoUrl: '🏢', industry: 'Technology' },
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 160000,
      jobType: 'full-time',
      isRemote: false,
      postedAt: '2024-01-15T10:00:00Z',
      description: 'We are looking for a senior frontend developer to join our team and help build the next generation of web applications.',
      requirements: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      matchScore: 0.92
    },
    {
      id: '2',
      title: 'Product Manager',
      company: { name: 'StartupXYZ', logoUrl: '🚀', industry: 'Fintech' },
      location: 'Remote',
      salaryMin: 100000,
      salaryMax: 140000,
      jobType: 'full-time',
      isRemote: true,
      postedAt: '2024-01-16T14:30:00Z',
      description: 'Join our product team to drive innovation and growth in the fintech space.',
      requirements: ['Product Management', 'Agile', 'Analytics'],
      matchScore: 0.85
    },
    {
      id: '3',
      title: 'UX Designer',
      company: { name: 'Design Studio', logoUrl: '🎨', industry: 'Design' },
      location: 'New York, NY',
      salaryMin: 80000,
      salaryMax: 110000,
      jobType: 'full-time',
      isRemote: false,
      postedAt: '2024-01-14T09:15:00Z',
      description: 'Create beautiful and intuitive user experiences for our clients.',
      requirements: ['Figma', 'User Research', 'Prototyping'],
      matchScore: 0.78
    },
    {
      id: '4',
      title: 'Machine Learning Engineer',
      company: { name: 'AI Innovations', logoUrl: '🤖', industry: 'AI/ML' },
      location: 'Seattle, WA',
      salaryMin: 130000,
      salaryMax: 180000,
      jobType: 'full-time',
      isRemote: true,
      postedAt: '2024-01-17T11:45:00Z',
      description: 'Build and deploy ML models at scale for our AI platform.',
      requirements: ['Python', 'TensorFlow', 'AWS', 'Docker'],
      matchScore: 0.95
    }
  ]

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isAuthenticated && user) {
      loadJobs()
    }
  }, [isAuthenticated, user, activeTab])

  const loadJobs = async () => {
    if (!user) return

    try {
      switch (activeTab) {
        case 'recommended':
          await getRecommendations(user.id)
          break
        case 'recent':
          await searchJobs({ page: 1, limit: 10 })
          break
        case 'remote':
          await searchJobs({ remote: true, page: 1, limit: 10 })
          break
        case 'full-time':
          await searchJobs({ jobType: 'full-time', page: 1, limit: 10 })
          break
        case 'saved':
          await getSavedJobs(user.id)
          break
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const handleSaveJob = async (jobId: string) => {
    if (!user) return

    try {
      if (savedJobIds.has(jobId)) {
        await unsaveJob(user.id, jobId)
        setSavedJobIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(jobId)
          return newSet
        })
      } else {
        await saveJob(user.id, jobId)
        setSavedJobIds(prev => new Set(prev).add(jobId))
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
    }
  }

  const applyFilters = async () => {
    const searchParams = {
      location: filters.location || undefined,
      jobType: filters.jobType || undefined,
      salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : undefined,
      remote: filters.remote || undefined,
      page: 1,
      limit: 10
    }
    
    await searchJobs(searchParams)
    setShowFilters(false)
  }

  const getDisplayJobs = () => {
    switch (activeTab) {
      case 'recommended':
        return recommendations.length > 0 ? recommendations : mockJobs.filter(job => job.matchScore > 0.8)
      case 'saved':
        return savedJobs
      case 'remote':
        return mockJobs.filter(job => job.isRemote)
      case 'full-time':
        return mockJobs.filter(job => job.jobType === 'full-time')
      default:
        return mockJobs
    }
  }

  const displayJobs = getDisplayJobs()

  const tabs = [
    { id: 'recommended', label: 'Recommended', icon: Star, count: recommendations.length || 4 },
    { id: 'recent', label: 'Recent', icon: Clock, count: jobs.length || 12 },
    { id: 'remote', label: 'Remote', icon: MapPin, count: 8 },
    { id: 'full-time', label: 'Full-time', icon: TrendingUp, count: 15 },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: savedJobs.length || 3 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Job Feed</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="City, State"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                placeholder="50000"
                value={filters.salaryMin}
                onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remote only</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        ) : (
          displayJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200">
              <div className="flex justify-between items-start">
                <div className="flex space-x-4 flex-1">
                  <div className="text-3xl">{job.company.logoUrl}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      {activeTab === 'recommended' && job.matchScore && (
                        <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 mr-1" />
                          {Math.round(job.matchScore * 100)}% match
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{job.company.name}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatJobPostedDate(job.postedAt)}
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-600 text-sm">
                      {truncateText(job.description, 150)}
                    </p>

                    {job.requirements && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.requirements.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{job.requirements.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => handleSaveJob(job.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {savedJobIds.has(job.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatJobType(job.jobType)}
                  </span>
                  {job.isRemote && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Remote
                    </span>
                  )}
                </div>
                <Button size="sm">Apply Now</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {displayJobs.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => {}}>
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  )
}
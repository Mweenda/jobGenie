/**
 * Personalized Job Feed Component
 * Displays ranked job recommendations with infinite scroll and filtering
 */

import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  DollarSign,
  Briefcase,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import SmartJobCard from './SmartJobCard'
import { UserProfile, Job, JobType, CompanySize } from '../../services/jobMatchingEngineV2'
import { JobMatchingEngineV2 } from '../../services/jobMatchingEngineV2'

interface JobFilters {
  searchQuery: string
  location: string
  remoteOnly: boolean
  jobTypes: JobType[]
  salaryMin?: number
  salaryMax?: number
  companySizes: CompanySize[]
  postedWithin: number // days
}

interface PersonalizedJobFeedProps {
  userProfile: UserProfile
  onSaveJob: (jobId: string) => void
  onUnsaveJob: (jobId: string) => void
  onApplyToJob: (jobId: string) => void
  savedJobIds: string[]
  className?: string
}

const DEFAULT_FILTERS: JobFilters = {
  searchQuery: '',
  location: '',
  remoteOnly: false,
  jobTypes: [],
  companySizes: [],
  postedWithin: 30
}

export default function PersonalizedJobFeed({
  userProfile,
  onSaveJob,
  onUnsaveJob,
  onApplyToJob,
  savedJobIds,
  className = ''
}: PersonalizedJobFeedProps) {
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [_page, setPage] = useState(1)

  // Simulate fetching jobs from API
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async (reset = false) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockJobs = generateMockJobs()
    
    if (reset) {
      setJobs(mockJobs)
      setPage(1)
    } else {
      setJobs(prev => [...prev, ...mockJobs])
    }
    
    setHasMore(mockJobs.length === 10) // Assume 10 per page
    setIsLoading(false)
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1)
      fetchJobs()
    }
  }

  // Calculate job matches and apply filters
  const filteredJobMatches = useMemo(() => {
    let filteredJobs = jobs

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.requiredSkills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    // Apply location filter
    if (filters.location) {
      const location = filters.location.toLowerCase()
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(location) ||
        (filters.remoteOnly && job.isRemote)
      )
    }

    // Apply remote filter
    if (filters.remoteOnly) {
      filteredJobs = filteredJobs.filter(job => job.isRemote || job.isHybrid)
    }

    // Apply job type filter
    if (filters.jobTypes.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.jobTypes.includes(job.jobType))
    }

    // Apply company size filter
    if (filters.companySizes.length > 0) {
      filteredJobs = filteredJobs.filter(job => filters.companySizes.includes(job.company.size))
    }

    // Apply salary filter
    if (filters.salaryMin || filters.salaryMax) {
      filteredJobs = filteredJobs.filter(job => {
        if (!job.salaryRange) return false
        const jobMin = job.salaryRange.min
        const jobMax = job.salaryRange.max
        
        if (filters.salaryMin && jobMax < filters.salaryMin) return false
        if (filters.salaryMax && jobMin > filters.salaryMax) return false
        
        return true
      })
    }

    // Apply posted within filter
    const cutoffDate = new Date(Date.now() - filters.postedWithin * 24 * 60 * 60 * 1000)
    filteredJobs = filteredJobs.filter(job => job.postedDate >= cutoffDate)

    // Calculate matches and sort by score + recency
    const matches = filteredJobs.map(job => 
      JobMatchingEngineV2.calculateJobMatch(userProfile, job)
    )

    return matches.sort((a, b) => {
      // Primary sort: match score (descending)
      if (Math.abs(a.overallScore - b.overallScore) > 5) {
        return b.overallScore - a.overallScore
      }
      
      // Secondary sort: recency (newer first)
      return b.job.postedDate.getTime() - a.job.postedDate.getTime()
    })
  }, [jobs, filters, userProfile])

  const updateFilter = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.location) count++
    if (filters.remoteOnly) count++
    if (filters.jobTypes.length > 0) count++
    if (filters.companySizes.length > 0) count++
    if (filters.salaryMin || filters.salaryMax) count++
    if (filters.postedWithin !== 30) count++
    return count
  }, [filters])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Recommended Jobs ({filteredJobMatches.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchJobs(true)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="City, state, or remote"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.remoteOnly}
                        onChange={(e) => updateFilter('remoteOnly', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Remote only</span>
                    </label>
                  </div>
                </div>

                {/* Salary Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.salaryMin || ''}
                        onChange={(e) => updateFilter('salaryMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.salaryMax || ''}
                        onChange={(e) => updateFilter('salaryMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Posted Within Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Posted Within</label>
                  <select
                    value={filters.postedWithin}
                    onChange={(e) => updateFilter('postedWithin', Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value={1}>Past 24 hours</option>
                    <option value={3}>Past 3 days</option>
                    <option value={7}>Past week</option>
                    <option value={14}>Past 2 weeks</option>
                    <option value={30}>Past month</option>
                  </select>
                </div>
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['full-time', 'part-time', 'contract', 'internship', 'freelance'] as JobType[]).map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.jobTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('jobTypes', [...filters.jobTypes, type])
                          } else {
                            updateFilter('jobTypes', filters.jobTypes.filter(t => t !== type))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Company Size Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <div className="flex flex-wrap gap-2">
                  {(['startup', 'small', 'medium', 'large', 'enterprise'] as CompanySize[]).map(size => (
                    <label key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.companySizes.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('companySizes', [...filters.companySizes, size])
                          } else {
                            updateFilter('companySizes', filters.companySizes.filter(s => s !== size))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  Clear All Filters
                </Button>
                <Button onClick={() => setShowFilters(false)} size="sm">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Feed */}
      <div className="space-y-4">
        {filteredJobMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria to see more opportunities.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredJobMatches.map((jobMatch, index) => (
              <SmartJobCard
                key={`${jobMatch.job.id}-${index}`}
                jobMatch={jobMatch}
                onSave={onSaveJob}
                onUnsave={onUnsaveJob}
                onApply={onApplyToJob}
                isSaved={savedJobIds.includes(jobMatch.job.id)}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-8">
                <Button 
                  onClick={loadMore} 
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading more jobs...
                    </>
                  ) : (
                    'Load More Jobs'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Mock data generator for development
function generateMockJobs(): Job[] {
  const companies = [
    { name: 'TechCorp', size: 'large' as CompanySize, industry: 'Technology' },
    { name: 'StartupXYZ', size: 'startup' as CompanySize, industry: 'FinTech' },
    { name: 'BigCorp Inc', size: 'enterprise' as CompanySize, industry: 'Enterprise Software' },
    { name: 'MediumCo', size: 'medium' as CompanySize, industry: 'Healthcare' },
    { name: 'SmallTech', size: 'small' as CompanySize, industry: 'AI/ML' }
  ]

  const titles = [
    'Senior Software Engineer',
    'Frontend Developer',
    'Full Stack Engineer',
    'DevOps Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'Backend Developer'
  ]

  const skills = [
    ['React', 'TypeScript', 'Node.js', 'AWS'],
    ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
    ['Python', 'Django', 'PostgreSQL', 'Docker'],
    ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
    ['Product Strategy', 'Analytics', 'Agile', 'Roadmapping'],
    ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    ['Figma', 'Sketch', 'User Research', 'Prototyping'],
    ['Go', 'Redis', 'MongoDB', 'GraphQL']
  ]

  const locations = [
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Remote'
  ]

  return Array.from({ length: 10 }, (_, i) => {
    const company = companies[Math.floor(Math.random() * companies.length)]
    const title = titles[Math.floor(Math.random() * titles.length)]
    const skillSet = skills[Math.floor(Math.random() * skills.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const isRemote = location === 'Remote' || Math.random() > 0.7
    
    return {
      id: `job-${Date.now()}-${i}`,
      title,
      company: {
        id: `company-${company.name.toLowerCase()}`,
        name: company.name,
        size: company.size,
        industry: company.industry,
        location: location === 'Remote' ? 'San Francisco, CA' : location
      },
      location: location === 'Remote' ? 'Remote' : location,
      isRemote,
      isHybrid: !isRemote && Math.random() > 0.8,
      jobType: 'full-time' as JobType,
      salaryRange: Math.random() > 0.3 ? {
        min: 80000 + Math.floor(Math.random() * 100000),
        max: 120000 + Math.floor(Math.random() * 100000),
        currency: '$',
        period: 'yearly' as const
      } : undefined,
      requiredSkills: skillSet,
      preferredSkills: skillSet.slice(0, 2),
      experienceLevel: ['entry', 'mid', 'senior'][Math.floor(Math.random() * 3)] as any,
      description: `We are looking for a talented ${title} to join our ${company.size} ${company.industry} company.`,
      requirements: [
        `${Math.floor(Math.random() * 5) + 1}+ years of experience`,
        `Proficiency in ${skillSet[0]} and ${skillSet[1]}`,
        'Strong problem-solving skills',
        'Excellent communication skills'
      ],
      benefits: ['Health insurance', 'Remote work', '401k matching', 'Unlimited PTO'],
      postedDate: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      applicationUrl: `https://example.com/apply/${i}`
    }
  })
}

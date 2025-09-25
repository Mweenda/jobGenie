import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { FloatingButton } from '@/components/ui/floating-button'
import Header from '@/components/feature/Header'
import { Job } from '@/components/shared/JobCard'
import { EnhancedJobCard } from '@/components/shared/EnhancedJobCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingGrid } from '@/components/shared/LoadingGrid'

// Mock data for demonstration
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    remote: true,
    salary: '$120k - $150k',
    postedDate: '2 days ago',
    description: 'We are looking for a Senior Frontend Developer to join our growing team. You will work on cutting-edge web applications using React, TypeScript, and modern development practices.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    type: 'Full-time',
    experience: 'Senior',
    saved: false,
    logo: '🚀'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY',
    remote: false,
    salary: '$100k - $130k',
    postedDate: '1 week ago',
    description: 'Join our product team to drive innovation and growth. You will work closely with engineering and design teams to build products that users love.',
    skills: ['Product Strategy', 'Analytics', 'User Research', 'Agile'],
    type: 'Full-time',
    experience: 'Mid-level',
    saved: true,
    logo: '💡'
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'Austin, TX',
    remote: true,
    salary: '$80k - $110k',
    postedDate: '3 days ago',
    description: 'We are seeking a talented UX Designer to create exceptional user experiences. You will work on web and mobile applications for various clients.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    type: 'Full-time',
    experience: 'Mid-level',
    saved: false,
    logo: '🎨'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Seattle, WA',
    remote: true,
    salary: '$110k - $140k',
    postedDate: '5 days ago',
    description: 'Help us scale our infrastructure and improve our deployment processes. You will work with AWS, Kubernetes, and CI/CD pipelines.',
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
    type: 'Full-time',
    experience: 'Senior',
    saved: false,
    logo: '☁️'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'AI Innovations',
    location: 'Boston, MA',
    remote: false,
    salary: '$95k - $125k',
    postedDate: '1 week ago',
    description: 'Join our data science team to build machine learning models that drive business decisions. You will work with large datasets and cutting-edge ML technologies.',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    type: 'Full-time',
    experience: 'Mid-level',
    saved: true,
    logo: '🤖'
  },
  {
    id: '6',
    title: 'Marketing Manager',
    company: 'Growth Co',
    location: 'Los Angeles, CA',
    remote: true,
    salary: '$75k - $95k',
    postedDate: '4 days ago',
    description: 'Lead our marketing efforts and drive customer acquisition. You will work on digital marketing campaigns, content strategy, and brand development.',
    skills: ['Digital Marketing', 'Content Strategy', 'Analytics', 'SEO'],
    type: 'Full-time',
    experience: 'Mid-level',
    saved: false,
    logo: '📈'
  }
]


const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState(mockJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading] = useState(false)

  const handleToggleSave = (jobId: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, saved: !job.saved } : job
      )
    )
  }

  const handleApply = (jobId: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, applied: true } : job
      )
    )
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (selectedFilters.length === 0) return matchesSearch
    
    return matchesSearch && selectedFilters.some(filter => {
      if (filter === 'Remote') return job.remote
      if (filter === 'Full-time') return job.type === 'Full-time'
      if (filter === '$100k+') return job.salary && job.salary.includes('100k')
      if (filter === 'Tech') return job.skills.some(skill => 
        ['React', 'TypeScript', 'JavaScript', 'Python', 'AWS', 'Docker'].includes(skill)
      )
      return false
    })
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pt-20 sm:pt-24 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-display-lg mb-2">Find Your Dream Job</h1>
              <p className="text-base sm:text-body-lg text-muted-foreground">Discover amazing opportunities with AI-powered matching</p>
            </div>
            
            <FloatingButton
              variant="glass"
              onClick={() => setShowFilters(!showFilters)}
              className="self-center sm:self-auto"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </FloatingButton>
          </div>

          {/* Search Bar */}
          <GlassCard variant="floating" className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 glass-subtle border-0 text-sm sm:text-base"
                />
              </div>
              <FloatingButton variant="primary" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Search
              </FloatingButton>
            </div>
          </GlassCard>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <GlassCard variant="prominent" className="p-3 sm:p-4">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {['Remote', 'Full-time', '$100k+', 'Tech', 'Featured'].map((filter) => (
                    <Button 
                      key={filter}
                      variant="outline" 
                      size="sm" 
                      className={`glass-subtle text-xs sm:text-sm ${
                        selectedFilters.includes(filter) ? 'bg-blue-500/20 text-blue-600' : ''
                      }`}
                      onClick={() => {
                        setSelectedFilters(prev => 
                          prev.includes(filter) 
                            ? prev.filter(f => f !== filter)
                            : [...prev, filter]
                        )
                      }}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {filter}
                    </Button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>

        {/* Job Results */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"
          >
            <p className="text-muted-foreground text-sm sm:text-base text-center sm:text-left">
              Showing {filteredJobs.length} jobs • Updated 2 minutes ago
            </p>
            <div className="flex items-center justify-center sm:justify-end space-x-2 text-xs sm:text-sm text-muted-foreground">
              <span>Sort by:</span>
              <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm">
                Most Recent
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>
          </motion.div>

          {isLoading ? (
            <LoadingGrid count={6} />
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.map((job, index) => (
                <EnhancedJobCard 
                  key={job.id} 
                  job={job} 
                  delay={index * 0.1}
                  onToggleSave={handleToggleSave}
                  onApply={handleApply}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No jobs found"
              description="Try adjusting your search criteria or filters to find more opportunities."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery(''); 
                setSelectedFilters([]);
              }}
            />
          )}

          {/* Load More */}
          {!isLoading && filteredJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center pt-8"
            >
              <FloatingButton variant="glass" className="px-8">
                Load More Jobs
              </FloatingButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobsPage

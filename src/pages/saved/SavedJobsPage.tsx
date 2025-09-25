import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Bookmark, Calendar, MapPin, DollarSign, Building2, Filter, SlidersHorizontal, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { FloatingButton } from '@/components/ui/floating-button'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/feature/Header'
import { Job } from '@/components/shared/JobCard'
import { EmptyState } from '@/components/shared/EmptyState'

// Mock saved jobs data
const mockSavedJobs: Job[] = [
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY',
    remote: false,
    salary: '$100k - $130k',
    postedDate: '1 week ago',
    savedDate: '3 days ago',
    description: 'Join our product team to drive innovation and growth. You will work closely with engineering and design teams to build products that users love.',
    skills: ['Product Strategy', 'Analytics', 'User Research', 'Agile'],
    type: 'Full-time',
    experience: 'Mid-level',
    logo: '💡',
    applied: false,
    notes: 'Great company culture, need to prepare case study'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'AI Innovations',
    location: 'Boston, MA',
    remote: false,
    salary: '$95k - $125k',
    postedDate: '1 week ago',
    savedDate: '2 days ago',
    description: 'Join our data science team to build machine learning models that drive business decisions. You will work with large datasets and cutting-edge ML technologies.',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    type: 'Full-time',
    experience: 'Mid-level',
    logo: '🤖',
    applied: true,
    notes: 'Applied via LinkedIn, waiting for response'
  },
  {
    id: '7',
    title: 'Senior React Developer',
    company: 'WebTech Solutions',
    location: 'Remote',
    remote: true,
    salary: '$130k - $160k',
    postedDate: '3 days ago',
    savedDate: '1 day ago',
    description: 'Looking for an experienced React developer to join our remote team. You will be working on complex web applications with modern technologies.',
    skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
    type: 'Full-time',
    experience: 'Senior',
    logo: '⚛️',
    applied: false,
    notes: 'Perfect match for my skills, high priority'
  },
  {
    id: '8',
    title: 'UX/UI Designer',
    company: 'Creative Agency',
    location: 'San Francisco, CA',
    remote: true,
    salary: '$85k - $115k',
    postedDate: '5 days ago',
    savedDate: '4 days ago',
    description: 'We are looking for a creative UX/UI designer to work on innovative digital products for our clients.',
    skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Testing'],
    type: 'Full-time',
    experience: 'Mid-level',
    logo: '🎨',
    applied: false,
    notes: 'Need to update portfolio before applying'
  }
]


interface SavedJobCardProps {
  job: Job;
  delay: number;
  onRemove: (id: string) => void;
  onApply: (id: string) => void;
}

function SavedJobCard({ job, delay, onRemove, onApply }: SavedJobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard variant="prominent" hover className="p-4 sm:p-6 relative">
        {/* Status Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <Badge 
            variant={job.applied ? "default" : "secondary"}
            className={`text-xs ${job.applied ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"}`}
          >
            {job.applied ? "Applied" : "Saved"}
          </Badge>
        </div>

        {/* Job Header */}
        <div className="flex items-start space-x-3 sm:space-x-4 mb-4 pr-16 sm:pr-20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden glass-subtle flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              {job.logo ? (
                <span className="text-lg sm:text-2xl">{job.logo}</span>
              ) : (
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{job.title}</h3>
            <p className="text-muted-foreground text-sm sm:text-base truncate">{job.company}</p>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
              {job.remote && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Remote
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Saved {job.savedDate}</span>
            </div>
          </div>
          
          {job.salary && (
            <div className="flex items-center space-x-1 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600">{job.salary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {job.description}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="glass-subtle rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Your Notes</p>
                <p className="text-sm text-muted-foreground">{job.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {!job.applied ? (
            <FloatingButton 
              className="flex-1" 
              variant="primary"
              onClick={() => onApply(job.id)}
            >
              Apply Now
            </FloatingButton>
          ) : (
            <FloatingButton 
              className="flex-1" 
              variant="glass"
              disabled
            >
              ✓ Applied
            </FloatingButton>
          )}
          <FloatingButton 
            variant="glass"
            onClick={() => onRemove(job.id)}
            className="text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </FloatingButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState(mockSavedJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const handleRemove = (jobId: string) => {
    setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
  }

  const handleApply = (jobId: string) => {
    setSavedJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, applied: true } : job
      )
    )
  }

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (selectedFilters.length === 0) return matchesSearch
    
    return matchesSearch && selectedFilters.some(filter => {
      if (filter === 'Not Applied') return !job.applied
      if (filter === 'Applied') return job.applied
      if (filter === 'Remote') return job.remote
      if (filter === 'Has Notes') return job.notes
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
              <h1 className="text-xl sm:text-display-lg mb-2 flex items-center justify-center sm:justify-start space-x-2">
                <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                <span>Saved Jobs</span>
              </h1>
              <p className="text-sm sm:text-body-lg text-muted-foreground">Keep track of opportunities you're interested in</p>
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
          <GlassCard variant="floating" className="p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search your saved jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-subtle border-0"
                />
              </div>
              <FloatingButton variant="primary">
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
              <GlassCard variant="prominent" className="p-4">
                <div className="flex flex-wrap gap-4">
                  {['Not Applied', 'Applied', 'Remote', 'Has Notes'].map((filter) => (
                    <Button 
                      key={filter}
                      variant="outline" 
                      size="sm" 
                      className={`glass-subtle ${
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

        {/* Results */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <p className="text-muted-foreground">
              {filteredJobs.length} saved jobs • Last updated 5 minutes ago
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <Button variant="ghost" size="sm" className="font-medium">
                Recently Saved
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>

          {/* Saved Jobs Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.map((job, index) => (
                <SavedJobCard
                  key={job.id}
                  job={job}
                  delay={index * 0.1}
                  onRemove={handleRemove}
                  onApply={handleApply}
                />
              ))}
            </div>
          ) : savedJobs.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved jobs yet"
              description="Start building your collection by saving interesting job opportunities. You can bookmark jobs from the Jobs page."
              actionLabel="Browse Jobs"
              onAction={() => console.log('Navigate to jobs page')}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No matching saved jobs"
              description="Try adjusting your search criteria or filters to find your saved opportunities."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery(''); 
                setSelectedFilters([]);
              }}
            />
          )}

          {/* Quick Actions */}
          {savedJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12"
            >
              <GlassCard variant="floating" className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full glass-prominent flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Manage Your Applications
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Keep track of your job application progress and deadlines
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    <FloatingButton variant="glass">
                      Export List
                    </FloatingButton>
                    <FloatingButton variant="primary">
                      Application Tracker
                    </FloatingButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavedJobsPage

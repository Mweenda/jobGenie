import { useState } from 'react'
import { X, MapPin, DollarSign, Clock, Building, Users, Star, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../base/Button'
// import Input from '../base/Input'
import { formatSalary, formatJobType, formatCompanySize } from '../../utils/format'
import { formatJobPostedDate } from '../../utils/date'

interface Job {
  id: string
  title: string
  company: {
    name: string
    logoUrl: string
    industry: string
    website?: string
    size?: string
    description?: string
  }
  location: string
  salaryMin?: number
  salaryMax?: number
  jobType: string
  isRemote: boolean
  postedAt: string
  description: string
  requirements?: string[]
  matchScore?: number
}

interface JobDetailModalProps {
  job: Job
  isOpen: boolean
  onClose: () => void
  onSave?: (jobId: string) => void
  onApply?: (jobId: string, coverLetter: string) => void
  isSaved?: boolean
}

export default function JobDetailModal({ 
  job, 
  isOpen, 
  onClose, 
  onSave, 
  onApply, 
  isSaved = false 
}: JobDetailModalProps) {
  const { isAuthenticated } = useAuth()
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  if (!isOpen) return null

  const handleApply = async () => {
    if (!onApply) return
    
    setIsApplying(true)
    try {
      await onApply(job.id, coverLetter)
      setShowApplicationForm(false)
      setCoverLetter('')
      // Show success message or redirect
    } catch (error) {
      console.error('Error applying to job:', error)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{job.company.logoUrl}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600">{job.company.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex overflow-hidden" style={{ height: 'calc(90vh - 80px)' }}>
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Job Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="text-sm">{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">{formatJobPostedDate(job.postedAt)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                <span className="text-sm">{formatJobType(job.jobType)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {formatJobType(job.jobType)}
              </span>
              {job.isRemote && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Remote
                </span>
              )}
              {job.matchScore && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  {Math.round(job.matchScore * 100)}% match
                </span>
              )}
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((requirement, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {requirement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Company Info with Job Poster Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                About {job.company.name}
              </h2>
              
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 border border-blue-100/50 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Company Logo */}
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md border border-gray-100">
                    {job.company.logoUrl ? (
                      <img 
                        src={job.company.logoUrl} 
                        alt={`${job.company.name} logo`}
                        className="w-16 h-16 object-contain rounded-xl"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Company Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{job.company.name}</h3>
                        <p className="text-blue-600 font-medium">{job.company.industry}</p>
                      </div>
                      {job.company.website && (
                        <a 
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </a>
                      )}
                    </div>
                    
                    {/* Company Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl border border-gray-100">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Industry</p>
                          <p className="text-sm font-semibold text-gray-900">{job.company.industry}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl border border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Company Size</p>
                          <p className="text-sm font-semibold text-gray-900">{formatCompanySize(job.company.size || null)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl border border-gray-100">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</p>
                          <p className="text-sm font-semibold text-gray-900">{job.location}</p>
                        </div>
                      </div>
                    </div>
                    
                    {job.company.description && (
                      <div className="mt-4 p-4 bg-white/60 rounded-xl border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-2">About the Company</h4>
                        <p className="text-gray-700 leading-relaxed">{job.company.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Form */}
            {showApplicationForm && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply for this position</h2>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the employer why you're interested in this role..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApply}
                      loading={isApplying}
                    >
                      Submit Application
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setShowApplicationForm(true)}
                      disabled={showApplicationForm}
                    >
                      {showApplicationForm ? 'Application Form Below' : 'Apply Now'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onSave?.(job.id)}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save Job
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Sign in to apply for this job
                    </p>
                    <Button className="w-full">
                      Sign In
                    </Button>
                  </div>
                )}
              </div>

              {/* Job Stats */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type</span>
                    <span className="font-medium">{formatJobType(job.jobType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remote</span>
                    <span className="font-medium">{job.isRemote ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium">{formatJobPostedDate(job.postedAt)}</span>
                  </div>
                  {job.matchScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Match Score</span>
                      <span className="font-medium text-green-600">
                        {Math.round(job.matchScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Similar Jobs */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Similar Jobs</h3>
                <div className="space-y-3">
                  {/* This would be populated with similar jobs */}
                  <div className="text-sm text-gray-500 text-center py-4">
                    Similar jobs will appear here
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
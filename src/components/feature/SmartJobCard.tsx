/**
 * Smart Job Card Component
 * Displays job information with explainable match scores and actions
 */

import { useState } from 'react'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Users, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Award,
  Target
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { JobMatch } from '../../services/jobMatchingEngineV2'
import { formatDistanceToNow } from 'date-fns'

interface SmartJobCardProps {
  jobMatch: JobMatch
  onSave: (jobId: string) => void
  onUnsave: (jobId: string) => void
  onApply: (jobId: string) => void
  isSaved?: boolean
  className?: string
}

export default function SmartJobCard({
  jobMatch,
  onSave,
  onUnsave,
  onApply,
  isSaved = false,
  className = ''
}: SmartJobCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { job, overallScore, confidence, components, reasoning, recommendationTags } = jobMatch

  const handleSaveToggle = () => {
    if (isSaved) {
      onUnsave(job.id)
    } else {
      onSave(job.id)
    }
  }

  const handleApply = () => {
    onApply(job.id)
    // In production, this would also track analytics
    window.open(job.applicationUrl, '_blank', 'noopener,noreferrer')
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <Award className="h-4 w-4 text-green-600" />
      case 'medium': return <Target className="h-4 w-4 text-blue-600" />
      case 'low': return <TrendingUp className="h-4 w-4 text-yellow-600" />
      default: return null
    }
  }

  const formatSalary = (salary: typeof job.salaryRange) => {
    if (!salary) return null
    const { min, max, currency, period } = salary
    const periodText = period === 'yearly' ? '/year' : period === 'monthly' ? '/month' : '/hour'
    return `${currency}${min.toLocaleString()}-${max.toLocaleString()}${periodText}`
  }

  const formatLocation = () => {
    if (job.isRemote) return 'Remote'
    if (job.isHybrid) return `${job.location} (Hybrid)`
    return job.location
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 ${className}`}>
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.company.logo ? (
                <img 
                  src={job.company.logo} 
                  alt={`${job.company.name} logo`}
                  className="h-12 w-12 rounded-lg object-contain border"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {job.title}
                </h3>
                {getConfidenceIcon(confidence)}
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <span className="font-medium">{job.company.name}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{formatLocation()}</span>
                </div>
              </div>

              {/* Job Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {job.salaryRange && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatSalary(job.salaryRange)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(job.postedDate, { addSuffix: true })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="capitalize">{job.company.size}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match Score & Actions */}
          <div className="flex flex-col items-end space-y-2">
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getMatchColor(overallScore)}`}>
              {overallScore}% Match
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                className="p-2"
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Recommendation Tags */}
        {recommendationTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recommendationTags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Skills Preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 5).map((skill, index) => {
              const isMatched = components.skills.matchedSkills.some(
                m => m.skill.toLowerCase() === skill.toLowerCase()
              )
              return (
                <Badge 
                  key={index} 
                  variant={isMatched ? "default" : "outline"}
                  className={`text-xs ${isMatched ? 'bg-green-100 text-green-700 border-green-300' : ''}`}
                >
                  {skill}
                </Badge>
              )
            })}
            {job.requiredSkills.length > 5 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{job.requiredSkills.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Match Insights */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Why recommended:</span> {reasoning}
          </p>
        </div>

        {/* Expandable Details */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full justify-between p-0 h-auto font-normal text-gray-600 hover:text-gray-900"
          >
            <span className="text-sm">
              {showDetails ? 'Hide' : 'Show'} match breakdown
            </span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showDetails && (
            <div className="mt-4 space-y-3">
              {/* Match Breakdown */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skills Match:</span>
                    <span className={`font-medium ${components.skills.score >= 70 ? 'text-green-600' : components.skills.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {components.skills.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${components.skills.score >= 70 ? 'bg-green-500' : components.skills.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${components.skills.score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {components.skills.totalMatched}/{components.skills.totalRequired} required skills
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className={`font-medium ${components.experience.score >= 70 ? 'text-green-600' : components.experience.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {components.experience.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${components.experience.score >= 70 ? 'bg-green-500' : components.experience.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${components.experience.score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {components.experience.userYears} years vs {components.experience.requiredYears} required
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className={`font-medium ${components.location.score >= 70 ? 'text-green-600' : components.location.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {components.location.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${components.location.score >= 70 ? 'bg-green-500' : components.location.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${components.location.score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {components.location.remoteCompatible ? 'Remote available' : 'On-site required'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferences:</span>
                    <span className={`font-medium ${components.preferences.score >= 70 ? 'text-green-600' : components.preferences.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {components.preferences.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${components.preferences.score >= 70 ? 'bg-green-500' : components.preferences.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${components.preferences.score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Job type & company match
                  </div>
                </div>
              </div>

              {/* Skills Gap */}
              {components.skills.missingSkills.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    Skills to develop:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {components.skills.missingSkills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                        {skill}
                      </Badge>
                    ))}
                    {components.skills.missingSkills.length > 4 && (
                      <Badge variant="outline" className="text-xs text-yellow-600">
                        +{components.skills.missingSkills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4 pt-4 border-t">
          <Button 
            onClick={handleApply}
            className="flex-1"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
            size="sm"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

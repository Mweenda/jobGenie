import React from 'react'
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck, Building2, Users, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  remote?: boolean
  salary?: string
  postedDate: string
  description?: string
  skills: string[]
  type?: string
  experience?: string
  saved?: boolean
  applied?: boolean
  logo?: string
  notes?: string
  savedDate?: string
}

interface JobCardProps {
  job: Job
  variant?: 'default' | 'saved'
  onToggleSave?: (id: string) => void
  onApply?: (id: string) => void
  onRemove?: (id: string) => void
  className?: string
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  variant = 'default',
  onToggleSave,
  onApply,
  onRemove,
  className 
}) => {
  const handleApply = () => {
    if (onApply) {
      onApply(job.id)
    }
  }

  const handleToggleSave = () => {
    if (onToggleSave) {
      onToggleSave(job.id)
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 animate-slide-up border-0 shadow-sm hover:shadow-xl",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
              {job.logo || '💼'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h3>
                {job.applied && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Applied
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">{job.company}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 shrink-0">
            {variant === 'saved' ? (
              <>
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {onRemove && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-red-50 hover:text-red-600"
                    onClick={() => onRemove(job.id)}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSave}
                className="shrink-0 hover:bg-primary/10"
              >
                {job.saved ? (
                  <BookmarkCheck className="w-5 h-5 text-primary" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
            {job.remote && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Remote
              </Badge>
            )}
          </div>
          {job.salary && (
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {variant === 'saved' && job.savedDate 
                ? `Saved ${job.savedDate}` 
                : `Posted ${job.postedDate}`
              }
            </span>
          </div>
        </div>

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>

        {variant === 'saved' && job.notes && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Notes:</span> {job.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            {job.type && (
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{job.type}</span>
              </span>
            )}
            {job.experience && <span>{job.experience}</span>}
          </div>
          
          {!job.applied ? (
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleApply}
            >
              Apply Now
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Application Sent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

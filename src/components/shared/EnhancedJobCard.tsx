import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, Briefcase, Heart, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { FloatingButton } from '@/components/ui/floating-button'
import { Job } from './JobCard'

interface EnhancedJobCardProps {
  job: Job;
  delay: number;
  onToggleSave?: (id: string) => void;
  onApply?: (id: string) => void;
}

export function EnhancedJobCard({ job, delay, onToggleSave, onApply }: EnhancedJobCardProps) {
  const [isSaved, setIsSaved] = useState(job.saved || false);

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    if (onToggleSave) {
      onToggleSave(job.id);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard 
        variant="prominent" 
        hover 
        className="p-6 relative"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden glass-subtle">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                {job.logo ? (
                  <span className="text-2xl">{job.logo}</span>
                ) : (
                  <Briefcase className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleSave}
            className={`p-2 rounded-full glass-subtle transition-colors ${
              isSaved ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

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
              <Clock className="w-4 h-4" />
              <span>{job.postedDate}</span>
            </div>
          </div>
          
          {job.salary && (
            <div className="flex items-center space-x-1 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-600">
                {job.salary}
              </span>
            </div>
          )}
        </div>

        {job.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {job.description}
          </p>
        )}

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

        <div className="flex space-x-2">
          <FloatingButton 
            className="flex-1" 
            variant="primary"
            onClick={handleApply}
          >
            {job.applied ? 'Applied' : 'Apply Now'}
          </FloatingButton>
          <FloatingButton variant="glass">
            <Search className="w-4 h-4" />
          </FloatingButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

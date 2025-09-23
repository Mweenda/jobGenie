import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Clock, DollarSign, Briefcase, Heart, Filter, SlidersHorizontal } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { FloatingButton } from './FloatingButton';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  tags: string[];
  logo: string;
  featured?: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $160k',
    posted: '2 days ago',
    description: 'Join our team to build cutting-edge web applications using React, TypeScript, and modern tools.',
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    logo: 'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU4NTA2NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    featured: true
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateLab',
    location: 'Remote',
    type: 'Full-time',
    salary: '$110k - $140k',
    posted: '1 day ago',
    description: 'Lead product strategy and development for our growing SaaS platform with a focus on user experience.',
    tags: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
    logo: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzU4NTM5Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    type: 'Contract',
    salary: '$80k - $100k',
    posted: '3 days ago',
    description: 'Create beautiful and intuitive user experiences for mobile and web applications.',
    tags: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
    logo: 'https://images.unsplash.com/photo-1420310414923-bf3651a89816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxhcHRvcHxlbnwxfHx8fDE3NTg1MzMyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'CloudTech',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$100k - $130k',
    posted: '4 days ago',
    description: 'Build scalable backend systems and APIs using Node.js, Python, and cloud technologies.',
    tags: ['Node.js', 'Python', 'AWS', 'Docker'],
    logo: 'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU4NTA2NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    featured: true
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'AI Analytics',
    location: 'Seattle, WA',
    type: 'Full-time',
    salary: '$130k - $170k',
    posted: '5 days ago',
    description: 'Analyze complex datasets and build machine learning models to drive business insights.',
    tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    logo: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzU4NTM5Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Infrastructure Co',
    location: 'Remote',
    type: 'Full-time',
    salary: '$115k - $145k',
    posted: '1 week ago',
    description: 'Manage and optimize cloud infrastructure, CI/CD pipelines, and deployment processes.',
    tags: ['Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
    logo: 'https://images.unsplash.com/photo-1420310414923-bf3651a89816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxhcHRvcHxlbnwxfHx8fDE3NTg1MzMyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

interface JobCardProps {
  job: Job;
  delay: number;
}

function JobCard({ job, delay }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard 
        variant={job.featured ? "floating" : "prominent"} 
        hover 
        className={`p-6 relative ${job.featured ? 'ring-2 ring-blue-400/30' : ''}`}
      >
        {job.featured && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Featured
            </Badge>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden glass-subtle">
              <ImageWithFallback
                src={job.logo}
                alt={`${job.company} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSaved(!isSaved)}
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
            </div>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{job.posted}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="font-medium text-green-600">{job.salary}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex space-x-2">
          <FloatingButton className="flex-1" variant="primary">
            Apply Now
          </FloatingButton>
          <FloatingButton variant="glass">
            <Search className="w-4 h-4" />
          </FloatingButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find Your Dream Job</h1>
              <p className="text-muted-foreground">Discover amazing opportunities with AI-powered matching</p>
            </div>
            
            <FloatingButton
              variant="glass"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </FloatingButton>
          </div>

          {/* Search Bar */}
          <GlassCard variant="floating" className="p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
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
                  <Button variant="outline" size="sm" className="glass-subtle">
                    <Filter className="w-4 h-4 mr-2" />
                    Remote
                  </Button>
                  <Button variant="outline" size="sm" className="glass-subtle">
                    Full-time
                  </Button>
                  <Button variant="outline" size="sm" className="glass-subtle">
                    $100k+
                  </Button>
                  <Button variant="outline" size="sm" className="glass-subtle">
                    Tech
                  </Button>
                  <Button variant="outline" size="sm" className="glass-subtle">
                    Featured
                  </Button>
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
            className="flex items-center justify-between"
          >
            <p className="text-muted-foreground">
              Showing {mockJobs.length} jobs • Updated 2 minutes ago
            </p>
          </motion.div>

          <div className="grid gap-6">
            {mockJobs.map((job, index) => (
              <JobCard key={job.id} job={job} delay={index * 0.1} />
            ))}
          </div>

          {/* Load More */}
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
        </div>
      </div>
    </div>
  );
}
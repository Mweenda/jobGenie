import { MapPin, Clock, DollarSign, Bookmark } from 'lucide-react'
import Button from '../base/Button'

const jobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $160k',
    type: 'Full-time',
    posted: '2 days ago',
    logo: '🏢',
    description: 'We are looking for a senior frontend developer to join our team...'
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$100k - $140k',
    type: 'Full-time',
    posted: '1 day ago',
    logo: '🚀',
    description: 'Join our product team to drive innovation and growth...'
  },
  {
    id: 3,
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    salary: '$80k - $110k',
    type: 'Full-time',
    posted: '3 days ago',
    logo: '🎨',
    description: 'Create beautiful and intuitive user experiences...'
  }
]

export default function JobFeed() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex space-x-4">
                <div className="text-3xl">{job.logo}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.posted}
                    </div>
                  </div>
                  
                  <p className="mt-3 text-gray-600 text-sm">{job.description}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {job.type}
              </span>
              <Button size="sm">Apply Now</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { User, Mail, Edit3, Save, X, Plus, Sparkles, Briefcase, TrendingUp, Bookmark } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
// import { useJobStore } from '../../store/jobStore'
import Button from '../../components/base/Button'
import Input from '../../components/base/Input'
import Header from '../../components/feature/Header'
import { formatApplicationStatus, formatSalary } from '../../utils/format'
import { formatJobPostedDate } from '../../utils/date'

interface UserSkill {
  id: string
  skillName: string
  proficiencyLevel: number
}

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  // const { getSavedJobs } = useJobStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    jobTitle: user?.jobTitle || '',
    experienceLevel: user?.experienceLevel || 'mid',
  })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    try {
      // Load saved jobs and applications
      // These would be real API calls in production
      setSavedJobs([])
      setApplications([])
      setSkills([])
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      jobTitle: user?.jobTitle || '',
      experienceLevel: user?.experienceLevel || 'mid',
    })
    setIsEditing(false)
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      const skill: UserSkill = {
        id: Math.random().toString(36).substr(2, 9),
        skillName: newSkill.trim(),
        proficiencyLevel: 3
      }
      setSkills([...skills, skill])
      setNewSkill('')
    }
  }

  const removeSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId))
  }

  const updateSkillLevel = (skillId: string, level: number) => {
    setSkills(skills.map(skill => 
      skill.id === skillId ? { ...skill, proficiencyLevel: level } : skill
    ))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Profile Header */}
        <div className="glass-floating rounded-2xl p-8 mb-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg text-gray-600 mb-3">{user.jobTitle || 'Job Title Not Set'}</p>
                <div className="flex items-center justify-center sm:justify-start text-gray-500 space-x-2">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="glass-subtle hover:glass-prominent border-gray-300 text-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    loading={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="glass-subtle hover:glass-prominent border-blue-300 text-blue-700 hover:text-blue-800"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="glass-floating rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g. Senior Software Engineer"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="glass-floating rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                Skills & Expertise
              </h2>
              
              {isEditing && (
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1"
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-3">
                {skills.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {isEditing ? 'Add your skills to help us recommend better jobs' : 'No skills added yet'}
                  </p>
                ) : (
                  skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{skill.skillName}</span>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => isEditing && updateSkillLevel(skill.id, level)}
                              disabled={!isEditing}
                              className={`w-3 h-3 rounded-full mr-1 ${
                                level <= skill.proficiencyLevel
                                  ? 'bg-blue-500'
                                  : 'bg-gray-300'
                              } ${isEditing ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {skill.proficiencyLevel}/5
                          </span>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="glass-floating rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                Recent Applications
              </h2>
              
              {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{application.job.title}</h3>
                          <p className="text-gray-600">{application.job.company.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Applied {formatJobPostedDate(application.applied_at)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          formatApplicationStatus(application.status).color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : formatApplicationStatus(application.status).color === 'blue'
                            ? 'bg-blue-100 text-blue-800'
                            : formatApplicationStatus(application.status).color === 'red'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {formatApplicationStatus(application.status).text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Stats */}
            <div className="glass-floating rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                Profile Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-semibold text-gray-900">{applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saved Jobs</span>
                  <span className="font-semibold text-gray-900">{savedJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-semibold text-gray-900">{skills.length}</span>
                </div>
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="glass-floating rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                </div>
                Saved Jobs
              </h3>
              
              {savedJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No saved jobs yet</p>
              ) : (
                <div className="space-y-3">
                  {savedJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="border rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                      <p className="text-gray-600 text-sm">{job.company.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </p>
                    </div>
                  ))}
                  {savedJobs.length > 3 && (
                    <p className="text-blue-600 text-sm text-center cursor-pointer hover:text-blue-700">
                      View all {savedJobs.length} saved jobs
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
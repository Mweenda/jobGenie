/**
 * Progressive Onboarding Component
 * Guides users through profile completion with gamified experience
 */

import { useState, useEffect } from 'react'
import {
  User,
  Briefcase,
  GraduationCap,
  Target,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Trophy,
  Zap,
  Plus,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { ProgressBar } from '../ui/progress-bar'
import { UserProfile, UserSkill, WorkExperience, Education, JobPreferences } from '../../services/jobMatchingEngineV2'

interface ProgressiveOnboardingProps {
  userProfile: UserProfile
  onProfileUpdate: (profile: Partial<UserProfile>) => void
  onComplete: () => void
  className?: string
}

type OnboardingStep = 'welcome' | 'basic' | 'experience' | 'skills' | 'education' | 'preferences' | 'complete'

interface OnboardingProgress {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  totalSteps: number
  completionPercentage: number
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'basic', 
  'experience',
  'skills',
  'education',
  'preferences',
  'complete'
]

export default function ProgressiveOnboarding({
  userProfile,
  onProfileUpdate,
  onComplete,
  className = ''
}: ProgressiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({})
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([])

  // Calculate progress
  const progress: OnboardingProgress = {
    currentStep,
    completedSteps,
    totalSteps: ONBOARDING_STEPS.length - 1, // Exclude welcome step
    completionPercentage: Math.round((completedSteps.length / (ONBOARDING_STEPS.length - 1)) * 100)
  }

  useEffect(() => {
    // Initialize temp profile with existing user data
    setTempProfile({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      headline: userProfile.headline,
      location: userProfile.location,
      skills: userProfile.skills || [],
      experience: userProfile.experience || [],
      education: userProfile.education || [],
      preferences: userProfile.preferences || {
        jobTypes: [],
        locations: [],
        remotePreference: 'flexible',
        industries: [],
        companySizes: []
      }
    })
  }, [userProfile])

  const updateTempProfile = (updates: Partial<UserProfile>) => {
    setTempProfile(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStepName = ONBOARDING_STEPS[currentIndex + 1]
      
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }
      
      // Save progress to profile
      onProfileUpdate(tempProfile)
      
      setCurrentStep(nextStepName)
      
      // Complete onboarding if we've reached the end
      if (nextStepName === 'complete') {
        setTimeout(() => onComplete(), 2000)
      }
    }
  }

  const prevStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1])
    }
  }

  const skipStep = () => {
    nextStep()
  }

  const renderProgressHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
        <Badge variant="secondary" className="text-sm">
          {progress.completionPercentage}% Complete
        </Badge>
      </div>
      
      <ProgressBar 
        value={progress.completionPercentage} 
        className="mb-4"
      />
      
      <div className="flex items-center justify-center space-x-2">
        {ONBOARDING_STEPS.slice(1, -1).map((step, index) => (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
              completedSteps.includes(step)
                ? 'bg-green-500 text-white'
                : step === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {completedSteps.includes(step) ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderWelcomeStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Trophy className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to JobGenie!</h2>
          <p className="text-lg text-gray-600">
            Let's set up your profile to find the perfect job matches
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-lg">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Smart Matching</h3>
            <p className="text-sm text-green-700">AI-powered job recommendations</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Quick Apply</h3>
            <p className="text-sm text-blue-700">One-click applications</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Career Growth</h3>
            <p className="text-sm text-purple-700">AI career coaching</p>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          This will take about <strong>3-5 minutes</strong> to complete
        </div>

        <Button onClick={nextStep} size="lg" className="w-full md:w-auto">
          Let's Get Started
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )

  const renderBasicInfoStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <Input
              value={tempProfile.firstName || ''}
              onChange={(e) => updateTempProfile({ firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <Input
              value={tempProfile.lastName || ''}
              onChange={(e) => updateTempProfile({ lastName: e.target.value })}
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Professional Headline</label>
          <Input
            value={tempProfile.headline || ''}
            onChange={(e) => updateTempProfile({ headline: e.target.value })}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <Input
            value={tempProfile.location || ''}
            onChange={(e) => updateTempProfile({ location: e.target.value })}
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="ghost" onClick={skipStep}>
              Skip
            </Button>
            <Button onClick={nextStep}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderExperienceStep = () => {
    const addExperience = () => {
      const newExp: WorkExperience = {
        id: `exp-${Date.now()}`,
        title: '',
        company: '',
        startDate: new Date(),
        isCurrent: false
      }
      updateTempProfile({
        experience: [...(tempProfile.experience || []), newExp]
      })
    }

    const updateExperience = (index: number, updates: Partial<WorkExperience>) => {
      const updated = [...(tempProfile.experience || [])]
      updated[index] = { ...updated[index], ...updates }
      updateTempProfile({ experience: updated })
    }

    const removeExperience = (index: number) => {
      const updated = [...(tempProfile.experience || [])]
      updated.splice(index, 1)
      updateTempProfile({ experience: updated })
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Work Experience
            </div>
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(tempProfile.experience || []).map((exp, index) => (
            <div key={exp.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Experience #{index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeExperience(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Job Title"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, { title: e.target.value })}
                />
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, { company: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`current-${index}`}
                  checked={exp.isCurrent}
                  onChange={(e) => updateExperience(index, { isCurrent: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`current-${index}`} className="text-sm">
                  This is my current role
                </label>
              </div>
            </div>
          ))}

          {(tempProfile.experience || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Add your work experience to get better job matches</p>
              <Button variant="outline" onClick={addExperience} className="mt-3">
                Add Your First Job
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" onClick={skipStep}>
                Skip
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const [newSkill, setNewSkill] = useState('')

  const renderSkillsStep = () => {

    const addSkill = () => {
      if (newSkill.trim()) {
        const skill: UserSkill = {
          name: newSkill.trim(),
          level: 3,
          category: 'technical'
        }
        updateTempProfile({
          skills: [...(tempProfile.skills || []), skill]
        })
        setNewSkill('')
      }
    }

    const removeSkill = (index: number) => {
      const updated = [...(tempProfile.skills || [])]
      updated.splice(index, 1)
      updateTempProfile({ skills: updated })
    }

    const updateSkillLevel = (index: number, level: number) => {
      const updated = [...(tempProfile.skills || [])]
      updated[index] = { ...updated[index], level: level as 1 | 2 | 3 | 4 | 5 }
      updateTempProfile({ skills: updated })
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a skill (e.g., React, Python, Project Management)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button onClick={addSkill}>Add</Button>
          </div>

          <div className="space-y-3">
            {(tempProfile.skills || []).map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex items-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateSkillLevel(index, level)}
                        className={`w-4 h-4 rounded-full border ${
                          skill.level >= level 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                      {skill.level === 1 ? 'Beginner' :
                       skill.level === 2 ? 'Novice' :
                       skill.level === 3 ? 'Intermediate' :
                       skill.level === 4 ? 'Advanced' : 'Expert'}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSkill(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {(tempProfile.skills || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Add your skills to get matched with relevant opportunities</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" onClick={skipStep}>
                Skip
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEducationStep = () => {
    const addEducation = () => {
      const newEdu: Education = {
        id: `edu-${Date.now()}`,
        school: '',
        degree: '',
        fieldOfStudy: ''
      }
      updateTempProfile({
        education: [...(tempProfile.education || []), newEdu]
      })
    }

    const updateEducation = (index: number, updates: Partial<Education>) => {
      const updated = [...(tempProfile.education || [])]
      updated[index] = { ...updated[index], ...updates }
      updateTempProfile({ education: updated })
    }

    const removeEducation = (index: number) => {
      const updated = [...(tempProfile.education || [])]
      updated.splice(index, 1)
      updateTempProfile({ education: updated })
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Education
            </div>
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(tempProfile.education || []).map((edu, index) => (
            <div key={edu.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Education #{index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeEducation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="School/University"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, { school: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Degree (e.g., Bachelor's)"
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(index, { degree: e.target.value })}
                  />
                  <Input
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy || ''}
                    onChange={(e) => updateEducation(index, { fieldOfStudy: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}

          {(tempProfile.education || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Add your educational background</p>
              <Button variant="outline" onClick={addEducation} className="mt-3">
                Add Education
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" onClick={skipStep}>
                Skip
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPreferencesStep = () => {
    const preferences = tempProfile.preferences || {
      jobTypes: [],
      locations: [],
      remotePreference: 'flexible',
      industries: [],
      companySizes: []
    }

    const updatePreferences = (updates: Partial<JobPreferences>) => {
      updateTempProfile({
        preferences: { ...preferences, ...updates }
      })
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Job Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Remote Work Preference</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'remote', label: 'Remote Only' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'onsite', label: 'On-site' },
                { value: 'flexible', label: 'Flexible' }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={preferences.remotePreference === option.value ? 'default' : 'outline'}
                  onClick={() => updatePreferences({ remotePreference: option.value as any })}
                  className="text-sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Job Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' },
                { value: 'freelance', label: 'Freelance' }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={preferences.jobTypes.includes(option.value as any) ? 'default' : 'outline'}
                  onClick={() => {
                    const current = preferences.jobTypes
                    const updated = current.includes(option.value as any)
                      ? current.filter(type => type !== option.value)
                      : [...current, option.value as any]
                    updatePreferences({ jobTypes: updated })
                  }}
                  className="text-sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Company Sizes</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'startup', label: 'Startup' },
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'enterprise', label: 'Enterprise' }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={preferences.companySizes.includes(option.value as any) ? 'default' : 'outline'}
                  onClick={() => {
                    const current = preferences.companySizes
                    const updated = current.includes(option.value as any)
                      ? current.filter(size => size !== option.value)
                      : [...current, option.value as any]
                    updatePreferences({ companySizes: updated })
                  }}
                  className="text-sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" onClick={skipStep}>
                Skip
              </Button>
              <Button onClick={nextStep}>
                Complete Setup
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCompleteStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Complete!</h2>
          <p className="text-lg text-gray-600">
            You're all set to discover amazing job opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {progress.completionPercentage}%
            </div>
            <div className="text-sm text-green-700">Profile Complete</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {(tempProfile.skills || []).length}
            </div>
            <div className="text-sm text-blue-700">Skills Added</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              Ready
            </div>
            <div className="text-sm text-purple-700">For Job Matching</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          Your profile has been saved. We're now finding the best job matches for you!
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        {currentStep !== 'welcome' && currentStep !== 'complete' && renderProgressHeader()}
        
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'basic' && renderBasicInfoStep()}
        {currentStep === 'experience' && renderExperienceStep()}
        {currentStep === 'skills' && renderSkillsStep()}
        {currentStep === 'education' && renderEducationStep()}
        {currentStep === 'preferences' && renderPreferencesStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  )
}

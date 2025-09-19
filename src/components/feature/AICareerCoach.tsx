/**
 * AI Career Coach Component
 * Provides AI-powered career guidance, resume optimization, and interview preparation
 */

import { useState } from 'react'
import {
  Bot,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  BookOpen,
  Sparkles,
  Download,
  Copy,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { 
  aiCareerCoach, 
  ResumeOptimization, 
  CoverLetterGeneration, 
  InterviewPrep,
  CareerGuidance,
  WritingTone 
} from '../../services/aiCareerCoach'
import { UserProfile, Job } from '../../services/jobMatchingEngineV2'

interface AICareerCoachProps {
  userProfile: UserProfile
  currentJob?: Job
  className?: string
}

type CoachMode = 'overview' | 'resume' | 'coverLetter' | 'interview' | 'career'

export default function AICareerCoach({ 
  userProfile, 
  currentJob, 
  className = '' 
}: AICareerCoachProps) {
  const [mode, setMode] = useState<CoachMode>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Resume optimization state
  const [resumeBullets, setResumeBullets] = useState<string[]>([
    'Developed web applications using React and Node.js',
    'Collaborated with cross-functional teams to deliver features',
    'Implemented responsive designs and improved user experience'
  ])
  const [resumeOptimization, setResumeOptimization] = useState<ResumeOptimization | null>(null)
  
  // Cover letter state
  const [coverLetterTone, setCoverLetterTone] = useState<WritingTone>('professional')
  const [coverLetter, setCoverLetter] = useState<CoverLetterGeneration | null>(null)
  
  // Interview prep state
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null)
  
  // Career guidance state
  const [careerGuidance, setCareerGuidance] = useState<CareerGuidance | null>(null)

  const handleOptimizeResume = async () => {
    if (!currentJob) {
      setError('Please select a job to optimize your resume for')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const optimization = await aiCareerCoach.optimizeResume(
        userProfile,
        currentJob,
        resumeBullets
      )
      setResumeOptimization(optimization)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!currentJob) {
      setError('Please select a job to generate a cover letter for')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const letter = await aiCareerCoach.generateCoverLetter(
        userProfile,
        currentJob,
        coverLetterTone
      )
      setCoverLetter(letter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrepareInterview = async () => {
    if (!currentJob) {
      setError('Please select a job to prepare for interviews')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const prep = await aiCareerCoach.prepareInterview(userProfile, currentJob)
      setInterviewPrep(prep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare interview materials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCareerGuidance = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const guidance = await aiCareerCoach.getCareerGuidance(userProfile)
      setCareerGuidance(guidance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate career guidance')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Bot className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Career Coach</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Get personalized career guidance powered by AI. Optimize your resume, prepare for interviews, 
          and plan your career growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('resume')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Resume Optimizer</h3>
                <p className="text-sm text-gray-600">Tailor your resume for specific jobs</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('coverLetter')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Cover Letter Writer</h3>
                <p className="text-sm text-gray-600">Generate personalized cover letters</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('interview')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Interview Prep</h3>
                <p className="text-sm text-gray-600">Practice with likely interview questions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('career')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Career Guidance</h3>
                <p className="text-sm text-gray-600">Plan your career path and skill development</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderResumeOptimizer = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => setMode('overview')}>
            ←
          </Button>
          <FileText className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">Resume Optimizer</h2>
        </div>
        {currentJob && (
          <Badge variant="outline">
            Optimizing for: {currentJob.title}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Resume Bullets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeBullets.map((bullet, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-sm text-gray-500 mt-1">•</span>
              <Input
                value={bullet}
                onChange={(e) => {
                  const newBullets = [...resumeBullets]
                  newBullets[index] = e.target.value
                  setResumeBullets(newBullets)
                }}
                className="flex-1"
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setResumeBullets([...resumeBullets, ''])}
            className="w-full"
          >
            Add Bullet Point
          </Button>
        </CardContent>
      </Card>

      <div className="flex space-x-3">
        <Button 
          onClick={handleOptimizeResume}
          disabled={isLoading || !currentJob}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize Resume
            </>
          )}
        </Button>
      </div>

      {resumeOptimization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Optimized Resume</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  +{resumeOptimization.matchImprovement}% match improvement
                </Badge>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(resumeOptimization.optimizedBullets.join('\n'))}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumeOptimization.changes.map((change, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={change.impact === 'high' ? 'default' : change.impact === 'medium' ? 'secondary' : 'outline'}>
                      {change.impact} impact
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">Original:</div>
                    <div className="bg-red-50 p-2 rounded text-red-800">{change.original}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">Optimized:</div>
                    <div className="bg-green-50 p-2 rounded text-green-800">{change.optimized}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Why:</strong> {change.reason}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCoverLetterWriter = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => setMode('overview')}>
            ←
          </Button>
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Cover Letter Writer</h2>
        </div>
        {currentJob && (
          <Badge variant="outline">
            Writing for: {currentJob.title}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Writing Tone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['professional', 'enthusiastic', 'technical', 'conversational'] as WritingTone[]).map(tone => (
              <Button
                key={tone}
                variant={coverLetterTone === tone ? 'default' : 'outline'}
                onClick={() => setCoverLetterTone(tone)}
                className="capitalize"
              >
                {tone}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleGenerateCoverLetter}
        disabled={isLoading || !currentJob}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Cover Letter
          </>
        )}
      </Button>

      {coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Cover Letter</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(coverLetter.coverLetter)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-sm">{coverLetter.coverLetter}</div>
            </div>
            
            {coverLetter.keyPoints.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Points Highlighted:</h4>
                <ul className="space-y-1">
                  {coverLetter.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderInterviewPrep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => setMode('overview')}>
          ←
        </Button>
        <Users className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold">Interview Preparation</h2>
      </div>

      <Button 
        onClick={handlePrepareInterview}
        disabled={isLoading || !currentJob}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <BookOpen className="h-4 w-4 mr-2" />
            Generate Interview Prep
          </>
        )}
      </Button>

      {interviewPrep && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Interview Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviewPrep.commonQuestions.map((q, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{q.question}</span>
                    <Badge variant="outline" className="capitalize">
                      {q.difficulty}
                    </Badge>
                  </div>
                  {q.suggestedAnswer && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Suggested approach:</strong> {q.suggestedAnswer}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interviewPrep.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{tip.tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const renderCareerGuidance = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => setMode('overview')}>
          ←
        </Button>
        <TrendingUp className="h-6 w-6 text-orange-600" />
        <h2 className="text-xl font-semibold">Career Guidance</h2>
      </div>

      <Button 
        onClick={handleGetCareerGuidance}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 mr-2" />
            Get Career Guidance
          </>
        )}
      </Button>

      {careerGuidance && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills to Learn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {careerGuidance.skillsToLearn.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{skill.skill}</span>
                    <div className="text-sm text-gray-600">
                      {skill.timeToLearn} • Market demand: {skill.demandInMarket}/10
                    </div>
                  </div>
                  <Badge variant={skill.priority === 'high' ? 'default' : skill.priority === 'medium' ? 'secondary' : 'outline'}>
                    {skill.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salary Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Range:</span>
                  <span className="font-medium">{careerGuidance.salaryProjection.currentRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1-Year Projection:</span>
                  <span className="font-medium text-green-600">{careerGuidance.salaryProjection.oneYearProjection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">5-Year Projection:</span>
                  <span className="font-medium text-green-600">{careerGuidance.salaryProjection.fiveYearProjection}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === 'overview' && renderOverview()}
      {mode === 'resume' && renderResumeOptimizer()}
      {mode === 'coverLetter' && renderCoverLetterWriter()}
      {mode === 'interview' && renderInterviewPrep()}
      {mode === 'career' && renderCareerGuidance()}
    </div>
  )
}

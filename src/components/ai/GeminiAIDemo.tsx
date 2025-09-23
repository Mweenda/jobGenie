import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, FileText, Target, MessageSquare, TrendingUp } from 'lucide-react'
import { GeminiAIService } from '@/services/GeminiAIService'
import type { Job } from '@/components/shared/JobCard'

const GeminiAIDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  // Mock data for demo
  const mockJob: Job = {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    remote: true,
    salary: '$120,000 - $160,000',
    postedDate: '2025-01-15',
    description: 'We are looking for an experienced Frontend Developer to join our team. You will work on building scalable web applications using React, TypeScript, and modern web technologies.',
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js', 'GraphQL'],
    type: 'Full-time',
    experience: 'Senior',
    saved: false,
    logo: '🏢'
  }

  const mockProfile = {
    name: 'John Doe',
    experience: '5 years of frontend development experience',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
    background: 'Frontend developer with experience in e-commerce and fintech applications',
    preferences: {
      remote: true,
      salaryRange: '$100,000 - $150,000',
      location: 'San Francisco Bay Area'
    },
    goals: 'Looking to advance to a senior role at a tech company'
  }

  const handleDemo = async (demoType: string) => {
    setIsLoading(true)
    setActiveDemo(demoType)
    setResults(null)

    try {
      let result
      switch (demoType) {
        case 'coverLetter': {
          result = await GeminiAIService.generateCoverLetter(mockJob, mockProfile)
          break
        }
        case 'compatibility': {
          result = await GeminiAIService.analyzeJobCompatibility(mockJob, mockProfile)
          break
        }
        case 'interview': {
          result = await GeminiAIService.generateInterviewQuestions(mockJob)
          break
        }
        case 'resume': {
          const mockBullets = [
            'Developed web applications using React and JavaScript',
            'Worked with REST APIs to integrate frontend with backend services',
            'Collaborated with design team to implement UI/UX designs'
          ]
          result = await GeminiAIService.optimizeResumeBullets(mockBullets, mockJob)
          break
        }
        case 'insights': {
          result = await GeminiAIService.generateJobSearchInsights([mockJob], mockProfile)
          break
        }
      }
      setResults(result)
    } catch (error: unknown) {
      console.error('Demo error:', error)
      setResults({ error: 'Failed to generate AI response. Please try again.' })
    } finally {
      setIsLoading(false)
      setActiveDemo(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8" />
          Gemini AI Integration Demo
        </h1>
        <p className="text-muted-foreground">
          Explore JobGenie's AI-powered features using Google's Gemini AI
        </p>
      </div>

      {/* Demo Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Button
          onClick={() => handleDemo('coverLetter')}
          disabled={isLoading}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <FileText className="w-6 h-6" />
          <span>Generate Cover Letter</span>
          {isLoading && activeDemo === 'coverLetter' && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>

        <Button
          onClick={() => handleDemo('compatibility')}
          disabled={isLoading}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <Target className="w-6 h-6" />
          <span>Job Compatibility</span>
          {isLoading && activeDemo === 'compatibility' && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>

        <Button
          onClick={() => handleDemo('interview')}
          disabled={isLoading}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span>Interview Prep</span>
          {isLoading && activeDemo === 'interview' && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>

        <Button
          onClick={() => handleDemo('resume')}
          disabled={isLoading}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <FileText className="w-6 h-6" />
          <span>Resume Optimizer</span>
          {isLoading && activeDemo === 'resume' && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>

        <Button
          onClick={() => handleDemo('insights')}
          disabled={isLoading}
          variant="outline"
          className="h-20 flex flex-col gap-2"
        >
          <TrendingUp className="w-6 h-6" />
          <span>Market Insights</span>
          {isLoading && activeDemo === 'insights' && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>
      </div>

      {/* Mock Job Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{mockJob.logo}</span>
            Demo Job: {mockJob.title} at {mockJob.company}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Location:</strong> {mockJob.location} {mockJob.remote && <Badge variant="secondary">Remote</Badge>}</p>
            <p><strong>Salary:</strong> {mockJob.salary}</p>
            <p><strong>Skills:</strong> {mockJob.skills.map(skill => (
              <Badge key={skill} variant="outline" className="mr-1">{skill}</Badge>
            ))}</p>
            <p><strong>Description:</strong> {mockJob.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Generated Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                {results.error}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cover Letter Result */}
                {typeof results === 'string' && (
                  <div>
                    <h3 className="font-semibold mb-2">Generated Cover Letter:</h3>
                    <Textarea
                      value={results}
                      readOnly
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {/* Compatibility Analysis Result */}
                {results.compatibilityScore && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Compatibility Score:</h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
                          {results.compatibilityScore}%
                        </div>
                        <span className="text-muted-foreground">Match</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Strengths:</h3>
                      <div className="flex flex-wrap gap-2">
                        {results.strengths?.map((strength: string, i: number) => (
                          <Badge key={i} variant="default">{strength}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Areas to Develop:</h3>
                      <div className="flex flex-wrap gap-2">
                        {results.gaps?.map((gap: string, i: number) => (
                          <Badge key={i} variant="outline">{gap}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Recommendations:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Summary:</h3>
                      <p className="text-sm text-muted-foreground">{results.summary}</p>
                    </div>
                  </div>
                )}

                {/* Interview Questions Result */}
                {results.technical && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Technical Questions:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.technical.map((q: string, i: number) => (
                          <li key={i} className="text-sm">{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Behavioral Questions:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.behavioral.map((q: string, i: number) => (
                          <li key={i} className="text-sm">{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Company-Specific Questions:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.companySpecific.map((q: string, i: number) => (
                          <li key={i} className="text-sm">{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Preparation Tips:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.tips.map((tip: string, i: number) => (
                          <li key={i} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Resume Optimization Result */}
                {results.optimizedBullets && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Optimized Resume Bullets:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.optimizedBullets.map((bullet: string, i: number) => (
                          <li key={i} className="text-sm">{bullet}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Keywords Added:</h3>
                      <div className="flex flex-wrap gap-2">
                        {results.keywordsAdded?.map((keyword: string, i: number) => (
                          <Badge key={i} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Suggestions:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.suggestions?.map((suggestion: string, i: number) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Market Insights Result */}
                {results.marketTrends && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Opportunity Score:</h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
                          {results.opportunityScore}%
                        </div>
                        <span className="text-muted-foreground">Market Opportunity</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Market Trends:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.marketTrends.map((trend: string, i: number) => (
                          <li key={i} className="text-sm">{trend}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Skill Gaps:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.skillGaps.map((gap: string, i: number) => (
                          <li key={i} className="text-sm">{gap}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Recommendations:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {results.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Summary:</h3>
                      <p className="text-sm text-muted-foreground">{results.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">To use Gemini AI features in your JobGenie app:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Get your Gemini API key from <a href="https://aistudio.google.com/app/apikey" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Add <code>VITE_GEMINI_API_KEY=your_key_here</code> to your <code>.env</code> file</li>
            <li>The Firebase AI integration is already configured in <code>src/lib/firebase.ts</code></li>
            <li>Use <code>GeminiAIService</code> methods in your components for AI features</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This demo uses mock data. In production, you'll connect to your user profiles and real job data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeminiAIDemo

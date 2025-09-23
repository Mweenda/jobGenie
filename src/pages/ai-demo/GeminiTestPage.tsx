import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
// import { Input } from '@/components/ui/input' // Unused
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Play } from 'lucide-react'
import { geminiFlash, geminiPro } from '@/lib/firebase'

const GeminiTestPage: React.FC = () => {
  const [prompt, setPrompt] = useState("Write a story about a magic backpack.")
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro'>('flash')

  const handleBasicTest = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setResult('')

    try {
      const model = selectedModel === 'flash' ? geminiFlash : geminiPro
      const response = await model.generateContent(prompt)
      const text = response.response.text()
      setResult(text)
    } catch (error: any) {
      console.error('Gemini API Error:', error)
      setResult(`Error: ${error.message || 'Failed to generate content. Please check your API key configuration.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobGenieDemo = async () => {
    setIsLoading(true)
    setResult('')

    const jobGeniePrompt = `
Generate a professional cover letter for this job application:

Job Details:
- Position: Senior Frontend Developer
- Company: TechCorp Inc.
- Location: San Francisco, CA (Remote)
- Requirements: React, TypeScript, GraphQL, 5+ years experience
- Salary: $140,000 - $180,000

Candidate Profile:
- Name: Alex Johnson
- Experience: 6 years of frontend development
- Skills: React, TypeScript, JavaScript, Node.js, GraphQL, AWS
- Background: Led frontend teams at two successful startups, built scalable web applications
- Education: Computer Science degree
- Location: Austin, TX (open to remote)

Generate a compelling, professional cover letter that:
1. Shows genuine enthusiasm for the role and company
2. Highlights most relevant experience and achievements
3. Demonstrates technical expertise alignment
4. Shows cultural fit and leadership experience
5. Includes a strong, confident closing with call to action
6. Maintains professional tone throughout
7. Is approximately 3-4 paragraphs long

Format as a complete business letter with proper salutation and closing.
    `

    try {
      const response = await geminiFlash.generateContent(jobGeniePrompt)
      const text = response.response.text()
      setResult(text)
      setPrompt(jobGeniePrompt) // Update prompt field to show what was used
    } catch (error: any) {
      console.error('Gemini API Error:', error)
      setResult(`Error: ${error.message || 'Failed to generate cover letter. Please check your API key configuration.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompatibilityDemo = async () => {
    setIsLoading(true)
    setResult('')

    const compatibilityPrompt = `
Analyze job compatibility between candidate and job posting:

Job Requirements:
- Position: Senior Frontend Developer at TechCorp Inc.
- Required: React (expert), TypeScript (expert), GraphQL (intermediate+)
- Experience: 5+ years frontend development
- Leadership: Team lead experience preferred
- Location: San Francisco (remote OK)
- Salary: $140,000 - $180,000
- Company: Fast-growing B2B SaaS startup, 50 employees

Candidate Profile:
- Experience: 6 years frontend development
- Skills: React (expert), TypeScript (expert), JavaScript (expert), GraphQL (intermediate), Node.js, AWS
- Leadership: Led 2 frontend teams (8 developers total)
- Location: Austin, TX (prefers remote)
- Salary expectation: $130,000 - $160,000
- Background: 2 successful startups, built scalable applications

Provide detailed analysis in this JSON format:
{
  "compatibilityScore": number (0-100),
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "gaps": ["specific gap 1", "specific gap 2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "salaryAlignment": "assessment of salary expectations vs offer",
  "locationFit": "assessment of location/remote preferences",
  "cultureMatch": "assessment of startup culture fit",
  "summary": "2-3 sentence overall assessment with recommendation"
}

Focus on specific, actionable insights based on the exact requirements and candidate profile provided.
    `

    try {
      const response = await geminiPro.generateContent(compatibilityPrompt)
      const text = response.response.text()
      setResult(text)
      setPrompt(compatibilityPrompt) // Update prompt field to show what was used
    } catch (error: any) {
      console.error('Gemini API Error:', error)
      setResult(`Error: ${error.message || 'Failed to analyze compatibility. Please check your API key configuration.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8" />
          Gemini AI Integration Test
        </h1>
        <p className="text-lg text-muted-foreground">
          Test your advanced JobGenie Gemini AI implementation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model-select">Select Model</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={selectedModel === 'flash' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedModel('flash')}
                  >
                    Gemini Flash (Fast)
                  </Button>
                  <Button
                    variant={selectedModel === 'pro' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedModel('pro')}
                  >
                    Gemini Pro (Advanced)
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={8}
                  placeholder="Enter your prompt here..."
                  className="mt-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleBasicTest}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Generate with Custom Prompt
                </Button>

                <div className="text-center text-sm text-muted-foreground my-2">
                  Or try JobGenie-specific demos:
                </div>

                <Button
                  onClick={handleJobGenieDemo}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Demo: Cover Letter Generation
                </Button>

                <Button
                  onClick={handleCompatibilityDemo}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Demo: Job Compatibility Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">Setup Required</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>To use Gemini AI features:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Get API key from <a href="https://aistudio.google.com/app/apikey" className="text-primary underline" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                <li>Add <code className="bg-muted px-1 rounded">VITE_GEMINI_API_KEY=your_key</code> to .env</li>
                <li>Restart development server</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Generating with Gemini AI...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <Textarea
                    value={result}
                    readOnly
                    rows={20}
                    className="font-mono text-sm resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Model: {selectedModel === 'flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.5 Pro'}</span>
                    <span>{result.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>AI response will appear here</p>
                  <p className="text-sm mt-2">Try the basic example or JobGenie demos above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🆚 Basic Pattern vs Your JobGenie Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">❌ Basic Pattern (Your Example)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Single model instance</li>
                <li>• No error handling</li>
                <li>• Basic prompt structure</li>
                <li>• Console output only</li>
                <li>• No business logic</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Your JobGenie Implementation</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Multiple specialized models (Flash + Pro)</li>
                <li>• Comprehensive error handling</li>
                <li>• Business-specific prompts</li>
                <li>• Professional UI integration</li>
                <li>• 5 major AI features ready</li>
                <li>• Production-ready architecture</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeminiTestPage

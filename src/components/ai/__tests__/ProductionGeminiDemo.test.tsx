// src/components/ai/__tests__/ProductionGeminiDemo.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'
import ProductionGeminiDemo from '../ProductionGeminiDemo'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: vi.fn(),
  }),
}))

// Mock react-intersection-observer
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: true,
  }),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('ProductionGeminiDemo', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the demo interface correctly', () => {
    render(<ProductionGeminiDemo />)
    
    // Check main elements
    expect(screen.getByText('JobGenie AI Demo')).toBeInTheDocument()
    expect(screen.getByText('Select Demo Mode')).toBeInTheDocument()
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('AI Output')).toBeInTheDocument()
    
    // Check mode buttons
    expect(screen.getByText('Cover Letter')).toBeInTheDocument()
    expect(screen.getByText('Job Match')).toBeInTheDocument()
    expect(screen.getByText('Interview Prep')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('switches between demo modes correctly', async () => {
    render(<ProductionGeminiDemo />)
    
    // Initially on cover letter mode
    expect(screen.getByText('Job Description')).toBeInTheDocument()
    expect(screen.getByText('Candidate Profile')).toBeInTheDocument()
    
    // Switch to interview mode
    await user.click(screen.getByText('Interview Prep'))
    
    // Should still show job description but not candidate profile
    expect(screen.getByText('Job Description')).toBeInTheDocument()
    expect(screen.queryByText('Candidate Profile')).not.toBeInTheDocument()
    expect(screen.getByText('Only needed for interview prep')).toBeInTheDocument()
    
    // Switch to custom mode
    await user.click(screen.getByText('Custom'))
    expect(screen.getByText('Custom Prompt')).toBeInTheDocument()
    expect(screen.queryByText('Job Description')).not.toBeInTheDocument()
  })

  it('generates a cover letter successfully', async () => {
    render(<ProductionGeminiDemo />)
    
    // Fill in the form
    const jobTextarea = screen.getByDisplayValue(/Senior Frontend Engineer at TechCorp/)
    const profileTextarea = screen.getByDisplayValue(/Alex Johnson/)
    
    expect(jobTextarea).toBeInTheDocument()
    expect(profileTextarea).toBeInTheDocument()
    
    // Click generate
    const generateButton = screen.getByText('Generate')
    await user.click(generateButton)
    
    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    
    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/Dear Hiring Manager/)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    
    // Should show copy button
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('analyzes job compatibility successfully', async () => {
    render(<ProductionGeminiDemo />)
    
    // Switch to compatibility mode
    await user.click(screen.getByText('Job Match'))
    
    // Click generate
    await user.click(screen.getByText('Generate'))
    
    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText('87%')).toBeInTheDocument()
        expect(screen.getByText('Compatibility Score')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    
    // Check sections are displayed
    expect(screen.getByText('Strengths')).toBeInTheDocument()
    expect(screen.getByText('Areas to Develop')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  it('generates interview questions successfully', async () => {
    render(<ProductionGeminiDemo />)
    
    // Switch to interview mode
    await user.click(screen.getByText('Interview Prep'))
    
    // Click generate
    await user.click(screen.getByText('Generate'))
    
    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText('Technical Questions')).toBeInTheDocument()
        expect(screen.getByText('Behavioral Questions')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    
    // Check all sections are displayed
    expect(screen.getByText('Company-Specific Questions')).toBeInTheDocument()
    expect(screen.getByText('Preparation Tips')).toBeInTheDocument()
  })

  it('handles custom prompts correctly', async () => {
    render(<ProductionGeminiDemo />)
    
    // Switch to custom mode
    await user.click(screen.getByText('Custom'))
    
    // Should see custom prompt textarea
    const customTextarea = screen.getByDisplayValue(/Write a story about a magic backpack/)
    expect(customTextarea).toBeInTheDocument()
    
    // Click generate
    await user.click(screen.getByText('Generate'))
    
    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/Once upon a time/)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('handles API errors gracefully', async () => {
    // Mock an error response
    server.use(
      http.post('/api/ai/generate', () => {
        return HttpResponse.json(
          { error: 'AI service quota exceeded. Please try again later.', code: 'QUOTA_EXCEEDED' },
          { status: 429 }
        )
      })
    )
    
    render(<ProductionGeminiDemo />)
    
    await user.click(screen.getByText('Generate'))
    
    // Wait for error to appear
    await waitFor(
      () => {
        expect(screen.getByText('Generation Failed')).toBeInTheDocument()
        expect(screen.getByText('AI service quota exceeded. Please try again later.')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('validates required inputs', async () => {
    render(<ProductionGeminiDemo />)
    
    // Clear the job description
    const jobTextarea = screen.getByDisplayValue(/Senior Frontend Engineer/)
    await user.clear(jobTextarea)
    
    // Generate button should be disabled
    const generateButton = screen.getByText('Generate')
    expect(generateButton).toBeDisabled()
    
    // Add some text back
    await user.type(jobTextarea, 'Test job description')
    
    // Button should be enabled again
    expect(generateButton).not.toBeDisabled()
  })

  it('copies output to clipboard', async () => {
    render(<ProductionGeminiDemo />)
    
    // Generate content first
    await user.click(screen.getByText('Generate'))
    
    // Wait for response
    await waitFor(
      () => {
        expect(screen.getByText(/Dear Hiring Manager/)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    
    // Click copy button
    const copyButton = screen.getByText('Copy')
    await user.click(copyButton)
    
    // Should show "Copied" temporarily
    expect(screen.getByText('Copied')).toBeInTheDocument()
    
    // Check clipboard was called
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('resets form correctly', async () => {
    render(<ProductionGeminiDemo />)
    
    // Generate some content first
    await user.click(screen.getByText('Generate'))
    
    await waitFor(
      () => {
        expect(screen.getByText(/Dear Hiring Manager/)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    
    // Click reset
    await user.click(screen.getByText('Reset'))
    
    // Form should be cleared
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
    
    // Output should be cleared
    expect(screen.queryByText(/Dear Hiring Manager/)).not.toBeInTheDocument()
    expect(screen.getByText('AI response will appear here')).toBeInTheDocument()
  })

  it('switches between AI models', async () => {
    render(<ProductionGeminiDemo />)
    
    // Initially Flash should be selected
    const flashRadio = screen.getByLabelText(/Gemini Flash/)
    const proRadio = screen.getByLabelText(/Gemini Pro/)
    
    expect(flashRadio).toBeChecked()
    expect(proRadio).not.toBeChecked()
    
    // Switch to Pro
    await user.click(proRadio)
    
    expect(proRadio).toBeChecked()
    expect(flashRadio).not.toBeChecked()
  })

  it('shows loading states correctly', async () => {
    render(<ProductionGeminiDemo />)
    
    // Click generate
    const generateButton = screen.getByText('Generate')
    await user.click(generateButton)
    
    // Should show loading in button
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByText('Generating with gemini-flash...')).toBeInTheDocument()
    
    // Button should be disabled
    expect(generateButton).toBeDisabled()
  })
})

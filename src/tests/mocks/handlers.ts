// src/tests/mocks/handlers.ts - MSW handlers for AI API testing
import { http, HttpResponse } from 'msw'

// Mock responses for different scenarios
const mockResponses = {
  coverLetter: {
    text: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Frontend Engineer position at TechCorp. With 6 years of frontend development experience and a proven track record of leading teams at successful startups, I am excited about the opportunity to contribute to your innovative projects.

My extensive experience with React, TypeScript, and JavaScript directly aligns with your technical requirements. Throughout my career, I have built scalable e-commerce and fintech applications, consistently focusing on performance optimization and exceptional user experiences. My background in UI/UX design enables me to bridge the gap between technical implementation and user-centered design principles.

As a team leader who has mentored junior developers and guided technical decisions, I am particularly drawn to the leadership aspects of this role. I thrive in collaborative environments and believe my experience scaling frontend architectures would be valuable as TechCorp continues to grow.

I would welcome the opportunity to discuss how my skills and passion for frontend development can contribute to TechCorp's success. Thank you for considering my application.

Sincerely,
Alex Johnson`,
    meta: {
      model: 'gemini-flash',
      tokensUsed: 180,
      cached: false,
      generatedAt: new Date().toISOString(),
      cost: 0.00018
    }
  },

  compatibility: {
    text: JSON.stringify({
      compatibilityScore: 87,
      strengths: [
        "6+ years experience exceeds 5-year requirement",
        "Strong React and TypeScript expertise",
        "Leadership experience with team mentoring",
        "Startup experience matches company culture",
        "UI/UX design skills add extra value"
      ],
      gaps: [
        "GraphQL experience not explicitly mentioned",
        "No specific mention of scalable architecture patterns"
      ],
      recommendations: [
        "Highlight any GraphQL projects or willingness to learn",
        "Prepare examples of scalable frontend architectures you've built",
        "Research TechCorp's specific tech stack and challenges"
      ],
      summary: "Excellent match with strong technical skills and leadership experience. Minor gaps in GraphQL can be easily addressed through examples or learning commitment."
    }),
    meta: {
      model: 'gemini-pro',
      tokensUsed: 220,
      cached: false,
      generatedAt: new Date().toISOString(),
      cost: 0.0011
    }
  },

  interview: {
    text: JSON.stringify({
      technical: [
        "How would you optimize the performance of a React application with large datasets?",
        "Explain the differences between TypeScript interfaces and types, and when to use each",
        "How do you handle state management in complex React applications?",
        "Describe your approach to implementing responsive design with modern CSS",
        "What strategies do you use for code splitting and lazy loading in React?"
      ],
      behavioral: [
        "Tell me about a time you had to mentor a junior developer through a challenging project",
        "How do you handle disagreements with team members about technical decisions?",
        "Describe a situation where you had to learn a new technology quickly",
        "How do you prioritize tasks when working on multiple projects simultaneously?"
      ],
      companySpecific: [
        "What interests you most about working at a growing tech company like TechCorp?",
        "How would you contribute to building a positive engineering culture?",
        "What questions do you have about our technical challenges and roadmap?"
      ],
      tips: [
        "Research TechCorp's recent product launches and technical blog posts",
        "Prepare specific examples of React performance optimizations you've implemented",
        "Practice explaining complex technical concepts in simple terms",
        "Prepare questions about the team structure and development processes",
        "Review TypeScript best practices and common patterns"
      ]
    }),
    meta: {
      model: 'gemini-flash',
      tokensUsed: 195,
      cached: false,
      generatedAt: new Date().toISOString(),
      cost: 0.000195
    }
  },

  custom: {
    text: `Once upon a time, in a world where job searching felt like wandering through an endless maze, there lived a young professional named Sam who carried a very special backpack.

This wasn't just any ordinary backpack – it was woven from threads of ambition and lined with pockets of possibility. Every morning, Sam would pack it with resumes, cover letters, and dreams, but somehow, the backpack always seemed to know exactly what Sam needed most.

One day, while preparing for a particularly important interview, Sam reached into the main compartment and pulled out not just a resume, but one that had magically tailored itself to highlight exactly the right experiences. The backpack had somehow reorganized Sam's work history to tell the perfect story for this specific role.

As Sam walked to the interview, the backpack whispered confidence-boosting affirmations and reminded Sam of past achievements. During the interview, when asked about handling challenging projects, Sam reached into a side pocket and found detailed examples that perfectly answered each question.

The magic backpack didn't just help Sam get the job – it helped Sam discover their true calling. It revealed that the perfect career wasn't about finding the right job posting, but about understanding one's own unique value and finding where it could make the greatest impact.

From that day forward, Sam shared the backpack's wisdom with others, helping fellow job seekers discover that the real magic wasn't in the backpack at all – it was in believing in themselves and their ability to create their own career adventures.

And they all lived successfully ever after.`,
    meta: {
      model: 'gemini-flash',
      tokensUsed: 285,
      cached: false,
      generatedAt: new Date().toISOString(),
      cost: 0.000285
    }
  }
}

export const handlers = [
  // Successful AI generation
  http.post('/api/ai/generate', async ({ request }) => {
    const body = await request.json() as any
    const { prompt, options } = body

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Determine response type based on prompt content
    let responseKey: keyof typeof mockResponses = 'custom'
    
    if (prompt.includes('cover letter') || prompt.includes('Cover Letter')) {
      responseKey = 'coverLetter'
    } else if (prompt.includes('compatibility') || prompt.includes('JSON format')) {
      responseKey = 'compatibility'
    } else if (prompt.includes('interview') || prompt.includes('questions')) {
      responseKey = 'interview'
    }

    const response = mockResponses[responseKey]
    
    return HttpResponse.json({
      ...response,
      meta: {
        ...response.meta,
        model: options?.model || 'gemini-flash'
      }
    })
  }),

  // Rate limit error simulation
  http.post('/api/ai/generate-rate-limited', () => {
    return HttpResponse.json(
      {
        error: 'Too many AI requests from this IP, please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: 900000 // 15 minutes
      },
      { status: 429 }
    )
  }),

  // Server error simulation
  http.post('/api/ai/generate-error', () => {
    return HttpResponse.json(
      {
        error: 'Internal server error. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }),

  // Invalid input simulation
  http.post('/api/ai/generate-invalid', () => {
    return HttpResponse.json(
      {
        error: 'Prompt is required and must be a string',
        code: 'INVALID_INPUT'
      },
      { status: 400 }
    )
  }),

  // Quota exceeded simulation
  http.post('/api/ai/generate-quota', () => {
    return HttpResponse.json(
      {
        error: 'AI service quota exceeded. Please try again later.',
        code: 'QUOTA_EXCEEDED'
      },
      { status: 429 }
    )
  })
]

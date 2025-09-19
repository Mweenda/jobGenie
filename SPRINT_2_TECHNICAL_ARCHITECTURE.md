# 🏗️ JobGenie Sprint 2: Technical Architecture & TDD Strategy

## 🎯 **Sprint 2 Goal**
Transform JobGenie into a **two-sided marketplace** connecting job seekers with recruiters through AI-powered tools, global job aggregation, and sustainable monetization.

---

## 🧪 **TDD Strategy: Test-First Development**

### **TDD Workflow for Every Feature:**
```
1. 🔴 RED: Write failing tests first (define expected behavior)
2. 🟢 GREEN: Write minimal code to make tests pass
3. 🔵 REFACTOR: Improve code quality while keeping tests green
4. 📊 MEASURE: Verify performance and business metrics
```

### **Test Pyramid Structure:**
```
        🔺 E2E Tests (5%)
       🔺🔺 Integration Tests (15%)
    🔺🔺🔺🔺 Unit Tests (80%)
```

---

## 🏛️ **System Architecture Overview**

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Job Seekers   │    │    Recruiters   │    │   Admin Panel   │
│   (React App)   │    │   (React App)   │    │   (React App)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌─────────────────────────────────┐
              │        API Gateway              │
              │     (Express.js + Auth)         │
              └─────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Job Matching   │    │   Recruiter     │    │   Payment       │
│    Service      │    │    Service      │    │   Service       │
│  (Node.js +     │    │  (Node.js +     │    │  (Stripe +      │
│   OpenAI +      │    │   Firebase)     │    │   Firebase)     │
│   Pinecone)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌─────────────────────────────────┐
              │        Data Layer               │
              │   Firebase + Vector DB          │
              └─────────────────────────────────┘
```

---

## 🔧 **Core Services Architecture**

### **1. Job Aggregation Service**

#### **TDD Test Cases (Write First):**
```typescript
// tests/services/jobAggregation.test.ts
describe('JobAggregationService', () => {
  describe('aggregateJobs', () => {
    it('should fetch jobs from Indeed API within 2s', async () => {
      const startTime = Date.now()
      const jobs = await JobAggregationService.fetchFromIndeed()
      const duration = Date.now() - startTime
      
      expect(duration).toBeLessThan(2000)
      expect(jobs).toHaveLength.greaterThan(0)
      expect(jobs[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        company: expect.any(String),
        location: expect.any(String),
        source: 'indeed'
      })
    })

    it('should deduplicate jobs across sources', async () => {
      const indeedJobs = await JobAggregationService.fetchFromIndeed()
      const glassdoorJobs = await JobAggregationService.fetchFromGlassdoor()
      const deduplicated = JobAggregationService.deduplicateJobs([...indeedJobs, ...glassdoorJobs])
      
      const uniqueTitles = new Set(deduplicated.map(job => `${job.title}-${job.company}`))
      expect(uniqueTitles.size).toBe(deduplicated.length)
    })

    it('should map external job schemas to unified schema', async () => {
      const externalJob = { /* Indeed API format */ }
      const unifiedJob = JobAggregationService.mapToUnifiedSchema(externalJob, 'indeed')
      
      expect(unifiedJob).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        company: expect.objectContaining({
          name: expect.any(String),
          size: expect.any(String)
        }),
        location: expect.objectContaining({
          city: expect.any(String),
          country: expect.any(String)
        }),
        salary: expect.any(Object),
        requirements: expect.any(Array),
        source: 'indeed',
        sourceId: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })
})
```

#### **Implementation (After Tests):**
```typescript
// src/services/jobAggregationService.ts
export class JobAggregationService {
  private static readonly APIS = {
    indeed: new IndeedAPI(),
    glassdoor: new GlassdoorAPI(),
    remoteOk: new RemoteOkAPI()
  }

  static async aggregateJobs(): Promise<UnifiedJob[]> {
    const promises = Object.entries(this.APIS).map(async ([source, api]) => {
      try {
        const jobs = await api.fetchJobs()
        return jobs.map(job => this.mapToUnifiedSchema(job, source))
      } catch (error) {
        console.error(`Failed to fetch from ${source}:`, error)
        return []
      }
    })

    const allJobs = (await Promise.all(promises)).flat()
    return this.deduplicateJobs(allJobs)
  }

  static deduplicateJobs(jobs: UnifiedJob[]): UnifiedJob[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.name.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  static mapToUnifiedSchema(externalJob: any, source: string): UnifiedJob {
    // Implementation based on source-specific mapping logic
    // This ensures consistent schema across all job sources
  }
}
```

### **2. AI-Powered Recruiter Service**

#### **TDD Test Cases:**
```typescript
// tests/services/recruiterAI.test.ts
describe('RecruiterAIService', () => {
  describe('semanticCandidateSearch', () => {
    it('should find candidates within 5s using semantic search', async () => {
      const query = "Senior React developer with TypeScript experience"
      const startTime = Date.now()
      
      const results = await RecruiterAIService.semanticSearch(query, {
        limit: 10,
        experienceLevel: 'senior'
      })
      
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(5000)
      expect(results.candidates).toHaveLength.lessThanOrEqual(10)
      expect(results.searchTime).toBeLessThan(5000)
    })

    it('should generate explainable candidate summaries', async () => {
      const candidate = mockCandidate()
      const summary = await RecruiterAIService.generateCandidateSummary(candidate)
      
      expect(summary).toMatchObject({
        candidateId: candidate.id,
        summary: expect.any(String),
        keyStrengths: expect.any(Array),
        matchReasons: expect.any(Array),
        confidenceScore: expect.any(Number),
        generatedAt: expect.any(Date)
      })
      
      expect(summary.summary.length).toBeGreaterThan(100)
      expect(summary.keyStrengths).toHaveLength.greaterThan(0)
      expect(summary.confidenceScore).toBeGreaterThanOrEqual(0)
      expect(summary.confidenceScore).toBeLessThanOrEqual(1)
    })

    it('should provide recruiter chatbot assistance', async () => {
      const conversation = [
        { role: 'user', content: 'Find React developers in San Francisco' }
      ]
      
      const response = await RecruiterAIService.chatbotAssist(conversation)
      
      expect(response).toMatchObject({
        message: expect.any(String),
        suggestedActions: expect.any(Array),
        candidateResults: expect.any(Array),
        searchQuery: expect.any(Object)
      })
    })
  })

  describe('creditSystem', () => {
    it('should deduct credits for premium searches', async () => {
      const recruiter = mockRecruiter({ credits: 10 })
      const initialCredits = recruiter.credits
      
      await RecruiterAIService.performPremiumSearch(recruiter.id, 'React developer')
      
      const updatedRecruiter = await RecruiterService.getById(recruiter.id)
      expect(updatedRecruiter.credits).toBe(initialCredits - 1)
    })

    it('should prevent searches when credits are insufficient', async () => {
      const recruiter = mockRecruiter({ credits: 0 })
      
      await expect(
        RecruiterAIService.performPremiumSearch(recruiter.id, 'React developer')
      ).rejects.toThrow('Insufficient credits')
    })
  })
})
```

### **3. Payment & Subscription Service**

#### **TDD Test Cases:**
```typescript
// tests/services/payment.test.ts
describe('PaymentService', () => {
  describe('subscriptionManagement', () => {
    it('should create Stripe subscription for Pro tier', async () => {
      const user = mockUser()
      const subscription = await PaymentService.createSubscription(user.id, 'pro')
      
      expect(subscription).toMatchObject({
        userId: user.id,
        tier: 'pro',
        status: 'active',
        stripeSubscriptionId: expect.any(String),
        currentPeriodEnd: expect.any(Date)
      })
    })

    it('should handle payment method updates', async () => {
      const subscription = mockSubscription()
      const newPaymentMethod = 'pm_test_card'
      
      const updated = await PaymentService.updatePaymentMethod(
        subscription.id, 
        newPaymentMethod
      )
      
      expect(updated.paymentMethod).toBe(newPaymentMethod)
    })

    it('should process credit purchases', async () => {
      const user = mockUser()
      const purchase = await PaymentService.purchaseCredits(user.id, {
        amount: 50,
        paymentMethod: 'pm_test_card'
      })
      
      expect(purchase).toMatchObject({
        userId: user.id,
        creditsAdded: 50,
        amountPaid: expect.any(Number),
        transactionId: expect.any(String)
      })
      
      const updatedUser = await UserService.getById(user.id)
      expect(updatedUser.credits).toBe(user.credits + 50)
    })
  })

  describe('webhookHandling', () => {
    it('should handle Stripe subscription cancellation webhook', async () => {
      const webhookEvent = mockStripeWebhook('customer.subscription.deleted')
      
      await PaymentService.handleWebhook(webhookEvent)
      
      const subscription = await SubscriptionService.getByStripeId(
        webhookEvent.data.object.id
      )
      expect(subscription.status).toBe('cancelled')
    })
  })
})
```

---

## 📊 **Data Models & Schema**

### **Unified Job Schema:**
```typescript
interface UnifiedJob {
  id: string
  title: string
  company: {
    name: string
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
    industry: string
    logo?: string
    glassdoorRating?: number
  }
  location: {
    city: string
    state?: string
    country: string
    remote: boolean
    timezone?: string
  }
  salary?: {
    min?: number
    max?: number
    currency: string
    period: 'hourly' | 'monthly' | 'annually'
  }
  requirements: {
    skills: string[]
    experience: 'entry' | 'mid' | 'senior' | 'lead'
    education?: string
    languages?: string[]
  }
  description: string
  benefits?: string[]
  source: 'indeed' | 'glassdoor' | 'remoteok' | 'linkedin'
  sourceId: string
  sourceUrl: string
  postedAt: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### **Recruiter Profile Schema:**
```typescript
interface RecruiterProfile {
  id: string
  userId: string
  companyId: string
  role: 'recruiter' | 'hiring_manager' | 'admin'
  subscription: {
    tier: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'past_due'
    currentPeriodEnd: Date
  }
  credits: number
  searchHistory: SearchRecord[]
  preferences: {
    industries: string[]
    locations: string[]
    remoteOk: boolean
  }
  createdAt: Date
  updatedAt: Date
}
```

### **Subscription Tiers:**
```typescript
interface SubscriptionTier {
  name: 'free' | 'pro' | 'enterprise'
  price: number
  currency: 'USD'
  period: 'monthly' | 'annually'
  features: {
    candidateSearches: number // per month
    aiSummaries: number
    exportData: boolean
    prioritySupport: boolean
    customIntegrations: boolean
  }
  limits: {
    maxSearchResults: number
    maxSavedCandidates: number
    maxTeamMembers: number
  }
}
```

---

## 🔌 **API Design (RESTful + GraphQL)**

### **REST Endpoints:**
```typescript
// Job Aggregation API
GET    /api/v1/jobs                    // List jobs with filters
GET    /api/v1/jobs/:id               // Get job details
POST   /api/v1/jobs/search            // Advanced job search
GET    /api/v1/jobs/sources           // Available job sources

// Recruiter API
GET    /api/v1/recruiters/candidates  // Search candidates
POST   /api/v1/recruiters/candidates/search // Semantic search
GET    /api/v1/recruiters/candidates/:id/summary // AI summary
POST   /api/v1/recruiters/candidates/:id/contact // Contact candidate

// Payment API
GET    /api/v1/billing/subscription   // Current subscription
POST   /api/v1/billing/subscription   // Create/update subscription
POST   /api/v1/billing/credits        // Purchase credits
GET    /api/v1/billing/invoices       // Invoice history
POST   /api/v1/billing/webhook        // Stripe webhook
```

### **GraphQL Schema:**
```graphql
type Query {
  jobs(filters: JobFilters, pagination: Pagination): JobConnection!
  candidates(query: String!, filters: CandidateFilters): CandidateConnection!
  subscription: Subscription
  searchHistory: [SearchRecord!]!
}

type Mutation {
  searchCandidates(query: String!, filters: CandidateFilters): SearchResult!
  generateCandidateSummary(candidateId: ID!): CandidateSummary!
  contactCandidate(candidateId: ID!, message: String!): ContactResult!
  purchaseCredits(amount: Int!, paymentMethod: String!): CreditPurchase!
  updateSubscription(tier: SubscriptionTier!): Subscription!
}

type Subscription {
  newJobsAdded(filters: JobFilters): Job!
  candidateResponse(contactId: ID!): CandidateMessage!
}
```

---

## 🧠 **AI/ML Pipeline Architecture**

### **Vector Search Pipeline:**
```
Job/Candidate Text → Embedding Model → Vector DB → Similarity Search
                   (OpenAI)         (Pinecone)    (Semantic Results)
```

### **TDD for AI Components:**
```typescript
// tests/ai/embeddings.test.ts
describe('EmbeddingService', () => {
  it('should generate consistent embeddings for identical text', async () => {
    const text = "Senior React Developer with TypeScript"
    const embedding1 = await EmbeddingService.generate(text)
    const embedding2 = await EmbeddingService.generate(text)
    
    expect(embedding1).toEqual(embedding2)
    expect(embedding1).toHaveLength(1536) // OpenAI embedding dimension
  })

  it('should find similar candidates using vector similarity', async () => {
    const query = "React developer with 5 years experience"
    const results = await VectorSearchService.findSimilarCandidates(query, {
      threshold: 0.8,
      limit: 10
    })
    
    expect(results.every(r => r.similarity >= 0.8)).toBe(true)
    expect(results).toHaveLength.lessThanOrEqual(10)
  })
})
```

---

## 💳 **Payment Infrastructure**

### **Stripe Integration Architecture:**
```typescript
// TDD Test for Payment Processing
describe('StripeService', () => {
  it('should process subscription payments securely', async () => {
    const paymentIntent = await StripeService.createPaymentIntent({
      amount: 2999, // $29.99
      currency: 'usd',
      customer: 'cus_test123',
      metadata: { subscriptionTier: 'pro' }
    })
    
    expect(paymentIntent.status).toBe('requires_payment_method')
    expect(paymentIntent.amount).toBe(2999)
  })

  it('should handle failed payments gracefully', async () => {
    const failedPayment = await StripeService.simulateFailedPayment('pm_card_declined')
    
    expect(failedPayment.status).toBe('requires_payment_method')
    expect(failedPayment.last_payment_error).toBeDefined()
  })
})
```

### **Subscription Tiers Implementation:**
```typescript
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'free',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: {
      candidateSearches: 5,
      aiSummaries: 2,
      exportData: false,
      prioritySupport: false,
      customIntegrations: false
    }
  },
  pro: {
    name: 'pro',
    price: 29.99,
    currency: 'USD',
    period: 'monthly',
    features: {
      candidateSearches: 100,
      aiSummaries: 50,
      exportData: true,
      prioritySupport: true,
      customIntegrations: false
    }
  },
  enterprise: {
    name: 'enterprise',
    price: 99.99,
    currency: 'USD',
    period: 'monthly',
    features: {
      candidateSearches: -1, // unlimited
      aiSummaries: -1,
      exportData: true,
      prioritySupport: true,
      customIntegrations: true
    }
  }
}
```

---

## 🔒 **Security & Privacy Architecture**

### **TDD Security Tests:**
```typescript
describe('SecurityService', () => {
  it('should validate API rate limits', async () => {
    const requests = Array(101).fill(null).map(() => 
      request(app).get('/api/v1/jobs').set('Authorization', `Bearer ${token}`)
    )
    
    const responses = await Promise.all(requests)
    const rateLimitedResponses = responses.filter(r => r.status === 429)
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })

  it('should encrypt sensitive candidate data', async () => {
    const candidateData = { email: 'test@example.com', phone: '555-0123' }
    const encrypted = await SecurityService.encrypt(candidateData)
    const decrypted = await SecurityService.decrypt(encrypted)
    
    expect(encrypted).not.toEqual(candidateData)
    expect(decrypted).toEqual(candidateData)
  })

  it('should enforce GDPR data deletion', async () => {
    const userId = 'user_123'
    await SecurityService.deleteUserData(userId)
    
    const userData = await UserService.getById(userId)
    expect(userData).toBeNull()
    
    const candidateProfile = await CandidateService.getByUserId(userId)
    expect(candidateProfile).toBeNull()
  })
})
```

---

## 📈 **Performance & Monitoring**

### **Performance Test Requirements:**
```typescript
describe('PerformanceTests', () => {
  it('should handle 1000 concurrent job searches', async () => {
    const promises = Array(1000).fill(null).map(() => 
      JobService.search({ query: 'React developer', location: 'San Francisco' })
    )
    
    const startTime = Date.now()
    const results = await Promise.all(promises)
    const duration = Date.now() - startTime
    
    expect(duration).toBeLessThan(5000) // 5s for 1000 searches
    expect(results.every(r => r.length > 0)).toBe(true)
  })

  it('should maintain <300ms API response times', async () => {
    const endpoints = ['/api/v1/jobs', '/api/v1/candidates', '/api/v1/search']
    
    for (const endpoint of endpoints) {
      const startTime = Date.now()
      await request(app).get(endpoint)
      const duration = Date.now() - startTime
      
      expect(duration).toBeLessThan(300)
    }
  })
})
```

---

## 🚀 **Deployment & CI/CD Pipeline**

### **TDD CI/CD Pipeline:**
```yaml
# .github/workflows/sprint2-tdd.yml
name: Sprint 2 TDD Pipeline

on: [push, pull_request]

jobs:
  test-driven-development:
    runs-on: ubuntu-latest
    steps:
      - name: 🔴 RED Phase - Run Failing Tests
        run: |
          npm test -- --testNamePattern="should.*" --passWithNoTests
          # Expect some tests to fail initially
      
      - name: 🟢 GREEN Phase - Implement Features
        run: |
          npm run build
          npm test -- --coverage --watchAll=false
          # All tests must pass
      
      - name: 🔵 REFACTOR Phase - Code Quality
        run: |
          npm run lint
          npm run type-check
          npm run test:e2e
          # Maintain quality while keeping tests green
      
      - name: 📊 MEASURE Phase - Performance Tests
        run: |
          npm run test:performance
          npm run test:load
          # Verify business metrics
```

---

## 📋 **Sprint 2 Implementation Roadmap**

### **Week 1: Foundation (TDD Setup)**
- [ ] Write failing tests for job aggregation
- [ ] Implement job aggregation service
- [ ] Write failing tests for unified schema
- [ ] Implement schema mapping

### **Week 2: AI Services (TDD Core)**
- [ ] Write failing tests for semantic search
- [ ] Implement vector search with Pinecone
- [ ] Write failing tests for AI summaries
- [ ] Implement OpenAI integration

### **Week 3: Recruiter Tools (TDD Features)**
- [ ] Write failing tests for recruiter dashboard
- [ ] Implement candidate search UI
- [ ] Write failing tests for credit system
- [ ] Implement usage tracking

### **Week 4: Payment System (TDD Security)**
- [ ] Write failing tests for Stripe integration
- [ ] Implement subscription management
- [ ] Write failing tests for webhook handling
- [ ] Implement payment security

### **Week 5: Integration & Performance (TDD Scale)**
- [ ] Write failing performance tests
- [ ] Optimize for scale requirements
- [ ] Write failing security tests
- [ ] Implement security measures

---

## ✅ **Success Criteria (Measurable)**

### **Technical Metrics:**
- [ ] **100% Test Coverage** (Unit + Integration + E2E)
- [ ] **API Response Time** < 300ms (95th percentile)
- [ ] **Search Performance** < 5s for semantic queries
- [ ] **Zero Security Vulnerabilities** (CodeQL + Snyk)

### **Business Metrics:**
- [ ] **Recruiter Engagement** > 65% daily active usage
- [ ] **Job Seeker Applications** > 3 per session
- [ ] **Monetization Conversion** > 10% free → paid
- [ ] **Customer Satisfaction** > 4.5/5 rating

### **Quality Metrics:**
- [ ] **Build Success Rate** > 99%
- [ ] **Deployment Success Rate** > 99%
- [ ] **Error Rate** < 0.1%
- [ ] **Performance Regression** = 0

---

This comprehensive TDD-driven architecture ensures that **every line of code is tested first**, **every feature meets business requirements**, and **every deployment is production-ready**. 

Ready to begin implementation with the **RED-GREEN-REFACTOR** cycle? 🚀

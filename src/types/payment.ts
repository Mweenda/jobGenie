// src/types/payment.ts
export interface SubscriptionTier {
  id: string
  name: 'free' | 'pro' | 'enterprise'
  displayName: string
  description: string
  price: number
  currency: string
  period: 'monthly' | 'annually'
  features: SubscriptionFeatures
  limits: SubscriptionLimits
  popular?: boolean
  trialDays?: number
  setupFee?: number
  discountPercent?: number
}

export interface SubscriptionFeatures {
  candidateSearches: number // -1 for unlimited
  aiSummaries: number
  contactCredits: number
  exportData: boolean
  prioritySupport: boolean
  customIntegrations: boolean
  teamManagement: boolean
  advancedAnalytics: boolean
  whiteLabel: boolean
  apiAccess: boolean
  bulkOperations: boolean
  customReports: boolean
}

export interface SubscriptionLimits {
  maxSearchResults: number
  maxSavedCandidates: number
  maxTeamMembers: number
  maxJobPostings: number
  maxCompanyProfiles: number
  apiRequestsPerDay: number
  storageGB: number
  emailSupport: boolean
  phoneSupport: boolean
  dedicatedManager: boolean
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  currency: string
  bonus?: number // Extra credits
  popular?: boolean
  validityDays?: number // Credit expiration
  description?: string
}

export interface PaymentService {
  // Subscription Management
  createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse>
  updateSubscription(subscriptionId: string, tierId: string): Promise<SubscriptionDetails>
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<SubscriptionDetails>
  reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails>
  
  // Credit Management
  purchaseCredits(request: PurchaseCreditsRequest): Promise<CreditPurchase>
  getCreditBalance(userId: string): Promise<CreditBalance>
  getCreditHistory(userId: string, pagination?: PaginationParams): Promise<CreditTransaction[]>
  
  // Payment Methods
  addPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod>
  updatePaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod>
  deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void>
  setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod>
  
  // Billing
  getInvoices(userId: string, pagination?: PaginationParams): Promise<Invoice[]>
  downloadInvoice(invoiceId: string): Promise<Blob>
  getUpcomingInvoice(subscriptionId: string): Promise<Invoice>
  
  // Webhooks
  handleWebhook(event: StripeWebhookEvent): Promise<void>
}

export interface CreateSubscriptionRequest {
  userId: string
  tierId: string
  paymentMethodId: string
  billingAddress: BillingAddress
  couponCode?: string
  trialDays?: number
  metadata?: Record<string, string>
}

export interface CreateSubscriptionResponse {
  subscription: SubscriptionDetails
  clientSecret?: string // For 3D Secure authentication
  requiresAction: boolean
  nextPaymentDate: string
  prorationAmount?: number
}

export interface SubscriptionDetails {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  defaultPaymentMethod?: PaymentMethod
  latestInvoice?: Invoice
  upcomingInvoice?: Invoice
  metadata?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export interface CreditBalance {
  userId: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  expiringCredits: ExpiringCredit[]
  lastUpdated: string
}

export interface ExpiringCredit {
  credits: number
  expirationDate: string
  source: 'purchase' | 'bonus' | 'refund' | 'promotion'
}

export interface CreditTransaction {
  id: string
  userId: string
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiration'
  amount: number // Positive for additions, negative for usage
  description: string
  relatedEntityId?: string // Related subscription, purchase, etc.
  relatedEntityType?: string
  balanceAfter: number
  metadata?: Record<string, string>
  createdAt: string
}

export interface PurchaseCreditsRequest {
  userId: string
  packageId: string
  quantity?: number
  paymentMethodId: string
  billingAddress?: BillingAddress
  metadata?: Record<string, string>
}

export interface CreditPurchase {
  id: string
  userId: string
  packageId: string
  creditsAdded: number
  bonusCredits: number
  totalCredits: number
  amountPaid: number
  currency: string
  paymentIntentId: string
  status: PaymentStatus
  receipt?: Receipt
  expirationDate?: string
  metadata?: Record<string, string>
  createdAt: string
  completedAt?: string
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'canceled'
  | 'failed'

export interface Receipt {
  id: string
  number: string
  downloadUrl: string
  emailSent: boolean
  items: ReceiptItem[]
  subtotal: number
  tax?: number
  total: number
  currency: string
  createdAt: string
}

export interface ReceiptItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate?: number
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod?: PaymentMethod
  requiresAction: boolean
  nextAction?: NextAction
  lastPaymentError?: PaymentError
  metadata?: Record<string, string>
  createdAt: string
}

export interface NextAction {
  type: 'redirect_to_url' | 'use_stripe_sdk' | 'display_bank_transfer_instructions'
  redirectToUrl?: {
    url: string
    returnUrl: string
  }
  useStripeSdk?: Record<string, any>
}

export interface PaymentError {
  type: string
  code: string
  message: string
  declineCode?: string
  paymentMethod?: PaymentMethod
}

// Stripe-specific types
export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
  apiVersion: string
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  phone?: string
  address?: BillingAddress
  defaultSource?: string
  invoiceSettings: {
    defaultPaymentMethod?: string
  }
  metadata?: Record<string, string>
}

export interface StripeSubscription {
  id: string
  customer: string
  status: SubscriptionStatus
  items: StripeSubscriptionItem[]
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  canceledAt?: number
  trialStart?: number
  trialEnd?: number
  defaultPaymentMethod?: string
  latestInvoice?: string
  metadata?: Record<string, string>
}

export interface StripeSubscriptionItem {
  id: string
  price: StripePrice
  quantity: number
}

export interface StripePrice {
  id: string
  product: string
  unitAmount: number
  currency: string
  recurring: {
    interval: 'month' | 'year'
    intervalCount: number
  }
  metadata?: Record<string, string>
}

export interface StripeProduct {
  id: string
  name: string
  description?: string
  images?: string[]
  metadata?: Record<string, string>
  active: boolean
}

// Usage tracking
export interface UsageRecord {
  id: string
  userId: string
  subscriptionId?: string
  feature: UsageFeature
  quantity: number
  timestamp: string
  metadata?: Record<string, string>
}

export type UsageFeature = 
  | 'candidate_search'
  | 'ai_summary'
  | 'candidate_contact'
  | 'data_export'
  | 'api_request'
  | 'job_posting'
  | 'team_member'

export interface UsageQuota {
  feature: UsageFeature
  limit: number
  used: number
  remaining: number
  resetDate: string
  overage: number
  overageCost?: number
}

export interface BillingCycle {
  id: string
  userId: string
  subscriptionId?: string
  startDate: string
  endDate: string
  usage: UsageRecord[]
  quotas: UsageQuota[]
  invoice?: Invoice
  status: 'active' | 'completed' | 'failed'
}

// Discount and coupon system
export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  type: 'percent' | 'fixed_amount' | 'credits'
  value: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  timesRedeemed: number
  validFrom: string
  validUntil?: string
  applicableTiers?: string[]
  firstTimeCustomersOnly?: boolean
  minimumAmount?: number
  active: boolean
  metadata?: Record<string, string>
  createdAt: string
}

export interface CouponRedemption {
  id: string
  couponId: string
  userId: string
  subscriptionId?: string
  discountAmount: number
  currency?: string
  creditsAwarded?: number
  redeemedAt: string
}

// Analytics and reporting
export interface RevenueMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  averageRevenuePerUser: number
  customerLifetimeValue: number
  churnRate: number
  growthRate: number
  period: {
    start: string
    end: string
  }
}

export interface SubscriptionMetrics {
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  canceledSubscriptions: number
  upgrades: number
  downgrades: number
  subscriptionsByTier: Record<string, number>
  conversionRate: number
  period: {
    start: string
    end: string
  }
}

export interface PaymentAnalytics {
  revenue: RevenueMetrics
  subscriptions: SubscriptionMetrics
  topPerformingTiers: Array<{
    tierId: string
    tierName: string
    revenue: number
    subscribers: number
  }>
  paymentMethodDistribution: Record<string, number>
  geographicDistribution: Record<string, number>
  refundRate: number
  failedPaymentRate: number
}

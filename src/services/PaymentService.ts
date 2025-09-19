// src/services/PaymentService.ts
import Stripe from 'stripe'
import { 
  PaymentService as IPaymentService,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  SubscriptionDetails,
  CreditPurchase,
  CreditBalance,
  CreditTransaction,
  PaymentMethod,
  Invoice,
  StripeWebhookEvent,
  SubscriptionTier,
  CreditPackage,
  UsageRecord,
  UsageQuota,
  PaginationParams,
  PurchaseCreditsRequest
} from '../types/payment'
import { APIError, APIErrorCodes } from '../types/api'

export class PaymentService implements IPaymentService {
  private stripe: Stripe
  private subscriptionTiers: Map<string, SubscriptionTier>
  private creditPackages: Map<string, CreditPackage>

  constructor(
    stripeSecretKey: string,
    private webhookSecret: string
  ) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true
    })

    this.initializeSubscriptionTiers()
    this.initializeCreditPackages()
  }

  private initializeSubscriptionTiers(): void {
    const tiers: SubscriptionTier[] = [
      {
        id: 'free',
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        currency: 'USD',
        period: 'monthly',
        features: {
          candidateSearches: 5,
          aiSummaries: 2,
          contactCredits: 1,
          exportData: false,
          prioritySupport: false,
          customIntegrations: false,
          teamManagement: false,
          advancedAnalytics: false,
          whiteLabel: false,
          apiAccess: false,
          bulkOperations: false,
          customReports: false
        },
        limits: {
          maxSearchResults: 10,
          maxSavedCandidates: 25,
          maxTeamMembers: 1,
          maxJobPostings: 0,
          maxCompanyProfiles: 1,
          apiRequestsPerDay: 0,
          storageGB: 1,
          emailSupport: true,
          phoneSupport: false,
          dedicatedManager: false
        }
      },
      {
        id: 'pro',
        name: 'pro',
        displayName: 'Professional',
        description: 'For growing recruiting teams',
        price: 99,
        currency: 'USD',
        period: 'monthly',
        popular: true,
        trialDays: 14,
        features: {
          candidateSearches: 500,
          aiSummaries: 200,
          contactCredits: 100,
          exportData: true,
          prioritySupport: true,
          customIntegrations: false,
          teamManagement: true,
          advancedAnalytics: true,
          whiteLabel: false,
          apiAccess: true,
          bulkOperations: true,
          customReports: false
        },
        limits: {
          maxSearchResults: 100,
          maxSavedCandidates: 1000,
          maxTeamMembers: 5,
          maxJobPostings: 20,
          maxCompanyProfiles: 3,
          apiRequestsPerDay: 1000,
          storageGB: 10,
          emailSupport: true,
          phoneSupport: true,
          dedicatedManager: false
        }
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'For large organizations',
        price: 499,
        currency: 'USD',
        period: 'monthly',
        features: {
          candidateSearches: -1, // unlimited
          aiSummaries: -1,
          contactCredits: -1,
          exportData: true,
          prioritySupport: true,
          customIntegrations: true,
          teamManagement: true,
          advancedAnalytics: true,
          whiteLabel: true,
          apiAccess: true,
          bulkOperations: true,
          customReports: true
        },
        limits: {
          maxSearchResults: -1, // unlimited
          maxSavedCandidates: -1,
          maxTeamMembers: -1,
          maxJobPostings: -1,
          maxCompanyProfiles: -1,
          apiRequestsPerDay: -1,
          storageGB: 100,
          emailSupport: true,
          phoneSupport: true,
          dedicatedManager: true
        }
      }
    ]

    this.subscriptionTiers = new Map(tiers.map(tier => [tier.id, tier]))
  }

  private initializeCreditPackages(): void {
    const packages: CreditPackage[] = [
      {
        id: 'credits_50',
        name: 'Starter Pack',
        credits: 50,
        price: 25,
        currency: 'USD',
        description: 'Perfect for small projects'
      },
      {
        id: 'credits_200',
        name: 'Growth Pack',
        credits: 200,
        bonus: 20,
        price: 90,
        currency: 'USD',
        popular: true,
        description: 'Most popular choice'
      },
      {
        id: 'credits_500',
        name: 'Professional Pack',
        credits: 500,
        bonus: 75,
        price: 200,
        currency: 'USD',
        description: 'For serious recruiters'
      },
      {
        id: 'credits_1000',
        name: 'Enterprise Pack',
        credits: 1000,
        bonus: 200,
        price: 350,
        currency: 'USD',
        validityDays: 365,
        description: 'Maximum value'
      }
    ]

    this.creditPackages = new Map(packages.map(pkg => [pkg.id, pkg]))
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const tier = this.subscriptionTiers.get(request.tierId)
      if (!tier) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: `Subscription tier ${request.tierId} not found`
        })
      }

      // Create or retrieve Stripe customer
      const customer = await this.createOrGetCustomer(request.userId, request.billingAddress)

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(request.paymentMethodId, {
        customer: customer.id
      })

      // Set as default payment method
      await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: request.paymentMethodId
        }
      })

      // Create subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customer.id,
        items: [{
          price_data: {
            currency: tier.currency.toLowerCase(),
            product_data: {
              name: tier.displayName,
              description: tier.description
            },
            unit_amount: tier.price * 100, // Convert to cents
            recurring: {
              interval: tier.period === 'monthly' ? 'month' : 'year'
            }
          }
        }],
        default_payment_method: request.paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: request.userId,
          tierId: request.tierId,
          ...request.metadata
        }
      }

      // Add trial if applicable
      if (request.trialDays || tier.trialDays) {
        subscriptionParams.trial_period_days = request.trialDays || tier.trialDays
      }

      // Add coupon if provided
      if (request.couponCode) {
        subscriptionParams.coupon = request.couponCode
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams)

      // Convert to our format
      const subscriptionDetails = await this.convertStripeSubscription(subscription, tier)

      const response: CreateSubscriptionResponse = {
        subscription: subscriptionDetails,
        requiresAction: subscription.latest_invoice?.payment_intent?.status === 'requires_action',
        nextPaymentDate: new Date(subscription.current_period_end * 1000).toISOString()
      }

      // Add client secret if payment requires action
      if (response.requiresAction && subscription.latest_invoice?.payment_intent) {
        const paymentIntent = subscription.latest_invoice.payment_intent as Stripe.PaymentIntent
        response.clientSecret = paymentIntent.client_secret || undefined
      }

      return response

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.PAYMENT_FAILED,
          message: error.message,
          details: { stripeCode: error.code, type: error.type }
        })
      }
      throw error
    }
  }

  async updateSubscription(subscriptionId: string, tierId: string): Promise<SubscriptionDetails> {
    try {
      const tier = this.subscriptionTiers.get(tierId)
      if (!tier) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: `Subscription tier ${tierId} not found`
        })
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      
      // Update subscription item
      await this.stripe.subscriptionItems.update(subscription.items.data[0].id, {
        price_data: {
          currency: tier.currency.toLowerCase(),
          product_data: {
            name: tier.displayName,
            description: tier.description
          },
          unit_amount: tier.price * 100,
          recurring: {
            interval: tier.period === 'monthly' ? 'month' : 'year'
          }
        },
        proration_behavior: 'always_invoice'
      })

      const updatedSubscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      return this.convertStripeSubscription(updatedSubscription, tier)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.PAYMENT_FAILED,
          message: error.message
        })
      }
      throw error
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<SubscriptionDetails> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      })

      const tier = this.subscriptionTiers.get(subscription.metadata.tierId || 'free')!
      return this.convertStripeSubscription(subscription, tier)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      })

      const tier = this.subscriptionTiers.get(subscription.metadata.tierId || 'free')!
      return this.convertStripeSubscription(subscription, tier)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async purchaseCredits(request: PurchaseCreditsRequest): Promise<CreditPurchase> {
    try {
      const creditPackage = this.creditPackages.get(request.packageId)
      if (!creditPackage) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: `Credit package ${request.packageId} not found`
        })
      }

      const quantity = request.quantity || 1
      const totalCredits = creditPackage.credits * quantity
      const bonusCredits = (creditPackage.bonus || 0) * quantity
      const totalAmount = creditPackage.price * quantity

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: totalAmount * 100, // Convert to cents
        currency: creditPackage.currency.toLowerCase(),
        payment_method: request.paymentMethodId,
        confirm: true,
        return_url: 'https://jobgenie.com/payment/return',
        metadata: {
          userId: request.userId,
          packageId: request.packageId,
          quantity: quantity.toString(),
          credits: totalCredits.toString(),
          bonusCredits: bonusCredits.toString()
        }
      })

      const purchase: CreditPurchase = {
        id: `cp_${Date.now()}`,
        userId: request.userId,
        packageId: request.packageId,
        creditsAdded: totalCredits,
        bonusCredits,
        totalCredits: totalCredits + bonusCredits,
        amountPaid: totalAmount,
        currency: creditPackage.currency,
        paymentIntentId: paymentIntent.id,
        status: this.convertPaymentIntentStatus(paymentIntent.status),
        createdAt: new Date().toISOString(),
        completedAt: paymentIntent.status === 'succeeded' ? new Date().toISOString() : undefined,
        metadata: request.metadata
      }

      // If payment succeeded, add credits to user balance
      if (paymentIntent.status === 'succeeded') {
        await this.addCreditsToBalance(request.userId, totalCredits + bonusCredits, {
          source: 'purchase',
          purchaseId: purchase.id,
          expirationDate: creditPackage.validityDays 
            ? new Date(Date.now() + creditPackage.validityDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined
        })
      }

      return purchase

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.PAYMENT_FAILED,
          message: error.message
        })
      }
      throw error
    }
  }

  async getCreditBalance(userId: string): Promise<CreditBalance> {
    // This would typically fetch from database
    // For now, returning mock data
    return {
      userId,
      totalCredits: 150,
      usedCredits: 45,
      remainingCredits: 105,
      expiringCredits: [
        {
          credits: 25,
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'purchase'
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  }

  async getCreditHistory(userId: string, pagination?: PaginationParams): Promise<CreditTransaction[]> {
    // This would typically fetch from database
    // For now, returning mock data
    return [
      {
        id: 'ct_1',
        userId,
        type: 'purchase',
        amount: 100,
        description: 'Credit purchase - Growth Pack',
        balanceAfter: 150,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ct_2',
        userId,
        type: 'usage',
        amount: -5,
        description: 'Candidate search with AI summary',
        balanceAfter: 145,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  async addPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const customer = await this.createOrGetCustomer(userId)
      
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      })

      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId)
      return this.convertStripePaymentMethod(paymentMethod)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.PAYMENT_FAILED,
          message: error.message
        })
      }
      throw error
    }
  }

  async updatePaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.update(paymentMethodId, {
        metadata: { userId }
      })

      return this.convertStripePaymentMethod(paymentMethod)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId)
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const customer = await this.createOrGetCustomer(userId)
      
      await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      })

      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId)
      return { ...this.convertStripePaymentMethod(paymentMethod), isDefault: true }

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.PAYMENT_FAILED,
          message: error.message
        })
      }
      throw error
    }
  }

  async getInvoices(userId: string, pagination?: PaginationParams): Promise<Invoice[]> {
    try {
      const customer = await this.createOrGetCustomer(userId)
      
      const invoices = await this.stripe.invoices.list({
        customer: customer.id,
        limit: pagination?.limit || 20
      })

      return invoices.data.map(this.convertStripeInvoice)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId)
      if (!invoice.invoice_pdf) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: 'Invoice PDF not available'
        })
      }

      const response = await fetch(invoice.invoice_pdf)
      return response.blob()

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async getUpcomingInvoice(subscriptionId: string): Promise<Invoice> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
        customer: subscription.customer as string
      })

      return this.convertStripeInvoice(upcomingInvoice)

    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new APIError({
          code: APIErrorCodes.NOT_FOUND,
          message: error.message
        })
      }
      throw error
    }
  }

  async handleWebhook(event: StripeWebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data as Stripe.Invoice)
          break

        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data as Stripe.PaymentMethod)
          break

        default:
          console.log(`Unhandled webhook event: ${event.type}`)
      }
    } catch (error) {
      console.error('Webhook handling error:', error)
      throw error
    }
  }

  // Private helper methods
  private async createOrGetCustomer(userId: string, billingAddress?: any): Promise<Stripe.Customer> {
    // This would typically check database first
    // For now, creating a new customer
    return this.stripe.customers.create({
      metadata: { userId },
      address: billingAddress ? {
        line1: billingAddress.line1,
        line2: billingAddress.line2,
        city: billingAddress.city,
        state: billingAddress.state,
        postal_code: billingAddress.postalCode,
        country: billingAddress.country
      } : undefined
    })
  }

  private async convertStripeSubscription(
    subscription: Stripe.Subscription, 
    tier: SubscriptionTier
  ): Promise<SubscriptionDetails> {
    return {
      id: `sub_${subscription.id}`,
      userId: subscription.metadata.userId,
      tier,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : undefined,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : undefined,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      createdAt: new Date(subscription.created * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private convertStripePaymentMethod(paymentMethod: Stripe.PaymentMethod): PaymentMethod {
    return {
      id: paymentMethod.id,
      type: paymentMethod.type as any,
      last4: paymentMethod.card?.last4 || '',
      brand: paymentMethod.card?.brand,
      expiryMonth: paymentMethod.card?.exp_month,
      expiryYear: paymentMethod.card?.exp_year,
      isDefault: false, // Would be determined by customer default
      createdAt: new Date(paymentMethod.created * 1000).toISOString()
    }
  }

  private convertStripeInvoice(invoice: Stripe.Invoice): Invoice {
    return {
      id: invoice.id,
      subscriptionId: invoice.subscription as string,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status as any,
      dueDate: new Date(invoice.due_date! * 1000).toISOString(),
      paidAt: invoice.status_transitions.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
        : undefined,
      items: invoice.lines.data.map(line => ({
        description: line.description || '',
        quantity: line.quantity || 1,
        unitAmount: (line.amount / 100) / (line.quantity || 1),
        totalAmount: line.amount / 100
      })),
      downloadUrl: invoice.invoice_pdf || undefined,
      createdAt: new Date(invoice.created * 1000).toISOString()
    }
  }

  private convertPaymentIntentStatus(status: string): any {
    const statusMap: Record<string, any> = {
      'requires_payment_method': 'requires_payment_method',
      'requires_confirmation': 'requires_confirmation',
      'requires_action': 'requires_action',
      'processing': 'processing',
      'succeeded': 'succeeded',
      'canceled': 'canceled'
    }
    return statusMap[status] || 'pending'
  }

  private async addCreditsToBalance(
    userId: string, 
    credits: number, 
    metadata: { source: string; purchaseId?: string; expirationDate?: string }
  ): Promise<void> {
    // This would typically update database
    console.log(`Adding ${credits} credits to user ${userId}`, metadata)
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription creation/update
    console.log('Subscription updated:', subscription.id)
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription cancellation
    console.log('Subscription canceled:', subscription.id)
  }

  private async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
    // Handle successful payment
    console.log('Payment succeeded for invoice:', invoice.id)
  }

  private async handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id)
  }

  private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    // Handle payment method attachment
    console.log('Payment method attached:', paymentMethod.id)
  }
}

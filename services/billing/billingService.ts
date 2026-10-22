
import Stripe from 'stripe';
import { UserTier } from '../orchestrationConfig';
import { config } from '../config';
import { storageQuotaService } from '../storage/storageQuotaService';

export class BillingService {
  private _stripe: Stripe | null = null;

  private get stripe(): Stripe {
    if (config.stripe.developmentBillingMode) {
      throw new Error("Stripe is disabled in development billing mode. Use mock methods instead.");
    }
    if (!this._stripe) {
      const apiKey = config.stripe.apiKey;
      if (!apiKey) {
        throw new Error("STRIPE_SECRET_KEY is not configured. Please set it in your environment variables.");
      }
      this._stripe = new Stripe(apiKey, {
        apiVersion: '2025-01-27' as any
      });
    }
    return this._stripe;
  }

  constructor() {
    if (config.stripe.developmentBillingMode) {
      console.warn("[BillingService] Development billing mode active. Stripe calls will be mocked.");
    }
  }

  /**
   * Create a checkout session for a subscription.
   */
  async createCheckoutSession(userId: string, email: string, priceId: string, successUrl: string, cancelUrl: string) {
    if (config.stripe.developmentBillingMode) {
      console.log(`[Billing] MOCK: Creating checkout session for user ${userId}, price ${priceId}`);
      return { url: `${successUrl}?mock_session_id=dev_${Date.now()}` };
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId }
    });

    return session;
  }

  /**
   * Handle Stripe Webhooks.
   */
  async handleWebhook(payload: any, sig: string, webhookSecret: string) {
    if (config.stripe.developmentBillingMode) {
      console.log("[Billing] MOCK: Handling webhook event", payload.type);
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.onSubscriptionSuccess(session);
        break;
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await this.onSubscriptionCancelled(subscription);
        break;
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        await this.onPaymentFailed(invoice);
        break;
    }

    return { received: true };
  }

  // Mock methods for manual testing in dev
  async simulateSubscriptionSuccess(userId: string, tier: UserTier) {
    console.log(`[Billing] MOCK: Simulating subscription success for ${userId} -> ${tier}`);
    const mappedPlan = tier === UserTier.PRO ? 'Pro' : tier === UserTier.ENTERPRISE ? 'Business' : 'Free';
    await storageQuotaService.updatePlanTier(userId, mappedPlan);
  }

  async simulateTokenDeduction(userId: string, amount: number) {
    console.log(`[Billing] MOCK: Deducting ${amount} tokens from user ${userId}`);
  }

  private async onSubscriptionSuccess(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;
    console.log(`[Billing] Subscription success for user ${userId}, Customer: ${customerId}`);
    
    if (userId) {
      // Fetch or determine plan from metadata or priceId
      const priceId = session.line_items?.data?.[0]?.price?.id;
      let plan: 'Pro' | 'Creator' | 'Business' = 'Pro';
      if (priceId && priceId.includes('creator')) {
        plan = 'Creator';
      } else if (priceId && (priceId.includes('business') || priceId.includes('enterprise'))) {
        plan = 'Business';
      }
      await storageQuotaService.updatePlanTier(userId, plan);
    }
  }

  private async onSubscriptionCancelled(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    console.log(`[Billing] Subscription cancelled for customer ${customerId}`);
    
    // Attempt to downgrade associated user to Free if resolved
    const userId = subscription.metadata?.userId;
    if (userId) {
      await storageQuotaService.updatePlanTier(userId, 'Free');
    }
  }

  private async onPaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    console.log(`[Billing] Payment failed for customer ${customerId}. Entering grace period.`);
    // Notify user and potentially restrict access
  }

  /**
   * Middleware for feature gating.
   */
  static gateByTier(requiredTier: UserTier) {
    return (req: any, res: any, next: any) => {
      const user = req.user; // Assumes auth middleware populated this
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const tierPriority = { [UserTier.FREE]: 0, [UserTier.PRO]: 1, [UserTier.ENTERPRISE]: 2 };
      if (tierPriority[user.tier as UserTier] < tierPriority[requiredTier]) {
        return res.status(403).json({ 
          error: 'Upgrade Required', 
          message: `This feature requires ${requiredTier} tier.` 
        });
      }
      next();
    };
  }
}

export const billingService = new BillingService();

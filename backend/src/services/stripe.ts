import Stripe from 'stripe';
import { env } from '../config/env.js';

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

export { stripe };

interface CreateCheckoutParams {
    customerId?: string;
    customerEmail: string;
    priceId?: string;
    mode: 'subscription' | 'payment';
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    lineItems?: Stripe.Checkout.SessionCreateParams.LineItem[];
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer_email: params.customerId ? undefined : params.customerEmail,
        customer: params.customerId,
        mode: params.mode,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
        line_items: params.lineItems || (params.priceId ? [{ price: params.priceId, quantity: 1 }] : undefined),
        payment_method_types: ['card'],
    };

    if (params.mode === 'subscription') {
        sessionParams.subscription_data = {
            metadata: params.metadata,
        };
    }

    return stripe.checkout.sessions.create(sessionParams);
}

/**
 * Create or get Stripe customer
 */
export async function getOrCreateCustomer(email: string, name: string, userId: string): Promise<string> {
    // Search for existing customer
    const customers = await stripe.customers.list({
        email,
        limit: 1,
    });

    if (customers.data.length > 0) {
        return customers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
    });

    return customer.id;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription status
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
    payload: Buffer,
    signature: string
): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
